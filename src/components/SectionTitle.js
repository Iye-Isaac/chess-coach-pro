import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles } from '../theme';


const styles = { ...sharedStyles, ...StyleSheet.create({

}) };

export function SectionTitle({
  eyebrow,
  title,
  detail,
  action
}) {
  return <View style={styles.sectionHead}>
    <View style={{
      flex: 1
    }}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!detail && <Text style={styles.bodyMuted}>{detail}</Text>}
    </View>
    {action}
  </View>;
}

