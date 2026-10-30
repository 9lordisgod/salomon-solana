# UI design principles — Salomon Solana (Seeker / mobile)

> Owner: Solana Product · Co-own with Solana Mobile FE · Draft 2026-10-29 (America/Vancouver)
> Base tip: `7897172` (main) · Align surfaces to [`docs/PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md) + [`docs/notes/OVERCLAIMS.md`](OVERCLAIMS.md)
> **Not a shipped lookbook.** Goal-tense for unbuilt capabilities. Slice 1 implements Research desk + Ask only.

## North star

Premium, restrained research desk for Solana Mobile — zinc/mono, quiet chrome, high signal. The user always knows: where inference runs, that chain is propose-only, and that signing needs an explicit approval outside the model.

## Non-negotiables (every surface)

1. **Honest mode chips** — `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` · `REFUSED` (never soften; never badge STUB/REMOTE as LOCAL).
2. **Standing status strip** — when the surface is about ask or chain, keep visible (compact chips or footer):
   - **LOCAL** (or honest substitute)
   - **PROPOSE-ONLY** (on-chain intent path)
   - **APPROVAL REQUIRED** (no silent sign / broadcast)
3. **Fail-closed is obvious** — missing model → empty state that blocks ask, plain reason, no silent REMOTE hop.
4. **Goal tense only** for Seed Vault, dApp Store listing, on-device model, live signing, chain submit.
5. **Keys never in the model** — copy and UX reinforce Seed Vault as intended signer; no paste-seed / in-app keystore affordances.
6. **Propose ≠ Sign ≠ Broadcast** — three distinct user moments when chain is live (M2–M3); Slice 1 has no live signing UI.
7. **No pure-AI Compose / Play narrative** — this app lives in `apps/mobile` on this repo only.

## Aesthetic

| Do | Don’t |
|----|--------|
| Zinc / mono, tight type, generous but calm spacing | Neon crypto kitsch, meme wallets, hype CTAs |
| Quiet headers; content first | Dense dashboards, chart spam on home |
| Short goal-tense boundary lines | Present-tense “Seed Vault signs” / “on-device model ready” before true |
| One primary action per screen | Competing “Sign now” / “Connect wallet” hero chrome in M0 |

Visual baseline: chat-first zinc desk already on `fe/mobile-slice1`. Evolve; don’t fork a second aesthetic.

---

## Information architecture

Five primary destinations. Bottom or rail nav may land later; Slice 1 can be desk-only with Settings reachable from header overflow.

```text
┌─────────────────────────────────────────────┐
│  Status: LOCAL | PROPOSE-ONLY | APPROVAL…   │  ← persistent when relevant
├─────────────────────────────────────────────┤
│  Research desk  │  Ask lives here (home)    │
│  Approval       │  Pending + history        │
│  Library        │  Local notes / threads    │
│  Settings       │  Model, network, honesty  │
└─────────────────────────────────────────────┘
```

| Dest | Role | M0 / Slice 1 | Later |
|------|------|--------------|-------|
| **Research desk** | Home. Thread list + active chat. Primary research surface. | **In** | — |
| **Ask** | Not a separate tab: the composer + thread *on* the desk. Named as a flow. | **In** | Streaming, tools |
| **Approval** | Queue of propose-only drafts awaiting Sign / Broadcast confirms. | Stub / empty goal-tense | M2–M3 live |
| **Library** | On-device notes & saved threads (local-first). | Placeholder OK | Search, export opt-in |
| **Settings** | Model path, chip legend, network/RPC labels, Seed Vault status (goal), honesty links. | Minimal | REMOTE opt-in labeled |

---

## Primary flows

### 1. Research desk (home)

- Open app → desk with thread (or empty welcome in goal tense).
- Header: product name + **honest engine chip(s)**.
- Persistent or header-adjacent: **LOCAL · PROPOSE-ONLY · APPROVAL REQUIRED** (can collapse to icons + a11y labels on small widths).
- Seed Vault line (goal): e.g. “Intended signer: Seed Vault — keys never enter the model; signing not shipped.”
- No chain-action screens; no live Sign CTA in Slice 1.

### 2. Ask

```text
User types → Sanitizer (host) → Local model?
  ├─ yes → answer in thread; chip LOCAL
  ├─ no  → fail-closed empty / blocked composer; chip MODEL MISSING
  └─ refuse path → chip REFUSED; plain reason; no silent retry via REMOTE
```

- Composer disabled or clearly blocked when `MODEL MISSING`.
- If labeled REMOTE is ever offered (post–Slice 1): explicit opt-in, never default, never silent; chip must read `REMOTE`.
- STUB answers (dev): chip `STUB` always.

### 3. Approval (propose → sign → broadcast)

Goal flow when chain is live (not Slice 1 UI):

```text
Model/tool emits proposal (UNTRUSTED)
  → host builds human_summary + draft_sha256
  → Approval sheet: review summary, amount, cluster, destination
  → User Sign → Seed Vault / MWA (outside model)
  → Host holds signature
  → User Broadcast (second confirm) → RPC
  → reject at any step → discard; no auto-retry sign
```

Slice 1: Approval destination may show an honest empty state — “Propose-only approvals will land here; signing not shipped.” No fake pending items.

### 4. Library

- Local threads / notes index; open → desk thread.
- Default: stays on device. Any export / sync = labeled, user-explicit (later).
- No cloud library implied in copy.

### 5. Settings

Minimum useful:

- **Model** — path / present / missing (drives `MODEL MISSING`).
- **Chip legend** — what LOCAL / STUB / REMOTE / MODEL MISSING / REFUSED mean.
- **On-chain** — PROPOSE-ONLY reminder; Seed Vault status goal-tense (“not connected / not shipped”).
- **Honesty** — link or short list from OVERCLAIMS (no live listing / signing claims).

Never: seed paste, private-key import, “enable auto-sign.”

---

## Slice map (FE)

| Slice | Ships | Explicitly out |
|-------|-------|----------------|
| **1** (current) | Desk + Ask thread, honest chips, fail-closed missing model, goal-tense SV copy | Live signing, chain screens, REMOTE default, Library depth, Approval queue live |
| **2** | Settings minimal + Library placeholder; Approval empty honest | Sign path |
| **M2–M3** | Approval Sign → Vault; then Broadcast confirm | Auto-sign, custody |

Repo path: `apps/mobile/` only.

---

## Copy patterns

| Intent | Pattern |
|--------|--------|
| Unbuilt capability | “Aims to…” / “Intended…” / “(not shipped)” |
| Mode | Chip text exact; don’t paraphrase into softer synonyms in UI |
| Failure | One plain sentence + what the user can do (install/connect model) |
| Chain | “Propose” / “Review” / “Sign in Seed Vault” / “Broadcast” — never “Send” as the first CTA for a draft |

---

## Open for FE alignment

1. Nav: desk-only Slice 1 vs early 4–5 tab rail (Product default: **desk-only + header entry to Settings** until Slice 2).
2. Status strip: always-on vs show on Ask/Approval only (Product default: **always-on compact** on desk).
3. Approval empty-state copy length (keep ≤2 lines).
4. Whether Library is a real route stub in Slice 1 or Settings-only link (Product default: **defer route**; mention in Settings).

FE: comment on the PR or reply in-agent; Product will revise this note once, then lock for Slice 2.

## Related

- [`docs/PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md)
- [`docs/notes/PRODUCT_NICHE.md`](PRODUCT_NICHE.md)
- [`docs/notes/OVERCLAIMS.md`](OVERCLAIMS.md)
- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md`](../DESIGN_SEED_VAULT_BOUNDARIES_V0.md)

## Copyright

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
