import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles, S, R, F, W, T, M } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  badge: {
  backgroundColor: C.bg,
  borderRadius: R.full,
  paddingHorizontal: S.sm,
  paddingVertical: S.xs,
  alignSelf: 'flex-start'
},
  badgeAmber: {
  backgroundColor: C.bg
},
  badgeNeutral: {
  backgroundColor: C.bg
},
  badgeText: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  letterSpacing: M.zero
},
  badgeTextAmber: {
  color: C.muted
},
  badgeTextNeutral: {
  color: C.muted
}
}) };

export function Badge({
  children,
  tone = 'green'
}) {
  return <View style={[styles.badge, tone === 'amber' ? styles.badgeAmber : tone === 'neutral' ? styles.badgeNeutral : null]}>
    <Text style={[styles.badgeText, tone === 'amber' ? styles.badgeTextAmber : tone === 'neutral' ? styles.badgeTextNeutral : null]}>{children}</Text>
  </View>;
}

