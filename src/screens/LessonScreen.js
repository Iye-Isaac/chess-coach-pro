import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import styles from './LessonScreen.styles';
import lessonsData from '../data/lessons.json';
import { Badge, Button, Empty, LessonPlayer } from '../components';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';
import { readToday, recordActivity } from '../activity/store';

export function LessonScreen({ lessonId, onBack, onNextLesson }) {
  const lesson = lessonsData.lessons.find((item) => item.id === lessonId);
  const [currentStep, setCurrentStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const nextLesson = useMemo(() => lesson && lessonsData.lessons
    .find((item) => item.track === lesson.track && item.order === lesson.order + 1), [lesson]);

  useEffect(() => {
    let active = true;
    getJSON(STORAGE_KEYS.lessons, {}).then((saved) => {
      const record = saved?.[lessonId];
      if (active) setCurrentStep(record?.completedAt ? 0 : Math.max(0, Math.min(lesson?.steps.length - 1 || 0, Number(record?.lastStep) || 0)));
      if (active) setProgressReady(true);
    });
    return () => { active = false; };
  }, [lessonId, lesson]);

  useEffect(() => {
    if (!lesson || !progressReady || completed) return;
    getJSON(STORAGE_KEYS.lessons, {}).then((saved) => {
      const prior = saved?.[lesson.id] || {};
      return setJSON(STORAGE_KEYS.lessons, {
        ...saved,
        [lesson.id]: { ...prior, lastStep: currentStep },
      });
    });
  }, [lesson, currentStep, progressReady, completed]);

  if (!lesson) return <View style={styles.page}><Empty mark="♘" title="Lesson not found" detail="This lesson may have moved in the catalog." /><Button title="Back to learning" onPress={onBack} /></View>;

  const finishLesson = async () => {
    await readToday();
    const saved = await getJSON(STORAGE_KEYS.lessons, {});
    const prior = saved?.[lesson.id] || {};
    const completedAt = Date.now();
    const next = {
      ...saved,
      [lesson.id]: {
        ...prior,
        completedAt,
        stars,
        bestStars: Math.max(Number(prior.bestStars || prior.stars) || 0, stars),
        lastStep: 0,
      },
    };
    await setJSON(STORAGE_KEYS.lessons, next);
    try { await recordActivity('lesson', lesson.id); }
    catch { Alert.alert('Practice log', 'Your lesson is complete, but today’s activity could not be saved.'); }
    setCompleted(true);
  };

  const advance = () => {
    if (currentStep + 1 === lesson.steps.length) finishLesson();
    else setCurrentStep((step) => step + 1);
  };

  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to learning path" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  Learning path</Text></Pressable>
    {!progressReady ? <View style={styles.loading}><Text style={styles.bodyMuted}>Resuming your lesson…</Text></View>
      : completed ? <View style={styles.completionCard}>
        <Badge tone="amber">LESSON COMPLETE</Badge>
        <Text style={styles.completionTitle}>A strong step forward.</Text>
        <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
        <Text style={styles.completionCopy}>{stars === 3 ? 'No wrong turns this time.' : `${mistakes} ${mistakes === 1 ? 'wrong turn' : 'wrong turns'} helped make the idea stick.`} You can revisit this lesson whenever you like.</Text>
        <Button title={nextLesson ? 'Next lesson' : 'Back to learning path'} onPress={() => nextLesson ? onNextLesson(nextLesson.id) : onBack()} />
        <Button title="Review this lesson" secondary onPress={() => { setCurrentStep(0); setMistakes(0); setCompleted(false); }} />
      </View> : <>
        <View style={styles.lessonIntro}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonSummary}>{lesson.summary}</Text><Text style={styles.lessonMeta}>{lesson.minutes} MIN · {lesson.track.toUpperCase()}</Text></View>
        <LessonPlayer
          key={`${lesson.id}-${currentStep}`}
          lesson={lesson}
          stepIndex={currentStep}
          totalSteps={lesson.steps.length}
          isLastStep={currentStep === lesson.steps.length - 1}
          onNext={advance}
          onMistake={() => setMistakes((count) => count + 1)}
        />
      </>}
  </ScrollView>;
}
