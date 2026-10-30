# apps/mobile

Expo / React Native shell for **Solana Seeker / Saga (Android)**. Separate from the pure-AI Salomon Android Compose app.

## M0 (this tree)

- Chat-first research desk (zinc / mono)
- Honest engine chip: `LOCAL` · `STUB` · `REMOTE` · `MODEL MISSING` · `REFUSED`
- Every ask **fails closed** — no local model wired yet, no silent cloud fallback
- Seed Vault / Mobile Wallet Adapter **not wired**

```bash
npm install
npm run web       # dogfood UI without a device
npm run android   # emulator or Seeker
npm run typecheck
```

## Not claimed

On-device SLM, dApp Store build, live Seed Vault signing, or chain submission.

## Seed Vault contract (SV-0)

Types only in `src/vault/types.ts` — match `docs/DESIGN_SEED_VAULT_BOUNDARIES_V0.md` §7
(`SignApprovalRequest` / `ExportApprovalRequest` / `SignResult`). Approval UX screens land
with M2/M3: show `human_summary` + `draft_sha256` (public fee_payer/cluster only); Sign then
**separate** Broadcast confirm. No paste-key; refuse in-product seed/mnemonic export.
