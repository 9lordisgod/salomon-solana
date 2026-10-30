# @salomon-solana/ask (SA-0)

Fail-closed local ask interface for the Seeker Expo shell. Types, chips, reasons, sanitizer hook, and an abstract `LocalCompleter` that wraps Platform's locked native `ask(prompt) → {status 0|1|2|3, text, error}`. **No live llama binding.** See `docs/notes/DESIGN_SOLANA_LOCAL_ASK_V0.md`.

`npm test`
