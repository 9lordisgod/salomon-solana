// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * Seed Vault lane — Mock MWA session boundary (M2).
 * authorize / deauthorize ONLY. No signTransactions, signAndSendTransactions,
 * signMessages, or broadcast — those are M3+ behind Lead re-GO.
 * auth_token is host-private (tokenStore); only MwaSessionPublic leaves this module.
 * Never throws from connect(): fails closed via ConnectResult codes.
 */
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { APP_IDENTITY, DISCONNECTED, type ConnectResult, type MwaSessionPublic } from './types';
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenStore';

const CLUSTER: MwaSessionPublic['cluster'] = 'devnet';

let session: MwaSessionPublic = DISCONNECTED;

export function getSession(): MwaSessionPublic {
  return session;
}

/** MWA account addresses are base64 of the 32-byte pubkey; expose base58 only. */
function toBase58(address: string): string {
  try {
    return new PublicKey(Buffer.from(address, 'base64')).toBase58();
  } catch {
    // already base58 (some wallets)
    return new PublicKey(address).toBase58();
  }
}

function classify(err: unknown): 'user_declined' | 'vault_unavailable' | 'mwa_not_authorized' {
  const e = err as { code?: string; name?: string; message?: string } | undefined;
  const s = `${e?.code ?? ''} ${e?.name ?? ''} ${e?.message ?? ''}`;
  if (/WALLET_NOT_FOUND|ERROR_WALLET_NOT_FOUND|SolanaMobileWalletAdapterWalletNotInstalledError|not installed|no wallet/i.test(s)) {
    return 'vault_unavailable';
  }
  if (/AUTHORIZATION_FAILED|-1\b|declin|reject|cancel|SESSION_CLOSED/i.test(s)) {
    return 'user_declined';
  }
  return 'mwa_not_authorized';
}

export async function connect(): Promise<ConnectResult> {
  try {
    const prior = await getAuthToken();
    const result = await transact(async (wallet) => {
      const auth = await wallet.authorize({
        chain: `solana:${CLUSTER}`,
        identity: APP_IDENTITY,
        ...(prior ? { auth_token: prior } : {}),
      });
      return { token: auth.auth_token, addresses: auth.accounts.map((a) => a.address) };
    });
    if (!result.token || result.addresses.length === 0) {
      session = DISCONNECTED;
      await clearAuthToken();
      return { ok: false, code: 'mwa_not_authorized' };
    }
    await setAuthToken(result.token);
    session = { authorized: true, cluster: CLUSTER, pubkeys: result.addresses.map(toBase58) };
    return { ok: true, session };
  } catch (err) {
    session = DISCONNECTED;
    const code = classify(err);
    if (code !== 'user_declined') await clearAuthToken();
    return { ok: false, code };
  }
}

export async function disconnect(): Promise<MwaSessionPublic> {
  const token = await getAuthToken();
  try {
    if (token) {
      await transact(async (wallet) => {
        await wallet.deauthorize({ auth_token: token });
      });
    }
  } catch {
    // fail-closed: local state is cleared regardless
  } finally {
    await clearAuthToken();
    session = DISCONNECTED;
  }
  return session;
}
