// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * Honest engine state for Seeker M0.
 * Never soften labels: LOCAL | STUB | REMOTE | MODEL MISSING | REFUSED.
 * Default is MODEL MISSING until a real local backend is wired.
 */
export type EngineChip = 'local' | 'stub' | 'remote' | 'missing' | 'refused';

export type EngineStatus = {
  available: boolean;
  backend: 'gguf' | 'stub' | 'none';
  model: string | null;
  /** Opt-in labeled remote — never silent fallback. */
  remoteOptIn: boolean;
  gatewayAvailable: boolean;
};

export const MISSING_STATUS: EngineStatus = {
  available: false,
  backend: 'none',
  model: null,
  remoteOptIn: false,
  gatewayAvailable: false,
};

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
    case 'local':
      return short ? `LOCAL · ${short}` : 'LOCAL';
    case 'stub':
      return 'STUB';
    case 'remote':
      return short ? `REMOTE · ${short}` : 'REMOTE';
    case 'refused':
      return 'REFUSED';
    default:
      return 'MODEL MISSING';
  }
}

/** M0: no local model — every ask fails closed. */
export function askLocal(_prompt: string, status: EngineStatus): { ok: false; chip: EngineChip; text: string } {
  const chip = chipOf(status);
  if (chip === 'missing' || !status.available) {
    return {
      ok: false,
      chip: 'missing',
      text: 'Local model missing. Install an on-device model or explicitly enable labeled REMOTE. Nothing was sent anywhere.',
    };
  }
  if (chip === 'stub') {
    return {
      ok: false,
      chip: 'stub',
      text: 'STUB only — demo backend, not a real on-device model. Refusing to pretend otherwise.',
    };
  }
  // Future: local / remote paths. M0 never reaches here.
  return {
    ok: false,
    chip: 'refused',
    text: 'Ask path not wired yet. Fail-closed.',
  };
}
