import { SolTransferDraft, SplTransferDraft, TransferDraft } from './types.js';

/** Host-built deterministic summary — never model-authored. */
export function humanSummary(draft: TransferDraft): string {
  if (draft.schema === 'sm0.sol_transfer.v0') {
    const d = draft as SolTransferDraft;
    return `Propose SOL transfer on ${d.cluster}: ${d.lamports} lamports from ${d.fee_payer} to ${d.to} (unsigned).`;
  }
  const d = draft as SplTransferDraft;
  return `Propose SPL transfer on ${d.cluster}: mint ${d.mint} amount ${d.amount} from ${d.fee_payer} to owner ${d.to_owner} (unsigned).`;
}
