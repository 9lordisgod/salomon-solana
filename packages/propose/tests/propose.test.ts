import { proposeSolTransfer, proposeSplTransfer } from '../src/propose.js';
import { ProposeConfig, ProposeDenied, NotImplemented } from '../src/types.js';
import { signDraft, broadcastSigned, seedVaultSign } from '../src/execute.js';
import { isForbiddenToolName } from '../src/forbidden.js';
import { sha256Hex } from '../src/hash.js';
import { validateTransferDraft } from '../src/validate.js';

const FEE = 'So11111111111111111111111111111111111111112';
const TO = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const cfg: ProposeConfig = {
  cluster: 'devnet',
  maxDraftLamports: 10n * 1_000_000_000n,
  tokenAllowlist: {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { decimals: 6, maxRaw: 1_000_000n },
  },
};

describe('SM-0 propose ≠ sign', () => {
  test('proposeSolTransfer returns unsigned artefact with matching sha256', () => {
    const a = proposeSolTransfer({ fee_payer: FEE, to: TO, lamports: '1000' }, cfg);
    expect(a.draft_sha256).toBe(sha256Hex(a.draft_json));
    const parsed = JSON.parse(a.draft_json);
    expect(parsed.unsigned).toBe(true);
    expect(parsed.signature).toBeUndefined();
    expect(a.human_summary).toContain('unsigned');
    expect(a.human_summary).toContain('1000');
  });

  test('host cluster wins; mismatch denies', () => {
    expect(() =>
      proposeSolTransfer({ fee_payer: FEE, to: TO, lamports: '1000', cluster: 'mainnet-beta' }, cfg),
    ).toThrow(ProposeDenied);
  });

  test('cap exceeded denies', () => {
    expect(() =>
      proposeSolTransfer({ fee_payer: FEE, to: TO, lamports: String(20n * 1_000_000_000n) }, cfg),
    ).toThrow(/draft_amount_cap_exceeded/);
  });

  test('secret fields in draft denied', () => {
    try {
      validateTransferDraft(
        {
          schema: 'sm0.sol_transfer.v0',
          cluster: 'devnet',
          fee_payer: FEE,
          to: TO,
          lamports: '1',
          unsigned: true,
          private_key: 'x',
        } as never,
        cfg,
      );
      throw new Error('expected ProposeDenied');
    } catch (e) {
      expect(e).toBeInstanceOf(ProposeDenied);
      expect((e as ProposeDenied).code).toBe('key_material_in_draft');
    }
  });

  test('SPL requires allowlisted mint', () => {
    expect(() =>
      proposeSplTransfer(
        { fee_payer: FEE, mint: FEE, to_owner: TO, amount: '1' },
        cfg,
      ),
    ).toThrow(/mint_not_allowlisted/);
  });

  test('SPL allowlisted ok', () => {
    const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const a = proposeSplTransfer(
      { fee_payer: FEE, mint, to_owner: TO, amount: '100' },
      cfg,
    );
    expect(JSON.parse(a.draft_json).unsigned).toBe(true);
  });

  test('sign/broadcast/vault throw NotImplemented', () => {
    expect(() => signDraft({})).toThrow(NotImplemented);
    expect(() => broadcastSigned({})).toThrow(NotImplemented);
    expect(() => seedVaultSign({})).toThrow(NotImplemented);
  });

  test('forbidden tool names', () => {
    expect(isForbiddenToolName('sign_transaction')).toBe(true);
    expect(isForbiddenToolName('signAndSendTransaction')).toBe(true);
    expect(isForbiddenToolName('propose_sol_transfer')).toBe(false);
    expect(isForbiddenToolName('get_solana_balance')).toBe(false);
  });
});
