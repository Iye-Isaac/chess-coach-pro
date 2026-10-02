import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  username: 'chesscoach.username',
  games: 'chesscoach.games',
  localGames: 'chesscoach.localGames',
  profile: 'chesscoach.profile',
  onboardingDone: 'chesscoach.onboarding.done',
  trainingSolved: 'chesscoach.training.solved',
  puzzleRating: 'chesscoach.puzzleRating',
  puzzleHistory: 'chesscoach.puzzleHistory',
  adaptive: (player) => `chesscoach.adaptive.${player || 'guest'}`,
  supabaseGuestSession: 'chesscoach.supabase.guest-session',
};

export async function getJSON(key, fallback = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
