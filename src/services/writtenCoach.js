import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage/keys';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '');
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const sessionKey = STORAGE_KEYS.supabaseGuestSession;
let sessionRequest = null;

export function isCoachBackendConfigured() {
  return Boolean(supabaseUrl?.startsWith('https://') && publishableKey);
}

async function fetchJSON(url, options, signal, timeout = 30000) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort);
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; abort(); }, timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const result = await response.json().catch(() => ({}));
    return { response, result };
  } catch {
    if (signal?.aborted) throw Object.assign(new Error('Written coaching canceled.'), { name: 'AbortError' });
    if (timedOut) throw new Error('Written coaching took too long. Try again.');
    throw new Error('Could not reach the written coach. Check your internet connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

async function createSession() {
  if (!isCoachBackendConfigured()) throw new Error('The written coach is not connected. Configure the Supabase project first.');
  const session = await getJSON(sessionKey);
  if (session?.access_token && session.expires_at > Date.now() + 60000) return session;
  const headers = { apikey: publishableKey, 'Content-Type': 'application/json' };
  let reply;
  if (session?.refresh_token) {
    reply = await fetchJSON(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST', headers, body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!reply.response.ok && [400, 401, 403].includes(reply.response.status)) {
      await AsyncStorage.removeItem(sessionKey);
      reply = null;
    }
  }
  if (!reply) reply = await fetchJSON(`${supabaseUrl}/auth/v1/signup`, { method: 'POST', headers, body: '{}' });
  const { response, result } = reply;
  if (!response.ok || !result.access_token) {
    if (result.error_code === 'anonymous_provider_disabled') throw new Error('Enable anonymous sign-ins in Supabase to use written coaching without an account.');
    if (response.status === 429) throw new Error('Too many sign-in requests. Wait a moment and try again.');
    throw new Error('Could not start a guest coaching session. Check the Supabase URL, public key and anonymous sign-in settings.');
  }
  const next = {
    access_token: result.access_token, refresh_token: result.refresh_token,
    expires_at: Date.now() + (Number(result.expires_in) || 3600) * 1000,
  };
  await AsyncStorage.setItem(sessionKey, JSON.stringify(next));
  return next;
}

async function getGuestSession(signal) {
  if (signal?.aborted) throw Object.assign(new Error('Written coaching canceled.'), { name: 'AbortError' });
  if (!sessionRequest) sessionRequest = createSession().finally(() => { sessionRequest = null; });
  if (!signal) return sessionRequest;
  return new Promise((resolve, reject) => {
    const abort = () => reject(Object.assign(new Error('Written coaching canceled.'), { name: 'AbortError' }));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    sessionRequest.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

const fingerprint = ({ criticalMoments, stats }) => JSON.stringify({ version: 1, criticalMoments, stats });
function validReview(review) {
  return typeof review?.overall_summary === 'string' && review.overall_summary.trim()
    && ['opening', 'middlegame', 'endgame'].every((phase) => typeof review[`${phase}_review`] === 'string'
      && Array.isArray(review[`${phase}_lessons`]) && review[`${phase}_lessons`].every((lesson) => typeof lesson === 'string'));
}

export async function getCachedCoachNotes(gameId, input) {
  if (!gameId) return null;
  const saved = await getJSON(STORAGE_KEYS.writtenReview(gameId));
  return saved?.fingerprint === fingerprint(input) && validReview(saved.review) ? saved.review : null;
}

export async function requestGameAnalysis({ criticalMoments, stats, username, gameId, signal }) {
  const input = { criticalMoments, stats };
  const cached = await getCachedCoachNotes(gameId, input);
  if (signal?.aborted) throw Object.assign(new Error('Written coaching canceled.'), { name: 'AbortError' });
  if (cached) return cached;
  if (!Array.isArray(criticalMoments) || criticalMoments.length > 3 || !stats) throw new Error('Finish the engine review before asking for written notes.');
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const session = await getGuestSession(signal);
    const { response, result } = await fetchJSON(`${supabaseUrl}/functions/v1/chess-coach`, {
      method: 'POST',
      headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ criticalMoments, stats, username }),
    }, signal, 90000);
    if (response.status === 401 && attempt === 0) { await AsyncStorage.removeItem(sessionKey); continue; }
    if (!response.ok) {
      if (response.status === 404) throw new Error('Deploy the chess-coach Edge Function in your Supabase project.');
      if ([401, 403].includes(response.status)) throw new Error('The coaching session was rejected. Check Supabase authentication settings.');
      throw new Error(typeof result.error === 'string' ? result.error : 'The written coach could not complete this review. Try again.');
    }
    if (!validReview(result)) throw new Error('The coach returned incomplete notes. Try again.');
    if (signal?.aborted) throw Object.assign(new Error('Written coaching canceled.'), { name: 'AbortError' });
    if (gameId) await setJSON(STORAGE_KEYS.writtenReview(gameId), { fingerprint: fingerprint(input), review: result, createdAt: Date.now() });
    return result;
  }
}
