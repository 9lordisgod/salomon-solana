export type EngineChip = 'local' | 'stub' | 'remote' | 'missing' | 'refused';
export type EngineStatus = {
  available: boolean;
  backend: 'gguf' | 'stub' | 'none'; // remote is remoteOptIn+gateway, not a backend
  model: string | null;
  remoteOptIn: boolean;
  gatewayAvailable: boolean;
};
export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type AskRequest = { question: string; history?: ChatTurn[]; options?: { maxTokens?: number } };
export type Redaction = { kind: string; placeholder: string };
export type AskOk = { ok: true; answer: string; chip: 'local' | 'remote'; model: string; steps: number; redactions: Redaction[]; transcriptDigest: string };
export type AskErr = { ok: false; chip: EngineChip; reason: string; status: number; message: string };
export type AskResult = AskOk | AskErr;
/** Platform-locked native status (EXPO_GGUF_LLAMA_INTEGRATION_OUTLINE.md, Opt A). */
export enum NativeAskStatus { MissingModel = 0, Stub = 1, Local = 2, Refused = 3 }
export type NativeAskResult = { status: NativeAskStatus | number; text: string | null; error: string | null };
