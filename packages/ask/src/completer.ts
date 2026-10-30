import { EngineChip, NativeAskResult, NativeAskStatus } from './types.js';
/** Binding-agnostic. Platform (libsalomon_solana_core.so via Expo TurboModule) supplies the impl.
 *  No streaming in SM-A1. Agent loop / chat template / sanitizer sit ABOVE this. */
export interface LocalCompleter {
  kind: 'local';
  ask(prompt: string): Promise<NativeAskResult>;
}
/** Unknown status codes fail closed to missing. */
export function chipOfNative(status: number): EngineChip {
  switch (status) {
    case NativeAskStatus.Stub: return 'stub';
    case NativeAskStatus.Local: return 'local';
    case NativeAskStatus.Refused: return 'refused';
    default: return 'missing';
  }
}
export function createUnavailableCompleter(): LocalCompleter {
  return { kind: 'local', async ask() { return { status: NativeAskStatus.MissingModel, text: null, error: 'local_model_unavailable' }; } };
}
