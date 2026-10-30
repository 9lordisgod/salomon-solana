import { ProposeConfig, ProposeDenied, SolanaCluster } from './types.js';

const CEILINGS: Record<SolanaCluster, bigint> = {
  devnet: 100n * 1_000_000_000n,
  testnet: 100n * 1_000_000_000n,
  'mainnet-beta': 500_000_000n, // 0.5 SOL
};

export function loadProposeConfig(env: NodeJS.ProcessEnv = process.env): ProposeConfig {
  const cluster = (env.SOLANA_CLUSTER ?? 'devnet') as SolanaCluster;
  if (!['devnet', 'testnet', 'mainnet-beta'].includes(cluster)) {
    throw new ProposeDenied('env_unconfigured', `unknown cluster ${cluster}`);
  }
  const raw = env.MAX_DRAFT_LAMPORTS;
  if (!raw) {
    throw new ProposeDenied('draft_amount_cap_missing');
  }
  let maxDraftLamports: bigint;
  try {
    maxDraftLamports = BigInt(raw);
  } catch {
    throw new ProposeDenied('draft_amount_cap_missing', 'MAX_DRAFT_LAMPORTS not a u64');
  }
  if (maxDraftLamports > CEILINGS[cluster]) {
    throw new ProposeDenied('draft_amount_cap_exceeded', 'env above cluster ceiling');
  }
  // SM-0: empty allowlist until env supplies mints; SPL propose fails closed.
  const tokenAllowlist: ProposeConfig['tokenAllowlist'] = {};
  const allow = env.TOKEN_ALLOWLIST?.trim();
  if (allow) {
    for (const part of allow.split(',')) {
      const [mint, decimalsStr, maxRawStr] = part.split('@');
      if (!mint || !decimalsStr || !maxRawStr) {
        throw new ProposeDenied('env_unconfigured', `bad TOKEN_ALLOWLIST entry ${part}`);
      }
      tokenAllowlist[mint] = { decimals: Number(decimalsStr), maxRaw: BigInt(maxRawStr) };
    }
  }
  return { cluster, maxDraftLamports, tokenAllowlist };
}
