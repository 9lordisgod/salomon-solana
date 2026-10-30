# Salomon Solana

> **Salomon Solana is aiming to be a local-first AI research agent for Solana Mobile (Seeker) — on-device by default; notes stay on-device; Seed Vault for signing; light Solana actions only when you approve.** (Mobile app / Seed Vault signing / chain actions not shipped yet.)

Salomon Solana is the on-chain sibling of [Salomon](https://github.com/9lordisgod/salomon). Crypto / Solana Mobile narrative lives here; pure-AI Salomon stays separate. This track is designed to keep sensitive research on-device by default with a small language model (SLM). For on-chain actions it would only *propose* them. Every proposal is meant to be sanitized and fail closed, and nothing would be signed until you approve it in **Seed Vault**. The model must never see raw keys.

## Principles

- **Local-first (goal):** asks are designed to run on the device. If local inference is unavailable, the app should refuse instead of silently using the cloud.
- **Propose-only on-chain (goal):** the agent would draft transactions; only you would sign them, through Seed Vault.
- **No keys in the model:** private keys must never reach the model, its prompts, or its logs.

## Status

M0 is in progress. This repo holds the scaffold only. **No dApp Store build, on-phone model, or live Seed Vault/chain integration has shipped yet.** See [docs/STATUS.md](docs/STATUS.md).

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Product scope](docs/PRODUCT_SCOPE.md)
- [Status](docs/STATUS.md) · [Progress](docs/PROGRESS.md)
- [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## Layout

```
apps/mobile/   React Native (Expo) shell for Seeker
onchain/       Future Anchor program (placeholder, not deployed)
crates/core/   Shared Rust sanitizer / ask boundary (stub)
docs/          Architecture, roadmap, scope, status
```

## License

Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary. See [LICENSE](LICENSE).
