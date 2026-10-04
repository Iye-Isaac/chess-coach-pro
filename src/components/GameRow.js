import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';
import { gameDate, opponentName, resultLabel } from '../services/chessCom';


const styles = { ...sharedStyles, ...StyleSheet.create({
  gameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.sm,
  minHeight: M.n65,
  paddingHorizontal: S.sm,
  backgroundColor: C.paper,
  borderBottomWidth: M.n1,
  borderBottomColor: C.line
}
}) };

export function GameRow({
  game,
  username,
  onPress
}) {
  const won = resultLabel(game, username) === 'Win';
  const drawn = resultLabel(game, username) === 'Draw';
  return <Pressable accessibilityRole="button" accessibilityLabel={`Review game against ${opponentName(game, username)}`} onPress={onPress} style={({
    pressed
  }) => [styles.gameRow, pressed && styles.pressed]}>
    <View style={[styles.resultDot, {
      backgroundColor: won ? C.success : drawn ? C.warning : C.danger
    }]} />
    <View style={{
      flex: 1
    }}>
      <Text style={styles.rowTitle}>vs. {opponentName(game, username)}</Text>
      <Text style={styles.rowSub}>{gameDate(game.end_time)}  ·  {game.time_class || 'chess'}  ·  {game.white?.rating || '—'}–{game.black?.rating || '—'}</Text>
    </View>
    <Text style={[styles.resultText, {
      color: won ? C.success : drawn ? C.warning : C.muted
    }]}>{resultLabel(game, username)}</Text>
    <Text style={styles.rowChevron}>›</Text>
  </Pressable>;
}

