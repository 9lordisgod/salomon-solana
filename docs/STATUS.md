# Status

**As of 2026-10-29 (America/Vancouver).** Tip of record: GitHub `main`.

| Milestone | Owner | State |
|---|---|---|
| M0 Scaffold (Expo shell, propose pkg, SV-0/SM-0 notes) | Lead | **Done** (on `main`) |
| M1 Android build runs on emulator | Solana Mobile FE + Platform | **Next** — task list in [notes/SHIP_ANDROID_M1.md](notes/SHIP_ANDROID_M1.md) |
| UI-1 Refined research desk + honest status + approval sheet stub | Solana Mobile FE + Product (Lead review) | **Principles parked** — [notes/UI_DESIGN_PRINCIPLES.md](notes/UI_DESIGN_PRINCIPLES.md); build next, alongside/after M1. Approval sheet is a fixture stub only |
| M2 MWA connect + Mock MWA Wallet | Seed Vault / On-Chain + FE | Not started |
| M3 Propose-only tx flow (sign ≠ broadcast) | Seed Vault / On-Chain + FE | Design only (SV-0, SM-0); interface stubs allowed |
| M4 / AI-1 Local GGUF ask with fail-closed refusals | Platform/Agent Runtime + Model Eng + Privacy & Safety | **Not started** — plan locked in [notes/AI_DECISION_LOCAL_GGUF.md](notes/AI_DECISION_LOCAL_GGUF.md); model picked in [notes/AI_MODEL_RECOMMENDATION.md](notes/AI_MODEL_RECOMMENDATION.md); blocked on M1 |
| AI-2 Sanitizer + notes context | Privacy & Safety + Agent Runtime | Not started |
| AI-3 QLoRA / opt-in remote | — | **Out of scope** for early ship |
| M5 Signed APK + listing + privacy/ToS/site | Solana Release + Docs | Not started |
| M6 dApp Publisher Portal submission | Solana Release | Not started |

### Honesty line
Nothing is GREEN beyond M0. No verified Android build yet, no live wallet connection, no Seed Vault integration, **no on-device model running, no custom or fine-tuned model exists**, no signed APK, nothing submitted to the dApp Store. Seed Vault is the **intended** signer. UI design principles are a document, not shipped UI.

### Known blockers
- Not yet verified that the shell builds on Android (no CI build).
- MWA and llama.cpp bindings are native modules → require Expo **dev client / prebuild**; Expo Go cannot be used for M2+ / AI-1.
- Model picked (Qwen2.5-3B-Instruct Q4_K_M primary, 1.5B contingency); license + on-device perf still to verify.
- Release keystore + publisher wallet must be created and held by Release (human-held secrets).
- Legal copy (privacy/ToS) needs owner review before M5.
