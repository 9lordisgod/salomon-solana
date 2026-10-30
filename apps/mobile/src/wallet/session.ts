/** Pure helpers — no I/O, no secrets. */
import type { MwaSessionPublic, SolanaCluster } from './types';

export const DEFAULT_CLUSTER: SolanaCluster = 'devnet';

export function emptySession(cluster: SolanaCluster = DEFAULT_CLUSTER): MwaSessionPublic {
  return { authorized: false, cluster, pubkeys: [] };
}

export function sessionFromAuthorize(input: { cluster: SolanaCluster; pubkeys: string[] }): MwaSessionPublic {
  const pubkeys = input.pubkeys.filter((p) => typeof p === 'string' && p.length > 0);
  if (pubkeys.length === 0) return emptySession(input.cluster);
  return { authorized: true, cluster: input.cluster, pubkeys: [...pubkeys] };
}

/** The ONLY wallet shape allowed into model-facing context. Copies whitelisted fields. */
export function toModelFacingSnapshot(session: MwaSessionPublic): MwaSessionPublic {
  const snap: MwaSessionPublic = {
    authorized: session.authorized === true,
    cluster: session.cluster,
    pubkeys: Array.isArray(session.pubkeys) ? session.pubkeys.map(String) : [],
  };
  assertNoSecretsInSnapshot(snap);
  return snap;
}

const ALLOWED = new Set(['authorized', 'cluster', 'pubkeys']);
const FORBIDDEN = /auth_?token|token|secret|seed|mnemonic|private/i;

export function assertNoSecretsInSnapshot(snap: unknown): void {
  if (!snap || typeof snap !== 'object') throw new Error('snapshot must be an object');
  for (const k of Object.keys(snap as object)) {
    if (!ALLOWED.has(k) || FORBIDDEN.test(k)) throw new Error(`forbidden snapshot key: ${k}`);
  }
}
