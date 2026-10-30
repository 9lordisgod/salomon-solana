# Status

**As of 2026-10-29 (America/Vancouver).** Tip of record: GitHub `main`.

| Milestone | Owner | State |
|---|---|---|
| M0 Scaffold (Expo shell, propose pkg, SV-0/SM-0 notes) | Lead | **Done** (on `main`) |
| M1 Android build runs on emulator | Solana Mobile FE + Platform | **Next** — task list in [notes/SHIP_ANDROID_M1.md](notes/SHIP_ANDROID_M1.md) |
| M2 MWA connect + Mock MWA Wallet | Seed Vault / On-Chain + FE | Not started |
| M3 Propose-only tx flow (sign ≠ broadcast) | Seed Vault / On-Chain + FE | Design only (SV-0, SM-0) |
| M4 Local-first ask (on-device or labeled hybrid) | FE + Platform | Not started |
| M5 Signed APK + listing + privacy/ToS/site | Solana Release + Docs | Not started |
| M6 dApp Publisher Portal submission | Solana Release | Not started |

### Honesty line
Nothing is GREEN beyond M0. No verified Android build yet, no live wallet connection, no Seed Vault integration, no on-device model, no signed APK, nothing submitted to the dApp Store. Seed Vault is the **intended** signer.

### Known blockers
- Not yet verified that the shell builds on Android (no CI build).
- MWA is a native module → requires Expo **dev client / prebuild**; Expo Go cannot be used for M2+.
- Release keystore + publisher wallet must be created and held by Release (human-held secrets).
- Legal copy (privacy/ToS) needs owner review before M5.
