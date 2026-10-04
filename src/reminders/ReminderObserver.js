import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { localDateKey } from '../activity/calendar';
import { readToday, subscribeActivity } from '../activity/store';
import { cancelTodayReminder, notificationAPI, offerFirstReminder, setupNotificationHandler, syncReminders } from './service';

export function ReminderObserver({ onOpenToday }) {
  const onOpen = useRef(onOpenToday);
  onOpen.current = onOpenToday;
  useEffect(() => {
    setupNotificationHandler();
    readToday().catch(() => {});
    const sync = () => syncReminders().catch(() => {});
    sync();
    const unsubscribe = subscribeActivity(event => {
      if (event.type !== 'activity') return;
      if (event.progress.complete) cancelTodayReminder(event.date).catch(() => {});
      // No permission dialog runs from launch or foreground handlers.
      if (event.completedItem && AppState.currentState === 'active') offerFirstReminder().catch(() => {});
      sync();
    });
    const appState = AppState.addEventListener('change', state => { if (state === 'active') sync(); });
    let day = localDateKey();
    const timer = setInterval(() => { const next = localDateKey(); if (next !== day) { day = next; readToday().catch(() => {}); sync(); } }, 1000);
    const api = notificationAPI();
    const open = response => { if (response?.notification.request.content.data?.kind === 'daily-plan') onOpen.current(); };
    const responseListener = api?.addNotificationResponseReceivedListener(open);
    api?.getLastNotificationResponseAsync().then(response => { if (response) { open(response); api.clearLastNotificationResponseAsync?.(); } }).catch(() => {});
    return () => { unsubscribe(); appState.remove(); responseListener?.remove(); clearInterval(timer); };
  }, []);
  return null;
}
