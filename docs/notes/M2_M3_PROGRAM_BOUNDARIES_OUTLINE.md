# M2 / M3 program boundaries (outline) — On-Chain × Seed Vault

**Status:** OUTLINE for Seed Vault Engineer + Lead · after M0 `002f34e`  
**Authors:** On-Chain Engineer (draft) · Seed Vault Engineer (co-own Vault rows)  
**Binding:** APPROVED `DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md` · Seed Vault `DESIGN_SEED_VAULT_BOUNDARIES_V0.md`  
**Note:** Lead roadmap M2 = Seed Vault boundary; M3 = propose-only transfers + signing. On-Chain eng slice naming: **SM-0** stubs now; SM-1 = first live Vault sign (maps under Lead M2/M3).

## Split of ownership

| Concern | M2 (Vault boundary) | M3 (propose + sign UX) | Custom `onchain/` program |
|---------|---------------------|-------------------------|---------------------------|
| MWA authorize / session | **Seed Vault** | FE wires UX; Vault owns rules | N/A |
| Keys never in model | **Seed Vault** (+ sanitizer) | Prove end-to-end | N/A |
| Draft schema / allowlists / caps | On-Chain (SM-0→) | On-Chain | Only if SM-2 receipt program opens |
| `human_summary` + `draft_sha256` | Contract shared | FE displays; Vault aborts on hash mismatch | Optional on-chain receipt of hash |
| `sign` / `signAndSend` | Denied in loop | Vault path after Approval only; **sign ≠ broadcast** until PS | Forbidden as agent tools |
| System + SPL transfers | — | **Yes** (no custom program) | Placeholder only |
| Attestation (TEE inference) | Orthogonal | Orthogonal | Not wallet auth |

## Program surface

| Milestone | Programs touched | Custom Anchor in `onchain/` |
|-----------|------------------|-----------------------------|
| SM-0 (now) | None (draft JSON only) | Placeholder README only |
| Lead M2 / SM-1 prep | None for custody proof | Still empty |
| Lead M3 / SM-1 | System Program + SPL Token (allowlisted mints) | **Still empty** unless Lead opens receipt program |
| Later SM-2 | Optional attestation/receipt program | Design + PS gate before any deploy |

**Hard rule:** no custom program ID in SM-0/SM-1. `onchain/` must not gain deploy scripts that imply a live program.

## Interface contract (hand-off)

```text
On-Chain propose_*  →  DraftArtefact { draft_json, draft_sha256, human_summary }
        ↓
FE Approval UX (show summary + hash + cluster + amounts)
        ↓ user confirms Sign
Seed Vault / MWA sign(exact bytes)  →  signature to HOST only
        ↓ optional second confirm
Host broadcast  →  RPC
```

- Model never sees signature / seed / Vault token.  
- fee_payer must equal connected Vault account.  
- Hash mismatch ⇒ abort (Vault Engineer).

## Open for Seed Vault Engineer

1. Confirm M2 success criteria: authorize session + deny path when Vault missing + no key in model logs (digest-only).  
2. Confirm SM-1 sign payload encoding (tx message bytes vs draft_json) for hash binding.  
3. Co-sign this outline → park any edits under `docs/notes/`.

## Non-goals until PS+Lead open

Mainnet spend above 0.5 SOL · SPL without allowlist · `signAndSend` collapse · custom program deploy · silent chain.
