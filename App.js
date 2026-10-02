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
import { ProfileScreen } from './src/screens/ProfileScreen';
import { fetchRecentGames, recentPlayerRating } from './src/services/chessCom';
import { isCoachBackendConfigured } from './src/services/coachApi';
const TABS = [
  { id: 'home', mark: '⌂', label: 'Home' },
  { id: 'review', mark: '◉', label: 'Review' },
  { id: 'train', mark: '♟', label: 'Train' },
  { id: 'play', mark: '♜', label: 'Play' },
  { id: 'library', mark: '▤', label: 'Library' },
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
  const finishOnboarding = async next => {
    setProfile(next);
    setOnboardingDone(true);
    setTab('home');
    await Promise.all([AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next)), AsyncStorage.setItem(STORAGE_KEYS.onboardingDone, 'yes')]);
  };
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
    : !onboardingDone
      ? <OnboardingScreen onFinish={finishOnboarding} />
      : tab === 'home'
        ? <HomeScreen username={username} games={games} onConnect={connect} onRefresh={refresh} syncing={syncing} syncError={syncError} onOpenReview={openReview} onTab={setTab} />
        : tab === 'review'
          ? <ReviewScreen username={username} games={games} onOpenReview={openReview} syncing={syncing} onRefresh={refresh} backendReady={isCoachBackendConfigured()} />
          : tab === 'game' && selectedGame
            ? <GameReviewScreen key={selectedGame.url || selectedGame.end_time} game={selectedGame} username={username} onBack={() => setTab('review')} />
            : tab === 'train'
        ? <TrainScreen onTab={setTab} profile={profile} />
              : tab === 'play'
                ? null
                : tab === 'progress'
                  ? <ProgressScreen games={games} username={username} onTab={setTab} />
                  : tab === 'history'
                    ? <HistoryScreen games={games} username={username} localGames={localGames} onOpenReview={openReview} onTab={setTab} />
                    : tab === 'learning'
                      ? <LearningScreen onTab={setTab} profile={profile} />
                      : tab === 'profile'
                        ? <ProfileScreen username={username} profile={profile} rating={recentPlayerRating(games, username)} onTab={setTab} onDisconnect={disconnect} onUpdateProfile={updateProfile} onRestart={restartOnboarding} />
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
                          : <LibraryScreen onTab={setTab} />;
  return (
    <SafeAreaView style={styles.app}>
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
                onPress={() => setTab(item.id)}
                style={styles.tabItem}
                accessibilityRole="tab"
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
