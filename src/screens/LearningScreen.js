import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import styles from './LearningScreen.styles';
import { Badge, Button } from '../components';
import lessonsData from '../data/lessons.json';
import { getJSON, STORAGE_KEYS } from '../storage/keys';

const TRACKS = [
  { id: 'foundations', label: 'Foundations', mark: '♙' },
  { id: 'tactics', label: 'Tactics', mark: '♘' },
  { id: 'endgames', label: 'Endgames', mark: '♖' },
  { id: 'openings', label: 'Openings', mark: '♗' },
];

export function LearningScreen({ onTab, profile, onOpenLesson, initialTrack }) {
  const [track, setTrack] = useState(initialTrack || 'foundations');
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const lessons = useMemo(() => lessonsData.lessons
    .filter((lesson) => lesson.track === track)
    .sort((a, b) => a.order - b.order), [track]);
  const completed = lessons.filter((lesson) => progress[lesson.id]?.completedAt).length;

  useEffect(() => {
    let active = true;
    getJSON(STORAGE_KEYS.lessons, {}).then((saved) => {
      if (active) setProgress(saved && typeof saved === 'object' ? saved : {});
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const openLesson = (lesson, index) => {
    if (index > 0 && !progress[lessons[index - 1].id]?.completedAt) {
      Alert.alert('Lesson locked', `Complete “${lessons[index - 1].title}” to unlock this lesson.`);
      return;
    }
    onOpenLesson(lesson.id);
  };

  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}>
      <Badge tone="amber">{lessonsData.reviewReady ? 'LEARN AT YOUR PACE' : 'DRAFT LESSONS · PROOFREADING'}</Badge>
      <Text style={styles.pageTitle}>Your learning path</Text>
      <Text style={styles.pageSubtitle}>Short, interactive lessons for {profile?.goal || 'steady improvement'}.</Text>
    </View>

    <View style={styles.trackRail}>
      {TRACKS.map((item) => <Pressable
        key={item.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: track === item.id }}
        accessibilityLabel={`${item.label} lessons`}
        onPress={() => setTrack(item.id)}
        style={[styles.trackTab, track === item.id && styles.trackTabActive]}
      >
        <Text style={[styles.trackTabText, track === item.id && styles.trackTabTextActive]}>{item.label}</Text>
      </Pressable>)}
    </View>

    <View style={styles.progressCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>Track progress</Text>
        <Text style={styles.progressTitle}>{completed} / {lessons.length || '—'} lessons</Text>
      </View>
    </View>

    {loading ? <View style={styles.emptyCard}><Text style={styles.bodyMuted}>Loading your lessons…</Text></View>
      : lessons.length ? lessons.map((lesson, index) => {
        const record = progress[lesson.id];
        const isComplete = !!record?.completedAt;
        const locked = index > 0 && !progress[lessons[index - 1].id]?.completedAt;
        return <Pressable
          key={lesson.id}
          accessibilityRole="button"
          accessibilityLabel={`${locked ? 'Locked: ' : ''}${lesson.title}${isComplete ? `, ${record.bestStars || record.stars || 0} stars` : ''}`}
          onPress={() => openLesson(lesson, index)}
          style={({ pressed }) => [styles.lessonNode, locked && styles.lessonNodeLocked, pressed && styles.pressed]}
        >
          <View style={[styles.nodeMark, isComplete && styles.nodeMarkComplete, locked && styles.nodeMarkLocked]}>
            <Text style={[styles.nodeMarkText, isComplete && styles.nodeMarkTextComplete]}>{isComplete ? '✓' : locked ? '⌑' : String(lesson.order).padStart(2, '0')}</Text>
          </View>
          <View style={styles.nodeCopy}>
            <Text style={styles.nodeTitle}>{lesson.title}</Text>
            <Text style={styles.nodeSummary}>{lesson.summary}</Text>
            <Text style={styles.nodeMeta}>{lesson.minutes} min · {lesson.steps.length} steps{isComplete ? ` · ${'★'.repeat(record.bestStars || record.stars || 1)}` : ''}</Text>
          </View>
          <Text style={styles.rowChevron}>{locked ? '⌑' : '›'}</Text>
        </Pressable>;
      }) : <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>More {TRACKS.find((item) => item.id === track)?.label.toLowerCase()} lessons are on the way.</Text>
        <Text style={styles.bodyMuted}>The Foundations track is ready to explore now.</Text>
      </View>}

    <View style={styles.resourcesCard}>
      <View style={{ flex: 1 }}><Text style={styles.eyebrow}>Keep exploring</Text><Text style={styles.resourcesTitle}>More resources</Text><Text style={styles.bodyMuted}>Browse the guides and references in your library.</Text></View>
      <Button title="Open library" compact secondary onPress={() => onTab('library')} />
    </View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
