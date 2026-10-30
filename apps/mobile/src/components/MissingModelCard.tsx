// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function MissingModelCard() {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>MODEL MISSING</Text>
      <Text style={styles.body}>
        Local model missing. On-device ask fails closed — no cloud fallback. Seed Vault signing and chain
        actions are not wired in this shell yet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  kicker: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  body: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
