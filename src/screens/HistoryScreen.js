import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './HistoryScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Empty } from '../components';
import { gameDate, opponentName, resultLabel } from '../services/chessCom';

export function HistoryScreen({
  games,
  username,
  localGames,
  onOpenReview,
  onTab
}) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">YOUR RECENT PLAY</Badge>
        <Text style={styles.pageTitle}>Game history</Text>
        <Text style={styles.pageSubtitle}>Return to imported games or review a local game you finished on this device.</Text></View>
    <SectionTitle eyebrow="PLAYED ON THIS DEVICE" title="Coach & pass-and-play" />
    {localGames.length ? localGames.map(game => <Pressable key={game.id} onPress={() => onOpenReview(game)} style={styles.historyCard}><View style={styles.resultDot} />
        <View style={{
        flex: 1
      }}><Text style={styles.rowTitle}>{game.opponentName || 'Local game'}</Text>
        <Text style={styles.rowSub}>{new Date(game.date).toLocaleDateString()} · {game.mode === 'coach' ? 'Stockfish Coach' : 'Pass & play'}</Text></View>
        <Badge tone="neutral">{game.resultLabel || 'Review'}</Badge>
        <Text style={styles.rowChevron}>›</Text></Pressable>) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Completed local games will appear here.</Text></View>}
    <SectionTitle eyebrow="CHESS.COM" title="Imported games" action={games.length > 0 ? <Text style={styles.linkText}>{games.length} recent</Text> : null} />
    {games.length ? games.map(game => <GameRow key={game.url || String(game.end_time)} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Connect a public Chess.com profile to see past games.</Text></View>}
    <Button title="Play a game" onPress={() => onTab('play')} secondary />
        <View style={styles.bottomSpace} />
  </ScrollView>;
}
