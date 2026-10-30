# Product Scope — Salomon Solana

> Owner: Solana Product · Draft 2026-10-29 (America/Vancouver) · base tip `002f34e`
> Sibling pure-AI Salomon stays crypto-free. Do not mix narratives.

## One-liner (goal tense)

Salomon Solana aims to be a **local-first AI research agent for Solana Mobile / Seeker**: on-device asks by default; propose-only on-chain actions; **Seed Vault** for signing — keys never in the model.

**Not shipped yet:** dApp Store build, on-phone model, live Seed Vault integration, or working chain actions. M0 = scaffold only.

## Audience

Primary: crypto-native users on **Solana Mobile (Seeker / dApp Store)** who want private on-device research AI and safe, user-approved on-chain actions.

Secondary: traders / researchers who already live on Seeker and need a research desk that does not silently leave the device.

Out of hero: pure-AI Android Play users (that product lives in the separate Salomon repo), journalist/source-protection framing as hero (historical privacy foundation only).

## Promise (direction — not all shipped)

| Promise | Status |
|---|---|
| Local-first asks; fail closed if no local model | Goal · M1 |
| Notes/chat stay on-device unless user opts into a **labeled** remote path | Goal · never silent, never default |
| Credentials / seed material never enter the model | Standing rule |
| Signatures only via Seed Vault after explicit user approval | Goal · M2–M3; **not live** |
| Light Solana actions: propose → sanitize/allowlist/simulate → Seed Vault approve | Goal · M3; **not live** |

## In scope

- Chat-first research desk on Seeker (React Native / Solana Mobile Stack).
- Honest engine chips: `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` (never soften).
- On-device SLM ask path with fail-closed missing-model UX.
- Seed Vault / Mobile Wallet Adapter **boundary** (keys outside the model).
- Propose-only SOL/SPL transfers and message signs (after M2 boundary is proven).
- dApp Store packaging (M4) once prior milestones are honest and green.

## Out of scope / do not claim

- Live Seed Vault signing, live chain actions, or dApp Store listing as present-tense product facts.
- Autonomous signing, custody, or key handling by the model — ever.
- Silent cloud / REMOTE fallback for sensitive asks.
- Wallet, DeFi, auto-trading, or silent chain calls as product features.
- Mixing crypto/on-chain narrative into pure-AI Salomon (Play/APK sibling).
- Present-tense “notes stay on your phone” / “Seed Vault signs” as shipped guarantees.

## FE screen list (working — M0)

**Slice 1 (first shippable UI):**
1. Chat-first home + thread
2. Header engine chips (honest)
3. Fail-closed empty state when model missing
4. Goal-tense Seed Vault boundary copy (no live signing UI)

**Later (not slice 1):**
- Explicit labeled REMOTE opt-in
- Proposal review sheet → Seed Vault approval handoff (M2–M3)
- Approvals / history surfaces as needed

**Never in this app:** pure-AI Android Compose surfaces; Play Store hero copy.

Repo home for FE: `apps/mobile/` on **this** repo (`9lordisgod/salomon-solana`). Zinc/mono chat-first desk unless Product revises.

## Boundaries vs pure-AI Salomon

| | Pure-AI Salomon | Salomon Solana (this repo) |
|---|---|---|
| Distribution | Android Play / APK (goal) | Seeker / dApp Store (goal) |
| UI stack | Compose + Rust hybrid | React Native / SMS / Expo |
| On-chain | Out of hero | Propose-only + Seed Vault |
| Narrative | Crypto-free | Local-first + on-chain |

## Honesty checklist (every surface)

- Goal / direction tense for unbuilt capabilities.
- Label `STUB` and `REMOTE`; never badge them as `LOCAL`.
- Sanitizer = heuristic, not a complete PII guarantee.
- M0 scaffold ≠ green product.

## Copyright

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
