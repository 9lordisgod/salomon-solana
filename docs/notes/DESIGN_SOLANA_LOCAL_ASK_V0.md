# salomon-solana — Local ask path interface v0 (SA-0)

**Date:** 2026-10-29 (America/Vancouver) · **Owner:** Agent Runtime (interface) · **Eng:** Solana Mobile FE + Platform · **Roadmap:** M4 Option A (on-device ≤3B); Option B Hybrid documented, off by default.
**Scope:** salomon-solana only. Not the pure-AI `salomon` runtime. No on-chain execution in ask.
**Binding source of truth:** [`EXPO_GGUF_LLAMA_INTEGRATION_OUTLINE.md`](./EXPO_GGUF_LLAMA_INTEGRATION_OUTLINE.md) (Platform, Opt A locked; cited @ tip `e02b690`).
**Code:** `packages/ask/` (`@salomon-solana/ask`).

## 1. Layering

```
UI chip (apps/mobile engine.ts)  ← EngineChip / chipLabel
askLocal()  [packages/ask]       ← validation, tool allowlist, sanitizer, system prompt, chat template, digest log
LocalCompleter.ask(prompt)       ← Platform native: Rust cdylib salomon-solana-core → libsalomon_solana_core.so via Expo TurboModule
```
Agent loop, sanitizer and chat template sit **above** the native completer (Platform lock). No streaming in SM-A0/A1.

## 2. Status chips (all five; never soften)

| Chip | Label | When |
|---|---|---|
| `local` | `LOCAL · <model>` | backend `gguf`, allowlisted model, asset sha256 matches pin, runner linked, native status 2 |
| `stub` | `STUB` | explicit stub opt-in only, or native status 1 — **never ok:true** |
| `missing` | `MODEL MISSING` | default; no/unverified asset; runner not linked; native status 0; unknown native status |
| `refused` | `REFUSED` | secret-shaped input (`key_material_in_context`), native status 3, forbidden tool, policy |
| `remote` | `REMOTE · <model>` | only `remoteOptIn && gatewayAvailable` **and** per-request consent — Option B, **out of v0 eng**; askLocal returns `policy_mismatch` |

Native map (Platform lock): `0 MissingModel→missing`, `1 Stub→stub`, `2 Local→local`, `3 Refused→refused`, anything else→missing.

## 3. Interface (packages/ask/src)

- `types.ts` — `EngineChip`, `EngineStatus {available, backend:'gguf'|'stub'|'none', model, remoteOptIn, gatewayAvailable}`, `AskRequest {question, history?: user|assistant turns, options?.maxTokens}`, `AskOk`, `AskErr {ok:false, chip, reason, status, message}`, `NativeAskStatus`, `NativeAskResult`.
- `completer.ts` — `interface LocalCompleter { kind:'local'; ask(prompt): Promise<{status,text,error}> }`, `chipOfNative`, `createUnavailableCompleter()` (always status 0).
- `status.ts` — `MISSING_STATUS`, `getEngineStatus({modelId, assetSha256, backendLinked, stubOptIn, ...})`, `chipOf`, `chipLabel`, `MODEL_ALLOWLIST`, `PINNED_GGUF_SHA256`.
- `reasons.ts` — reason → HTTP-ish status + chip + plain-language message.
- Sanitizer: **hook point only** (`deps.sanitize`). Scrub eng (assertNoSecrets, parity with phase3-platform offlineAsk) is **PARKED until Lead opens SM-A1**. v0: no hook ⇒ `policy_mismatch`, completer never called; hook throws ⇒ `input_refused` / REFUSED.
- `forbidden.ts` — verbatim copy of `packages/propose` `FORBIDDEN_TOOL_RE` / `FORBIDDEN_TOOL_NAMES` (isolation; keep in sync).
- `ask.ts` — `askLocal(req, deps)`, `assertToolSpecs`.
- `prompts/source_care.txt` — host-owned research-desk system prompt.

## 4. Reasons

| reason | status | chip |
|---|---|---|
| input_refused | 422 | REFUSED |
| local_model_unavailable | 503 | MODEL MISSING |
| stub_not_real_model | 503 | STUB |
| forbidden_tool | 403 | REFUSED |
| bad_request | 400 | REFUSED |
| completion_failed / timeout | 503 | MODEL MISSING |
| policy_mismatch | 503 | REFUSED |

## 5. Hard rules

1. Default path = local. REMOTE only if remoteOptIn && gatewayAvailable && per-request consent — not in v0 eng. Never a silent cloud fallback; no model + hybrid off ⇒ MODEL MISSING.
2. STUB never returns ok:true pretending LOCAL (checked both from EngineStatus and native status 1).
3. Sanitizer hook (required; eng parked to SM-A1) runs on question + every history turn **before** the completer; secrets ⇒ REFUSED, completer never called.
4. System prompt is host-owned (file/string). Client cannot send `role:system` (⇒ bad_request). Missing system prompt ⇒ policy_mismatch.
5. Tool allowlist empty by default. When the on-chain lane opens, only `propose_*` + read-only from `packages/propose`; any `FORBIDDEN_TOOL_*` match ⇒ 403. Ask never imports wallet/auth/Seed Vault sign and never auto-submits txs.
6. Logs: reason codes + `transcriptDigest` (sha256) only — never prompt, answer, or key material.
7. Model allowlist: `qwen2.5-3b-instruct-q4_k_m`, GGUF 3B Q4_K_M sha256 `9c9f56a391a3abbd5b89d0245bf6106081bcc3173119d4229235dd9d23253f94`. Reject abliterated/uncensored. Model never in base APK.
8. Binding: Platform-locked Opt A (outline §2) — new Rust crate `salomon-solana-core` → `libsalomon_solana_core.so` (not Play `salomon_core`) + Expo TurboModule; dev client/prebuild, not Expo Go. `llama.rn` = prototype only. packages/ask stays binding-agnostic.

## 6. Env / asset contract

- GGUF downloaded post-install to app-private storage; path passed to native; sha256 verified before `backendLinked` + LOCAL.
- `modelId` must be in allowlist; offline by default (no network permission used by ask).
- `stubOptIn` is a dev-only flag; shows STUB.

## 7. Open for Platform / FE

1. TurboModule name + JS signature for `ask(prompt)` and an `assetStatus()` probe feeding `getEngineStatus`.
2. Chat template: AR applies Qwen ChatML in JS — confirm native does not re-template.
3. `maxTokens` / timeout: pass through native or JS-side timeout → `timeout` reason?
4. `transcriptDigest` uses `node:crypto` in v0; RN needs expo-crypto or native sha256 hook.
5. Native status 3 Refused vs JS sanitizer — keep both (defence in depth); native refuse reason codes to log?
6. Download/verify flow owner (FE vs Release) and where sha256 pin lives at runtime.
