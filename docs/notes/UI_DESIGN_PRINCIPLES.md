<!-- © 2026 Anon Rothschild. All rights reserved. Proprietary. -->
# UI design principles — Salomon Solana (Seeker / mobile)

> Owner: Solana Product · Co-own with Solana Mobile FE · Lead visual tokens appendix
> **Status:** FE ACK 2026-10-29 — treat as aligned. Visual tokens / refined desk = FE Slice 2 after Android M1 green.
> **Not a shipped lookbook.** Goal-tense for unbuilt capabilities. Slice 1 implements Research desk + Ask only.
> Conflict-resolved merge of PR #8 into main (Lead + Product) 2026-10-29.

## North star

Premium, restrained research desk for Solana Mobile — zinc/charcoal (Linear/Craft), quiet chrome, high signal. Not a chatbot bubble-fest; not flashy crypto. The user always knows: where inference runs, that chain is propose-only, and that signing needs an explicit approval outside the model.

## Non-negotiables (every surface)

1. **Honest mode chips** — `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` · `REFUSED` (never soften; never badge STUB/REMOTE as LOCAL).
2. **Standing policy strip** — when the surface is about ask or chain, keep visible (compact chips or footer):
   - **LOCAL** (or honest substitute — may mirror mode chip)
   - **PROPOSE-ONLY** (on-chain intent path)
   - **APPROVAL REQUIRED** (no silent sign / broadcast)
3. **Mode ≠ policy visually** — engine mode chips stay visually distinct from policy chips. Mode answers "where did this answer run?"; policy answers "what are the trust rules?"
4. **Fail-closed is obvious** — missing model → empty state that blocks ask, plain reason, no silent REMOTE hop.
5. **Goal tense only** for Seed Vault, dApp Store listing, on-device model, live signing, chain submit.
6. **Keys never in the model** — Seed Vault as intended signer; no paste-seed / in-app keystore affordances.
7. **Propose ≠ Sign ≠ Broadcast** — three distinct user moments when chain is live (M2–M3); Slice 1 has no live signing UI.
8. **No pure-AI Compose / Play narrative** — this app lives in `apps/mobile` on this repo only.
9. **Shared enums** — when Agent Runtime tips `packages/ask` shared types, FE imports those enums rather than forking chip/mode string unions.

## Aesthetic

| Do | Don't |
|----|--------|
| Zinc / charcoal, tight type, generous but calm spacing | Neon crypto kitsch, meme wallets, hype CTAs |
| Quiet headers; content first | Dense dashboards, chart spam on home |
| Short goal-tense boundary lines | Present-tense "Seed Vault signs" / "on-device model ready" before true |
| One primary action per screen | Competing "Sign now" / "Connect wallet" hero chrome in M0 |
| Mode chips styled apart from policy strip | One undifferentiated chip row that conflates engine + trust |

Visual baseline: chat-first zinc desk on `fe/mobile-slice1`. FE owns token refinement in Slice 2; don't fork a second aesthetic. Concrete RN tokens: see **Appendix A**.

---

## Information architecture

Five primary destinations. Slice 1 is desk-only with Settings reachable from header.

| Dest | Role | M0 / Slice 1 | Later |
|------|------|--------------|-------|
| **Research desk** | Home. Thread list + active chat. | **In** | — |
| **Ask** | Composer + thread *on* the desk. | **In** | Streaming, tools |
| **Approval** | Propose-only drafts awaiting Sign / Broadcast. | Stub / empty ≤2 lines goal-tense | M2–M3 live |
| **Library** | On-device notes & saved threads. | Deferred — Settings mention only | Search, export opt-in |
| **Settings** | Model path, chip legend, network/RPC, Seed Vault (goal), honesty. | Header entry | REMOTE opt-in labeled |

**Nav (locked):** desk-only + header → Settings until Slice 2. No 5-tab rail yet.

---

## Primary flows

### 1. Research desk (home)
- Open app → desk with thread (or empty welcome in goal tense).
- Header: product name + honest engine mode chip(s) (visually distinct).
- Always-on compact policy strip: **LOCAL · PROPOSE-ONLY · APPROVAL REQUIRED**.
- Seed Vault line (goal): "Intended signer: Seed Vault — keys never enter the model; signing not shipped."
- No chain-action screens; no live Sign CTA in Slice 1.

### 2. Ask
```text
User types → Sanitizer (host) → Local model?
  ├─ yes → answer in thread; mode chip LOCAL
  ├─ no  → fail-closed; mode chip MODEL MISSING
  └─ refuse → mode chip REFUSED; plain reason; no silent REMOTE
```
- Composer blocked when `MODEL MISSING`.
- REMOTE only with explicit opt-in later; never default/silent.
- STUB answers always chip `STUB`.

### 3. Approval (propose → sign → broadcast)
Goal when chain is live (not Slice 1): proposal → human_summary + draft_sha256 → Approval sheet → Sign in Seed Vault/MWA → hold signature → separate Broadcast confirm.
Slice 1 stub: ≤2 lines goal-tense; no fake pending items.

### 4. Library
Slice 1: **no Library route** — Settings mention only.

### 5. Settings
Model path/present/missing; chip legend (mode vs policy); PROPOSE-ONLY + Seed Vault goal-tense; honesty/OVERCLAIMS. Never: seed paste, private-key import, auto-sign.

---

## Slice map (FE)

| Slice | Ships | Explicitly out |
|-------|-------|----------------|
| **1** | Desk + Ask, honest mode chips, fail-closed missing model, goal-tense SV copy | Live signing, REMOTE default, Library route, Approval queue live |
| **2** (after Android M1 green) | Visual tokens / refined desk; Approval empty stub; Settings minimal | Sign path |
| **M2–M3** | Approval Sign → Vault; then Broadcast confirm | Auto-sign, custody |

Android `SHIP_ANDROID_M1.md` remains Priority 1 ahead of Slice 2 polish.

---

## Copy patterns & bans

Unbuilt = "Aims to…" / "Intended…" / "(not shipped)". Mode chip text exact. Chain CTAs: Propose / Review / Sign in Seed Vault / Broadcast — never "Send" as first CTA for a draft.

**Banned present tense until true:** Seed Vault signs; dApp Store listed; on-device model ready; notes stay on phone (absolute while REMOTE can exist); local-only while STUB/REMOTE exist; auto-sign; paste-seed; pure-AI Compose/Play narrative.

---

## Alignment log

| Date | Who | Result |
|------|-----|--------|
| 2026-10-29 | Product | Initial draft PR #8 |
| 2026-10-29 | Solana Mobile FE | ACK all four defaults; mode≠policy + shared-enums; Slice 2 after Android M1 |
| 2026-10-29 | Lead | Conflict-resolve merge: keep Product IA + Lead visual tokens appendix |

## Related

- `docs/PRODUCT_SCOPE.md`, `docs/notes/OVERCLAIMS.md`, `docs/notes/SHIP_ANDROID_M1.md`, `docs/notes/AI_MODEL_RECOMMENDATION.md`, `packages/ask`

## Appendix A — Visual system (Lead / RN tokens)

```ts
export const tokens = {
  bg: '#09090B',
  bgRaised: '#18181B',
  bgSunken: '#0C0C0E',
  border: '#27272A',
  borderStrong: '#3F3F46',
  textBright: '#FAFAFA',
  text: '#E4E4E7',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
  accent: '#A3B8FF',
  accentFg: '#09090B',
  ok: '#86EFAC',
  warn: '#FCD34D',
  danger: '#FCA5A5',
};
```

Type: Display 28/34 600; Title 20/26 600; Body 15/22 400; Label 13/18 500; Meta/chip 11/14 600 uppercase; Mono 12/16. Spacing 4-pt base. Radius: 6 chips, 12 cards, 20 sheet top. Agent replies = document blocks (no chat bubbles).

## First UI milestone — UI-1

"Refined research desk + honest status + approval sheet stub." Tokens in `src/theme.ts`; desk redesign; `ApprovalSheet` fixture behind dev flag labeled `STUB — no wallet connected` (Approve disabled). Done when: runs on Android emulator (M1), screenshots on PR, copy-flag/banned words cleared. Owners: Solana Mobile FE (build), Product (copy), Lead (review).

## Copyright

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
