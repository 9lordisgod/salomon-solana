# DESIGN — Seed Vault / wallet boundaries (salomon-solana · Seeker)

**Author:** Seed Vault Engineer · **Date:** Thu Oct 29, 2026 (America/Vancouver) · **Status:** SV-0 **APPROVED** (Lead) — design only; **not shipped**  
**Repo tip of record:** `9lordisgod/salomon-solana` @ `002f34e` (GitHub `main`)  
**Binds to:** [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) ask vs propose-only paths · On-Chain SM-0 (types/stubs/tests + transfer propose only; sign later)  
**Not for:** Main Android Salomon / pure-AI narrative. No product claims until **M2** (Seed Vault boundary) is green.

## 0. One-line rule

Seed material and signing authority live **only** in Solana Mobile **Seed Vault** (reached via Mobile Wallet Adapter). The model and agent loop never see seeds, private keys, auth tokens, or signatures. Any **sign** or **export** requires **explicit user approval** in host UX before the Vault path runs. Missing Vault / MWA ⇒ fail closed with a plain reason — never paste-a-key, never in-app keystore fallback.

## 1. Ownership (who owns what)

| Owner | Owns | Does not own |
|-------|------|--------------|
| **Seed Vault Engineer** (this role) | Custody boundary at Vault; MWA↔Vault session rules; approve-gated sign/export contract; what may never enter model context; fail-closed Vault-missing behavior; honesty claims for Vault | Custom programs, draft schemas, spend caps (On-Chain); RN screens polish (Solana Mobile FE); dApp Store packaging (Solana Release); Android Play primary path |
| **On-Chain Engineer** | Propose-only tools, draft schemas, program/mint allowlists, spend caps, UNTRUSTED wraps, FORBIDDEN tool regex | Calling Seed Vault APIs; Approval UX chrome |
| **Solana Mobile FE** | Approval / sign / broadcast UX on Seeker; display of `human_summary` + `draft_sha256`; connect/authorize session UI | Inventing sign tools in the model loop |
| **Platform** | Shared Rust privacy core (creds out of model, fail-closed ask); packaging seams for MWA module | Wallet custody policy |

**M0 landed** (scaffold tip `002f34e`). Coordinate with On-Chain + Solana Mobile FE on this contract. Design + interface only until M2/M3; no live sign path in SV-0.

## 2. Zones (Seed Vault view)

| Zone | Holds | May do | Never |
|------|-------|--------|-------|
| **Model** | Sanitized prompts + UNTRUSTED tool envelopes | Call propose / read-only tools | See seed, key, Vault token, signature, export blob |
| **Agent host** | Public pubkey(s), RPC/cluster config, draft artefacts | Build/validate drafts; hash; present Approval UX; after approve, invoke MWA→Vault; optional broadcast after second confirm | Sign without UX; auto-approve; re-inject signatures into model context; export seed/keys to chat or logs |
| **MWA session** | Authorized account pubkey(s), ephemeral session | Authorize / reauthorize; pass sign requests the user approved | Persist seed outside Vault; widen scopes silently |
| **Seed Vault** (OUTSIDE loop) | Seed / auth material on Seeker | Show what will be signed; sign approved payload; return signature to host | — |
| **Export path** | User-approved export payload (notes, draft JSON, receipts — **never** seed) | Write only after explicit approve | Export keys, mnemonic, Vault tokens, or raw signed bytes into model context |

Hand-off **into** Vault (from On-Chain design): `{draft_json, draft_sha256, human_summary, tx_message_bytes_b64?}`.  
Vault / FE path **must** recompute or display what is signed and refuse if `draft_sha256` mismatches.  
Hand-off **out of** Vault: signature bytes to **host only**. Signed payload **never** re-enters model context.

## 3. Hard deny matrix

| Condition | Required outcome | Forbidden |
|-----------|------------------|-----------|
| Key / seed / mnemonic / keypair JSON in any model-bound context | `key_material_in_context` / refuse before complete | Mask-through; log cleartext |
| User asks to "export seed" / "show private key" / "backup phrase into chat" | Refuse; point to OS/Vault backup flows outside Salomon | Dump seed into UI transcript or model |
| No Seed Vault / MWA session when sign requested | Deny with plain reason (`vault_unavailable` / `mwa_not_authorized`) | In-app keystore; paste-key; soft continue |
| Approval UX not confirmed | No MWA `sign*` call | Auto-approve; collapse propose→sign |
| `draft_sha256` mismatch at sign time | Abort sign; no signature returned | Sign stale or mutated draft |
| Sign succeeded | Host holds signature; model sees at most "signed (hash…)" status if needed — prefer no model re-entry | Echo signature / signed tx into prompts |
| Broadcast not separately confirmed (SM-1) | Do not submit | `signAndSend` collapse without PS+Lead open |
| Inference TEE attest OK | Still **no** chain permission | Treating attest as wallet auth |

## 4. Approval contract (sign / export)

Two consequential classes, both **propose → explicit user approve → act outside model**:

### 4.1 Sign (SM-1+, gated)

1. Host shows deterministic `human_summary` + `draft_sha256` (+ cluster, fee payer, amounts).  
2. User confirms **Sign**.  
3. Host calls MWA → Seed Vault with the exact approved bytes.  
4. On success, host may offer **Broadcast** as a **second** confirm (On-Chain: `sign ≠ broadcast` until PS collapses).  
5. Deny / cancel at any step is final for that artefact; rebuild draft to retry.

### 4.2 Export (any credential-adjacent or user-data leave-device)

1. Agent proposes export (path, contents class: notes / draft JSON / receipt — **never** seed).  
2. Host lists exactly what leaves the device.  
3. User confirms **Export**.  
4. Host writes/shares; model does not receive file bytes back unless a separate sanitized re-ingest path exists.

**Standing Lead rule:** explicit user approval for **any** sign or export. No silent clipboard dumps of secrets.

## 5. Session rules (MWA → Seed Vault)

- Authorize only with user-visible connect flow (FE).  
- Host may store **public** authorized address(es) + cluster; never seed or Vault auth secrets in app prefs that the model can read.  
- Reauthorize when account or cluster changes; refuse sign if fee_payer ≠ connected account.  
- Disconnect clears host session handles; does not claim Vault wiped.  
- Logs: digests and public pubkeys only.

## 6. Milestone alignment (repo ROADMAP)

Repo milestones (`docs/ROADMAP.md`): M0 scaffold · M1 local ask · **M2 Seed Vault boundary** · M3 propose-only transfers + signing · M4 dApp Store.

| ID | Maps to | Seed Vault Engineer deliverable | Gate |
|----|---------|--------------------------------|------|
| **SV-0** | M0 / On-Chain SM-0 | This boundary doc + Approval/Sign/Export interface types (no live MWA) | Lead **APPROVED**; PS soft skim with SM-0 |
| **SV-M2** | **M2** | MWA authorize session; prove keys never reach the model; fail closed if Vault missing | Product claims for Vault boundary only after M2 green |
| **SV-M3** | M3 / On-Chain SM-1 | Live Seed Vault sign for approved draft after Approval UX; **sign ≠ broadcast** (second confirm); signature stays out of model | PS G3-class before any sign |
| **SV-Export** | with FE | Export approval for non-secret artefacts only | Never seed/mnemonic export in-product |
| **SV-G3** | later | Mainnet or `signAndSend` collapse | Explicit Lead+PS open only |

Honesty: say "Seed Vault is the **intended** signer" until M2/M3 green. Forbidden: present-tense "Seed Vault signs" / shipped chain actions before those gates.

### ARCHITECTURE note (align with Docs)

`docs/ARCHITECTURE.md` mermaid currently goes `SV approve → SIGN → RPC` in one path. **Locked:** sign ≠ broadcast as two explicit user steps for M3/SM-1. Prefer Docs soft-edit to show Broadcast as a separate confirm after Seed Vault returns a signature to the host.

## 7. Interface sketch (host ↔ FE / Vault module)

```ts
/** Host → Approval UX (no secrets) */
interface SignApprovalRequest {
  kind: "sign_solana_draft";
  draft_sha256: string;
  human_summary: string;
  cluster: "devnet" | "testnet" | "mainnet-beta";
  fee_payer: string; // base58 public only
  // optional display fields already inside human_summary
}

interface ExportApprovalRequest {
  kind: "export_artefact";
  artefact_class: "notes" | "draft_json" | "receipt" | "other_nonsensitive";
  destination_label: string; // e.g. "Share sheet" / "Local file"
  content_digest: string;    // sha256 of bytes to export
  // NEVER artefact_class that implies seed/key
}

type ApprovalDecision = { approved: true } | { approved: false; reason?: string };

/** After approve — host only; result must not be fed to model as raw bytes */
interface SignResult {
  draft_sha256: string;
  signature_b64: string; // host-held
  pubkey: string;
}
```

Forbidden request kinds: `export_seed`, `export_mnemonic`, `export_private_key`, `sign_and_send` (until SV-G3 explicitly opened).

## 8. Claims (S1)

| Allowed | Forbidden |
|---------|-----------|
| Parallel Seeker track; Vault intended signer | Seed Vault / chain as required for core Android AI |
| Propose-only; approve before sign/export | Present-tense "Vault signs" / "keys stay in Vault" as shipped product before M2/M3 |
| Fail closed if Vault missing | Paste-key or in-app seed backup inside Salomon |
| Credentials / seeds never in the model | Logging or chat-echo of secrets |

## 9. Locked (Lead 2026-10-29)

1. **SV-0** = Seed Vault half of On-Chain **SM-0** (design + types only).  
2. **M0** = scaffold tip `002f34e` on `9lordisgod/salomon-solana` — landed.  
3. **sign ≠ broadcast** two-step locked for SM-1 / M3.  
4. **No in-product seed export** — refuse; point to OS / Seed Vault backup only.

## 10. Related

- This repo: `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/STATUS.md`  
- On-Chain SM-0 draft (box handoff): `/workspace/docs-handoff-solana-onchain/DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md`  
- Inference hybrid lanes (orthogonal to chain auth): main Salomon `HYBRID_TRUST_BOUNDARIES.md` — do not conflate TEE attest with wallet auth
