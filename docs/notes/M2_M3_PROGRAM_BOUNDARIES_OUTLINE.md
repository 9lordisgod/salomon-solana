# M2 / M3 program boundaries — On-Chain × Seed Vault

**Status:** Seed Vault **CO-SIGNED** (2026-10-29) · after M0 `002f34e` · SV-0 @ `234b494` · outline tip `ccd9a57`  
**Authors:** On-Chain Engineer · Seed Vault Engineer (co-own Vault rows)  
**Binding:** APPROVED `docs/notes/DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md` · SV-0 `docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md`  
**Lead:** live MWA/sign held until SM-1 / Lead M2. sign ≠ broadcast (two user steps). No in-product seed export.

Roadmap map: Lead **M2** = Seed Vault boundary · Lead **M3** = propose-only transfers + signing. On-Chain **SM-0** = stubs now · **SM-1** = first live Vault sign (under Lead M2/M3).

## Path note (vs SV-0)

| Doc | Path on `salomon-solana` |
|-----|--------------------------|
| SV-0 (Seed Vault) | `docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md` |
| On-chain DESIGN (APPROVED) | `docs/notes/DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md` |
| This boundary note | `docs/notes/M2_M3_PROGRAM_BOUNDARIES_OUTLINE.md` |

No conflict with SV-0: complementary custody vs propose/allowlist. Optional later: mirror on-chain DESIGN to `docs/` root for parity with SV-0 — **not required** for SM-0.

---

## SM-0 (now) — On-Chain

- **DraftArtefact** = `{ draft_json, draft_sha256, human_summary }`  
  - Optional `tx_message_bytes_b64` **only** at prepare-for-sign, **host-filled** — never model. Absent from SM-0 propose output.
- `human_summary` + `draft_sha256` **host-built/verified**; model-supplied values ignored if present.
- Sign / broadcast / send / import_key / export_key: `NotImplemented` → treat as AgentDenied; **never** registered as model tools.
- Approval / sign handoff **OUT** of SM-0 code — stubs stop at unsigned draft.
- `onchain/` Anchor folder stays placeholder only (no deploy, no program ID).
- Package: `packages/propose` (types/stubs/tests).

## M2 (Vault boundary) — Seed Vault lane

- MWA authorize session; **public pubkey(s) only** on host; keys never in model.
- Missing Vault / MWA ⇒ deny with plain reason; **no** paste-key / in-app keystore fallback.
- No product “Vault signs” claims until M2 green.
- Lead: hold live MWA/sign until SM-1 / M2.

## M3 / SM-1 (sign path) — joint

- `fee_payer` **must** equal connected Vault account or abort.
- `draft_sha256` mismatch at sign time ⇒ abort; no signature.
- Flow: **propose → Approval UX (summary+hash) → Seed Vault sign → signature to host only → separate Broadcast confirm**.
- **sign ≠ broadcast** locked. No `signAndSend` collapse without Lead+PS.
- Signed payload / signature **never** re-enters model context (at most opaque status).
- Cluster on draft from **host env**; model cluster ignored/denied.
- No in-product seed/mnemonic export — refuse; OS/Vault backup only.
- TEE / inference attest **≠** wallet auth.

## Allowlists — On-Chain owns; Vault consumes

| Item | Owner | Consumer |
|------|-------|----------|
| Program IDs (when any) | On-Chain (host env) | Approval display (Vault/FE) |
| Mint allowlist + per-mint caps | On-Chain (host env) | Approval display |
| Spend caps (`MAX_DRAFT_LAMPORTS`, cluster ceilings) | On-Chain (host env) | Approval display |
| Connected account pubkey | Seed Vault / MWA session | fee_payer equality check |

Vault Engineer does **not** redefine allowlists — displays what On-Chain validated.

## Program surface

| Milestone | Programs touched | Custom Anchor in `onchain/` |
|-----------|------------------|-----------------------------|
| SM-0 | None (draft JSON only) | Placeholder only |
| M2 | None for custody proof | Still empty |
| M3 / SM-1 | System Program + SPL Token (allowlisted mints) | **Empty** unless Lead opens receipt program |
| Later SM-2 | Optional attestation/receipt program | Design + PS before any deploy |

## Interface contract

```text
On-Chain propose_*  →  DraftArtefact { draft_json, draft_sha256, human_summary }
        ↓  (SM-1 prepare-for-sign may add host tx_message_bytes_b64)
FE Approval UX (summary + hash + cluster + amounts)
        ↓ user confirms Sign
Seed Vault / MWA sign(exact bytes)  →  signature to HOST only
        ↓ optional second confirm
Host broadcast  →  RPC
```

## Non-goals until PS+Lead open

Mainnet spend above 0.5 SOL · SPL without allowlist · `signAndSend` collapse · custom program deploy · silent chain · in-product seed export.

## Seed Vault review checklist

- [x] SM-0 artefact shape matches SV-0 hand-off (`DraftArtefact` + host-only optional `tx_message_bytes_b64`)
- [x] M2 deny paths / no keystore fallback
- [x] M3/SM-1 fee_payer + hash abort + sign≠broadcast
- [x] Allowlist ownership as above (On-Chain owns; Vault/FE display only)

**Co-sign:** Seed Vault Engineer — all four PASS vs SV-0 @ `234b494` / tip `ccd9a57`. No diffs. Approval/sign remains OUT of SM-0 stubs on merge.

## Interface stubs (Lead 2026-10-29)

- `packages/propose` now exports `prepareForSign` + handoff types (`SignApprovalRequest`, `ApprovalDecision`, `SignResult`, `MwaSessionPublic`, `VaultHandoffDenied`) — **stubs only**, pure functions, no network. `SignApprovalRequest` frozen verbatim to SV-0 §7.
- **M2** = Mock MWA authorize/session (Seed Vault + FE). **M3** uses `prepareForSign` (host attaches `tx_message_bytes_b64`, fee_payer ∈ session pubkeys) → Approval → sign → **separate** broadcast.
- Still **no** live sign/broadcast, no `signTransactions`; `signDraft` / `broadcastSigned` / `seedVaultSign` remain `NotImplemented`. **No Seed Vault live claim.**
