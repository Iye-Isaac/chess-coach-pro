import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({
  empty: {
  alignItems: 'center',
  paddingVertical: 20,
  paddingHorizontal: 9
},
  emptyMark: {
  width: 46,
  height: 46,
  borderRadius: 16,
  backgroundColor: C.amberSoft,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 11
},
  emptyMarkText: {
  color: '#94651b',
  fontSize: 23
},
  emptyTitle: {
  color: C.ink,
  fontWeight: '700',
  fontSize: 14,
  textAlign: 'center'
},
  emptyDetail: {
  color: C.muted,
  fontSize: 11,
  lineHeight: 16,
  textAlign: 'center',
  marginTop: 5
}
}) };

export function Empty({
  mark = '♟',
  title,
  detail
}) {
  return <View style={styles.empty}>
    <View style={styles.emptyMark}><Text style={styles.emptyMarkText}>{mark}</Text></View>
    <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDetail}>{detail}</Text>
  </View>;
}

