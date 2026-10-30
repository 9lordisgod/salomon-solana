# Architecture

> **Target design** — not shipped. No on-phone SLM, Seed Vault signing, or chain submit path is live yet. See [STATUS.md](STATUS.md).

Salomon Solana is designed with two paths that never share secrets.

1. **Ask path (local, goal):** the prompt would run through an on-device SLM. If no local model is available, the ask fails closed and is refused. There is no silent cloud fallback.
2. **On-chain path (propose-only, goal):** the model would emit a *proposal* (for example a transfer). The proposal is meant to be sanitized, checked against an allowlist, and simulated. Only then would it be shown for explicit approval in Seed Vault. The model never holds keys.

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
  V -->|ok| SV[Seed Vault approval prompt]
  SV -->|reject| X[Discard]
  SV -->|approve| SIGN[Seed Vault signs]
  SIGN --> RPC[Submit to Solana RPC]
```

## Components (planned)

- `apps/mobile`: React Native (Expo) shell built on the Solana Mobile Stack (Mobile Wallet Adapter, Seed Vault).
- `crates/core`: shared sanitizer and ask/propose boundary.
- `onchain/`: optional future Anchor program.
