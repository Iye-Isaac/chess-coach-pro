import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  button: {
  minHeight: M.n48,
  borderRadius: R.small,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: S.lg,
  flexDirection: 'row',
  marginTop: S.xs
},
  buttonSecondary: {
  backgroundColor: C.paper,
  borderWidth: M.n1,
  borderColor: C.muted
},
  buttonPrimary: {
  backgroundColor: C.green
},
  buttonCompact: {
  minHeight: M.n48,
  paddingHorizontal: S.md,
  marginTop: M.zero
},
  buttonDisabled: {
  opacity: 0.48
},
  buttonText: {
  color: C.white,
  fontWeight: W.semibold,
  fontSize: F.body
},
  buttonTextSecondary: {
  color: C.ink
},
  buttonTextCompact: {
  fontSize: F.secondary
}
}) };

export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  busy = false,
  compact = false,
  style
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} disabled={disabled || busy} style={({
    pressed
  }) => [styles.button, secondary ? styles.buttonSecondary : styles.buttonPrimary, compact && styles.buttonCompact, (disabled || busy) && styles.buttonDisabled, pressed && !disabled && [styles.pressed, !secondary && { backgroundColor: C.green2 }], style]}>
      {busy ? <ActivityIndicator color={secondary ? C.green : C.white} size="small" /> : <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary, compact && styles.buttonTextCompact]}>{title}</Text>}
    </Pressable>;
}

