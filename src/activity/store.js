import { getJSON, setJSON, setManyJSON, STORAGE_KEYS } from '../storage/keys';
import lessonsData from '../data/lessons.json';
import { localDateKey, computeStreaks, weekStrip } from './calendar';
import { applyPlanEvent, buildDailyPlan, planProgress, weakestTheme } from './plan';

let queue = Promise.resolve();
const listeners = new Set();
const serialized = (task) => {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
};
export const subscribeActivity = (callback) => { listeners.add(callback); return () => listeners.delete(callback); };
const publish = (event) => listeners.forEach((callback) => callback(event));

async function load() {
  const [profile, lessons, history, mistakes, activity, plans, events, pendingAnalysis] = await Promise.all([
    getJSON(STORAGE_KEYS.profile, {}), getJSON(STORAGE_KEYS.lessons, {}),
    getJSON(STORAGE_KEYS.puzzleHistory, []), getJSON(STORAGE_KEYS.mistakes, []),
    getJSON(STORAGE_KEYS.activity, {}), getJSON(STORAGE_KEYS.dailyPlans, {}),
    getJSON(STORAGE_KEYS.activityEvents, {}), getJSON(STORAGE_KEYS.pendingAnalysis, null),
  ]);
  return { profile, lessons, history, mistakes, activity, plans, events, pendingAnalysis };
}

async function ensurePlan(data, now) {
  const date = localDateKey(now);
  if (!data.plans[date]) {
    data.plans[date] = buildDailyPlan({ date, profile: data.profile, lessons: lessonsData.lessons, progress: data.lessons, puzzleHistory: data.history, mistakes: data.mistakes, now: now.getTime() });
    if (!await setJSON(STORAGE_KEYS.dailyPlans, data.plans)) throw new Error('Could not save today’s plan.');
  }
  return data.plans[date];
}

export function readToday(now = new Date()) {
  return serialized(async () => {
    const data = await load();
    const plan = await ensurePlan(data, now);
    const resume = lessonsData.lessons.find((lesson) => data.lessons[lesson.id] && !data.lessons[lesson.id].completedAt);
    return {
      date: plan.date, plan, progress: planProgress(plan),
      day: data.activity[plan.date] || { lessons: 0, puzzles: 0, mistakesReviewed: 0, games: 0 },
      streak: computeStreaks(data.activity, now, data.plans), week: weekStrip(data.activity, now, data.plans),
      weakestTheme: weakestTheme(data.history, data.profile), resumeLesson: resume || null,
      pendingAnalysis: data.pendingAnalysis, events: data.events[plan.date] || [],
    };
  });
}

export function recordActivity(type, id, extra = {}, now = new Date()) {
  return serialized(async () => {
    const data = await load();
    const plan = await ensurePlan(data, now);
    const date = plan.date;
    const events = data.events[date] || [];
    if (events.some((event) => event.type === type && event.id === String(id))) return;
    const event = { ...extra, type, id: String(id), ts: now.getTime() };
    const nextEvents = [...events, event];
    const nextPlan = applyPlanEvent(plan, nextEvents, event);
    const day = { lessons: 0, puzzles: 0, mistakesReviewed: 0, games: 0, ...data.activity[date] };
    const counter = { lesson: 'lessons', puzzle: 'puzzles', mistake: 'mistakesReviewed', game: 'games' }[type];
    if (counter) day[counter] += 1;
    const completedItem = nextPlan.completed.length > plan.completed.length;
    data.activity[date] = day; data.events[date] = nextEvents; data.plans[date] = nextPlan;
    const saved = await setManyJSON([
      [STORAGE_KEYS.activity, data.activity], [STORAGE_KEYS.activityEvents, data.events],
      [STORAGE_KEYS.dailyPlans, data.plans],
    ]);
    if (!saved) throw new Error('Could not save practice activity.');
    publish({ type: 'activity', completedItem, date, progress: planProgress(nextPlan) });
  });
}

export function savePendingAnalysis(value, completedGameId = null) {
  return serialized(async () => {
    if (!value && completedGameId) {
      const pending = await getJSON(STORAGE_KEYS.pendingAnalysis, null);
      if (pending?.gameId !== completedGameId) return;
    }
    await setJSON(STORAGE_KEYS.pendingAnalysis, value);
    publish({ type: 'analysis' });
  });
}
