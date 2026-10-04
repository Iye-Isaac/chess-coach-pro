import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './ProgressScreen.styles';
import { C, PIECE_NAMES, S, R, F, W, T, M } from '../theme';
import { Badge, Button, SectionTitle, Empty } from '../components';
import { resultLabel, recentPlayerRating } from '../services/chessCom';

export function ProgressScreen({
  games,
  username,
  onTab
}) {
  const totals = games.reduce((acc, game) => {
    const result = resultLabel(game, username).toLowerCase();
    acc[result] = (acc[result] || 0) + 1;
    return acc;
  }, {});
  const rated = recentPlayerRating(games, username);
  const winRate = games.length ? Math.round((totals.win || 0) / games.length * 100) : 0;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Progress</Text>
        <Text style={styles.pageSubtitle}>A simple view of your recent play and practice.</Text></View>
    <View style={styles.statsPanel}><View style={styles.stat}><Text style={styles.statValue}>{rated || '—'}</Text>
        <Text style={styles.statLabel}>Recent rating</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>{games.length}</Text>
        <Text style={styles.statLabel}>Games · 30 days</Text></View></View>
    {games.length ? <><SectionTitle eyebrow="Recent results" title="What your games show" />
      <View style={styles.card}><View style={styles.progressRow}><Text style={styles.rowTitle}>Wins</Text>
        <Text style={styles.resultText}>{totals.win || 0}</Text></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, {
            width: `${winRate}%`
          }]} /></View>
        <Text style={styles.bodyMuted}>{winRate}% win rate in the imported games shown here.</Text>
        <View style={styles.progressRow}><Text style={styles.rowTitle}>Draws</Text>
        <Text style={styles.resultText}>{totals.draw || 0}</Text></View>
        <View style={styles.progressRow}><Text style={styles.rowTitle}>Losses</Text>
        <Text style={styles.resultText}>{totals.loss || 0}</Text></View></View>
      <View style={styles.focusCard}>
        <View style={{
          flex: 1
        }}><Text style={styles.focusTitle}>Next: review one turning point</Text>
        <Text style={styles.focusCopy}>Use game review to choose a lesson for your next practice session.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open game review" onPress={() => onTab('review')} style={styles.roundArrow}><Text style={styles.roundArrowText}>→</Text></Pressable></View>
    </> : <View style={styles.card}><Empty mark="◉" title="Your progress starts with a game" detail="Connect a public Chess.com profile on Home, or play locally and come back to your training plan." />
        <Button title="Connect Chess.com" onPress={() => onTab('home')} secondary /></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
