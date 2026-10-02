import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { C, sharedStyles } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  button: {
  minHeight: 46,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 15,
  flexDirection: 'row',
  marginTop: 5
},
  buttonSecondary: {
  backgroundColor: '#f4f5f0',
  borderWidth: 1,
  borderColor: C.line
},
  buttonPrimary: {
  backgroundColor: C.green
},
  buttonCompact: {
  minHeight: 39,
  paddingHorizontal: 11,
  marginTop: 0
},
  buttonDisabled: {
  opacity: 0.48
},
  buttonText: {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: 13
},
  buttonTextSecondary: {
  color: C.green
},
  buttonTextCompact: {
  fontSize: 12
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
  }) => [styles.button, secondary ? styles.buttonSecondary : styles.buttonPrimary, compact && styles.buttonCompact, (disabled || busy) && styles.buttonDisabled, pressed && !disabled && styles.pressed, style]}>
      {busy ? <ActivityIndicator color={secondary ? C.green : '#fff'} size="small" /> : <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary, compact && styles.buttonTextCompact]}>{title}</Text>}
    </Pressable>;
}

