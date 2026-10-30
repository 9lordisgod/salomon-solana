// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme';
import { connect, disconnect, getSession, shortKey, WALLET_COPY, type MwaSessionPublic } from '../wallet';

type Props = { onClose: () => void; onSession: (s: MwaSessionPublic) => void };

export function WalletScreen({ onClose, onSession }: Props) {
  const [session, setSession] = useState<MwaSessionPublic>(getSession());
  const [error, setError] = useState<string | null>(session.authorized ? null : WALLET_COPY.mwa_not_authorized);
  const [busy, setBusy] = useState(false);

  const doConnect = async () => {
    setBusy(true);
    const r = await connect();
    setBusy(false);
    if (r.ok) {
      setSession(r.session);
      onSession(r.session);
      setError(null);
    } else {
      // user_declined: no state change, just copy. Others: fail closed.
      setError(WALLET_COPY[r.code]);
    }
  };

  const doDisconnect = async () => {
    setBusy(true);
    const s = await disconnect();
    setBusy(false);
    setSession(s);
    onSession(s);
    setError(WALLET_COPY.mwa_not_authorized);
  };

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.tag}>MOCK MWA</Text>
        <Pressable onPress={onClose} accessibilityLabel="Back to desk" style={styles.close}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>
        Mock Mobile Wallet Adapter — authorize only, devnet. This is not Seed Vault live. No signing, no
        broadcast in this build.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{session.authorized ? 'Connected' : 'Not connected'}</Text>
        {session.authorized && session.pubkeys[0] ? (
          <Text style={styles.key}>{shortKey(session.pubkeys[0])} · {session.cluster}</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        disabled={busy}
        onPress={session.authorized ? doDisconnect : doConnect}
        style={({ pressed }) => [styles.btn, (busy || pressed) && styles.btnDim]}
      >
        <Text style={styles.btnText}>{session.authorized ? 'Disconnect' : 'Connect'}</Text>
      </Pressable>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: colors.textBright, fontSize: 20, fontWeight: '600' },
  tag: {
    fontFamily: mono, fontSize: 10, color: colors.textMuted, borderWidth: 1,
    borderColor: colors.chipBorder, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
  },
  close: { marginLeft: 'auto', padding: 6 },
  closeText: { color: colors.textMuted, fontSize: 14 },
  note: { color: colors.textDim, fontSize: 12, lineHeight: 18 },
  card: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgRaised,
    borderRadius: 12, padding: 14, gap: 4,
  },
  label: { color: colors.textDim, fontSize: 11 },
  value: { color: colors.text, fontSize: 15 },
  key: { fontFamily: mono, color: colors.textMuted, fontSize: 13 },
  error: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
  btn: { backgroundColor: colors.sendBg, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnDim: { opacity: 0.5 },
  btnText: { color: colors.sendFg, fontSize: 15, fontWeight: '600' },
});
