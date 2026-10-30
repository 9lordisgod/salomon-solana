# AI model recommendation — salomon-solana (Android / local ask)

**Date:** 2026-10-29 · **Owner:** Model Engineer · **Scope:** base Instruct GGUFs for on-device ask via llama.cpp (or a mobile binding). **No custom train yet.**

## Picks (use these two)

| Role | Model | Quant | Size | HF repo | Direct file URL |
|------|-------|-------|------|---------|-----------------|
| **Primary** | Qwen2.5-3B-Instruct | Q4_K_M | **1.93 GB** (1929903264 B) | [bartowski/Qwen2.5-3B-Instruct-GGUF](https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF) | https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf |
| **Contingency (tight RAM)** | Qwen2.5-1.5B-Instruct | Q4_K_M | **0.99 GB** (986048768 B) | [bartowski/Qwen2.5-1.5B-Instruct-GGUF](https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF) | https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf |

### Primary — Qwen2.5-3B-Instruct Q4_K_M
- **sha256 (verified):** `9c9f56a391a3abbd5b89d0245bf6106081bcc3173119d4229235dd9d23253f94`
- Sibling pure-AI salomon already uses this weight as mobile_primary (`SALOMON_GGUF_ROLE=mobile`).
- **Perf notes:** Best quality/size trade for Seeker-class Android with ≥6–8 GB RAM free for the process. ChatML template (`<|im_start|>…`) is the same family as desktop 7B, so prompt/system-refusal wiring stays one path. Expect usable interactive ask (roughly mid-single-digit tok/s on mid-range SoCs with llama.cpp CPU; faster with NPU/GPU bindings if wired later). Prefer this over 1.5B unless install size or RAM forces down.
- **Fetch:**
  ```bash
  huggingface-cli download bartowski/Qwen2.5-3B-Instruct-GGUF \
    --include "Qwen2.5-3B-Instruct-Q4_K_M.gguf" --local-dir ./
  ```

### Contingency — Qwen2.5-1.5B-Instruct Q4_K_M
- **sha256 (HF card):** `1adf0b11065d8ad2e8123ea110d1ec956dab4ab038eab665614adba04b6c3370`
- **Perf notes:** ~half the download/RAM of 3B; still ChatML/Qwen2. Fits tighter phones and first APK smoke. Expect weaker instruction-following and refusal reliability than 3B — fine for wiring llama.cpp / mobile binding, **not** a product-quality refusal claim until measured. Use when 3B OOM or store size budget is hard.
- **Fetch:**
  ```bash
  huggingface-cli download bartowski/Qwen2.5-1.5B-Instruct-GGUF \
    --include "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf" --local-dir ./
  ```

## Runtime target
- **llama.cpp** (or a mobile binding that loads GGUF): same Qwen2 ChatML chat template for both picks.
- Optional later ARM speed tweak (not the pin): bartowski `Q4_0_4_4` variants of the same Instruct models (~same on-disk size class) can be faster on some AArch64 SoCs; keep **Q4_K_M** as the quality default until device benches say otherwise.

## Explicitly not picked (this round)
- **Phi-3.5 / Phi-4 mini class** — solid on-device, but different chat template and less alignment with current Qwen prompt path; revisit only if Qwen fails device constraints.
- **Gemma 2 2B class** — license + template friction for a Qwen-aligned local ask stack; skip for v0.
- **Llama-3.2-3B-Instruct** — viable alt (~2.0 GB Q4_K_M) but diverges template; hold unless Lead wants a second family.

## Out of scope
- Custom QLoRA / domain train (Lead: none yet).
- Claiming privacy-rebuild refusal 8/8 on these mobile weights until Eval GREEN on this track.
- Fetching 1.5B onto the box until Lead opens that pin.

## Related
- Strategy: [`docs/notes/AI_DECISION_LOCAL_GGUF.md`](AI_DECISION_LOCAL_GGUF.md) (if present)
- Ship Android: [`docs/notes/SHIP_ANDROID_M1.md`](SHIP_ANDROID_M1.md)
