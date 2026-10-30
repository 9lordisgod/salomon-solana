# Contributing to Salomon Solana

Thanks for your interest! This project is open source under the [MIT License](LICENSE), and contributions are welcome.

- Branch from `main`, keep PRs small, and describe the change and how you tested it
  (`npm run typecheck`, `npm run lint`, `npm run test:wallet` in `apps/mobile`; `npm test` in `packages/*`).
- **Never commit secrets** — keypairs, seed phrases, auth tokens, keystores, or `.env` files. Use obviously fake fixtures.
- Changes touching the wallet / on-chain boundary or the sanitizer need a careful security review — call it out in the PR (see [SECURITY.md](SECURITY.md)).
- Respect the boundary: `src/agent/**` must never import `src/wallet/**`; the model never signs or broadcasts.
- Docs use goal tense for unshipped work. Don't claim a feature is live until it is verified on a real host.

By contributing, you agree your contributions are licensed under the MIT License.
