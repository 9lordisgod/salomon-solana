// Minimal M2 wallet panel — FE owns polish. Shows public session only.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { connect, disconnect, getSession, WalletSessionError, type MwaSessionPublic } from '../wallet';
import { colors } from '../theme';

export function WalletScreen() {
  const [session, setSession] = useState<MwaSessionPublic>(getSession());
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<MwaSessionPublic>) => {
    setBusy(true);
    setErr(null);
    try {
      setSession(await fn());
    } catch (e) {
      setErr(e instanceof WalletSessionError ? e.message : 'Wallet error');
      setSession(getSession());
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Wallet · Mock MWA ({session.cluster})</Text>
      <Text style={s.body}>
        {session.authorized ? `Connected: ${session.pubkeys[0]}` : 'Not connected'}
      </Text>
      {err ? <Text style={s.err}>{err}</Text> : null}
      <Pressable
        disabled={busy}
        onPress={() => run(session.authorized ? disconnect : () => connect())}
        style={({ pressed }) => [s.btn, (busy || pressed) && s.dim]}
      >
        <Text style={s.btnText}>{session.authorized ? 'Disconnect' : 'Connect wallet'}</Text>
      </Pressable>
      <Text style={s.note}>Authorize only · no signing yet · Seed Vault signing not shipped.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 8, backgroundColor: colors.bgRaised, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.textBright, fontSize: 14, fontWeight: '600' },
  body: { color: colors.text, fontSize: 13 },
  err: { color: colors.textMuted, fontSize: 13 },
  btn: { alignSelf: 'flex-start', backgroundColor: colors.sendBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  dim: { opacity: 0.5 },
  btnText: { color: colors.sendFg, fontWeight: '600', fontSize: 13 },
  note: { color: colors.textDim, fontSize: 11 },
});
