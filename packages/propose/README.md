# @salomon-solana/propose (SM-0)

Propose-only SOL/SPL transfer drafts. **No signing, no Seed Vault calls, no broadcast.**

- Host builds `human_summary` + `draft_sha256`.
- `signDraft` / `broadcastSigned` / `seedVaultSign` throw `NotImplemented`.
- `onchain/` Anchor folder stays a placeholder — unused here.

See `docs/notes/DESIGN_SOLANA_MOBILE_ONCHAIN_V0.md`.
