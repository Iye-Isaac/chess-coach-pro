import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import styles from './GameReviewScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Button, Empty } from '../components';
import { isCoachBackendConfigured, requestGameAnalysis } from '../services/coachApi';
import { gameDate, opponentName } from '../services/chessCom';

export function GameReviewScreen({
  game,
  username,
  onBack
}) {
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const backendReady = isCoachBackendConfigured();
  const load = useCallback(async () => {
    if (!game || !backendReady) return;
    setBusy(true);
    setError('');
    try {
      setReview(await requestGameAnalysis({
        game,
        username
      }));
    } catch (err) {
      setError(err.message || 'The review is not available yet.');
    } finally {
      setBusy(false);
    }
  }, [game, username, backendReady]);
  useEffect(() => {
    load();
  }, [load]);
  const phases = review ? [['Opening', review.opening_score, review.opening_review, review.opening_lessons], ['Middlegame', review.middlegame_score, review.middlegame_review, review.middlegame_lessons], ['Endgame', review.endgame_score, review.endgame_review, review.endgame_lessons]] : [];
  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  All games</Text></Pressable>
    <View style={styles.pageIntro}><Badge tone="amber">GAME REVIEW</Badge>
        <Text style={styles.pageTitle}>A game is a lesson.</Text>
        <Text style={styles.pageSubtitle}>vs. {opponentName(game, username)}  ·  {gameDate(game.end_time)}  ·  {game.time_class || 'chess'}</Text></View>
    {review ? <>
      <View style={styles.scoreHero}><Text style={styles.eyebrowLight}>OVERALL GAME SCORE</Text>
        <View style={styles.scoreLine}><Text style={styles.scoreBig}>{review.overall_score ?? '—'}</Text>
        <Text style={styles.scoreOutOf}>/ 10</Text>
        <Text style={styles.scoreBrand}>AI COACH NOTES</Text></View>
        <Text style={styles.scoreSummary}>{review.overall_summary || 'Your full game review is ready.'}</Text>
        <Text style={[styles.eyebrowLight, {
          marginTop: 8
        }]}>WRITTEN FEEDBACK · NOT A STOCKFISH EVALUATION</Text></View>
      {phases.map(([title, score, body, lessons]) => <View key={title} style={styles.phaseCard}><View style={styles.phaseHead}><Text style={styles.phaseTitle}>{title}</Text>
        <Text style={styles.phaseScore}>{score ?? '—'}<Text style={styles.phaseOutOf}> / 10</Text></Text></View>
        <Text style={styles.phaseBody}>{body || 'No phase notes were returned.'}</Text>{Array.isArray(lessons) && lessons.map((lesson, index) => <Text key={index} style={styles.lesson}>•  {lesson}</Text>)}</View>)}
    </> : <View style={styles.card}>
      {busy ? <View style={styles.loadingCard}><ActivityIndicator color={C.green} />
        <Text style={styles.cardTitle}>Your coach is reviewing the game…</Text>
        <Text style={styles.cardCopy}>Looking at the turning points and lessons across all three phases.</Text></View> : <>
        <Empty mark={backendReady ? '✦' : '⌁'} title={backendReady ? 'Ready for your review' : 'AI reviews need setup'} detail={error || 'The game is imported. Connect the secure Supabase coach service to get written feedback. Local Stockfish analysis is separate.'} />
        {backendReady && <Button title="Review this game" onPress={load} />}
      </>}
    </View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
