import React, { useEffect, useState } from 'react';
import styles from './src/App.styles';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from './src/theme';
import { STORAGE_KEYS } from './src/storage/keys';
import { Badge } from './src/components';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { GameReviewScreen } from './src/screens/GameReviewScreen';
import { TrainScreen } from './src/screens/TrainScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { LearningScreen } from './src/screens/LearningScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { fetchRecentGames, recentPlayerRating } from './src/services/chessCom';
import { isCoachBackendConfigured } from './src/services/coachApi';
import { ReminderObserver } from './src/reminders/ReminderObserver';
const TABS = [
  { id: 'home', mark: '⌂', label: 'Today' },
  { id: 'review', mark: '◉', label: 'Review' },
  { id: 'train', mark: '♟', label: 'Train' },
  { id: 'play', mark: '♜', label: 'Play' },
];



function App() {
  const [tab, setTab] = useState('home');
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [localGames, setLocalGames] = useState([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [profile, setProfile] = useState({
    goal: 'Improve tactics',
    level: 'I know the rules'
  });
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [skillCheckOpen, setSkillCheckOpen] = useState(false);
  const [planTheme, setPlanTheme] = useState(null);
  const [planSection, setPlanSection] = useState(null);
  const [planMistakeIds, setPlanMistakeIds] = useState(null);
  const [planTrack, setPlanTrack] = useState(null);
  const [planCoachLaunch, setPlanCoachLaunch] = useState(0);
  const [trainLaunch, setTrainLaunch] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedGames, savedLocalGames, savedProfile, savedOnboarding] = await Promise.all([AsyncStorage.getItem(STORAGE_KEYS.username), AsyncStorage.getItem(STORAGE_KEYS.games), AsyncStorage.getItem(STORAGE_KEYS.localGames), AsyncStorage.getItem(STORAGE_KEYS.profile), AsyncStorage.getItem(STORAGE_KEYS.onboardingDone)]);
        if (savedUser) setUsername(savedUser);
        if (savedGames) setGames(JSON.parse(savedGames));
        if (savedLocalGames) setLocalGames(JSON.parse(savedLocalGames));
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        setOnboardingDone(savedOnboarding === 'yes');
      } catch {/* A missing local cache does not prevent the app opening. */} finally {
        setReady(true);
      }
    })();
  }, []);
  const connect = async value => {
    const clean = value.trim();
    if (!clean) {
      setSyncError('Enter your Chess.com username to continue.');
      return;
    }
    setSyncing(true);
    setSyncError('');
    try {
      const recent = await fetchRecentGames(clean);
      await Promise.all([AsyncStorage.setItem(STORAGE_KEYS.username, clean), AsyncStorage.setItem(STORAGE_KEYS.games, JSON.stringify(recent))]);
      setUsername(clean);
      setGames(recent);
    } catch (error) {
      setSyncError(error.message || 'Could not sync the account.');
    } finally {
      setSyncing(false);
    }
  };
  const refresh = async value => {
    if (!value) return;
    setSyncing(true);
    setSyncError('');
    try {
      const recent = await fetchRecentGames(value);
      await AsyncStorage.setItem(STORAGE_KEYS.games, JSON.stringify(recent));
      setGames(recent);
    } catch (error) {
      setSyncError(error.message || 'Could not refresh games.');
    } finally {
      setSyncing(false);
    }
  };
  const openReview = game => {
    setSelectedGame(game);
    setTab('game');
  };
  const navigateTab = next => {
    setPlanTheme(null); setPlanSection(null); setPlanMistakeIds(null);
    setTab(next);
  };
  const openPractice = target => {
    if (target.kind === 'lesson') { setSelectedLesson(target.lessonId); setTab('lesson'); }
    else if (target.kind === 'theme' || target.kind === 'mistakes') {
      setPlanTheme(target.theme || null); setPlanSection(target.kind === 'mistakes' ? 'mistakes' : 'puzzles');
      setPlanMistakeIds(target.ids || null); setTrainLaunch(value => value + 1); setTab('train');
    } else if (target.kind === 'coach') { setPlanCoachLaunch(value => value + 1); setTab('play'); }
  };
  const finishOnboarding = async (next, intent = null) => {
    const merged = { ...profile, ...next };
    await Promise.all([AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(merged)), AsyncStorage.setItem(STORAGE_KEYS.puzzleRating, String(merged.puzzleRating)), AsyncStorage.setItem(STORAGE_KEYS.onboardingDone, 'yes')]);
    setProfile(merged);
    setOnboardingDone(true);
    setSkillCheckOpen(false);
    setPlanTheme(null);
    setPlanTrack(null);
    if (intent?.kind === 'theme') { setPlanTheme(intent.theme); setTrainLaunch((value) => value + 1); setTab('train'); }
    else if (intent?.kind === 'track' && intent.track === 'foundations') { setPlanTrack(intent.track); setTab('learning'); }
    else if (intent?.kind === 'track') { setTab('train'); }
    else if (intent?.kind === 'coach') { setPlanCoachLaunch((value) => value + 1); setTab('play'); }
    else setTab('home');
  };
  const startSkillCheck = () => { setSkillCheckOpen(true); setTab('home'); };
  const updateProfile = async next => {
    setProfile(next);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
  };
  const saveLocalGame = game => {
    setLocalGames(current => {
      if (current.some(item => item.id === game.id)) return current;
      const next = [game, ...current].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEYS.localGames, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const disconnect = () => Alert.alert('Disconnect Chess.com?', 'This removes the cached username and imported games from this device.', [{
    text: 'Cancel',
    style: 'cancel'
  }, {
    text: 'Disconnect',
    style: 'destructive',
    onPress: async () => {
      await Promise.all([AsyncStorage.removeItem(STORAGE_KEYS.username), AsyncStorage.removeItem(STORAGE_KEYS.games)]);
      setUsername('');
      setGames([]);
      setTab('home');
    }
  }]);
  const restartOnboarding = async () => {
    setOnboardingDone(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.onboardingDone);
  };
  const body = !ready
    ? (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={C.green} />
        <Text style={styles.bodyMuted}>Getting your training space ready…</Text>
      </View>
    )
    : skillCheckOpen
      ? <OnboardingScreen key="skill-check" initialStep="diagnostic" profile={profile} onCancel={() => setSkillCheckOpen(false)} onFinish={finishOnboarding} />
      : !onboardingDone
      ? <OnboardingScreen onFinish={finishOnboarding} />
      : tab === 'home'
        ? <HomeScreen username={username} games={games} onConnect={connect} onRefresh={refresh} syncing={syncing} syncError={syncError} onOpenReview={openReview} onTab={navigateTab} profile={profile} onStartSkillCheck={startSkillCheck} onPractice={openPractice} />
        : tab === 'review'
          ? <ReviewScreen username={username} games={games} onOpenReview={openReview} syncing={syncing} onRefresh={refresh} backendReady={isCoachBackendConfigured()} />
          : tab === 'game' && selectedGame
            ? <GameReviewScreen key={selectedGame.url || selectedGame.end_time} game={selectedGame} username={username} onBack={() => setTab('review')} />
            : tab === 'train'
        ? <TrainScreen key={`train-${trainLaunch}`} onTab={navigateTab} profile={profile} initialTheme={planTheme} initialSection={planSection} initialMistakeIds={planMistakeIds} />
              : tab === 'play'
                ? null
                : tab === 'progress'
                  ? <ProgressScreen games={games} username={username} onTab={setTab} />
                  : tab === 'history'
                    ? <HistoryScreen games={games} username={username} localGames={localGames} onOpenReview={openReview} onTab={setTab} />
                    : tab === 'learning'
                      ? <LearningScreen key={`learning-${planTrack || 'default'}`} onTab={setTab} profile={profile} initialTrack={planTrack} onOpenLesson={(lesson) => { setSelectedLesson(lesson); setTab('lesson'); }} />
                      : tab === 'lesson' && selectedLesson
                        ? <LessonScreen key={selectedLesson} lessonId={selectedLesson} onBack={() => setTab('learning')} onNextLesson={(lesson) => setSelectedLesson(lesson)} />
                      : tab === 'profile'
                        ? <ProfileScreen username={username} profile={profile} rating={recentPlayerRating(games, username)} onTab={setTab} onDisconnect={disconnect} onUpdateProfile={updateProfile} onRestart={restartOnboarding} onRetakeSkillCheck={startSkillCheck} />
                        : tab === 'setup'
                          ? (
                            <View style={styles.page}>
                              <Pressable onPress={() => setTab('profile')} style={styles.backButton}>
                                <Text style={styles.backText}>‹  Profile</Text>
                              </Pressable>
                              <View style={styles.pageIntro}>
                                <Badge tone="amber">APP SETUP</Badge>
                                <Text style={styles.pageTitle}>Privacy & AI</Text>
                                <Text style={styles.pageSubtitle}>
                                  Stockfish is a local chess engine and needs the installed development build. AI-written reviews run through a protected Supabase Edge Function and the OpenAI Responses API; provider credentials stay on the server.
                                </Text>
                              </View>
                              <View style={styles.noticeCard}>
                                <Text style={styles.noticeIcon}>{isCoachBackendConfigured() ? '✓' : '⌁'}</Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.noticeTitle}>{isCoachBackendConfigured() ? 'Supabase app settings found' : 'Supabase project setup required'}</Text>
                                  <Text style={styles.noticeCopy}>
                                    The server function and client connection are scaffolded in this project. Project URL and publishable key, anonymous guest sign-in, and the server-side OPENAI_API_KEY still need configuring before cloud reviews work.
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )
                          : <LibraryScreen onTab={setTab} onBack={() => setTab('learning')} />;
  return (
    <SafeAreaView style={styles.app}>
      {ready && onboardingDone && <ReminderObserver onOpenToday={() => navigateTab('home')} />}
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={styles.topBar}>
        <Pressable onPress={() => setTab('home')} style={styles.brand}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>♛</Text></View>
          <View>
            <Text style={styles.brandName}>chess coach</Text>
            <Text style={styles.brandSub}>PRO · YOUR NEXT MOVE</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile and settings"
          onPress={() => onboardingDone && setTab('profile')}
          style={styles.profileMark}
        >
          <Text style={styles.profileText}>{username ? username.slice(0, 1).toUpperCase() : '♘'}</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {ready && onboardingDone && (
          <View style={[styles.persistentPlayLayer, { display: tab === 'play' ? 'flex' : 'none' }]}>
            <PlayScreen
              playerRating={recentPlayerRating(games, username)}
              startingRating={profile.startingRating}
              coachPlanLaunch={planCoachLaunch}
              playerKey={username.toLowerCase()}
              onSaveGame={saveLocalGame}
              onOpenHistory={() => setTab('history')}
            />
          </View>
        )}
        {tab !== 'play' && <View style={{ flex: 1 }}>{body}</View>}
      </View>
      {onboardingDone && (
        <View style={styles.tabBar}>
          {TABS.map((item) => {
            const active = tab === item.id || (item.id === 'review' && tab === 'game');
            return (
              <Pressable
                key={item.id}
                onPress={() => navigateTab(item.id)}
                style={styles.tabItem}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabMark, active && styles.tabMarkActive]}>{item.mark}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
                {active && <View style={styles.tabIndicator} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

export default App;
