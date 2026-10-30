import { AskErr, EngineChip } from './types.js';
export const REASONS = {
  input_refused: { status: 422, chip: 'refused', message: 'That looks like a secret (key, seed phrase, or password). Nothing was sent to the model.' },
  local_model_unavailable: { status: 503, chip: 'missing', message: 'Local model missing. Install the on-device model. Nothing was sent anywhere.' },
  stub_not_real_model: { status: 503, chip: 'stub', message: 'STUB only — not a real on-device model. Refusing to answer as if it were.' },
  forbidden_tool: { status: 403, chip: 'refused', message: 'That tool is not allowed. Ask can only propose, never sign or send.' },
  bad_request: { status: 400, chip: 'refused', message: 'The question was empty or malformed.' },
  completion_failed: { status: 503, chip: 'missing', message: 'The local model failed to answer. Nothing was sent anywhere.' },
  timeout: { status: 503, chip: 'missing', message: 'The local model took too long. Nothing was sent anywhere.' },
  policy_mismatch: { status: 503, chip: 'refused', message: 'Engine policy check failed. Fail-closed.' },
} as const satisfies Record<string, { status: number; chip: EngineChip; message: string }>;
export type ReasonCode = keyof typeof REASONS;
export function err(reason: ReasonCode, chip?: EngineChip): AskErr {
  const r = REASONS[reason];
  return { ok: false, chip: chip ?? r.chip, reason, status: r.status, message: r.message };
}
