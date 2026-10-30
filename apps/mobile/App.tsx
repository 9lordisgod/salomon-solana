// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React, { useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { EngineChip } from './src/components/EngineChip';
import { MissingModelCard } from './src/components/MissingModelCard';
import { MISSING_STATUS, askLocal, chipOf, type EngineStatus } from './src/engine';
import { colors } from './src/theme';

type Msg = { id: string; role: 'user' | 'agent'; text: string };

const SUGGESTIONS = [
  { t: 'Research desk', q: 'Summarize what this Seeker shell can and cannot do today.' },
  { t: 'Fail-closed', q: 'What happens if there is no local model?' },
  { t: 'Propose-only', q: 'How would a Solana transfer be proposed without keys in the model?' },
];

export default function App() {
  // M0: status is always missing until native/local backend lands.
  const status: EngineStatus = MISSING_STATUS;
  const chip = chipOf(status);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const listRef = useRef<FlatList<Msg>>(null);
  const empty = msgs.length === 0;

  const send = (raw?: string) => {
    const t = (raw ?? input).trim();
    if (!t) return;
    const now = Date.now().toString();
    const reply = askLocal(t, status);
    setMsgs((m) => [
      ...m,
      { id: `${now}u`, role: 'user', text: t },
      { id: `${now}a`, role: 'agent', text: reply.text },
    ]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const footer = useMemo(
    () => (
      <Text style={styles.footer}>
        Local by default · REMOTE is always labeled · credentials stay out of the model · Seed Vault not wired
      </Text>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Salomon</Text>
          <Text style={styles.badge}>Research</Text>
          <View style={styles.chipWrap}>
            <EngineChip chip={chip} model={status.model} />
          </View>
        </View>

        {empty ? (
          <View style={styles.hero}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Private local AI · Seeker</Text>
            </View>
            <Text style={styles.heroTitle}>What do you want to work on?</Text>
            <Text style={styles.heroSub}>
              Asks stay on-device when a local model is connected. M0 fails closed with no model — nothing is
              sent anywhere. On-chain actions stay propose-only (Seed Vault not wired yet).
            </Text>
            <View style={styles.cardWrap}>
              <MissingModelCard />
            </View>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s.t}
                  onPress={() => send(s.q)}
                  style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
                >
                  <Text style={styles.suggestionTitle}>{s.t}</Text>
                  <Text style={styles.suggestionQ}>{s.q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.flex}
            contentContainerStyle={styles.thread}
            data={msgs}
            keyExtractor={(m) => m.id}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAgent]}>
                <Text style={item.role === 'user' ? styles.userText : styles.agentText}>{item.text}</Text>
              </View>
            )}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={[styles.input, empty && styles.inputTall]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask privately…"
            placeholderTextColor={colors.textDim}
            multiline
            textAlignVertical="top"
            onSubmitEditing={() => send()}
            blurOnSubmit={false}
          />
          <Pressable
            accessibilityLabel="Send"
            disabled={!input.trim()}
            onPress={() => send()}
            style={({ pressed }) => [
              styles.send,
              (!input.trim() || pressed) && styles.sendDisabled,
            ]}
          >
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: { color: colors.textBright, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  badge: {
    borderRadius: 6,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipWrap: { marginLeft: 'auto' },
  hero: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  pillText: { fontSize: 11, color: colors.textMuted },
  heroTitle: {
    color: colors.textBright,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  heroSub: { marginTop: 12, maxWidth: 420, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  cardWrap: { marginTop: 24 },
  suggestions: { marginTop: 20, gap: 8 },
  suggestion: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionPressed: { backgroundColor: colors.chipBg },
  suggestionTitle: { color: colors.text, fontSize: 13, fontWeight: '500' },
  suggestionQ: { marginTop: 2, color: colors.textDim, fontSize: 12, lineHeight: 16 },
  thread: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  bubble: { maxWidth: '92%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.chipBg },
  bubbleAgent: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
  },
  userText: { color: colors.textBright, fontSize: 15, lineHeight: 22 },
  agentText: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    color: colors.textBright,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputTall: { minHeight: 96 },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sendBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendDisabled: { opacity: 0.25 },
  sendText: { color: colors.sendFg, fontSize: 16, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textDim,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
  },
});
