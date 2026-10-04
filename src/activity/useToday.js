import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { readToday, subscribeActivity } from './store';
import { localDateKey } from './calendar';

export function useToday() {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { setSnapshot(await readToday()); setError(''); }
    catch { setError('Could not load today’s practice. Please try again.'); }
  }, []);
  useEffect(() => {
    let active = true;
    const update = async () => {
      try { const next = await readToday(); if (active) { setSnapshot(next); setError(''); } }
      catch { if (active) setError('Could not load today’s practice. Please try again.'); }
    };
    update();
    const unsubscribe = subscribeActivity(update);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') update(); });
    let day = localDateKey();
    const timer = setInterval(() => { const next = localDateKey(); if (next !== day) { day = next; update(); } }, 1000);
    return () => { active = false; unsubscribe(); subscription.remove(); clearInterval(timer); };
  }, []);
  return { snapshot, error, refresh };
}
