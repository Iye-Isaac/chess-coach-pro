import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, sharedStyles } from '../theme';
import { gameDate, opponentName, resultLabel } from '../services/chessCom';


const styles = { ...sharedStyles, ...StyleSheet.create({
  gameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  minHeight: 65,
  paddingHorizontal: 10,
  backgroundColor: C.paper,
  borderBottomWidth: 1,
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
  return <Pressable onPress={onPress} style={({
    pressed
  }) => [styles.gameRow, pressed && styles.pressed]}>
    <View style={[styles.resultDot, {
      backgroundColor: won ? '#6c9561' : drawn ? '#b29a66' : '#b87469'
    }]} />
    <View style={{
      flex: 1
    }}>
      <Text style={styles.rowTitle}>vs. {opponentName(game, username)}</Text>
      <Text style={styles.rowSub}>{gameDate(game.end_time)}  ·  {game.time_class || 'chess'}  ·  {game.white?.rating || '—'}–{game.black?.rating || '—'}</Text>
    </View>
    <Text style={[styles.resultText, {
      color: won ? '#557e4d' : drawn ? '#947735' : C.muted
    }]}>{resultLabel(game, username)}</Text>
    <Text style={styles.rowChevron}>›</Text>
  </Pressable>;
}

