/** M2 fail-closed codes — names align with propose VaultDenyCode subset. */
export type WalletSessionErrorCode = 'vault_unavailable' | 'mwa_not_authorized';

export const WALLET_ERROR_COPY: Record<WalletSessionErrorCode, string> = {
  vault_unavailable: 'No MWA wallet found. Install a Mobile Wallet Adapter wallet (e.g. Mock MWA Wallet on emulator) and try again.',
  mwa_not_authorized: 'Connection declined. Wallet not authorized.',
};

export class WalletSessionError extends Error {
  constructor(public readonly code: WalletSessionErrorCode, message?: string) {
    super(message ?? WALLET_ERROR_COPY[code]);
    this.name = 'WalletSessionError';
  }
}
