import { NotImplemented } from './types.js';

/** SM-0: sign / broadcast / Seed Vault paths are intentionally unimplemented. */
export function signDraft(_artefact: unknown): never {
  throw new NotImplemented('signDraft');
}

export function broadcastSigned(_signed: unknown): never {
  throw new NotImplemented('broadcastSigned');
}

export function seedVaultSign(_artefact: unknown): never {
  throw new NotImplemented('seedVaultSign');
}
