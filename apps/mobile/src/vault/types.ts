// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * SV-0 host ↔ FE / Vault module types — design contract only (not shipped).
 * Source: docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md §7
 * No live MWA until M2/M3. Sign ≠ broadcast (second confirm).
 */

/** Host → Approval UX (no secrets) */
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
  destination_label: string; // e.g. "Share sheet" / "Local file"
  content_digest: string; // sha256 of bytes to export
  // NEVER artefact_class that implies seed/key
}

export type ApprovalDecision = { approved: true } | { approved: false; reason?: string };

/** After approve — host only; result must not be fed to model as raw bytes */
export interface SignResult {
  draft_sha256: string;
  signature_b64: string; // host-held
  pubkey: string;
}

/** Forbidden request kinds until Lead+PS open (SV-G3 / export seed). */
export type ForbiddenVaultRequestKind =
  | 'export_seed'
  | 'export_mnemonic'
  | 'export_private_key'
  | 'sign_and_send';

export function isForbiddenVaultKind(kind: string): kind is ForbiddenVaultRequestKind {
  return (
    kind === 'export_seed' ||
    kind === 'export_mnemonic' ||
    kind === 'export_private_key' ||
    kind === 'sign_and_send'
  );
}
