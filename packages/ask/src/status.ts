import { EngineChip, EngineStatus } from './types.js';
export const MISSING_STATUS: EngineStatus = { available: false, backend: 'none', model: null, remoteOptIn: false, gatewayAvailable: false };
export const MODEL_ALLOWLIST = ['qwen2.5-3b-instruct-q4_k_m'];
export const PINNED_GGUF_SHA256 = '9c9f56a391a3abbd5b89d0245bf6106081bcc3173119d4229235dd9d23253f94';
const BANNED_MODEL_RE = /(abliterat|uncensor)/i;
export function isAllowedModel(id: string | null | undefined): boolean {
  if (!id) return false;
  const base = id.split('/').pop()!.replace(/\.gguf$/i, '').toLowerCase();
  return !BANNED_MODEL_RE.test(base) && MODEL_ALLOWLIST.includes(base);
}
/** Never claims LOCAL without a verified asset (sha256 match) and an allowlisted model. */
export function getEngineStatus(p: { modelId?: string | null; assetSha256?: string | null; backendLinked?: boolean; stubOptIn?: boolean; remoteOptIn?: boolean; gatewayAvailable?: boolean } = {}): EngineStatus {
  const remote = { remoteOptIn: !!p.remoteOptIn, gatewayAvailable: !!p.gatewayAvailable };
  if (p.backendLinked && isAllowedModel(p.modelId) && p.assetSha256 === PINNED_GGUF_SHA256)
    return { available: true, backend: 'gguf', model: p.modelId!, ...remote };
  if (p.stubOptIn) return { available: true, backend: 'stub', model: null, ...remote };
  return { ...MISSING_STATUS, ...remote };
}
export function chipOf(s: EngineStatus): EngineChip {
  if (s.remoteOptIn && s.gatewayAvailable) return 'remote';
  if (!s.available) return 'missing';
  if (s.backend === 'stub') return 'stub';
  if (s.backend === 'gguf') return 'local';
  return 'missing';
}
export function chipLabel(chip: EngineChip, model?: string | null): string {
  const short = model ? model.split('/').pop()!.replace(/\.gguf$/i, '').slice(0, 24) : '';
  switch (chip) {
    case 'local': return short ? `LOCAL · ${short}` : 'LOCAL';
    case 'stub': return 'STUB';
    case 'remote': return short ? `REMOTE · ${short}` : 'REMOTE';
    case 'refused': return 'REFUSED';
    default: return 'MODEL MISSING';
  }
}
