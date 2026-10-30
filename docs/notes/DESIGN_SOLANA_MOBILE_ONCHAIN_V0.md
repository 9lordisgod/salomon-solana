# DESIGN — Solana Mobile parallel track: programs, attestations, propose-only signing

> **Parked:** 2026-10-29 after Lead M0 tip `002f34e` on `9lordisgod/salomon-solana`.
> **SM-0** = first eng slice (types/stubs/tests + transfer propose). `onchain/` remains placeholder only.


**Author:** On-Chain Engineer · **Date:** Thu Oct 29, 2026 (America/Vancouver) · **Status:** APPROVED by Lead (2026-10-29). Parked under salomon-solana docs after M0 tip `002f34e`.  
**Track:** Parallel to Android-primary Salomon (Play/APK). Solana Mobile / Seeker / Seed Vault is **optional product path**, never required for core local AI.  
**Binding priors:** Phase 2 M4 propose-only (G1+G2 ACCEPTED, G3 never opened) · Phase 1.5 fail-closed attestation · PRODUCT_NICHE (Android primary; Solana secondary) · ANDROID_HYBRID_DECISION (Seeker/Seed Vault out of M-A0)

## 0. One-line rule

The agent **proposes** unsigned Solana transaction / message drafts (plus deterministic human summary + draft hash). It never holds, sees, requests, or uses seed material or private keys. Signing happens only in **Seed Vault** (or Mobile Wallet Adapter → Seed Vault) after explicit user approval. Nothing the model produces is signed or broadcast inside the agent loop.

## 1. Custody boundary

| Zone | Holds | May do | Never |
|------|-------|--------|-------|
| **Model** (local SLM or verified-remote) | prompt + sanitized msgs + UNTRUSTED tool envelopes | call read-only + propose tools | see keys/seeds/signatures; call sign/send |
| **Agent host** (device runtime / loop) | public pubkeys, RPC config, program IDs from env | build/validate drafts, hash them, wrap outputs UNTRUSTED | load keys, call Seed Vault sign APIs without user UX, broadcast |
| **Signer — Seed Vault** (OUTSIDE loop) | seed / auth material on Seeker | show human summary + draft hash; sign approved payload; return signature to host | — |
| **Broadcast** (host, post-approval only) | signed tx bytes | submit via RPC after user-approved sign | auto-retry sign; silent resubmit |

Hand-off artefact leaving the host toward Seed Vault = `{draft_json, draft_sha256, human_summary, tx_message_bytes_b64?}`. Signer path must recompute / display what is signed. Signed payload never re-enters model context.

## 2. Lanes (on-chain is always opt-in)

```text
[Device]
  notes / chat / credentials / Seed Vault session
       |
       |- DEFAULT > sanitize > LOCAL ask  (no chain)
       |
       |- OPT-IN ON-CHAIN > sanitize (key_material reject)
              > propose_* tools only
              > user Approval UX
              > Seed Vault sign (fail closed if Vault unavailable)
              > optional broadcast (separate explicit confirm)
       |
       |- OPT-IN VERIFIED REMOTE (inference) > mask > sanitize > attest > complete
              (orthogonal to chain; never implies chain permission)
```

Hard rules:
- `local_missing ≠ remote`
- `propose ≠ sign`
- `sign ≠ broadcast` (two explicit user steps unless product later collapses with PS signoff)
- Missing Seed Vault / MWA session ⇒ deny with plain reason; never fall back to in-app keystore or paste-a-key
- On-chain lane never default; never silent

## 3. Threat model (Solana-specific)

1. **Key / seed in model context** — paste of base58 secret, BIP39, Phantom export, JSON keypair. ⇒ `key_material_in_context` before any complete; AgentDenied; digest-only logs.
2. **Blind signing** — model or injection steers destination, amount, program, or compute budget. Mitigations: strict schema; program IDs + mint allowlists from **host env only**; human_summary host-built; Seed Vault shows summary; draft_sha256 verified.
3. **Prompt injection via RPC / account data** — all chain reads UNTRUSTED wrapped.
4. **Capability creep** — tool names matching sign/send/broadcast/simulate-with-signature refused at registration and execute.
5. **Replay / wrong cluster** — draft embeds `cluster` (`devnet`|`testnet`|`mainnet-beta`); host refuses cluster≠configured; recent blockhash fetched by host not model.
6. **Attestation confusion** — TEE/remote attestation is for **inference** only; it does **not** authorize chain actions. Chain auth = user + Seed Vault only.

## 4. Programs & on-chain surface (v0 scope)

**v0 does not deploy custom programs.** First engineering is client-side propose-only + Seed Vault boundary.

| Phase | On-chain surface | Notes |
|-------|------------------|-------|
| **SM-0** (this design) | No custom program. System + well-known SPL Token transfer drafts only (allowlisted mints). | Types/stubs/tests; no live sign |
| **SM-1** | Mobile Wallet Adapter + Seed Vault sign path for one approved transfer draft on **devnet** | PS G3-equivalent gate before any sign |
| **SM-2** | Optional Salomon attestation / receipt program (Anchor) — e.g. commit hash of approved action for audit-without-PII | Separate design + PS; not required for core AI |
| **Later** | Broader DeFi / swaps / NFTs | Explicitly out of hero until built |

Custom program principles (when SM-2 opens): fail-closed; no custody of user keys; no privileged admin that can move user funds; events omit secrets and source-IDs.

## 5. Tools — IN (propose-only)

| Tool | Does | Output |
|------|------|--------|
| `propose_sol_transfer` | Unsigned SystemProgram transfer draft | draft + sha256 + summary, UNTRUSTED |
| `propose_spl_transfer` | Unsigned SPL Token transfer (allowlisted mint) | draft + sha256 + summary, UNTRUSTED |
| `preview_solana_address` | Normalize / validate base58 pubkey; no derivation from seed | pubkey meta, UNTRUSTED |
| `get_solana_balance` (read-only) | RPC getBalance / getTokenAccountBalance | UNTRUSTED |
| `get_recent_blockhash` (read-only, host) | Used internally when building draft; not model-controlled fee payer | embedded in draft by host |

## 6. Tools — OUT (forbidden until separate PS gate)

Any Seed Vault / MWA `sign*` · `sendTransaction` · `signAndSendTransaction` · broadcast helpers · key import/export · simulate that requires signatures · inventing program IDs · mainnet drafts while env=`devnet` · auto-approve.

`FORBIDDEN_TOOL_RE` (adapt from M4): whole underscore segments  
`sign|submit|broadcast|settle|execute|send|publish|import_key|export_key|signAndSend`  
plus exact denylist including MWA method names used as tools.

## 7. Draft schema (sketch)

```ts
type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";

interface SolTransferDraft {
  schema: "sm0.sol_transfer.v0";
  cluster: SolanaCluster;       // HOST from env; model value ignored/denied
  fee_payer: string;            // base58; must equal connected Seed Vault account when signing
  to: string;                   // base58; host validates
  lamports: string;             // u64 decimal string; cap-checked
  recent_blockhash?: string;    // HOST-filled at prepare-for-sign time
  unsigned: true;
}

interface SplTransferDraft {
  schema: "sm0.spl_transfer.v0";
  cluster: SolanaCluster;
  fee_payer: string;
  mint: string;                 // must ∈ TOKEN_ALLOWLIST
  to_owner: string;
  amount: string;               // raw u64 decimal; decimals from allowlist
  unsigned: true;
}

interface DraftArtefact {
  draft_json: string;
  draft_sha256: string;         // sha256(draft_json)
  human_summary: string;        // host-generated, deterministic
}
```

Validation rejects: signature/secret fields; unknown schema; non-allowlisted mint; amount over cap; wrong cluster; extra properties.

## 8. Spend caps (proposed — needs Lead lock)

| Cluster | Max SOL per draft | Max SPL (USD-ish or raw) |
|---------|-------------------|--------------------------|
| devnet / testnet | 100 SOL | env per-mint |
| mainnet-beta | **0.5 SOL** until SM-1 PS gate | deny SPL until allowlist + caps stamped |

Missing `MAX_DRAFT_LAMPORTS` ⇒ deny `draft_amount_cap_missing`.

## 9. Attestation (two meanings — keep separate)

| Kind | Purpose | Owner pattern |
|------|---------|---------------|
| **Inference attestation** | Fail-closed verify before verified-remote complete | Reuse `phase1.5-attestation` client; unchanged |
| **Action attestation / receipt** (optional SM-2) | On-chain or local receipt that user approved draft_sha256 | New Anchor program or local signed receipt; **not** a substitute for Seed Vault |

Never conflate TEE instance allowlist with wallet authorization.

## 10. Integration with Android / Seeker packaging

- **M-A0 (Android primary):** Seeker / Seed Vault / wallets **explicitly out of scope** (Lead locked).
- **Parallel Solana Mobile app:** separate packaging track (dApp Store / Seeker). Shares Rust privacy core (creds, fail-closed ask) via Platform; adds MWA + Seed Vault module owned here + Platform/Seed Vault Engineer.
- Model never receives Seed Vault auth tokens or seed phrases.

## 11. Milestone plan

| ID | Deliverable | Gate |
|----|-------------|------|
| **SM-0** | This design + TS/Rust types + propose stubs + unit tests proving propose≠sign; no MWA | PS soft skim + Lead OK |
| **SM-1** | MWA authorize + Seed Vault sign **one** devnet transfer after Approval UX; broadcast optional second confirm | PS signoff (G3-class) before any sign path |
| **SM-2** | Optional receipt/attestation program design | Separate Lead+PS |
| **SM-G3** | Any mainnet or signAndSend collapse | Explicit open; not planned until SM-1 green |

## 12. Reuse from archived NEAR M4

Keep: custody table shape, UNTRUSTED wrap, FORBIDDEN tool regex discipline, host-owned config IDs, host-built human_summary, draft_sha256, spend caps, G1→G2→G3 gate ladder, `key_material_in_context`.  
Drop / replace: NEAR Intents verifier, Chain Signatures MPC, NEP-413, intents.near.  
Signer target: **Seed Vault via Mobile Wallet Adapter**, not in-loop MPC.

## 13. Honesty / claims (S1)

| Allowed | Forbidden |
|---------|-----------|
| Direction: Seed Vault is the intended signer | "Seed Vault signs" as shipped fact before SM-1 |
| Propose-only stubs / tests | Claiming chain actions or dApp Store app shipped |
| Parallel track to Android primary | Making Solana required for core AI |
| Fail closed if Vault missing | Paste-key or in-app seed fallback |

## 14. Ask for approval (this turn)

1. Lock **SM-0** scope (no custom program; transfer propose stubs only).  
2. Lock spend caps (devnet 100 SOL / mainnet 0.5 SOL).  
3. Confirm **sign ≠ broadcast** as two user steps for SM-1.  
4. Confirm I should scaffold SM-0 stubs next (and ping Platform / Solana Product only after you say so).

---

## Lead direction (2026-10-29 ~21:22 PDT)

- Owner: On-Chain Engineer for **salomon-solana**.
- Scaffold includes `programs/` **placeholder** (no deploy required for SM-0).
- Design = propose-only / fail-closed signing; **no keys in model**.
- **Wait for M0 tip**, then outline **M2/M3 program boundaries** with Seed Vault Engineer.
- Do not open Seed Vault Engineer coordination before M0 tip lands.

## Lead approval (2026-10-29 ~21:23 PDT)

**DRAFT APPROVED** — no changes required before M0.

Locked:
- propose ≠ sign ≠ broadcast
- host-built `human_summary` + `draft_sha256`
- no custom program in SM-0
- attestation orthogonal to chain auth

**Naming:**
- **Lead M0** = repo scaffold tip (`salomon-solana`)
- **SM-0** = first eng slice after tip (types/stubs/tests + transfer propose only)

**Parking:** after M0 SHA lands, move this design under `salomon-solana` `docs/` — **not** into pure-AI `salomon`. Then outline M2/M3 program boundaries with Seed Vault Engineer.
