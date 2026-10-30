# Architecture

> **Target design** — not shipped. No on-phone SLM, Seed Vault signing, or chain submit path is live yet. See [STATUS.md](STATUS.md). Seed Vault custody rules (design): [DESIGN_SEED_VAULT_BOUNDARIES_V0.md](DESIGN_SEED_VAULT_BOUNDARIES_V0.md) (**SV-0**, not M2).

Salomon Solana is designed with two paths that never share secrets.

1. **Ask path (local, goal):** the prompt would run through an on-device SLM. If no local model is available, the ask fails closed and is refused. There is no silent cloud fallback.
2. **On-chain path (propose-only, goal):** the model would emit a *proposal* (for example a transfer). The proposal is meant to be sanitized, checked against an allowlist, and simulated. Signing would require an explicit user **Sign** confirm via Seed Vault (host → MWA → Vault). **Broadcast would be a second, separate user confirm** after the Vault returns a signature to the host (`sign ≠ broadcast`, Lead lock for M3). The model never holds keys or signatures.

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#18181b','primaryTextColor':'#fafafa','primaryBorderColor':'#a1a1aa','lineColor':'#71717a','secondaryColor':'#27272a','tertiaryColor':'#3f3f46','fontFamily':'monospace'}}}%%
flowchart TD
  U[User prompt] --> S[Sanitizer]
  S -->|ask| L{Local SLM available?}
  L -->|yes| A[On-device answer]
  L -->|no| R[Refuse - fail closed]
  S -->|on-chain intent| P[Proposal: tx draft]
  P --> V[Validate + allowlist + simulate]
  V -->|fail| R
  V -->|ok| AP[Host: Sign approval UX]
  AP -->|reject| X[Discard]
  AP -->|approve Sign| SV[Seed Vault signs via MWA]
  SV --> H[Host holds signature]
  H --> BC{Broadcast confirm?}
  BC -->|reject| X
  BC -->|approve Broadcast| RPC[Submit to Solana RPC]
```

## Components (planned)

- `apps/mobile`: React Native (Expo) shell built on the Solana Mobile Stack (Mobile Wallet Adapter, Seed Vault).
- `crates/core`: shared sanitizer and ask/propose boundary.
- `onchain/`: optional future Anchor program.
