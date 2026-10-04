import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './OnboardingScreen.styles';
import { C } from '../theme';
import { Badge, Button } from '../components';
import { DiagnosticStep } from '../onboarding/DiagnosticStep';
import { initialPuzzleRating, themeLabel } from '../puzzles/catalog';

const GOALS = ['Improve tactics', 'Understand my games', 'Learn openings', 'Learn from scratch'];
const LEVELS = ['I know the rules', 'I play casually', 'I play regularly'];

export function OnboardingScreen({ onFinish, profile = {}, initialStep = 'welcome', onCancel }) {
  const [step, setStep] = useState(initialStep);
  const [goal, setGoal] = useState(profile.goal || 'Improve tactics');
  const [level, setLevel] = useState(profile.level || 'I know the rules');
  const [diagnostic, setDiagnostic] = useState(null);
  const startRating = profile.diagnosticDone && initialStep === 'diagnostic' ? (profile.puzzleRating || initialPuzzleRating(level)) : initialPuzzleRating(level);
  const answers = diagnostic?.answers || [];
  const themeSummary = useMemo(() => {
    const counts = {};
    answers.forEach(({ correct, themes = [] }) => themes.forEach((theme) => {
      counts[theme] ||= { correct: 0, missed: 0 };
      counts[theme][correct ? 'correct' : 'missed'] += 1;
    }));
    const weak = Object.entries(counts).sort((a, b) => b[1].missed - a[1].missed || a[1].correct - b[1].correct).map(([theme]) => theme);
    const strong = Object.entries(counts).filter(([, v]) => v.correct).sort((a, b) => b[1].correct - a[1].correct).map(([theme]) => theme);
    return { counts, weak: weak[0] || 'fork', weakList: weak, strong };
  }, [answers]);
  const estimate = diagnostic?.estimatedRating || startRating;
  const coachStrength = Math.max(400, estimate - 100);
  const profileResult = () => ({
    ...profile, goal, level, puzzleRating: estimate, startingRating: coachStrength,
    weakThemes: themeSummary.weakList, diagnosticDone: true,
  });
  const finish = (intent) => onFinish(profileResult(), intent);
  const choiceStyle = (active) => ({ padding: 14, borderWidth: 1, borderColor: active ? C.green : C.line, borderRadius: 12, backgroundColor: active ? C.greenSoft : C.paper, marginTop: 8 });
  const title = step === 'welcome' ? 'Think clearly.\nPlay confidently.' : step === 'goal' ? 'What would you like to work on?' : step === 'experience' ? 'How much chess have you played?' : step === 'diagnostic' ? 'Quick skill check' : 'Your starting point';
  const skipTo = { welcome: 'goal', goal: 'experience', experience: 'diagnostic' };
  return <ScrollView contentContainerStyle={styles.page}>
    {onCancel && <Pressable accessibilityRole="button" accessibilityLabel="Close skill check" onPress={onCancel} style={{ alignSelf: 'flex-end', padding: 8 }}><Text style={{ color: C.muted }}>Close</Text></Pressable>}
    <View style={[styles.hero, { marginTop: 20 }]}><Badge tone="amber">YOUR PERSONAL CHESS COACH</Badge>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSub}>{step === 'diagnostic' ? 'Five positions help us choose a useful starting level. No pressure.' : step === 'result' ? 'A simple plan based on your experience and skill check.' : 'Build a practice routine around the chess you actually play.'}</Text>
    </View>
    {step === 'welcome' && <View style={styles.card}><Text style={styles.pageSubtitle}>Practice offline, at your own pace. No account is needed.</Text><Button title="Get started  →" onPress={() => setStep('goal')} /><Button title="Skip setup" secondary onPress={() => setStep('goal')} /></View>}
    {step === 'goal' && <View style={styles.card}><Text style={styles.eyebrow}>YOUR GOAL</Text>{GOALS.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: goal === item }} key={item} onPress={() => setGoal(item)} style={choiceStyle(goal === item)}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}<Button title="Continue" onPress={() => setStep('experience')} /><Button title="Skip this step" secondary onPress={() => setStep('experience')} /></View>}
    {step === 'experience' && <View style={styles.card}><Text style={styles.eyebrow}>YOUR CHESS EXPERIENCE</Text>{LEVELS.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: level === item }} key={item} onPress={() => setLevel(item)} style={choiceStyle(level === item)}><Text style={styles.rowTitle}>{item}</Text><Text style={styles.bodyMuted}>Starting puzzle level: {initialPuzzleRating(item)}</Text></Pressable>)}<Button title="Start skill check  →" onPress={() => setStep('diagnostic')} /><Button title="Skip this step" secondary onPress={() => setStep('diagnostic')} /></View>}
    {step === 'diagnostic' && <View style={styles.card}><DiagnosticStep key={`${level}-${initialStep}`} startingRating={startRating} onComplete={(result) => { setDiagnostic(result); setStep('result'); }} onSkip={(result) => { setDiagnostic(result); setStep('result'); }} /></View>}
    {step === 'result' && <View style={styles.card}>
      <Text style={styles.eyebrow}>ESTIMATED PUZZLE RATING</Text><Text style={{ color: C.green, fontSize: 34, fontWeight: '800' }}>{estimate}</Text>
      <Text style={styles.bodyMuted}>{answers.filter((a) => a.correct).length} solved · {answers.filter((a) => !a.correct).length} missed</Text>
      <Text style={[styles.eyebrow, { marginTop: 16 }]}>SKILL THEMES</Text>
      <Text style={styles.bodyMuted}>Strengths: {themeSummary.strong.length ? themeSummary.strong.slice(0, 3).map(themeLabel).join(', ') : 'Keep practicing to discover your strengths.'}</Text>
      <Text style={styles.bodyMuted}>Practice first: {themeLabel(themeSummary.weak)}</Text>
      <Text style={[styles.eyebrow, { marginTop: 16 }]}>YOUR STARTING PLAN</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Start ${estimate < 900 ? 'Foundations' : 'Tactics'} lessons`} onPress={() => finish({ kind: 'track', track: estimate < 900 ? 'foundations' : 'tactics' })} style={choiceStyle(false)}><Text style={styles.rowTitle}>1. Start {estimate < 900 ? 'Foundations' : 'Tactics'}</Text><Text style={styles.bodyMuted}>A first learning track picked for your level.</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Practice ${themeLabel(themeSummary.weak)} puzzles`} onPress={() => finish({ kind: 'theme', theme: themeSummary.weak })} style={choiceStyle(false)}><Text style={styles.rowTitle}>2. Practice {themeLabel(themeSummary.weak)}</Text><Text style={styles.bodyMuted}>Your best theme to work on first.</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Play coach at ${coachStrength} strength`} onPress={() => finish({ kind: 'coach' })} style={choiceStyle(false)}><Text style={styles.rowTitle}>3. Play the coach · {coachStrength}</Text><Text style={styles.bodyMuted}>Recommended bot strength based on your estimate.</Text></Pressable>
      <Button title="Start my plan  →" onPress={() => finish(null)} />
      {onCancel && <Button title="Back to Today" secondary onPress={() => finish(null)} />}
    </View>}
    {skipTo[step] && <Pressable accessibilityRole="button" accessibilityLabel="Skip this onboarding step" onPress={() => setStep(skipTo[step])} style={{ alignSelf: 'center', padding: 12 }}><Text style={{ color: C.muted, textDecorationLine: 'underline' }}>Skip this step</Text></Pressable>}
  </ScrollView>;
}
