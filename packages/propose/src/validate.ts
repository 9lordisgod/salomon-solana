import { ProposeConfig, ProposeDenied, SolTransferDraft, SplTransferDraft, TransferDraft } from './types.js';

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const FORBIDDEN_KEYS = /^(signature|signatures|private_key|secret_key|seed|seed_phrase|mnemonic|public_key)$/i;

function assertPubkey(label: string, v: string): void {
  if (!BASE58_RE.test(v)) throw new ProposeDenied('invalid_pubkey', `${label} not base58 pubkey`);
}

function assertNoSecrets(obj: Record<string, unknown>): void {
  for (const k of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.test(k)) throw new ProposeDenied('key_material_in_draft', k);
  }
}

export function validateSolTransfer(draft: SolTransferDraft, cfg: ProposeConfig): void {
  assertNoSecrets(draft as unknown as Record<string, unknown>);
  if (draft.schema !== 'sm0.sol_transfer.v0') throw new ProposeDenied('schema_mismatch');
  if (draft.unsigned !== true) throw new ProposeDenied('must_be_unsigned');
  if (draft.cluster !== cfg.cluster) throw new ProposeDenied('cluster_mismatch');
  assertPubkey('fee_payer', draft.fee_payer);
  assertPubkey('to', draft.to);
  let lamports: bigint;
  try {
    lamports = BigInt(draft.lamports);
  } catch {
    throw new ProposeDenied('invalid_amount');
  }
  if (lamports <= 0n) throw new ProposeDenied('invalid_amount');
  if (lamports > cfg.maxDraftLamports) throw new ProposeDenied('draft_amount_cap_exceeded');
}

export function validateSplTransfer(draft: SplTransferDraft, cfg: ProposeConfig): void {
  assertNoSecrets(draft as unknown as Record<string, unknown>);
  if (draft.schema !== 'sm0.spl_transfer.v0') throw new ProposeDenied('schema_mismatch');
  if (draft.unsigned !== true) throw new ProposeDenied('must_be_unsigned');
  if (draft.cluster !== cfg.cluster) throw new ProposeDenied('cluster_mismatch');
  assertPubkey('fee_payer', draft.fee_payer);
  assertPubkey('to_owner', draft.to_owner);
  assertPubkey('mint', draft.mint);
  const allow = cfg.tokenAllowlist[draft.mint];
  if (!allow) throw new ProposeDenied('mint_not_allowlisted');
  let amount: bigint;
  try {
    amount = BigInt(draft.amount);
  } catch {
    throw new ProposeDenied('invalid_amount');
  }
  if (amount <= 0n) throw new ProposeDenied('invalid_amount');
  if (amount > allow.maxRaw) throw new ProposeDenied('draft_amount_cap_exceeded');
}

export function validateTransferDraft(draft: TransferDraft, cfg: ProposeConfig): void {
  if (draft.schema === 'sm0.sol_transfer.v0') validateSolTransfer(draft, cfg);
  else if (draft.schema === 'sm0.spl_transfer.v0') validateSplTransfer(draft, cfg);
  else throw new ProposeDenied('schema_mismatch');
}
