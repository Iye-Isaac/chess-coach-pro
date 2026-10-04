import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './ReviewScreen.styles';
import { C, PIECE_NAMES, S, R, F, W, T, M } from '../theme';
import { Badge, SectionTitle, GameRow, Empty } from '../components';
import { gameDate } from '../services/chessCom';

export function ReviewScreen({
  username,
  games,
  onOpenReview,
  syncing,
  onRefresh,
  backendReady
}) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Game review</Text>
        <Text style={styles.pageSubtitle}>Find the moments that shaped your game and turn them into your next lesson.</Text></View>
    {games.length > 0 && <View style={styles.reviewSummary}><Text style={styles.reviewSummaryValue}>{games.length}</Text>
        <View><Text style={styles.reviewSummaryTitle}>recent games found</Text>
        <Text style={styles.reviewSummarySub}>Choose a game to open its review.</Text></View></View>}
    <SectionTitle eyebrow="Last 30 days" title="Choose a game" action={username ? <Pressable accessibilityRole="button" accessibilityLabel="Refresh games" style={styles.backButton} onPress={() => onRefresh(username)} disabled={syncing}><Text style={styles.linkText}>{syncing ? 'Syncing…' : '↻ Refresh'}</Text></Pressable> : null} />
    {games.length ? games.map(game => <GameRow key={game.url || String(game.end_time)} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.card}><Empty title="Your reviews start here" detail="Connect a Chess.com account on Home to import games from the last 30 days." /></View>}
    <View style={[styles.noticeCard, {
      marginTop: S.lg
    }]}><Text style={styles.noticeIcon}>{backendReady ? '✦' : '⌁'}</Text>
        <View style={{
        flex: 1
      }}><Text style={styles.noticeTitle}>{backendReady ? 'AI review service connected' : 'AI review setup needed'}</Text>
        <Text style={styles.noticeCopy}>{backendReady ? 'Open a game to request a phase-by-phase coach review.' : 'Connect a Supabase project to turn on private AI game reviews. Stockfish stays on-device.'}</Text></View></View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
