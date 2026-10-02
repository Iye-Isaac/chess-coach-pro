import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './ReviewScreen.styles';
import { C, PIECE_NAMES } from '../theme';
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
    <View style={styles.pageIntro}><Badge tone="amber">REFLECT & IMPROVE</Badge>
        <Text style={styles.pageTitle}>Game review</Text>
        <Text style={styles.pageSubtitle}>Find the moments that shaped your game and turn them into your next lesson.</Text></View>
    <View style={styles.insightCard}><Text style={styles.eyebrowLight}>YOUR COACH</Text>
        <Text style={styles.insightTitle}>See the game{`\n`}behind the result.</Text>
        <Text style={styles.insightCopy}>Opening, middlegame, endgame: each phase has something to teach you.</Text>
        <Text style={styles.insightMark}>♛</Text></View>
    {games.length > 0 && <View style={styles.reviewSummary}><Text style={styles.reviewSummaryValue}>{games.length}</Text>
        <View><Text style={styles.reviewSummaryTitle}>recent games found</Text>
        <Text style={styles.reviewSummarySub}>Choose a game to open its review.</Text></View></View>}
    <SectionTitle eyebrow="LAST 30 DAYS" title="Choose a game" action={username ? <Pressable onPress={() => onRefresh(username)} disabled={syncing}><Text style={styles.linkText}>{syncing ? 'Syncing…' : '↻ Refresh'}</Text></Pressable> : null} />
    {games.length ? games.map(game => <GameRow key={game.url || String(game.end_time)} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.card}><Empty title="Your reviews start here" detail="Connect a Chess.com account on Home to import games from the last 30 days." /></View>}
    <View style={[styles.noticeCard, {
      marginTop: 18
    }]}><Text style={styles.noticeIcon}>{backendReady ? '✦' : '⌁'}</Text>
        <View style={{
        flex: 1
      }}><Text style={styles.noticeTitle}>{backendReady ? 'AI review service connected' : 'AI review setup needed'}</Text>
        <Text style={styles.noticeCopy}>{backendReady ? 'Open a game to request a phase-by-phase coach review.' : 'Connect a Supabase project to turn on private AI game reviews. Stockfish stays on-device.'}</Text></View></View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
