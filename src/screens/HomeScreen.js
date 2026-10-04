import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import styles from './HomeScreen.styles';
import { C, S, R, F, W, T, M } from '../theme';
import { Badge, Button } from '../components';
import { themeLabel } from '../puzzles/catalog';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';
import { useToday } from '../activity/useToday';
import { ChessComCard } from '../components/ChessComCard';

function ProgressRing({ completed, total }) {
  const circumference = 2 * Math.PI * 30;
  return <View style={styles.ring} accessibilityLabel={`${completed} of ${total} daily tasks complete`}>
    <Svg width={76} height={76}>
      <Circle cx={38} cy={38} r={30} stroke={C.line} strokeWidth={7} fill="none" />
      <Circle cx={38} cy={38} r={30} stroke={C.green} strokeWidth={7} fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - completed / Math.max(1, total))}
        strokeLinecap="round" rotation={-90} origin="38, 38" />
    </Svg>
    <Text style={styles.ringValue}>{completed}/{total}</Text>
  </View>;
}

export function HomeScreen({ username, games, onConnect, onRefresh, syncing, syncError, onOpenReview, onTab, profile, onStartSkillCheck, onPractice }) {
  const { snapshot, error, refresh } = useToday();
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    let active = true;
    getJSON(STORAGE_KEYS.skillCheckPromptDismissed, false).then((value) => { if (active) setDismissed(value); });
    return () => { active = false; };
  }, []);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const plan = snapshot?.plan;
  const reviewed = new Set((snapshot?.events || []).filter((event) => event.type === 'mistake').map((event) => event.id));
  const puzzlesDone = (snapshot?.events || []).filter((event) => event.type === 'puzzle' && event.theme === plan?.theme).length;
  const rows = plan ? [
    ...(plan.lessonId ? [{ id: 'lesson', title: plan.lessonTitle, detail: 'Your next lesson', target: { kind: 'lesson', lessonId: plan.lessonId } }] : []),
    { id: 'puzzles', title: `5 ${themeLabel(plan.theme)} puzzles`, detail: `${Math.min(5, puzzlesDone)} / 5 practiced`, target: { kind: 'theme', theme: plan.theme } },
    ...(plan.mistakeIds.length ? [{ id: 'mistakes', title: `Review ${plan.mistakeIds.length} saved ${plan.mistakeIds.length === 1 ? 'mistake' : 'mistakes'}`, detail: `${plan.mistakeIds.filter((id) => reviewed.has(id)).length} / ${plan.mistakeIds.length} reviewed`, target: { kind: 'mistakes', ids: plan.mistakeIds } }] : []),
    { id: 'coach', title: 'One game against the coach', detail: 'Optional · bonus', target: { kind: 'coach' } },
  ] : [];
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.greetingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>{greeting}{username ? `, ${username}` : ''}</Text>
        <Text style={styles.pageTitle}>Today</Text>
        <Text style={styles.bodyMuted}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>
      <View style={styles.streak} accessibilityLabel={`Current streak ${snapshot?.streak.current || 0} days`}>
        <Text style={styles.streakValue}>{snapshot?.streak.current || 0}</Text>
        <Text style={styles.streakLabel}>Day streak</Text>
      </View>
    </View>
    {snapshot && <View style={styles.weekRow}>
      {snapshot.week.map((day) => <View key={day.date} style={styles.weekDay} accessibilityLabel={`${day.date}: ${day.active ? 'practice complete' : 'no completed practice'}`}>
        <Text style={[styles.weekLabel, day.today && { color: C.ink, fontWeight: W.semibold }]}>{day.label}</Text>
        <View style={[styles.weekDot, day.active && styles.weekDotFilled, day.today && styles.weekDotToday]} />
      </View>)}
      <Text style={styles.longest}>Best{`\n`}{snapshot.streak.longest} days</Text>
    </View>}
    <View style={styles.card}>
      <View style={styles.planHeading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{snapshot?.progress.complete ? 'A good day of chess.' : 'One thoughtful step at a time.'}</Text>
          <Text style={styles.cardCopy}>{snapshot?.progress.complete ? 'Today’s practice is complete. Come back tomorrow for your next plan.' : 'Your practice is ready. Everything here works offline.'}</Text>
        </View>
        {snapshot && <ProgressRing {...snapshot.progress} />}
      </View>
      {!snapshot && !error && <ActivityIndicator color={C.green} accessibilityLabel="Loading today’s plan" />}
      {!!error && <><Text style={styles.errorText}>{error}</Text><Button title="Try again" onPress={refresh} secondary /></>}
      {rows.map((row) => {
        const done = plan.completed.includes(row.id);
        const next = row.id !== 'coach' && row === rows.find((item) => item.id !== 'coach' && !plan.completed.includes(item.id));
        return <Pressable key={row.id} accessibilityRole="button" accessibilityLabel={`${row.title}, ${done ? 'complete' : row.detail}`}
          onPress={() => onPractice(row.target)} style={({ pressed }) => [styles.planRow, next && { backgroundColor: C.green, borderRadius: R.small, padding: S.lg }, pressed && styles.pressed]}>
          <View style={[styles.check, done && styles.checkDone]}><Text style={done ? styles.checkDoneText : styles.checkText}>{done ? '✓' : row.id === 'coach' ? '+' : '○'}</Text></View>
          <View style={{ flex: 1 }}><Text style={[styles.rowTitle, next && { color: C.white }]}>{row.title}</Text><Text style={[styles.rowDetail, next && { color: C.white }]}>{done ? 'Done today' : row.detail}</Text></View>
          <Text style={[styles.arrow, next && { color: C.white }]}>›</Text>
        </Pressable>;
      })}
    </View>
    {(snapshot?.resumeLesson || snapshot?.pendingAnalysis) && <View style={styles.card}>
      <Text style={styles.cardTitle}>Pick up where you left off</Text>
      {snapshot.resumeLesson && <Button title={`Resume ${snapshot.resumeLesson.title}`} secondary onPress={() => onPractice({ kind: 'lesson', lessonId: snapshot.resumeLesson.id })} />}
      {snapshot.pendingAnalysis?.game && <Button title="Continue game analysis" secondary onPress={() => onOpenReview(snapshot.pendingAnalysis.game)} />}
    </View>}
    {snapshot && <View style={styles.spotlight}>

      <Text style={styles.cardTitle}>{themeLabel(snapshot.weakestTheme)}</Text>
      <Text style={styles.cardCopy}>A useful idea to practice, based on your missed puzzles and skill check.</Text>
      <Button title="Practice it  →" secondary onPress={() => onPractice({ kind: 'theme', theme: snapshot.weakestTheme })} />
    </View>}
    {profile && !profile.diagnosticDone && !dismissed && <View style={styles.card}>
      <Text style={styles.cardTitle}>Take the 2-minute skill check</Text>
      <Text style={styles.cardCopy}>Five quick puzzles help choose your starting point.</Text>
      <Button title="Start skill check  →" onPress={onStartSkillCheck} />
      <Button title="Maybe later" secondary onPress={() => { setDismissed(true); setJSON(STORAGE_KEYS.skillCheckPromptDismissed, true); }} />
    </View>}
    <View style={styles.quickGrid}>
      {[['learning', 'Learning path'], ['history', 'Game history'], ['progress', 'Progress'], ['profile', 'Profile & reminders']].map(([tab, title]) => (
        <Pressable key={tab} accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={() => onTab(tab)} style={styles.quickCard}><Text style={styles.quickTitle}>{title}  ›</Text></Pressable>
      ))}
    </View>
    <ChessComCard username={username} games={games} onConnect={onConnect} onRefresh={onRefresh} syncing={syncing} syncError={syncError} />
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
