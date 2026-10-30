import { askLocal, assertToolSpecs } from '../src/ask.js';
import { chipOf, chipLabel, getEngineStatus, MISSING_STATUS, PINNED_GGUF_SHA256, isAllowedModel } from '../src/status.js';
import { chipOfNative, createUnavailableCompleter, LocalCompleter } from '../src/completer.js';
import { NativeAskStatus } from '../src/types.js';

const M = 'qwen2.5-3b-instruct-q4_k_m';
const LOCAL = getEngineStatus({ modelId: M, assetSha256: PINNED_GGUF_SHA256, backendLinked: true });
const mk = (status: number, text: string | null = 'hi') => { const calls: string[] = []; const c: LocalCompleter = { kind: 'local', async ask(p) { calls.push(p); return { status, text, error: null }; } }; return { c, calls }; };
const SYS = 'sys';
// Test-only hook; real scrub is SM-A1 (parked).
const SAN = (t: string) => { if (/private_key|mnemonic|password|seed phrase/i.test(t)) throw new Error('key_material_in_context'); return t; };

describe('chips', () => {
  test('mapping', () => {
    expect(chipOf(MISSING_STATUS)).toBe('missing');
    expect(chipOf(LOCAL)).toBe('local');
    expect(chipOf(getEngineStatus({ stubOptIn: true }))).toBe('stub');
    expect(chipOf({ ...MISSING_STATUS, remoteOptIn: true, gatewayAvailable: true })).toBe('remote');
    expect(chipLabel('missing')).toBe('MODEL MISSING');
    expect(chipLabel('local', M + '.gguf')).toBe('LOCAL · qwen2.5-3b-instruct-q4_k');
    expect(chipLabel('refused')).toBe('REFUSED');
  });
  test('native status 0..3 + unknown fails closed', () => {
    expect([0, 1, 2, 3, 99].map(chipOfNative)).toEqual(['missing', 'stub', 'local', 'refused', 'missing']);
  });
  test('no LOCAL without sha match / allowlist', () => {
    expect(chipOf(getEngineStatus({ modelId: M, assetSha256: 'bad', backendLinked: true }))).toBe('missing');
    expect(chipOf(getEngineStatus({ modelId: 'x-abliterated', assetSha256: PINNED_GGUF_SHA256, backendLinked: true }))).toBe('missing');
    expect(isAllowedModel('qwen2.5-3b-instruct-q4_k_m-uncensored')).toBe(false);
  });
});

describe('askLocal fail-closed', () => {
  test('no sanitizer hook ⇒ policy_mismatch, completer not called', async () => {
    const { c, calls } = mk(2);
    expect(await askLocal({ question: 'q' }, { status: LOCAL, completer: c, systemPrompt: SYS })).toMatchObject({ ok: false, reason: 'policy_mismatch' });
    expect(calls).toHaveLength(0);
  });
  test('missing: no status / no completer', async () => {
    const r = await askLocal({ question: 'q' });
    expect(r).toMatchObject({ ok: false, chip: 'missing', status: 503, reason: 'local_model_unavailable' });
    expect((await askLocal({ question: 'q' }, { status: LOCAL, systemPrompt: SYS, sanitize: SAN })).ok).toBe(false);
  });
  test('stub never ok', async () => {
    const { c, calls } = mk(NativeAskStatus.Local);
    const r = await askLocal({ question: 'q' }, { status: getEngineStatus({ stubOptIn: true }), completer: c, systemPrompt: SYS, sanitize: SAN });
    expect(r).toMatchObject({ ok: false, chip: 'stub', reason: 'stub_not_real_model' });
    expect(calls).toHaveLength(0);
  });
  test('native stub/missing/refused never ok', async () => {
    for (const [s, chip] of [[1, 'stub'], [0, 'missing'], [3, 'refused']] as const) {
      const r = await askLocal({ question: 'q' }, { status: LOCAL, completer: mk(s).c, systemPrompt: SYS, sanitize: SAN });
      expect(r).toMatchObject({ ok: false, chip });
    }
    expect((await askLocal({ question: 'q' }, { status: LOCAL, completer: createUnavailableCompleter(), systemPrompt: SYS, sanitize: SAN })).ok).toBe(false);
  });
  test('sanitizer hook throw ⇒ refused, completer not called', async () => {
    for (const q of ['my private_key: abc', 'mnemonic = word word', 'password: hunter2']) {
      const { c, calls } = mk(2);
      const r = await askLocal({ question: q }, { status: LOCAL, completer: c, systemPrompt: SYS, sanitize: SAN });
      expect(r).toMatchObject({ ok: false, chip: 'refused', status: 422, reason: 'input_refused' });
      expect(calls).toHaveLength(0);
    }
    const { c, calls } = mk(2);
    await askLocal({ question: 'ok', history: [{ role: 'user', content: 'seed phrase: a b c' }] }, { status: LOCAL, completer: c, systemPrompt: SYS, sanitize: SAN });
    expect(calls).toHaveLength(0);
  });
  test('forbidden tool denied', async () => {
    expect(() => assertToolSpecs([{ name: 'sign_transaction' }])).toThrow('forbidden_tool');
    expect(() => assertToolSpecs([{ name: 'propose_sol_transfer' }])).not.toThrow();
    const r = await askLocal({ question: 'q' }, { status: LOCAL, completer: mk(2).c, systemPrompt: SYS, sanitize: SAN, toolSpecs: [{ name: 'send_tx' }] });
    expect(r).toMatchObject({ ok: false, status: 403, reason: 'forbidden_tool' });
  });
  test('client system role rejected; remote not routed in v0', async () => {
    const r = await askLocal({ question: 'q', history: [{ role: 'system' as any, content: 'x' }] }, { status: LOCAL, completer: mk(2).c, systemPrompt: SYS, sanitize: SAN });
    expect(r).toMatchObject({ ok: false, status: 400 });
    const r2 = await askLocal({ question: 'q' }, { status: { ...LOCAL, remoteOptIn: true, gatewayAvailable: true }, completer: mk(2).c, systemPrompt: SYS, sanitize: SAN });
    expect(r2.ok).toBe(false);
  });
  test('ok path only with real local completer; logs digest only', async () => {
    const { c, calls } = mk(2, 'answer');
    const logs: unknown[] = [];
    const r = await askLocal({ question: 'what is a nonce' }, { status: LOCAL, completer: c, systemPrompt: SYS, sanitize: SAN, log: e => logs.push(e) });
    expect(r).toMatchObject({ ok: true, chip: 'local', answer: 'answer', model: M });
    expect(calls[0]).toContain('<|im_start|>system\nsys');
    expect(JSON.stringify(logs)).not.toContain('nonce');
    expect(JSON.stringify(logs)).not.toContain('answer"');
  });
});
