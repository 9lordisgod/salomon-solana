# Roadmap — Salomon Seeker (Solana Mobile)

> Goal-tense. Tip of record = GitHub `main`. Nothing below is shipped unless STATUS.md says GREEN.
> Constraints: local by default · fail closed · propose-only on-chain · explicit user approval for every sign and broadcast · model never holds keys · no overclaims · emulator + Mock MWA Wallet is enough for dev (no physical Seeker required).
> AI: existing small open-source GGUF on-device — **no custom training for M0–M5 / early ship**. Decision: [notes/AI_DECISION_LOCAL_GGUF.md](notes/AI_DECISION_LOCAL_GGUF.md).

## Ownership
| Area | Owner |
|---|---|
| Mobile shell (Expo/RN, screens, nav, Android build) | **Solana Mobile FE** |
| Wallet integration (MWA / Seeker Connect, Seed Vault boundary) + `packages/propose` | **Seed Vault / On-Chain** |
| Model selection (GGUF file, quant, license, size/perf) | **Model Engineer** |
| llama.cpp binding, model asset packaging, ask API | **Platform / Agent Runtime** |
| System prompt, sanitizer, refusal suite | **Privacy & Safety + Eval Lead** |
| Signed APK, keystore, listing assets, Publisher Portal | **Solana Release** |
| EAS/CI/Gradle packaging, dev-client builds | **Platform** |
| README, privacy/ToS copy, website, honesty review | **Solana Docs** |
| Sequencing, scope, merges | **Lead Architect** |

## Milestones

### M1 — Android build runs (FE + Platform)
Expo SDK 51 dev-client build installs and launches on Android emulator (API 34) and a generic device.
- Acceptance: `npx expo run:android` succeeds from clean clone; app opens to home screen; `npm run typecheck` passes.
- Plan: [notes/SHIP_ANDROID_M1.md](notes/SHIP_ANDROID_M1.md).

### M2 — Wallet connect via MWA + Mock MWA Wallet (Seed Vault/On-Chain + FE)
`@solana-mobile/mobile-wallet-adapter-protocol-web3js` `transact()` → `authorize` against Mock MWA Wallet on the emulator; show pubkey; deauthorize.
- Acceptance: connect / disconnect works on emulator with Mock MWA Wallet; no wallet installed → clear "No wallet found" error (fail closed); auth token stored only in app storage, never passed to model code.
- Seeker Connect / Seed Vault on real Seeker = later validation, **not** claimed until tested.

### M3 — Propose-only transaction flow (Seed Vault/On-Chain + FE)
Agent drafts SOL transfer → `packages/propose` sanitizes + simulates (devnet) → review screen shows exact amount/recipient/fee → user taps Approve → wallet signs (`signTransactions`) → **separate** explicit Broadcast tap sends.
- Acceptance: model module has no import path to wallet/auth; reject paths at each step; devnet only by default; mainnet behind explicit setting.

### M4 — Local-first research/ask = AI-1 (+ AI-2 start)
**AI-1:** existing small GGUF (Qwen2.5-1.5B/3B-Instruct, Phi mini, Gemma 2 2B class; Q4) via llama.cpp binding (`llama.rn` or JNI) in the dev-client app. Model pick: awaiting Model Engineer.
**AI-2:** system prompt + sanitizer + fail-closed refusals; simple on-device notes/document context.
- First AI milestone: **small GGUF model answers locally inside the app with fail-closed refusals.**
- Acceptance: answers offline on emulator + arm64 device; model missing → "Local model unavailable" (fail closed, no silent remote); Privacy & Safety refusal suite passes (keys/seed requests, sign/send-for-me, jailbreaks); no keys/credentials in prompts or logs; UI labels mode truthfully.

### AI-3 — Later only (post-ship, out of scope for M0–M5)
Light QLoRA fine-tune only if real usage shows clear gaps. Optional remote path = explicit per-request user opt-in, clearly labeled, never a silent cloud fallback. **No custom model training before then.**

### M5 — Signed release APK + listing + legal + website (Release + Docs)
- Release keystore (dedicated for dApp Store, backed up offline; never committed). `eas build -p android --profile production` with `buildType: apk` or `./gradlew assembleRelease`.
- Assets: 512×512 icon, 1200×600 banner, ≥4 screenshots (1080×1920), short/long description, privacy policy URL, ToS URL, simple site (GitHub Pages).
- Acceptance: `apksigner verify` passes; versionCode increments; legal pages public.

### M6 — Solana dApp Publisher Portal submission (Release)
Documented step-by-step in `docs/notes/DAPP_STORE_SUBMISSION.md` (to write in M5): publisher.solanamobile.com → connect publisher wallet → create Publisher → create App NFT → upload release APK + assets → mint Release NFT → submit for review → track review email.
- Acceptance: submission doc reproducible by Release without Lead help.
