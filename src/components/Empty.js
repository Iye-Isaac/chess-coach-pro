import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles, S, R, F, W, T, M } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  empty: {
  alignItems: 'flex-start',
  paddingVertical: S.lg,
  paddingHorizontal: S.sm
},
  emptyMark: {
  width: M.n46,
  height: M.n46,
  borderRadius: R.card,
  backgroundColor: C.amberSoft,
  alignItems: 'flex-start',
  justifyContent: 'center',
  marginBottom: S.md
},
  emptyMarkText: {
  color: C.muted,
  fontSize: F.section
},
  emptyTitle: {
  color: C.ink,
  fontWeight: W.semibold,
  fontSize: F.secondary,
  textAlign: 'left'
},
  emptyDetail: {
  color: C.muted,
  fontSize: F.secondary,
  lineHeight: T.body,
  textAlign: 'left',
  marginTop: S.xs
}
}) };

export function Empty({
  mark = '♟',
  title,
  detail
}) {
  return <View style={styles.empty}>

    <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDetail}>{detail}</Text>
  </View>;
}
