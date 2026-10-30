<!-- © 2026 Anon Rothschild. All rights reserved. Proprietary. -->
# Salomon Solana — UI Design Principles (parked)

**Status:** Design direction only. Nothing here claims a shipped feature. Seed Vault is the *intended* signer; no on-device model runs yet (see `docs/STATUS.md`).

## 1. Principles
1. **Research tool first.** Feels like Linear / Craft — a quiet desk for thinking, not a chatbot toy and not a trading terminal. No tickers, no price flashing, no "AI magic" sparkles.
2. **Honest status, always visible.** Engine state (LOCAL / STUB / REMOTE / MODEL MISSING) and on-chain posture (PROPOSE-ONLY) live in persistent chrome, never only in onboarding.
3. **Fail closed, visibly.** When there is no model or no wallet, the UI says so plainly and offers the real next step. Disabled is better than pretend.
4. **Calm, explicit approval.** Any sign request is a deliberate sheet with a human summary and a hash; never a toast, never auto-confirmed, never combined with broadcast.
5. **Restraint.** One accent. Minimal chrome. Generous space. Motion only to explain state change (≤200 ms, no loops, respects Reduce Motion).
6. **No invented features.** If it isn't built, it isn't on screen — or it is shown as a labeled stub.
7. **Phone-first, long-use.** One-hand reach for primary actions, ≥44 pt targets, readable at arm's length, WCAG AA contrast minimum.

## 2. Surfaces (IA)
| Surface | Purpose | Built today? |
|---|---|---|
| **Research desk** (home) | Threaded research sessions; status bar; composer | Shell only (M0 single thread) |
| **Ask panel** | Composer + engine chip + context scope ("Notes: none") | Composer exists; fails closed (MODEL MISSING) |
| **Approval sheet** | Bottom sheet reviewing a proposed tx: human_summary, draft_sha256, network, fee estimate, Approve in wallet / Reject | **Stub only** until M2 Mock MWA + M3 |
| **Library** | Local notes/documents used as ask context | Not built (AI-2) — do not show live UI |
| **Settings / Trust** | Engine + model file status, wallet connection, data stays-local statement, remote opt-in (off, not built), legal links | Not built — first version is read-only status |

Navigation: single stack with Desk as root; Library and Settings via a header menu (no tab bar until Library exists). Approval sheet is modal over Desk only.

## 3. Visual system (React Native tokens)
### Color (zinc/charcoal, one accent)
```ts
export const tokens = {
  bg: '#09090B',        // zinc-950
  bgRaised: '#18181B',  // zinc-900  cards, sheets
  bgSunken: '#0C0C0E',  // composer well
  border: '#27272A',    // zinc-800 hairlines
  borderStrong: '#3F3F46',
  textBright: '#FAFAFA',
  text: '#E4E4E7',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
  accent: '#A3B8FF',    // single precise accent: focus, primary action, links
  accentFg: '#09090B',
  // semantic, used ONLY in status chips/sheets, low saturation
  ok: '#86EFAC',        // LOCAL running
  warn: '#FCD34D',      // STUB / APPROVAL REQUIRED / REMOTE
  danger: '#FCA5A5',    // MODEL MISSING, reject, errors
};
```
No gradients, no glow, no purple-to-teal Web3 washes.

### Type (system font; Inter if bundled later)
| Role | Size/Line | Weight |
|---|---|---|
| Display (empty desk title) | 28/34 | 600, tracking -0.4 |
| Title | 20/26 | 600 |
| Body | 15/22 | 400 |
| Label | 13/18 | 500 |
| Meta / chip | 11/14 | 600, uppercase, tracking +0.6 |
| Mono (hashes, addresses) | 12/16 | Menlo/monospace |

### Spacing & shape
4-pt base: 4, 8, 12, 16, 24, 32, 48. Screen gutter 16 (20 on hero). Radius: 6 chips, 12 cards, 20 sheet top. Hairline borders over shadows.

### Components
- **Status chip** — `[dot] LABEL`, 11pt caps, 1px border in semantic color at ~40% + 10% fill.
  - `LOCAL` (ok) — a local model is actually loaded and answering.
  - `STUB` (warn) — deterministic placeholder reply; not a model.
  - `REMOTE` (warn) — user opted in to a remote path; *never* default; not built.
  - `MODEL MISSING` (danger) — fail-closed; nothing is sent anywhere.
  - `PROPOSE-ONLY` (neutral/border) — persistent on-chain posture.
  - `APPROVAL REQUIRED` (warn) — appears on any proposed tx card and the sheet.
- **Status bar** — header right: engine chip + PROPOSE-ONLY chip. Tap opens Settings/Trust.
- **Cards** — bgRaised, 12 radius, hairline border, 16 padding; title (Label) + body (Body muted) + optional action row.
- **Bottom sheet** — bgRaised, top radius 20, grabber, scrim 60% black; primary action full-width at bottom; destructive/secondary as text button above it.
- **Proposed tx card** (in thread) — summary line, mono hash (truncated, tap to copy full), APPROVAL REQUIRED chip, "Review" → Approval sheet.
- **Composer** — sunken well, 16pt input, accent send button only enabled with text and when engine ≠ MODEL MISSING (else shows inline reason).
- **Messages** — no chat bubbles for agent; agent replies render as document blocks (full width, no avatar). User prompts as compact muted quote blocks. Reads as a research log.

## 4. Primary flows
1. **First open (M0/M1):** Desk shows MODEL MISSING + PROPOSE-ONLY chips → MissingModelCard explains how a model gets connected → composer disabled with reason.
2. **Local ask (AI-1, once real):** type → chip stays LOCAL → streaming document block → "Sources: none / Notes" footer.
3. **Propose tx (M3, once real):** agent drafts → proposed tx card → Review → Approval sheet (summary, draft_sha256, network, fee) → "Approve in wallet" hands to MWA wallet → result "Signed — not broadcast" → separate explicit **Broadcast** action with its own confirm.
4. **Trust check:** tap status bar → Settings/Trust shows engine, model file (name, size, sha256 or "none"), wallet (none / Mock MWA / real), "Data leaves device: never (remote not built)".

## 5. Copy flags (current shell)
| Current | Issue | Replace with |
|---|---|---|
| "Private local AI · Seeker" (hero pill) | Implies a local AI is running; none is | "Local-first research · model not connected" |
| "What do you want to work on?" | Generic chatbot opener | "Research desk" + one line of real state |
| "Ask privately…" placeholder | Implies working private inference | "Ask (no local model — fails closed)" while MISSING; "Ask locally…" when LOCAL |
| Long hero paragraph | Dense, trust copy buried | Move into chips + MissingModelCard + Settings/Trust |
| Footer "Seed Vault intended signer (not shipped)" | Honest, but low-hierarchy fine print | Keep honesty; move to Trust screen + PROPOSE-ONLY chip |
| Suggestion "Propose-only" asking about transfers | OK if answered by stub; must not imply a working flow | Keep, label replies STUB |
| Chat bubbles | Generic AI chat look | Document blocks |
Banned words until true: "secure enclave active", "Seed Vault connected", "on-device AI ready", "trained", "AI-powered trading", "instant", "trustless agent".

## 6. Redesign order in `apps/mobile/App.tsx`
1. **Header/status bar** — add PROPOSE-ONLY chip beside EngineChip; tap → Trust (static screen).
2. **Hero** — replace pill/title/paragraph with "Research desk" + state line; keep MissingModelCard as the single explanatory card.
3. **MissingModelCard** — restyle to card spec; concrete next step (model file expected at path, see AI_MODEL_RECOMMENDATION.md); no promises.
4. **Composer** — sunken well, disabled-with-reason when MODEL MISSING, accent send.
5. **Thread** — document blocks instead of bubbles.
6. **theme.ts** — replace with tokens above.

## 7. First UI milestone — UI-1
**"Refined research desk + honest status + approval sheet stub."**
- Tokens in `src/theme.ts`; StatusChip supports LOCAL / STUB / REMOTE / MODEL MISSING / PROPOSE-ONLY / APPROVAL REQUIRED.
- Desk redesign per §6 items 1–5.
- `ApprovalSheet` component rendered only from a **fixture** proposal behind a dev flag, labeled `STUB — no wallet connected`; Approve button disabled. No live Seed Vault or MWA claim.
- Static Settings/Trust screen reading real engine status.
- Done when: runs on Android emulator (M1), screenshots attached to PR, copy-flag table cleared, no banned words in `apps/mobile`.

Owners: Solana Mobile FE (build), Product (copy), Lead Architect (review). Runs alongside/after M1 Android run; Approval sheet goes live only with M2/M3.
