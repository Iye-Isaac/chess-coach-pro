import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './OnboardingScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Button } from '../components';

export function OnboardingScreen({
  onFinish
}) {
  const [goal, setGoal] = useState('Improve tactics');
  const [level, setLevel] = useState('I know the rules');
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={[styles.hero, {
      marginTop: 20
    }]}><Badge tone="amber">YOUR PERSONAL CHESS COACH</Badge>
        <Text style={styles.heroTitle}>Think clearly.{`\n`}Play confidently.</Text>
        <Text style={styles.heroSub}>Build a practice routine around the chess you actually play.</Text></View>
    <View style={styles.pageIntro}><Text style={styles.pageTitle}>Let’s make this yours.</Text>
        <Text style={styles.pageSubtitle}>Pick a starting point. You can change it any time, and you can skip account setup.</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>WHAT WOULD YOU LIKE TO WORK ON?</Text>
      {['Improve tactics', 'Understand my games', 'Learn openings'].map(item => <Pressable key={item} onPress={() => setGoal(item)} style={[styles.setupChoice, goal === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Text style={[styles.eyebrow, {
        marginTop: 18
      }]}>YOUR CHESS EXPERIENCE</Text>
      {['I know the rules', 'I play casually', 'I play regularly'].map(item => <Pressable key={item} onPress={() => setLevel(item)} style={[styles.setupChoice, level === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Button title="Build my starting plan  →" onPress={() => onFinish({
        goal,
        level
      })} />
      <Text style={styles.privacyNote}>No account or Chess.com connection required.</Text>
    </View>
  </ScrollView>;
}
