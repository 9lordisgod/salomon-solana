# Security Policy

## Model

- **No raw keys in the model:** signing happens only in Seed Vault. Keys never reach the model, its prompts, its tools, or its logs.
- **Propose-only:** the agent can only draft transactions. You approve each one in Seed Vault.
- **Fail closed:** if sanitizing, simulating, or decoding a proposal fails, it is dropped. If local inference is unavailable, the ask is refused rather than sent to a cloud fallback.

## Reporting

Report vulnerabilities privately to the repository owner (@9lordisgod). Do not open public issues for security reports.
