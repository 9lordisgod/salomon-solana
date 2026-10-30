// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, Pressable, FlatList, View, StyleSheet } from 'react-native';

type Msg = { id: string; role: 'user' | 'agent'; text: string };

// M0 stub: no local model yet, so every ask fails closed.
function ask(_prompt: string): string {
  return 'Local model not available yet. Refusing (fail-closed). No cloud fallback.';
}

export default function App() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const now = Date.now().toString();
    setMsgs(m => [...m, { id: now + 'u', role: 'user', text: t }, { id: now + 'a', role: 'agent', text: ask(t) }]);
    setInput('');
  };

  return (
    <SafeAreaView style={s.root}>
      <Text style={s.title}>Salomon · Seeker</Text>
      <FlatList data={msgs} keyExtractor={m => m.id} renderItem={({ item }) => (
        <Text style={item.role === 'user' ? s.user : s.agent}>{item.text}</Text>
      )} />
      <View style={s.row}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Ask privately…" placeholderTextColor="#71717a" />
        <Pressable style={s.btn} onPress={send}><Text style={s.btnText}>Send</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { color: '#fafafa', fontSize: 18, fontFamily: 'monospace', marginBottom: 12 },
  user: { color: '#fafafa', alignSelf: 'flex-end', marginVertical: 4 },
  agent: { color: '#a1a1aa', marginVertical: 4 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, color: '#fafafa', borderColor: '#3f3f46', borderWidth: 1, padding: 10 },
  btn: { backgroundColor: '#27272a', paddingHorizontal: 16, justifyContent: 'center' },
  btnText: { color: '#fafafa' },
});
