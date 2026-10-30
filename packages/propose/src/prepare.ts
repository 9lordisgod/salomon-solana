/** SM-1 host-only prepare-for-sign seam (M3). Stub: no sign, no MWA, no broadcast. */
import { ProposeDenied, type DraftArtefact } from './types.js';
import {
  assertSessionAllowsFeePayer,
  toSignApprovalRequest,
  VaultHandoffDenied,
  type MwaSessionPublic,
  type SignApprovalRequest,
} from './handoff.js';

export interface PrepareForSignInput {
  artefact: DraftArtefact; // SM-0 propose output (no tx bytes required)
  session: MwaSessionPublic;
  fee_payer: string;
  /** Host-fetched recent blockhash */
  recent_blockhash: string;
  /** Host-built unsigned tx message bytes (base64). Never from model. */
  tx_message_bytes_b64: string;
}

export interface PrepareForSignResult {
  artefact: DraftArtefact; // includes tx_message_bytes_b64
  approval: SignApprovalRequest;
}

/**
 * Host-only prepare-for-sign seam (M3).
 * Validates session + fee_payer, attaches host tx bytes, builds SignApprovalRequest.
 * Does NOT sign, does NOT call MWA, does NOT broadcast.
 */
export function prepareForSign(input: PrepareForSignInput): PrepareForSignResult {
  const { artefact, session, fee_payer, recent_blockhash, tx_message_bytes_b64 } = input;
  if (!artefact || !artefact.draft_sha256 || !artefact.draft_json) {
    throw new ProposeDenied('invalid_artefact', 'DraftArtefact missing draft_json/draft_sha256');
  }
  if (!session) throw new VaultHandoffDenied('vault_unavailable', 'No Vault/MWA session available');
  assertSessionAllowsFeePayer(session, fee_payer);
  if (!recent_blockhash || !recent_blockhash.trim()) {
    throw new ProposeDenied('missing_blockhash', 'Host recent_blockhash required');
  }
  if (!tx_message_bytes_b64 || !tx_message_bytes_b64.trim()) {
    throw new ProposeDenied('missing_tx_message_bytes', 'Host tx_message_bytes_b64 required');
  }
  const prepared: DraftArtefact = {
    draft_json: artefact.draft_json,
    draft_sha256: artefact.draft_sha256,
    human_summary: artefact.human_summary,
    tx_message_bytes_b64,
  };
  return {
    artefact: prepared,
    approval: toSignApprovalRequest(prepared, { cluster: session.cluster, fee_payer }),
  };
}
