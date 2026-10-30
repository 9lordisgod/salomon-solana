// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { EngineChip as Chip, chipLabel } from '../engine';
import { colors } from '../theme';

type Props = { chip: Chip; model?: string | null };

export function EngineChip({ chip, model }: Props) {
  const missing = chip === 'missing' || chip === 'refused';
  return (
    <Text
      accessibilityRole="text"
      accessibilityLabel={`Engine status ${chipLabel(chip, model)}`}
      style={[styles.chip, missing && styles.chipMissing]}
    >
      {chipLabel(chip, model)}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    maxWidth: 160,
    overflow: 'hidden',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.textBright,
  },
  chipMissing: {
    backgroundColor: colors.chipBg,
    color: colors.text,
  },
});
