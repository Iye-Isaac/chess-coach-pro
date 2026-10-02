import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const sessionKey = 'chesscoach.supabase.guest-session';

export function isCoachBackendConfigured() {
  return Boolean(supabaseUrl && publishableKey);
}

async function getGuestSession() {
  if (!isCoachBackendConfigured()) throw new Error('AI reviews are not connected yet. Add the Supabase project URL and publishable key, then restart the app.');
  let session;
  try { session = JSON.parse((await AsyncStorage.getItem(sessionKey)) || 'null'); } catch {}
  if (session?.access_token && session.expires_at > Date.now() + 60_000) return session;

  const endpoint = session?.refresh_token ? `${supabaseUrl}/auth/v1/token?grant_type=refresh_token` : `${supabaseUrl}/auth/v1/signup`;
  const payload = session?.refresh_token ? { refresh_token: session.refresh_token } : {};
  const response = await fetch(endpoint, {
    method: 'POST', headers: { apikey: publishableKey, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) throw new Error(result.msg || result.message || 'Could not create a secure guest session for AI reviews.');
  const next = { ...result, expires_at: Date.now() + (Number(result.expires_in) || 3600) * 1000 };
  await AsyncStorage.setItem(sessionKey, JSON.stringify(next));
  return next;
}

export async function requestGameAnalysis({ game, username }) {
  const session = await getGuestSession();
  const response = await fetch(`${supabaseUrl}/functions/v1/chess-coach`, {
    method: 'POST',
    headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ game, username }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The chess coach could not review this game. Please try again.');
  return result;
}
