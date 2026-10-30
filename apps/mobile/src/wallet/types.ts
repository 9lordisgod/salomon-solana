/**
 * M2 Mock MWA public session types.
 * SOURCE OF TRUTH: packages/propose/src/handoff.ts (MwaSessionPublic) + types.ts (SolanaCluster).
 * Thin mirror to avoid an Expo monorepo dep in M2 — must stay in lockstep. Do NOT add fields.
 */
export type SolanaCluster = 'devnet' | 'testnet' | 'mainnet-beta';

export interface MwaSessionPublic {
  authorized: boolean;
  cluster: SolanaCluster;
  /** Connected account pubkey(s), base58; empty if not authorized. */
  pubkeys: string[];
}

export interface AppIdentity {
  name: string;
  uri: string;
  icon: string;
}
