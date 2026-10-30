# Security Policy

## Model

- **No raw keys in the model:** signing happens only in Seed Vault. Keys never reach the model, its prompts, its tools, or its logs.
- **Propose-only:** the agent can only draft transactions. You approve each one in Seed Vault.
- **Fail closed:** if sanitizing, simulating, or decoding a proposal fails, it is dropped. If local inference is unavailable, the ask is refused rather than sent to a cloud fallback.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately through **GitHub Security Advisories**: go to the repository's
**Security** tab → **Report a vulnerability** (private vulnerability reporting).
Include steps to reproduce, affected files/commits, and impact. We aim to
acknowledge reports within a few days.

Never include real secrets, keys, seed phrases, or source material in a report —
use obviously fake fixtures.
