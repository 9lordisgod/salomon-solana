/**
 * M2 Mock MWA: authorize / deauthorize ONLY.
 * No signTransactions / signAndSendTransactions / signMessages / broadcast. Seed Vault live sign NOT shipped.
 */
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { WalletSessionError } from './errors';
import { DEFAULT_CLUSTER, emptySession, sessionFromAuthorize } from './session';
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenStore';
import type { AppIdentity, MwaSessionPublic, SolanaCluster } from './types';

export const APP_IDENTITY: AppIdentity = {
  name: 'Salomon Seeker',
  uri: 'https://github.com/9lordisgod/salomon-solana',
  icon: 'favicon.ico', // relative to uri
};

let current: MwaSessionPublic = emptySession(DEFAULT_CLUSTER);

function toBase58(address: string): string {
  // MWA returns base64 account addresses.
  return new PublicKey(Buffer.from(address, 'base64')).toBase58();
}

function isDecline(e: unknown): boolean {
  const code = (e as { code?: string })?.code ?? '';
  const msg = String((e as Error)?.message ?? '');
  return /DECLINED|AUTHORIZATION_FAILED/i.test(code) || /declin|not authorized/i.test(msg);
}

export async function connect(cluster: SolanaCluster = DEFAULT_CLUSTER): Promise<MwaSessionPublic> {
  let result: { auth_token: string; accounts: { address: string }[] };
  try {
    result = await transact(async (wallet) => {
      const r = await wallet.authorize({ cluster, identity: APP_IDENTITY });
      return { auth_token: r.auth_token, accounts: r.accounts };
    });
  } catch (e) {
    current = emptySession(cluster);
    if (isDecline(e)) throw new WalletSessionError('mwa_not_authorized');
    throw new WalletSessionError('vault_unavailable');
  }
  const session = sessionFromAuthorize({ cluster, pubkeys: result.accounts.map((a) => toBase58(a.address)) });
  if (!session.authorized) {
    current = emptySession(cluster);
    throw new WalletSessionError('mwa_not_authorized');
  }
  await setAuthToken(result.auth_token);
  current = session;
  return { ...current, pubkeys: [...current.pubkeys] };
}

export async function disconnect(): Promise<MwaSessionPublic> {
  const cluster = current.cluster;
  const token = await getAuthToken();
  if (token) {
    try {
      await transact(async (wallet) => {
        await wallet.deauthorize({ auth_token: token });
      });
    } catch {
      /* wallet gone: still clear locally (fail-closed) */
    }
  }
  await clearAuthToken();
  current = emptySession(cluster);
  return { ...current };
}

/** Public session only (in-memory). Token is never read into the return value. */
export function getSession(): MwaSessionPublic {
  return { ...current, pubkeys: [...current.pubkeys] };
}
