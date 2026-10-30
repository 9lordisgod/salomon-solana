# UI design principles — Salomon Solana (Seeker / mobile)

> Owner: Solana Product · Co-own with Solana Mobile FE · Draft 2026-10-29 (America/Vancouver)
> Base tip: `7897172` (main) · Align surfaces to [`docs/PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md) + [`docs/notes/OVERCLAIMS.md`](OVERCLAIMS.md)
> **Status:** FE ACK 2026-10-29 — treat as aligned. Visual tokens / refined desk = FE Slice 2 after Android M1 green.
> **Not a shipped lookbook.** Goal-tense for unbuilt capabilities. Slice 1 implements Research desk + Ask only.

## North star

Premium, restrained research desk for Solana Mobile — zinc/charcoal (Linear/Craft), quiet chrome, high signal. Not a chatbot bubble-fest; not flashy crypto. The user always knows: where inference runs, that chain is propose-only, and that signing needs an explicit approval outside the model.

## Non-negotiables (every surface)

1. **Honest mode chips** — `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` · `REFUSED` (never soften; never badge STUB/REMOTE as LOCAL).
2. **Standing policy strip** — when the surface is about ask or chain, keep visible (compact chips or footer):
   - **LOCAL** (or honest substitute — may mirror mode chip)
   - **PROPOSE-ONLY** (on-chain intent path)
   - **APPROVAL REQUIRED** (no silent sign / broadcast)
3. **Mode ≠ policy visually** — engine mode chips (`LOCAL|STUB|REMOTE|MODEL MISSING|REFUSED`) stay visually distinct from policy chips (`PROPOSE-ONLY` · `APPROVAL REQUIRED`). Mode answers “where did this answer run?”; policy answers “what are the trust rules?”
4. **Fail-closed is obvious** — missing model → empty state that blocks ask, plain reason, no silent REMOTE hop.
5. **Goal tense only** for Seed Vault, dApp Store listing, on-device model, live signing, chain submit.
6. **Keys never in the model** — copy and UX reinforce Seed Vault as intended signer; no paste-seed / in-app keystore affordances.
7. **Propose ≠ Sign ≠ Broadcast** — three distinct user moments when chain is live (M2–M3); Slice 1 has no live signing UI.
8. **No pure-AI Compose / Play narrative** — this app lives in `apps/mobile` on this repo only.
9. **Shared enums** — when Agent Runtime tips `packages/ask` (or equivalent) shared types, FE imports those enums rather than forking chip/mode string unions.

## Aesthetic

| Do | Don’t |
|----|--------|
| Zinc / charcoal, tight type, generous but calm spacing | Neon crypto kitsch, meme wallets, hype CTAs |
| Quiet headers; content first | Dense dashboards, chart spam on home |
| Short goal-tense boundary lines | Present-tense “Seed Vault signs” / “on-device model ready” before true |
| One primary action per screen | Competing “Sign now” / “Connect wallet” hero chrome in M0 |
| Mode chips styled apart from policy strip | One undifferentiated chip row that conflates engine + trust |

Visual baseline: chat-first zinc desk on `fe/mobile-slice1`. FE owns token refinement in Slice 2; don’t fork a second aesthetic.

---

## Information architecture

Five primary destinations. Bottom or rail nav may land later; Slice 1 is desk-only with Settings reachable from header.

```text
┌─────────────────────────────────────────────┐
│  Policy: LOCAL | PROPOSE-ONLY | APPROVAL…   │  ← always-on compact on desk
│  Mode chip(s): LOCAL / STUB / …             │  ← distinct from policy strip
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
| **Approval** | Queue of propose-only drafts awaiting Sign / Broadcast confirms. | Stub / empty goal-tense (≤2 lines) | M2–M3 live |
| **Library** | On-device notes & saved threads (local-first). | Deferred — Settings mention only | Search, export opt-in |
| **Settings** | Model path, chip legend, network/RPC labels, Seed Vault status (goal), honesty links. | Header entry | REMOTE opt-in labeled |

**Nav (locked):** desk-only + header → Settings until Slice 2. No 5-tab rail yet.

---

## Primary flows

### 1. Research desk (home)

- Open app → desk with thread (or empty welcome in goal tense).
- Header: product name + **honest engine mode chip(s)** (visually distinct).
- Always-on compact **policy strip**: **LOCAL · PROPOSE-ONLY · APPROVAL REQUIRED** (icons + a11y labels OK on small widths).
- Seed Vault line (goal): e.g. “Intended signer: Seed Vault — keys never enter the model; signing not shipped.”
- No chain-action screens; no live Sign CTA in Slice 1.

### 2. Ask

```text
User types → Sanitizer (host) → Local model?
  ├─ yes → answer in thread; mode chip LOCAL
  ├─ no  → fail-closed empty / blocked composer; mode chip MODEL MISSING
  └─ refuse path → mode chip REFUSED; plain reason; no silent retry via REMOTE
```

- Composer disabled or clearly blocked when `MODEL MISSING`.
- If labeled REMOTE is ever offered (post–Slice 1): explicit opt-in, never default, never silent; mode chip must read `REMOTE`.
- STUB answers (dev): mode chip `STUB` always.

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

Slice 1 / early stub: Approval empty state ≤2 lines goal-tense — e.g. “Propose-only approvals will land here. Signing not shipped.” No fake pending items.

### 4. Library

- Local threads / notes index; open → desk thread.
- Default: stays on device. Any export / sync = labeled, user-explicit (later).
- Slice 1: **no Library route** — mention in Settings only.

### 5. Settings

Minimum useful:

- **Model** — path / present / missing (drives `MODEL MISSING`).
- **Chip legend** — mode chips vs policy strip explained separately.
- **On-chain** — PROPOSE-ONLY reminder; Seed Vault status goal-tense (“not connected / not shipped”).
- **Honesty** — link or short list from OVERCLAIMS (no live listing / signing claims).
- **Library** — one line that local notes land later / stay on device.

Never: seed paste, private-key import, “enable auto-sign.”

---

## Slice map (FE)

| Slice | Ships | Explicitly out |
|-------|-------|----------------|
| **1** (shipped path) | Desk + Ask thread, honest mode chips, fail-closed missing model, goal-tense SV copy | Live signing, chain screens, REMOTE default, Library route, Approval queue live |
| **2** (after Android M1 green) | Visual tokens / refined desk; Approval empty stub; Settings minimal; Library still light | Sign path |
| **M2–M3** | Approval Sign → Vault; then Broadcast confirm | Auto-sign, custody |

Repo path: `apps/mobile/` only. Android `SHIP_ANDROID_M1.md` remains Priority 1 ahead of Slice 2 polish.

---

## Copy patterns

| Intent | Pattern |
|--------|--------|
| Unbuilt capability | “Aims to…” / “Intended…” / “(not shipped)” |
| Mode | Chip text exact; don’t paraphrase into softer synonyms in UI |
| Failure | One plain sentence + what the user can do (install/connect model) |
| Chain | “Propose” / “Review” / “Sign in Seed Vault” / “Broadcast” — never “Send” as the first CTA for a draft |

### Copy bans (present tense until true)

- “Seed Vault signs” / live signing as shipped
- dApp Store listed / published Seeker build as fact
- On-device model as shipping product
- “Notes stay on your phone” as absolute while REMOTE can exist
- “Local-only” while STUB/REMOTE exist
- Auto-sign, custody, paste-seed, silent chain, DeFi/trading agents
- Pure-AI Compose / Play narrative in this app

---

## Alignment log

| Date | Who | Result |
|------|-----|--------|
| 2026-10-29 | Product | Initial draft PR #8 |
| 2026-10-29 | Solana Mobile FE | ACK all four defaults; mode≠policy + shared-enums notes; Slice 2 after Android M1 |

Open only if Lead objects. FE will not further edit this note unless Lead objects; FE owns visual-token implementation in code.

## Related

- [`docs/PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md)
- [`docs/notes/PRODUCT_NICHE.md`](PRODUCT_NICHE.md)
- [`docs/notes/OVERCLAIMS.md`](OVERCLAIMS.md)
- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md`](../DESIGN_SEED_VAULT_BOUNDARIES_V0.md)
- [`docs/notes/SHIP_ANDROID_M1.md`](SHIP_ANDROID_M1.md)

## Copyright

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
