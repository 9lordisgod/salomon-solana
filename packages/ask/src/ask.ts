import { createHash } from 'node:crypto';
import { AskRequest, AskResult, EngineStatus } from './types.js';
import { LocalCompleter, chipOfNative } from './completer.js';
import { chipOf, MISSING_STATUS } from './status.js';
import { err } from './reasons.js';
import { isForbiddenToolName } from './forbidden.js';

export type ToolSpec = { name: string };
export type AskDeps = { completer?: LocalCompleter; status?: EngineStatus; systemPrompt?: string; sanitize?: (t: string) => string; toolSpecs?: ToolSpec[]; log?: (e: { reason: string; transcriptDigest?: string }) => void };

/** Allowlist empty by default; any forbidden name denies registration. */
export function assertToolSpecs(specs: ToolSpec[] = []): void {
  for (const s of specs) if (isForbiddenToolName(s.name)) throw new Error('forbidden_tool');
}
function template(sys: string, turns: { role: string; content: string }[]): string {
  return [`<|im_start|>system\n${sys}<|im_end|>`, ...turns.map(t => `<|im_start|>${t.role}\n${t.content}<|im_end|>`), '<|im_start|>assistant\n'].join('\n');
}
const digest = (s: string) => createHash('sha256').update(s).digest('hex');

export async function askLocal(req: AskRequest, deps: AskDeps = {}): Promise<AskResult> {
  const log = deps.log ?? (() => {});
  const fail = (r: Parameters<typeof err>[0], c?: Parameters<typeof err>[1]) => { log({ reason: r }); return err(r, c); };
  if (!req || typeof req.question !== 'string' || !req.question.trim()) return fail('bad_request');
  const hist = req.history ?? [];
  if (hist.some(h => h.role !== 'user' && h.role !== 'assistant')) return fail('bad_request'); // no client system role
  try { assertToolSpecs(deps.toolSpecs); } catch { return fail('forbidden_tool'); }
  const status = deps.status ?? MISSING_STATUS;
  const chip = chipOf(status);
  // REMOTE is out of v0 eng: never routed here, never a silent fallback.
  if (chip === 'remote') return fail('policy_mismatch', 'refused');
  if (chip === 'stub') return fail('stub_not_real_model');
  if (chip !== 'local' || !deps.completer || !status.model) return fail('local_model_unavailable');
  if (!deps.systemPrompt) return fail('policy_mismatch');
  // Sanitizer eng PARKED (SM-A1, Lead). Hook required: no sanitizer ⇒ fail closed, completer never called.
  const sanitize = deps.sanitize;
  if (!sanitize) return fail('policy_mismatch');
  let turns;
  try { turns = [...hist, { role: 'user' as const, content: req.question }].map(t => ({ role: t.role, content: sanitize(t.content) })); }
  catch { return fail('input_refused'); }
  const prompt = template(deps.systemPrompt, turns);
  let r;
  try { r = await deps.completer.ask(prompt); } catch { return fail('completion_failed'); }
  const nchip = chipOfNative(r.status);
  if (nchip === 'missing') return fail('local_model_unavailable');
  if (nchip === 'stub') return fail('stub_not_real_model');
  if (nchip === 'refused') return fail('input_refused');
  if (typeof r.text !== 'string' || !r.text) return fail('completion_failed');
  const transcriptDigest = digest(prompt + '\u0000' + r.text);
  log({ reason: 'ok', transcriptDigest });
  return { ok: true, answer: r.text, chip: 'local', model: status.model, steps: 1, redactions: [], transcriptDigest };
}
