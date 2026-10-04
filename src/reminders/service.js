import { Alert, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';
import { readToday } from '../activity/store';
import { planProgress } from '../activity/plan';
import { reminderRequests } from './schedule';

const defaults = { enabled: false, hour: 18, minute: 0, prePromptShown: false };
const settingsListeners = new Set();
let tail = Promise.resolve();
let notifications = null;
try {
  // Keep older development builds bootable until the new native module is installed.
  if (requireOptionalNativeModule('ExpoNotificationScheduler')) notifications = require('expo-notifications');
} catch { /* Reminders become available after a native rebuild. */ }

export const reminderAvailable = Boolean(notifications);
export const notificationAPI = () => notifications;
export async function cancelTodayReminder(date) {
  if (!notifications) return;
  await notifications.cancelScheduledNotificationAsync(`chesscoach.daily.${date}`);
}
export const subscribeReminderSettings = callback => { settingsListeners.add(callback); return () => settingsListeners.delete(callback); };
const serial = task => { const result = tail.then(task, task); tail = result.catch(() => {}); return result; };

export async function getReminderSettings() {
  const saved = await getJSON(STORAGE_KEYS.reminders, {});
  return { ...defaults, ...saved, hour: Math.max(0, Math.min(23, Math.floor(saved.hour ?? 18))), minute: Math.max(0, Math.min(59, Math.floor(saved.minute ?? 0))) };
}

async function persist(settings) {
  if (!await setJSON(STORAGE_KEYS.reminders, settings)) throw new Error('Could not save your reminder settings.');
  settingsListeners.forEach(callback => callback(settings));
  return settings;
}

export async function reminderEligible() {
  const plans = await getJSON(STORAGE_KEYS.dailyPlans, {});
  return Object.values(plans).some(plan => plan.completed?.length > 0);
}

async function cancelReminders() {
  if (!notifications) return;
  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter(item => item.identifier.startsWith('chesscoach.daily.')).map(item => notifications.cancelScheduledNotificationAsync(item.identifier)));
}

async function channel() {
  if (Platform.OS === 'android') await notifications.setNotificationChannelAsync('chesscoach-practice', {
    name: 'Daily chess practice', importance: notifications.AndroidImportance.DEFAULT,
  });
}

async function reschedule(settings) {
  if (!notifications) return;
  await cancelReminders();
  if (!settings.enabled) return;
  const permission = await notifications.getPermissionsAsync();
  if (!permission.granted) { await persist({ ...settings, enabled: false }); return; }
  await channel();
  const snapshot = await readToday();
  // One notification per civil day lets us cancel today's completed plan.
  // Refresh this rolling window on foreground, day changes and every completion.
  for (const request of reminderRequests(settings, snapshot)) {
    if (request.day === snapshot.date && (await readToday()).progress.complete) continue;
    await notifications.scheduleNotificationAsync({
      identifier: request.identifier,
      content: { title: 'Your chess plan is ready', body: request.body, sound: 'default', data: { kind: 'daily-plan', day: request.day } },
      trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date: request.date, ...(Platform.OS === 'android' ? { channelId: 'chesscoach-practice' } : {}) },
    });
  }
}

export function syncReminders() { return serial(async () => reschedule(await getReminderSettings())); }

export function updateReminderSettings(changes) {
  return serial(async () => {
    const next = { ...(await getReminderSettings()), ...changes };
    if (next.enabled && !notifications) throw new Error('Install the latest native app build to use reminders.');
    await persist(next);
    try { await reschedule(next); }
    catch (error) { await persist({ ...next, enabled: false }); await cancelReminders().catch(() => {}); throw error; }
    return getReminderSettings();
  });
}

export async function enableReminders() {
  if (!notifications) throw new Error('Install the latest native app build to use reminders.');
  if (!await reminderEligible()) throw new Error('Complete a daily plan item first, then enable reminders.');
  await channel();
  const permission = await notifications.requestPermissionsAsync();
  if (!permission.granted) {
    await updateReminderSettings({ enabled: false, prePromptShown: true });
    throw new Error('Notifications are off. You can allow them in your phone’s app settings when you’re ready.');
  }
  return updateReminderSettings({ enabled: true, prePromptShown: true });
}

export async function offerFirstReminder() {
  if (!notifications) return;
  const offer = await serial(async () => {
    const settings = await getReminderSettings();
    if (settings.prePromptShown || !await reminderEligible()) return false;
    await persist({ ...settings, prePromptShown: true });
    return settings;
  });
  if (!offer) return;
  const time = `${String(offer.hour).padStart(2, '0')}:${String(offer.minute).padStart(2, '0')}`;
  Alert.alert('Keep a little time for chess?', `A gentle reminder at ${time} can help you return to your daily plan. You can change the time or turn it off in Profile.`, [
    { text: 'Not now', style: 'cancel' },
    { text: 'Enable reminders', onPress: () => enableReminders().catch(error => Alert.alert('Reminders', error.message)) },
  ]);
}

export function setupNotificationHandler() {
  notifications?.setNotificationHandler({
    handleNotification: async notification => {
      let show = true;
      if (notification.request.content.data?.kind === 'daily-plan') {
        const today = await readToday();
        const settings = await getReminderSettings();
        show = settings.enabled && !planProgress(today.plan).complete;
      }
      return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
    },
  });
}
