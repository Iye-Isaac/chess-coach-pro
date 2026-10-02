import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  badge: {
  backgroundColor: C.greenSoft,
  borderRadius: 99,
  paddingHorizontal: 9,
  paddingVertical: 5,
  alignSelf: 'flex-start'
},
  badgeAmber: {
  backgroundColor: '#f3e7d0'
},
  badgeNeutral: {
  backgroundColor: C.soft
},
  badgeText: {
  color: C.green,
  fontSize: 9,
  fontWeight: '800',
  letterSpacing: 0.9
},
  badgeTextAmber: {
  color: '#87601e'
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

