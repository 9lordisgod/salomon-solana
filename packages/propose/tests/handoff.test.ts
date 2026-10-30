import {
  assertSessionAllowsFeePayer,
  FORBIDDEN_APPROVAL_KINDS,
  toSignApprovalRequest,
  VaultHandoffDenied,
  type MwaSessionPublic,
} from '../src/handoff.js';
import { prepareForSign } from '../src/prepare.js';
import * as execute from '../src/execute.js';
import { NotImplemented, ProposeDenied, type DraftArtefact } from '../src/types.js';

const FP = 'FeePayer1111111111111111111111111111111111';
const artefact: DraftArtefact = { draft_json: '{"x":1}', draft_sha256: 'abc123', human_summary: 'Send 1 SOL' };
const session: MwaSessionPublic = { authorized: true, cluster: 'devnet', pubkeys: [FP] };
const base = { artefact, session, fee_payer: FP, recent_blockhash: 'bh', tx_message_bytes_b64: 'AQID' };

const code = (fn: () => unknown) => {
  try { fn(); } catch (e) { return (e as { code?: string }).code; }
  return undefined;
};

describe('handoff', () => {
  test('toSignApprovalRequest maps sha + summary with exact SV-0 §7 fields', () => {
    const r = toSignApprovalRequest(artefact, { cluster: 'devnet', fee_payer: FP });
    expect(r).toEqual({ kind: 'sign_solana_draft', draft_sha256: 'abc123', human_summary: 'Send 1 SOL', cluster: 'devnet', fee_payer: FP });
    expect(Object.keys(r).sort()).toEqual(['cluster', 'draft_sha256', 'fee_payer', 'human_summary', 'kind']);
  });
  test('forbidden kinds listed', () => {
    expect(FORBIDDEN_APPROVAL_KINDS).toEqual(['export_seed', 'export_mnemonic', 'export_private_key', 'sign_and_send']);
  });
  test('assertSessionAllowsFeePayer denies unauthorized / mismatch', () => {
    expect(code(() => assertSessionAllowsFeePayer({ ...session, authorized: false }, FP))).toBe('mwa_not_authorized');
    expect(code(() => assertSessionAllowsFeePayer(session, 'Other'))).toBe('fee_payer_mismatch');
    expect(() => assertSessionAllowsFeePayer(session, FP)).not.toThrow();
  });
  test('empty / missing session → vault_unavailable / mwa_not_authorized', () => {
    expect(code(() => assertSessionAllowsFeePayer(undefined as unknown as MwaSessionPublic, FP))).toBe('vault_unavailable');
    expect(code(() => assertSessionAllowsFeePayer({ authorized: true, cluster: 'devnet', pubkeys: [] }, FP))).toBe('mwa_not_authorized');
    expect(code(() => prepareForSign({ ...base, session: undefined as unknown as MwaSessionPublic }))).toBe('vault_unavailable');
  });
});

describe('prepareForSign', () => {
  test('attaches tx_message_bytes_b64 and builds approval', () => {
    const r = prepareForSign(base);
    expect(r.artefact.tx_message_bytes_b64).toBe('AQID');
    expect(r.approval.draft_sha256).toBe('abc123');
    expect(r.approval.cluster).toBe('devnet');
    expect(artefact.tx_message_bytes_b64).toBeUndefined();
  });
  test('rejects empty tx bytes / blockhash', () => {
    expect(() => prepareForSign({ ...base, tx_message_bytes_b64: '' })).toThrow(ProposeDenied);
    expect(() => prepareForSign({ ...base, recent_blockhash: ' ' })).toThrow(ProposeDenied);
    expect(() => prepareForSign({ ...base, fee_payer: 'Other' })).toThrow(VaultHandoffDenied);
  });
  test('does not sign; sign/broadcast stubs still NotImplemented', () => {
    const r = prepareForSign(base) as unknown as Record<string, unknown>;
    expect(r.signature_b64).toBeUndefined();
    expect(() => execute.signDraft(artefact)).toThrow(NotImplemented);
    expect(() => execute.broadcastSigned({})).toThrow(NotImplemented);
    expect(() => execute.seedVaultSign(artefact)).toThrow(NotImplemented);
    expect((execute as Record<string, unknown>).signTransactions).toBeUndefined();
  });
});
