import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './LearningScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Button, SectionTitle } from '../components';

export function LearningScreen({
  onTab,
  profile
}) {
  const steps = [{
    n: '01',
    title: 'Warm up with a tactic',
    note: 'Train forcing moves and calculation.',
    tab: 'train'
  }, {
    n: '02',
    title: 'Play a focused game',
    note: 'Apply one idea against the coach.',
    tab: 'play'
  }, {
    n: '03',
    title: 'Review one game',
    note: 'Turn a mistake into a specific lesson.',
    tab: 'review'
  }, {
    n: '04',
    title: 'Study a useful idea',
    note: 'Build a foundation in openings and endings.',
    tab: 'library'
  }];
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">A PLAN YOU CAN KEEP</Badge>
        <Text style={styles.pageTitle}>Your learning path</Text>
        <Text style={styles.pageSubtitle}>A short repeatable loop, shaped around: {profile.goal || 'steady improvement'}.</Text></View>
    <View style={styles.insightCard}><Text style={styles.eyebrowLight}>THIS WEEK</Text>
        <Text style={styles.insightTitle}>Four small steps.{`\n`}One stronger habit.</Text>
        <Text style={styles.insightCopy}>Start anywhere and return when you are ready.</Text>
        <Text style={styles.insightMark}>♘</Text></View>
    {steps.map(step => <Pressable key={step.n} onPress={() => onTab(step.tab)} style={styles.pathCard}><View style={styles.pathNumber}><Text style={styles.pathNumberText}>{step.n}</Text></View>
        <View style={{
        flex: 1
      }}><Text style={styles.rowTitle}>{step.title}</Text>
        <Text style={styles.rowSub}>{step.note}</Text></View>
        <Text style={styles.rowChevron}>›</Text></Pressable>)}
  </ScrollView>;
}
