# Mock MWA — M2 (session boundary)

Status: Mock MWA on emulator only. **Seed Vault signing is not shipped.**

- Install a Mock MWA wallet (solana-mobile `mock-mwa-wallet` / fakewallet) on the Android emulator.
- `npm run android`, tap **Wallet** in the header → Connect / Disconnect (authorize / deauthorize, devnet).
- The MWA `auth_token` is stored in AsyncStorage inside `src/wallet/tokenStore.ts` only; it is never exported from `src/wallet/index.ts`, never logged, never in the model-facing snapshot (`toModelFacingSnapshot` = `{authorized, cluster, pubkeys}`).
- Fail-closed: `vault_unavailable` (no MWA wallet) / `mwa_not_authorized` (declined). No paste-key / in-app keystore.
- No `signTransactions` / `signAndSendTransactions` / `signMessages` / broadcast in M2.
- `npm run test:wallet` runs the snapshot self-test.
