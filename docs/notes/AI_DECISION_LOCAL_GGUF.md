# Decision — Local GGUF ask path (no custom training)

**Date:** 2026-10-29 (America/Vancouver) · **Owner:** Lead Architect · **Status:** Decided (plan only — nothing built yet)
Tip of record = GitHub `main`. © Anon Rothschild — proprietary.

## Decision
Salomon Seeker's research/ask path uses an **existing small open-source GGUF model** run **on-device** via llama.cpp (React Native binding, e.g. `llama.rn`, or a thin JNI module). We do **not** train a model from scratch.

## Phases
| Phase | What | Maps to |
|---|---|---|
| **AI-1** | Existing small GGUF (Qwen2.5-1.5B/3B-Instruct, Phi mini, Gemma 2 2B class, Q4 quant) via llama.cpp binding inside the Expo/Android dev-client app | M4 |
| **AI-2** | Behavior control: system prompt + input/output sanitizer + fail-closed refusals; simple on-device notes/document context | M4 → M5 |
| **AI-3** | Light QLoRA fine-tune **only if** real usage shows clear gaps. Optional remote path = explicit per-request user opt-in, clearly labeled, **never** a silent cloud fallback | Post-ship |

**Custom training (incl. QLoRA) is OUT OF SCOPE for M0–M5 / early ship.**

## Constraints (non-negotiable)
- Local by default. No model / load failure → ask returns "Local model unavailable" (**fail closed**); no silent remote fallback.
- **No keys in the model:** no private keys, seed phrases, auth tokens, or credentials in prompts, context, or logs. The model module has no import path to wallet/auth code.
- **Propose-only:** model output can at most become a *draft* handed to `packages/propose`; user approves in wallet; sign ≠ broadcast.
- Keep model phone-sized (target ≤ ~2 GB file, Q4).
- No overclaims: do not say "on-device model live" until AI-1 acceptance passes on an emulator/device build.

## First AI milestone (AI-1 acceptance)
"**Small GGUF model answers locally inside the app with fail-closed refusals.**"
- Prompt → local answer on Android emulator (x86_64) and an arm64 device, airplane mode on.
- Model missing/corrupt → "Local model unavailable".
- Privacy & Safety refusal suite passes (key/seed requests, "sign/send for me", jailbreaks).

## Model pick
**Awaiting Model Engineer recommendation** (exact files + download sources + size/perf notes). Candidate families: Qwen2.5-1.5B-Instruct / 3B-Instruct GGUF, Phi-3/3.5-mini-instruct GGUF, Gemma 2 2B-it GGUF (check license terms per model before bundling).

## Next concrete PRs / tasks
1. **FE + Platform — M1 Android run** (dev client builds on emulator). Prereq for everything below.
2. **Platform — package GGUF asset:** download-on-first-run to app storage with SHA-256 check (preferred over bundling in APK); no network after download.
3. **Platform / Agent Runtime — binding spike:** `llama.rn` (or JNI llama.cpp) in dev client; load model, generate tokens, measure load time / tok/s / RAM.
4. **Agent Runtime — ask API:** `ask(prompt, context?) → { mode: 'local' | 'unavailable', text, refused? }`; UI labels active mode truthfully.
5. **Privacy & Safety + Eval — refusal suite:** minimum system prompt, sanitizer rules (strip/reject key-like strings, base58 secret patterns, seed words), refusal tests; must pass before AI-1 is GREEN.
