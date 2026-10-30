# Salomon Solana

**A local-first AI research agent for Solana Mobile and Seeker.**

Salomon Solana is the on-chain sibling of [Salomon](https://github.com/9lordisgod/salomon). It keeps sensitive research on-device by default with a small language model (SLM). For on-chain actions it only *proposes* them. Every proposal is sanitized and fails closed, and nothing is signed until you approve it in **Seed Vault**. The model never sees raw keys.

## Principles

- **Local-first:** asks run on the device. If local inference is unavailable, the app refuses instead of silently using the cloud.
- **Propose-only on-chain:** the agent drafts transactions, and only you sign them, through Seed Vault.
- **No keys in the model:** private keys never reach the model, its prompts, or its logs.

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
