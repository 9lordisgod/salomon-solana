// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * Public MWA session shape — mirrors packages/propose/src/handoff.ts MwaSessionPublic.
 * Three public fields only. NO auth token, NO secrets — token is host-private (AsyncStorage, Seed Vault module).
 */
export interface MwaSessionPublic {
  authorized: boolean;
  cluster: 'devnet' | 'testnet' | 'mainnet-beta'; // M2 default: 'devnet'
  pubkeys: string[]; // base58; empty when not authorized
}

export type VaultDenyCode = 'vault_unavailable' | 'mwa_not_authorized';

export type ConnectResult =
  | { ok: true; session: MwaSessionPublic }
  | { ok: false; code: VaultDenyCode | 'user_declined' };

export const DISCONNECTED: MwaSessionPublic = { authorized: false, cluster: 'devnet', pubkeys: [] };

/** Exact fail-closed UX copy (M2 checklist §4). */
export const WALLET_COPY = {
  vault_unavailable: 'No MWA wallet found',
  mwa_not_authorized: 'Wallet not connected',
  user_declined: 'Connection declined',
} as const;

/** dApp identity passed to MWA authorize (consumed by Seed Vault mwa.ts). */
export const APP_IDENTITY = {
  name: 'Salomon',
  uri: 'https://salomon.local',
  icon: 'favicon.ico',
} as const;

export function shortKey(pk: string): string {
  return pk.length <= 10 ? pk : `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}
