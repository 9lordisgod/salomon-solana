# Progress

## 2026-10-29: SV-0 STATUS + ARCHITECTURE (sign ≠ broadcast)

- Merged PR #3 squash → tip `9cebbeb`. Lead: STATUS/ARCHITECTURE honesty CLEAR.
- **SV-0** parked as design-only (not M2); **SM-0** not landed yet.
- ARCHITECTURE mermaid split: Sign approval → Seed Vault → host holds signature → **second** Broadcast confirm → RPC (Lead M3 lock).
- Linked [DESIGN_SEED_VAULT_BOUNDARIES_V0.md](DESIGN_SEED_VAULT_BOUNDARIES_V0.md). No product claims for live Vault.

## 2026-10-29: Goal-tense soft-sync (docs)

- README hero + principles moved to aiming/goal tense; not-shipped parenthetical kept (merged tip `8c2c8e8`).
- ARCHITECTURE labeled target design; ask / propose-only paths described as goals.
- ROADMAP / PRODUCT_SCOPE marked M1–M4 planned; in-scope as goals; sibling `salomon` called out (PR #2 → `acdee9a`).
- Pure-AI `salomon` left untouched; crypto / Solana Mobile narrative stays in this repo.

## 2026-10-29: M0 initial scaffold

- Added README, LICENSE, NOTICE, SECURITY, CONTRIBUTING, .editorconfig, and .gitignore.
- Added docs: architecture (dual path), roadmap, status, and product scope.
- Added stubs: `apps/mobile` (Expo chat shell), the `onchain/` placeholder, and the `crates/core` boundary.
