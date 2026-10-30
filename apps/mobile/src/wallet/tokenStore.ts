// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/**
 * Host-private MWA auth_token storage. NOT exported from ./index.
 * The token never enters MwaSessionPublic, UI state, logs, or the AI/model path.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'salomon.mwa.auth_token';

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
    // best effort; session is already cleared in memory
  }
}
