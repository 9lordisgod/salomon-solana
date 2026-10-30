import { loadProposeConfig } from './config.js';
import { sha256Hex } from './hash.js';
import { humanSummary } from './summary.js';
import {
  DraftArtefact,
  ProposeConfig,
  ProposeDenied,
  SolTransferDraft,
  SplTransferDraft,
} from './types.js';
import { validateTransferDraft } from './validate.js';

function artefactFrom(draft: SolTransferDraft | SplTransferDraft): DraftArtefact {
  const draft_json = JSON.stringify(draft);
  return {
    draft_json,
    draft_sha256: sha256Hex(draft_json),
    human_summary: humanSummary(draft),
  };
}

/** Host overrides cluster from config; model-supplied cluster is ignored. */
export function proposeSolTransfer(
  input: { fee_payer: string; to: string; lamports: string; cluster?: string },
  cfg: ProposeConfig = loadProposeConfig(),
): DraftArtefact {
  const draft: SolTransferDraft = {
    schema: 'sm0.sol_transfer.v0',
    cluster: cfg.cluster,
    fee_payer: input.fee_payer,
    to: input.to,
    lamports: input.lamports,
    unsigned: true,
  };
  if (input.cluster && input.cluster !== cfg.cluster) {
    throw new ProposeDenied('cluster_mismatch', 'model cluster ignored; host cluster wins — deny on mismatch');
  }
  validateTransferDraft(draft, cfg);
  return artefactFrom(draft);
}

export function proposeSplTransfer(
  input: { fee_payer: string; mint: string; to_owner: string; amount: string; cluster?: string },
  cfg: ProposeConfig = loadProposeConfig(),
): DraftArtefact {
  const draft: SplTransferDraft = {
    schema: 'sm0.spl_transfer.v0',
    cluster: cfg.cluster,
    fee_payer: input.fee_payer,
    mint: input.mint,
    to_owner: input.to_owner,
    amount: input.amount,
    unsigned: true,
  };
  if (input.cluster && input.cluster !== cfg.cluster) {
    throw new ProposeDenied('cluster_mismatch');
  }
  validateTransferDraft(draft, cfg);
  return artefactFrom(draft);
}
