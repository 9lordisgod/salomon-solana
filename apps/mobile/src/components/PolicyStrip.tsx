// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme';

/** Always-on policy chips — distinct from EngineChip (model status). */
const POLICY = ['LOCAL', 'PROPOSE-ONLY', 'APPROVAL REQUIRED'] as const;

export function PolicyStrip() {
  return (
    <View style={styles.row} accessibilityLabel="Policy: local, propose-only, approval required">
      {POLICY.map((p) => (
        <Text key={p} style={styles.chip}>{p}</Text>
      ))}
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chip: {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.textDim,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
});
