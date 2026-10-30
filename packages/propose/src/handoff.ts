/** SM-1 handoff interface stubs (Lead 2026-10-29). Pure types/mappers only — no MWA, no sign, no broadcast. */
import type { DraftArtefact, SolanaCluster } from './types.js';

export type { SolanaCluster } from './types.js';

/** Host → Approval UX (no secrets). Frozen to SV-0 §7 — do not add/remove fields. */
export interface SignApprovalRequest {
  kind: 'sign_solana_draft';
  draft_sha256: string;
  human_summary: string;
  cluster: 'devnet' | 'testnet' | 'mainnet-beta';
  fee_payer: string; // base58 public only
}

export interface ExportApprovalRequest {
  kind: 'export_artefact';
  artefact_class: 'notes' | 'draft_json' | 'receipt' | 'other_nonsensitive';
  destination_label: string;
  content_digest: string;
}

/** Kinds that must never be accepted as approval requests (SV-0). */
export const FORBIDDEN_APPROVAL_KINDS = [
  'export_seed',
  'export_mnemonic',
  'export_private_key',
  'sign_and_send',
] as const;

export type ApprovalDecision = { approved: true } | { approved: false; reason?: string };

/** After approve — host only; must never be fed to model as raw bytes. */
export interface SignResult {
  draft_sha256: string;
  signature_b64: string;
  pubkey: string;
}

/** M2 Mock MWA / authorize session — public fields only. */
export interface MwaSessionPublic {
  authorized: boolean;
  cluster: SolanaCluster;
  /** Connected account pubkey(s); empty if not authorized. */
  pubkeys: string[];
}

export type VaultDenyCode =
  | 'vault_unavailable'
  | 'mwa_not_authorized'
  | 'fee_payer_mismatch'
  | 'draft_sha256_mismatch'
  | 'approval_rejected';

export class VaultHandoffDenied extends Error {
  constructor(public readonly code: VaultDenyCode, message?: string) {
    super(message ?? code);
    this.name = 'VaultHandoffDenied';
  }
}

/** Pure mapper: DraftArtefact + session facts → SignApprovalRequest. No MWA calls. */
export function toSignApprovalRequest(
  artefact: DraftArtefact,
  opts: { cluster: SolanaCluster; fee_payer: string },
): SignApprovalRequest {
  return {
    kind: 'sign_solana_draft',
    draft_sha256: artefact.draft_sha256,
    human_summary: artefact.human_summary,
    cluster: opts.cluster,
    fee_payer: opts.fee_payer,
  };
}

/** Require authorized session with fee_payer ∈ pubkeys; else VaultHandoffDenied. */
export function assertSessionAllowsFeePayer(session: MwaSessionPublic, fee_payer: string): void {
  if (!session || !Array.isArray(session.pubkeys)) {
    throw new VaultHandoffDenied('vault_unavailable', 'No Vault/MWA session available');
  }
  if (!session.authorized || session.pubkeys.length === 0) {
    throw new VaultHandoffDenied('mwa_not_authorized', 'MWA session not authorized');
  }
  if (!session.pubkeys.includes(fee_payer)) {
    throw new VaultHandoffDenied('fee_payer_mismatch', 'fee_payer is not a connected Vault account');
  }
}
