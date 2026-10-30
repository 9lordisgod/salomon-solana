/** Copied verbatim from packages/propose/src/forbidden.ts (isolation; keep in sync). */
/** Fail-closed tool-name denylist (SM-0). Whole underscore segments. */
export const FORBIDDEN_TOOL_RE =
  /(^|_)(sign|submit|broadcast|settle|execute|send|publish|import_key|export_key|signAndSend)(_|$)/i;

export const FORBIDDEN_TOOL_NAMES = new Set([
  'sign',
  'submit',
  'broadcast',
  'settle',
  'send_tx',
  'sign_message',
  'sign_transaction',
  'signAndSendTransaction',
  'signTransaction',
  'seed_vault_sign',
  'import_key',
  'export_key',
]);

export function isForbiddenToolName(name: string): boolean {
  if (FORBIDDEN_TOOL_NAMES.has(name)) return true;
  return FORBIDDEN_TOOL_RE.test(name);
}
