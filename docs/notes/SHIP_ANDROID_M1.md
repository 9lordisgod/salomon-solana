# SHIP M1/M2 — Android run + Mock MWA wallet connect

Owner: **Solana Mobile FE** (shell) · **Platform** (build) · **Seed Vault / On-Chain** (MWA). Branch: `ship/m1-android-run`.

## Prereqs (dev machine)
- Node 20 LTS, JDK 17, Android Studio (SDK 34, emulator image API 34 x86_64 Google APIs), `ANDROID_HOME` set.
- No physical Seeker needed.

## Task 1 — Android build runs (M1)
```bash
git clone https://github.com/9lordisgod/salomon-solana && cd salomon-solana/apps/mobile
npm install
npx expo install --fix            # align deps to SDK 51
npx expo install expo-dev-client expo-status-bar
npx expo prebuild -p android      # generates android/ (gitignore it or commit — Platform decides)
npx expo run:android              # builds debug APK, installs on running emulator
npm run typecheck
```
File changes:
- `apps/mobile/package.json`: scripts `"android": "expo run:android"`, `"prebuild": "expo prebuild -p android"`; add `expo-dev-client`.
- `apps/mobile/app.json`: add `icon`, `android.adaptiveIcon.foregroundImage`, `android.versionCode: 1`, `plugins: ["expo-dev-client"]`.
- `apps/mobile/assets/`: placeholder `icon.png` (1024²), `adaptive-icon.png`.
- If monorepo resolution breaks (packages/propose): add `apps/mobile/metro.config.js` with `watchFolders` = repo root and `nodeModulesPaths`.

Acceptance: clean clone → `npx expo run:android` → app launches to home on emulator; typecheck green.

## Task 2 — Mock MWA Wallet on emulator
```bash
git clone https://github.com/solana-mobile/mock-mwa-wallet
cd mock-mwa-wallet && ./gradlew installDebug   # or open in Android Studio and Run
```
(Alternative: fakewallet from `solana-mobile/mobile-wallet-adapter` repo `android/fakewallet`.)

## Task 3 — MWA connect (M2)
```bash
cd apps/mobile
npx expo install @solana-mobile/mobile-wallet-adapter-protocol-web3js @solana-mobile/mobile-wallet-adapter-protocol @solana/web3js react-native-get-random-values buffer @react-native-async-storage/async-storage
npx expo run:android
```
Files:
- `apps/mobile/polyfills.ts` (import `react-native-get-random-values`, set `global.Buffer`) — imported first in entry.
- `apps/mobile/src/wallet/mwa.ts`: `connect()` = `transact(w => w.authorize({ cluster: 'devnet', identity: { name: 'Salomon Seeker', uri: 'https://<site>', icon: 'favicon.ico' } }))`; `disconnect()` = `deauthorize`. Stores auth token in AsyncStorage only.
- `apps/mobile/src/screens/WalletScreen.tsx`: Connect / Disconnect, show base58 pubkey, error states.
- Boundary: `src/agent/**` must not import `src/wallet/**` (add eslint `no-restricted-imports`).

Acceptance:
- Connect → Mock wallet approve sheet → pubkey shown; Disconnect clears it.
- User rejects → "Connection declined" and no state change.
- No wallet installed → "No MWA wallet found" (fail closed).
- No sign/send calls exist in M2 code.

## Out of scope for this PR
Signing, broadcast, on-device model, release keystore. Do not claim Seed Vault live.
