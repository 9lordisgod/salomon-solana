# M2 — Mock MWA + authorize checklist (design only)

**Author:** Seed Vault Engineer · **Date:** Thu Oct 29, 2026 (America/Vancouver)  
**Status:** **PARKED on main** — design/checklist only. **No M2 code** until Lead GO after FE M1 config PR (`ship/m1-android-run`) merges.  
**Binds to:** `docs/ROADMAP.md` M2 · `docs/notes/SHIP_ANDROID_M1.md` Tasks 2–3 · SV-0 (`docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md`) · On-Chain `MwaSessionPublic` / `sm1-prepare-handoff-stubs`  
**Not claimed:** live Seed Vault / Seeker Connect on device until wired+proven.

## 0. Goal (ROADMAP M2 acceptance)

- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` `transact()` → `authorize` against **Mock MWA Wallet** on Android emulator.
- Show connected **pubkey**; **deauthorize** clears session.
- No wallet installed → clear fail-closed UX (never soft-continue / paste-key).
- Auth token in app storage only — **never** passed to model / agent loop.
- Emulator OK; **no physical Seeker required** for M2 green.
- **Out of scope for M2:** `signTransactions`, broadcast, Seed Vault live claim, prepare-for-sign eng beyond existing stubs.

## 1. Ownership

| Owner | Owns in M2 | Does not own |
|-------|------------|--------------|
| **Seed Vault Engineer** | Session boundary; auth-token isolation; fail-closed codes; MWA package allowlist; honesty ("Mock MWA" ≠ Seed Vault shipped) | RN chrome polish; Expo/Android build green (FE/Platform M1) |
| **Solana Mobile FE** | WalletScreen connect/disconnect UX; identity strings; error copy; eslint boundary `agent ↛ wallet` | Inventing sign tools; model-facing wallet APIs |
| **On-Chain** | Consumes `MwaSessionPublic` after M2 green; holds M3 prepare-for-sign until then | Owning MWA authorize UI or Mock Wallet install |
| **Platform** | Dev-client / emulator packaging that can host Mock MWA | Custody policy |

## 2. Packages (install after Lead GO — do not push until then)

**App (`apps/mobile`):**
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js`
- `@solana-mobile/mobile-wallet-adapter-protocol`
- `@solana/web3.js`
- `react-native-get-random-values`
- `buffer`
- `@react-native-async-storage/async-storage`

**Dev machine / emulator (not in app deps):**
- Mock MWA Wallet: `solana-mobile/mock-mwa-wallet` (`./gradlew installDebug`)  
  — or `mobile-wallet-adapter` `android/fakewallet` as alternate.

**Polyfills (first import in entry):**
- `apps/mobile/polyfills.ts` — `react-native-get-random-values` + `global.Buffer`.

**Forbidden in M2 deps / code:**
- Any path that calls `signTransactions` / `signAndSendTransactions` / `signMessages` for product flows.
- Any import from `src/agent/**` → `src/wallet/**` (eslint `no-restricted-imports`).

## 3. Session API (host ↔ Mock MWA)

Align host session shape with On-Chain stub `MwaSessionPublic`:

```ts
interface MwaSessionPublic {
  authorized: boolean;
  cluster: "devnet" | "testnet" | "mainnet-beta"; // M2 default: "devnet"
  pubkeys: string[]; // base58; empty when not authorized
}
```

**Host-private (never in MwaSessionPublic, never to model):**
- MWA auth token / authorization result material → AsyncStorage (or equivalent app-private store) only.
- No logging of auth token, no chat/transcript echo, no tool-envelope fields.

### 3.1 Authorize
1. User taps Connect on WalletScreen.
2. `transact(async (wallet) => wallet.authorize({ cluster: 'devnet', identity: { name, uri, icon } }))`.
3. On success: persist auth token in app storage; expose `MwaSessionPublic` with `authorized: true`, cluster, pubkey(s).
4. On user reject: no state change; UX `"Connection declined"`.
5. On no wallet / association failure: fail closed — see §4.

### 3.2 Deauthorize
1. User taps Disconnect.
2. `deauthorize` (or equivalent clear) via MWA; wipe auth token from app storage.
3. `MwaSessionPublic` → `{ authorized: false, cluster, pubkeys: [] }`.
4. Does **not** claim Vault wiped on device.

### 3.3 Reauthorize
- Re-run authorize when cluster or account changes; refuse later sign (M3) if `fee_payer ∉ pubkeys`.

## 4. Fail-closed UX (no-wallet / missing session)

| Condition | Code (align VaultDenyCode) | UX copy (plain) | Forbidden |
|-----------|----------------------------|-----------------|-----------|
| No MWA wallet / association fail | `vault_unavailable` | "No MWA wallet found" | Soft continue; in-app keystore; paste-a-key |
| Not authorized / empty pubkeys | `mwa_not_authorized` | "Wallet not connected" | Fake pubkey; silent reauth |
| User declines authorize sheet | (no code; no state change) | "Connection declined" | Persist partial token |
| Storage read of auth token fails mid-session | `mwa_not_authorized` | Re-prompt Connect | Pass broken token to model |

## 5. Auth token never to model (hard checks)

Checklist before M2 GREEN:
- [ ] Auth token lives only in wallet/session module + AsyncStorage.
- [ ] `src/agent/**` (and any model/prompt builder) has **zero** imports of wallet/auth modules (eslint gate).
- [ ] Tool envelopes / UNTRUSTED wraps may carry **public** pubkey + cluster only — never auth token, never signature.
- [ ] Logs: digests + public pubkeys only; scrub auth token from crash/analytics if those exist.
- [ ] Unit/integration assertion: after connect, model-facing snapshot excludes auth fields.

## 6. File plan (for GO — not authored until then)

| Path | Purpose |
|------|---------|
| `apps/mobile/polyfills.ts` | RNG + Buffer |
| `apps/mobile/src/wallet/mwa.ts` | `connect` / `disconnect`; token storage; → `MwaSessionPublic` |
| `apps/mobile/src/wallet/types.ts` | Re-export or mirror public session types; no secrets |
| `apps/mobile/src/screens/WalletScreen.tsx` | Connect / Disconnect / pubkey / error states |
| eslint `no-restricted-imports` | `agent ↛ wallet` |
| `docs/notes/M2_MOCK_MWA_CHECKLIST.md` | This note (promoted) |

## 7. Gate checklist (M2 GREEN)

- [ ] FE M1 config PR merged; Lead GO received.
- [ ] Mock MWA Wallet installed on emulator; authorize sheet appears.
- [ ] Connect → pubkey shown; Disconnect clears pubkey + token.
- [ ] User reject → declined copy; no token persisted.
- [ ] No wallet → "No MWA wallet found" (fail closed).
- [ ] No `sign*` / broadcast calls in M2 diff.
- [ ] eslint / import boundary: agent cannot import wallet.
- [ ] Docs honesty: "Mock MWA on emulator" — **not** "Seed Vault live".
- [ ] On-Chain notified: `MwaSessionPublic` producers ready for M3 prepare-for-sign.

## 8. Coordination

- **On-Chain:** M2 produces `MwaSessionPublic` only; M3 `prepareForSign` already stubbed on `sm1-prepare-handoff-stubs` (Seed Vault co-check PASS). Hold live sign until M2 GREEN.
- **Solana Mobile FE:** WalletScreen + identity; adopt this checklist on Lead GO.
- **Solana Docs:** after M2 green, STATUS/ROADMAP honesty only — no present-tense Seed Vault ship claim.

## 9. Locked

1. No M2 **code** / app PR until **Lead GO** after FE M1 config PR merges.
2. propose ≠ sign ≠ broadcast unchanged; M2 = authorize/session only.
3. Model never holds keys or auth tokens.
4. This note lives at `docs/notes/M2_MOCK_MWA_CHECKLIST.md` on main (Lead promoted from Seed Vault park 2026-10-29).
