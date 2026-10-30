# salomon-solana — Expo/RN × GGUF + llama.cpp (Platform outline)

**Date:** 2026-10-29 (America/Vancouver)  
**Audience:** Lead · Agent Runtime · Solana Mobile FE · Solana Release  
**Scope:** **salomon-solana only** (Expo / React Native Seeker shell).  
**Out of scope:** Pure-AI `salomon` Kotlin+Compose Play/APK path (`near-privacy-ai` / `apps/android`). Share **patterns** with that track; **separate ship**, separate artifacts, no shared APK pipeline.

---

## 1. Goal

Wire on-device ask for the Expo/RN Seeker shell so the UI can call a single fail-closed ask API:

- Model present + runner linked → `Local`
- Model missing / unverified / runner not linked → **`MissingModel`** (honest chip; no silent cloud)
- Secret-shaped input → `Refused`
- Explicit stub opt-in only → `Stub`

No claim of live on-device SLM until SM-A1 exits green.

---

## 2. Binding options (pick one for SM-A1)

| Opt | Approach | Pros | Cons | Platform rec |
|-----|----------|------|------|--------------|
| **A** | **Prebuilt `libsalomon_core.so` + Expo native module / RN TurboModule** wrapping the same JNI `nativeAsk → String?[3]` (or thin Kotlin → JS) | Same ask semantics / codes as Compose; one Rust core to audit; Solana Release can cargo-ndk the same crate family | Needs custom Expo config plugin / prebuild (not Expo Go); JNI package name must not collide with pure-AI app if both installed | **Preferred** for fail-closed parity |
| **B** | **UniFFI → Kotlin → RN bridge** | Cleaner Kotlin API; FE-friendly | Extra codegen; slower to first dogfood than thin JNI already shipping on Compose | Backup if TurboModule glue hurts |
| **C** | **Community RN llama bindings** (`llama.rn` / similar) as Completer only | Faster prototype | Dual policy surface; harder to keep Refused/MissingModel identical to Platform core; license/NDK/16KB unknown | **Prototype only** — not product path |
| **D** | **C ABI JSON** (`salomon_ask`) via JSI | Matches Release scripts | Compose already abandoned JSON shim for UI; keep C ABI for scripts, **not** the RN UI contract | Scripts / host tools only |

**Recommendation:** **Opt A** — reuse Platform `salomon-core` ask order + status codes; Solana Release owns Seeker/Expo prebuild drop of arm64 `.so`; Solana Mobile FE owns TurboModule + chip. Pure-AI Compose continues on its own `jniLibs` / Play pipeline.

**Expo constraint:** custom native code ⇒ **dev client / prebuild**, not Expo Go. Document that in `apps/mobile` README when wire opens.

---

## 3. Asset packaging (GGUF)

Pinned mobile weight (from pure-AI MANIFEST; reuse pin, not the Play APK):

| Field | Value |
|-------|-------|
| File | `salomon-qwen25-3b-instruct-Q4_K_M.gguf` |
| sha256 | `9c9f56a391a3abbd5b89d0245bf6106081bcc3173119d4229235dd9d23253f94` |
| Size | ~1.93 GB |

**Rules (both tracks):**

1. **Never** put the GGUF inside the base APK / AAB / dApp Store binary.
2. Resolve path at runtime (app `files` / `documents` dir or explicit user-picked URI).
3. Verify **sha256** before first load; mismatch → `MissingModel` (treat as absent).
4. Refuse split shards (`*-of-*`).
5. No auto-cloud fallback if fetch fails.

**Delivery options (Solana Release decides with Lead):**

| Mode | When |
|------|------|
| Sideload / adb push into app storage | Earliest dogfood |
| In-app download + verify (HTTPS + sha256) | Default product path |
| Play Asset Delivery / partner store expansion | Only if store policy + Seeker channel allow |

Env/role hint (pattern share): `SALOMON_GGUF_ROLE=mobile` → MANIFEST `artifacts.mobile_primary`.

---

## 4. Ask-path API the UI calls

Freeze one JS-facing contract for Solana Mobile FE (mirror Compose codes so chips stay honest):

```ts
/** Status codes match JNI String?[3][0] and Compose SalomonCore */
export type AskStatusCode = 0 | 1 | 2 | 3;
// 0 MissingModel · 1 Stub · 2 Local · 3 Refused

export type NativeAskResult = {
  status: AskStatusCode;
  text: string;
  error: string | null;
};

// Native module
ask(prompt: string): Promise<NativeAskResult>;
// Optional later: askCancelable(prompt, signal) for history-rail abort
```

**Native order (must match `salomon-core`):**  
`Refused` → `Stub` (opt-in) → `MissingModel` / `runner_not_linked` → `Local` only when offline complete succeeds.

**TS façade for UI** (chip mapping):

| status | Chip |
|--------|------|
| 0 | `MODEL MISSING` |
| 1 | `STUB` |
| 2 | `LOCAL` |
| 3 | `REFUSED` |

No silent remap of MissingModel → REMOTE.

### Agent Runtime coordination

| Layer | Owner | Notes |
|-------|-------|-------|
| Native ask / Completer | Platform + Solana Release | Fail-closed load+complete; scrub hooks at boundary |
| Secret scrub / assertNoSecrets | Platform pattern (`offlineAsk`) — Runtime advises parity | Same patterns as phase3-platform; vault refs stay out of model |
| Tool-calling agent loop | **Agent Runtime** | Sits **above** native ask; propose-only tools; no creds in model |
| Sanitizer / source-mask | Runtime (when Lead opens) | After local-ask smoke; not blocking stub wire |

**Handoff to Runtime:** treat `ask()` as the Completer; Runtime owns multi-step loop + tool allowlists. Native must never auto-submit chain txs (Seed Vault / approve UX stays FE + SV Engineer).

---

## 5. Phased plan (salomon-solana)

| Phase | Deliverable | Exit |
|-------|-------------|------|
| **SM-M0** (current shell) | Expo UI + fail-closed stub in JS | Chip shows MODEL MISSING; no `.so` required |
| **SM-A0** | Opt A TurboModule + stub `libsalomon_*` (no llama) | Installable Seeker/dev-client build; ask → MissingModel/Stub/Refused |
| **SM-A1** (gated) | Link llama.cpp in native core; GGUF fetch+verify; `Local` only on success | Device smoke; still no refusal-eval product claim on 3B |
| **Later** | Runtime agent loop on device; Seed Vault propose path | Separate Lead open |

Pure-AI M-A0/M-A1 Compose milestones stay on `near-privacy-ai` — do not block or merge Gradle with Expo prebuild.

---

## 6. Ownership

| Role | Owns |
|------|------|
| **Platform** | Ask semantics, status codes, this outline, pattern share; Expo packaging **support** when Solana Mobile FE blocks |
| **Solana Release** | Expo prebuild / NDK / arm64 `.so` drop for Seeker/dApp Store channel; no-GGUF-in-base gate |
| **Solana Mobile FE** | TurboModule surface, chip, missing card, history abort |
| **Agent Runtime** | Loop above Completer; sanitizer timing; parity with desktop propose-only |
| **Seed Vault Engineer** | Signing boundary — never inside model path |
| **Lead** | When to open SM-A0/A1; keystore / store signing still **user** decision |

---

## 7. Lead decisions (2026-10-29)

1. **Soname / crate:** use distinct **`salomon-solana-core`** → `libsalomon_solana_core.so` + `loadLibrary("salomon_solana_core")`. Same ask semantics/codes as Play `salomon_core`; **do not** share the Play soname (avoids dual-install collision). Sources may share patterns; separate crate/artifact.
2. **First dogfood:** **emulator + Mock MWA** first (yoxi: no physical Seeker required for development). Seeker device later for store dogfood.
3. **Streaming:** **not** required for SM-A0/SM-A1. Completer = `ask(prompt)→NativeAskResult` is enough; Runtime loop wraps above native.

---

## 8. Explicit non-goals

- Sharing Play AAB / Compose `apps/android` with Expo
- Bundling GGUF in the binary
- Claiming M1 refusal-green on 3B
- Putting Seed Vault seeds or signing keys in model context
- Using Expo Go for native llama builds
