import { localDateKey } from '../activity/calendar.js';
import { planProgress } from '../activity/plan.js';

export const REMINDER_DAYS = 60;

export function reminderCopy(plan, day = {}, today = false) {
  const parts = [];
  if (!today || !plan.completed.includes('puzzles')) {
    const count = today ? Math.max(1, 5 - (day.puzzles || 0)) : 5;
    parts.push(`${count} ${count === 1 ? 'puzzle' : 'puzzles'}`);
  }
  if (plan.lessonId && (!today || !plan.completed.includes('lesson'))) parts.push('a lesson');
  if (today && plan.mistakeIds.length && !plan.completed.includes('mistakes')) parts.push('saved mistakes');
  return `${parts.join(parts.length > 2 ? ', ' : ' and ')} ${parts.length === 1 && ['a lesson', '1 puzzle'].includes(parts[0]) ? 'is' : 'are'} waiting. A few thoughtful minutes can make a difference.`;
}

export function reminderRequests(settings, snapshot, now = new Date()) {
  if (!settings.enabled || !snapshot?.plan) return [];
  const requests = [];
  for (let offset = 0; offset < REMINDER_DAYS; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, settings.hour, settings.minute, 0, 0);
    if (date <= now || (offset === 0 && planProgress(snapshot.plan).complete)) continue;
    const day = localDateKey(date);
    const todayPuzzles = (snapshot.events || []).filter(event => event.type === 'puzzle' && event.theme === snapshot.plan.theme).length;
    requests.push({ identifier: `chesscoach.daily.${day}`, date, day, body: reminderCopy(snapshot.plan, { ...snapshot.day, puzzles: todayPuzzles }, offset === 0) });
  }
  return requests;
}
