/** SM-0 propose-only types. Copyright (c) 2026 Anon Rothschild. Proprietary. */

export type SolanaCluster = 'devnet' | 'testnet' | 'mainnet-beta';

export interface SolTransferDraft {
  schema: 'sm0.sol_transfer.v0';
  cluster: SolanaCluster;
  fee_payer: string;
  to: string;
  lamports: string;
  recent_blockhash?: string;
  unsigned: true;
}

export interface SplTransferDraft {
  schema: 'sm0.spl_transfer.v0';
  cluster: SolanaCluster;
  fee_payer: string;
  mint: string;
  to_owner: string;
  amount: string;
  unsigned: true;
}

export type TransferDraft = SolTransferDraft | SplTransferDraft;

export interface DraftArtefact {
  draft_json: string;
  draft_sha256: string;
  human_summary: string;
  /** Host-filled only at prepare-for-sign (SM-1+). Never model-supplied. Absent in SM-0 propose output. */
  tx_message_bytes_b64?: string;
}

export interface ProposeConfig {
  cluster: SolanaCluster;
  maxDraftLamports: bigint;
  tokenAllowlist: Record<string, { decimals: number; maxRaw: bigint }>;
}

export class ProposeDenied extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
    this.name = 'ProposeDenied';
  }
}

export class NotImplemented extends Error {
  constructor(what: string) {
    super(`${what} is not implemented in SM-0 (propose-only)`);
    this.name = 'NotImplemented';
  }
}
