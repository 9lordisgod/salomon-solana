// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * PLACEHOLDER ADAPTER — Seed Vault Engineer owns the real implementation
 * (transact + authorize/deauthorize, AsyncStorage auth token). FE ships chrome only.
 * Until that lands this fails closed: connect() -> vault_unavailable. No fake pubkey,
 * no paste-a-key, no silent reauth, no sign*. Seed Vault replaces this file keeping the API.
 */
import { DISCONNECTED, type ConnectResult, type MwaSessionPublic } from './types';

let session: MwaSessionPublic = DISCONNECTED;

export function getSession(): MwaSessionPublic {
  return session;
}

export async function connect(): Promise<ConnectResult> {
  session = DISCONNECTED;
  return { ok: false, code: 'vault_unavailable' };
}

export async function disconnect(): Promise<MwaSessionPublic> {
  session = DISCONNECTED;
  return session;
}
