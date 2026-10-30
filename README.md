# Salomon Solana

**Local-first AI research desk for Solana Mobile (Seeker)** — on-device asks by default, propose-only on-chain actions, Seed Vault for signing. Keys never enter the model.

> **Honesty:** M0 scaffold is on `main`. There is **no** dApp Store build, on-phone model, live Seed Vault, or live chain action yet. Everything below that is not marked GREEN is goal-tense.

---

## Two Salomon tracks (do not mix)

| | **Salomon** (sibling) | **Salomon Solana** (this repo) |
|---|---|---|
| Repo | [`9lordisgod/salomon`](https://github.com/9lordisgod/salomon) | [`9lordisgod/salomon-solana`](https://github.com/9lordisgod/salomon-solana) |
| Who | Investigative journalists, PIs, researchers | Crypto-native users on **Seeker / Solana Mobile** |
| Ship path | Android Play / APK | Seeker / **dApp Store** |
| UI | Kotlin + Jetpack Compose + Rust core | React Native / Expo / Solana Mobile Stack |
| On-chain | Out of hero — crypto-free | Propose-only + Seed Vault |
| Narrative | Pure privacy AI | Local research AI **plus** safe on-chain proposals |

This repo owns the **crypto / Solana Mobile** story. Pure-AI Salomon stays separate and crypto-free.

---

## What this product is aiming to be

A **premium research tool**, not a flashy crypto terminal and not a generic AI chatbot — closer to Linear / Craft: quiet dark zinc UI, strong typography, honest status always visible.

**Core loop (goal):**

1. **Ask locally** — a small open-source GGUF (Qwen2.5-3B Q4_K_M primary) answers on-device via llama.cpp. No custom training for early ship. Model file is **not** baked into the base APK.
2. **Fail closed** — if the local model is missing or offline, the app refuses. No silent cloud fallback.
3. **Propose on-chain** — the agent may draft a light Solana action (e.g. SOL/SPL transfer). Draft → sanitize / allowlist / simulate → you review.
4. **You sign in Seed Vault** — never the model. Keys, seeds, and auth tokens never enter prompts or logs.
5. **Broadcast is a second confirm** — sign ≠ broadcast. Separate explicit tap after wallet approve.

**Always-visible status chips (goal):** `LOCAL` · `PROPOSE-ONLY` · `APPROVAL REQUIRED` (plus honest labels like `STUB`, `REMOTE`, `MODEL MISSING` — never soften).

---

## Principles (standing)

- **Local-first** — asks run on device when possible; otherwise refuse.
- **Propose-only** — agent drafts; you approve; wallet signs; broadcast is separate.
- **No keys in the model** — Seed Vault / MWA boundary; credentials never touch the SLM.
- **No overclaims** — unbuilt features stay goal-tense; stubs are labeled stubs.
- **Dev without Seeker hardware** — Android emulator + Mock MWA Wallet is enough through early milestones.

---

## Current status

| Milestone | State |
|---|---|
| **M0** Scaffold (Expo shell, docs, propose stubs, SV-0/SM-0 design) | **Done** on `main` |
| **M1** Expo Android emulator / device build green | **Next** — [SHIP_ANDROID_M1](docs/notes/SHIP_ANDROID_M1.md) |
| **UI-1** Zinc research desk + honest chips | Principles parked — [UI_DESIGN_PRINCIPLES](docs/notes/UI_DESIGN_PRINCIPLES.md) |
| **M2** MWA connect + Mock Wallet | Not started |
| **M3** Propose-only tx (sign ≠ broadcast) | Design + interface stubs |
| **M4 / AI-1** Local GGUF ask + fail-closed refusals | Plan locked; blocked on M1 — [AI decision](docs/notes/AI_DECISION_LOCAL_GGUF.md) · [model pick](docs/notes/AI_MODEL_RECOMMENDATION.md) · [eval suite SM1-S1…S6](docs/notes/SOLANA_M1_LOCAL_GGUF_ASK_EVAL.md) |
| **M5** Signed APK + listing assets + privacy/ToS | Not started |
| **M6** dApp Publisher Portal submission | Not started |

Full table: [docs/STATUS.md](docs/STATUS.md) · sequencing: [docs/ROADMAP.md](docs/ROADMAP.md).

---

## How the pieces fit

```
┌─────────────────────────────────────────────────────────┐
│  apps/mobile  (Expo / React Native — Seeker shell)      │
│  Chat-first research desk · zinc UI · status chips      │
└─────────────┬───────────────────────────┬───────────────┘
              │ ask (local GGUF)          │ propose draft
              ▼                           ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│  llama.cpp binding      │   │  packages/propose         │
│  Qwen2.5-3B Q4 (goal)   │   │  sanitize · simulate      │
│  fail-closed if missing │   │  never signs / broadcasts │
└─────────────────────────┘   └─────────────┬─────────────┘
                                            │ user Approve
                                            ▼
                              ┌───────────────────────────┐
                              │  MWA → Seed Vault / Mock  │
                              │  sign · then broadcast    │
                              └───────────────────────────┘
```

- **Opt A** for native ask: TurboModule + distinct `libsalomon_solana_core.so` (not shared with pure-AI Salomon).
- GGUF downloaded / sideloaded for dogfood — **never** in the base APK for early ship.

---

## Repo layout

```
apps/mobile/     Expo / React Native shell (Seeker)
packages/        Propose / ask packages (stubs → real)
onchain/         Future Anchor program (placeholder, not deployed)
crates/core/     Shared Rust sanitizer / ask boundary (stub)
docs/            Architecture, roadmap, scope, status, design notes
  notes/         Ship plans, AI decision, UI principles, evals
  reviews/       Privacy & Safety soft-clear stamps
```

---

## Docs map

**Start here**

- [Product scope](docs/PRODUCT_SCOPE.md) — audience, in/out, honesty checklist
- [Roadmap](docs/ROADMAP.md) — M1–M6 + AI-1…AI-3
- [Status](docs/STATUS.md) · [Progress](docs/PROGRESS.md)
- [Architecture](docs/ARCHITECTURE.md)

**Design & ship**

- [UI design principles](docs/notes/UI_DESIGN_PRINCIPLES.md)
- [Seed Vault boundaries (SV-0)](docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md)
- [On-chain design](docs/notes/DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md)
- [Local ask design](docs/notes/DESIGN_SOLANA_LOCAL_ASK_V0.md)
- [Expo + GGUF outline](docs/notes/EXPO_GGUF_LLAMA_INTEGRATION_OUTLINE.md)
- [Ship Android M1](docs/notes/SHIP_ANDROID_M1.md)

**Safety**

- [Security](SECURITY.md) · [Overclaims](docs/notes/OVERCLAIMS.md)
- [Contributing](CONTRIBUTING.md)

---

## Not claimed (yet)

Do **not** read this README as shipping any of the following today:

- Live Seed Vault signing or live chain actions
- On-device model running in the app
- Custom / fine-tuned model
- dApp Store listing or signed release APK
- Silent cloud / REMOTE fallback for sensitive asks
- Autonomous trading, custody, or model-held keys

---

## License

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary. See [LICENSE](LICENSE).
