/**
 * PRIVATE to src/wallet. MWA auth_token lives only here (AsyncStorage).
 * Never re-export from wallet/index.ts. Never log. Never pass to model/engine.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'salomon.wallet.mwa_auth_v1';

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* fail-closed: nothing to surface */
  }
}
