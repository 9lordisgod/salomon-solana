# apps/mobile

Expo / React Native shell for **Solana Seeker / Saga (Android)**. Separate from the pure-AI Salomon Android Compose app.

## M0 (this tree)

- Chat-first research desk (zinc / mono)
- Honest engine chip: `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` · `REFUSED`
- Every ask **fails closed** — no local model wired yet, no silent cloud fallback

```bash
npm install
npm run web       # dogfood UI without a device
npm run android   # emulator or Seeker
npm run typecheck
```

## M1 — Android native build (SHIP_ANDROID_M1 Task 1)

**LOCK (Platform + Lead):** generated `android/` is gitignored; always `expo prebuild`. See `docs/notes/SHIP_ANDROID_M1.md`.

```bash
npm install
npx expo install --fix
npm run prebuild          # or: npx expo prebuild -p android
npm run android           # expo run:android — needs emulator or USB device
npm run typecheck
```

### Verified launch path (when box emulator cannot boot)

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
npx expo start --dev-client
```

Use a host with a USB device or local emulator. FE box nested KVM is **not** the acceptance host.

**Status:** typecheck + prebuild + `assembleDebug` verified on FE box. Home-screen launch
**not** verified here. Hold M1 GREEN until home launches on emulator, USB device, or CI with real KVM.

## Not claimed

On-device SLM, dApp Store build, live Seed Vault signing, or chain submission.

## Seed Vault contract (SV-0)

Types only in `src/vault/types.ts` — match `docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md` §7.
Approval UX screens land with M3: show `human_summary` + `draft_sha256` (public fee_payer/cluster only); Sign then
**separate** Broadcast confirm. No paste-key; refuse in-product seed/mnemonic export.

## M2 — Mock MWA (authorize/session)

Checklist: `docs/notes/M2_MOCK_MWA_CHECKLIST.md`.

- FE chrome: `WalletScreen` (Connect / Disconnect / truncated pubkey / fail-closed copy), header Wallet entry, always-on policy strip `LOCAL · PROPOSE-ONLY · APPROVAL REQUIRED` (separate from the engine chip).
- `src/wallet/types.ts` mirrors `MwaSessionPublic` (three public fields). Auth token never in FE/React state reachable by agent.
- `src/wallet/mwa.ts` — real Mock MWA authorize/deauthorize (`ConnectResult` API); token in AsyncStorage via `tokenStore` (not exported). Seed Vault owns this module.
- Fail-closed copy: `No MWA wallet found` · `Wallet not connected` · `Connection declined`. No paste-a-key, fake pubkey, silent reauth.
- Boundary: `.eslintrc.cjs` forbids `src/agent/**` importing `wallet` (`npm run lint`).
- Dogfood: Android emulator + Mock MWA Wallet app. **Mock MWA ≠ Seed Vault live.** No `sign*`, prepare-for-sign, or broadcast until M3.
