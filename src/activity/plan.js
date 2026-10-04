export function weakestTheme(history = [], profile = {}) {
  const counts = {};
  for (const attempt of history.slice(-200)) {
    for (const theme of attempt.themes || []) {
      counts[theme] ||= { missed: 0, total: 0 };
      counts[theme].total += 1;
      if (!attempt.solved || attempt.hintUsed) counts[theme].missed += 1;
    }
  }
  const ranked = Object.entries(counts).filter(([, count]) => count.missed > 0)
    .sort((a, b) => b[1].missed - a[1].missed || b[1].missed / b[1].total - a[1].missed / a[1].total || a[0].localeCompare(b[0]));
  return ranked[0]?.[0] || profile.weakThemes?.[0] || 'mateIn1';
}

export function buildDailyPlan({ date, profile = {}, lessons = [], progress = {}, puzzleHistory = [], mistakes = [], now = Date.now() }) {
  const track = profile.goal === 'Learn from scratch' || (profile.puzzleRating || 700) < 900 ? 'foundations' : profile.goal === 'Learn openings' ? 'openings' : 'tactics';
  const ordered = [...lessons].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  // Tracks without published lessons use the next available foundation lesson.
  const lesson = ordered.find((item) => item.track === track && !progress[item.id]?.completedAt)
    || ordered.find((item) => item.track === 'foundations' && !progress[item.id]?.completedAt)
    || ordered.find((item) => !progress[item.id]?.completedAt);
  const due = mistakes.filter((record) => Number(record.dueAt) <= now)
    .sort((a, b) => a.dueAt - b.dueAt || a.id.localeCompare(b.id)).slice(0, 5);
  return {
    date, lessonId: lesson?.id || null, lessonTitle: lesson?.title || null,
    theme: weakestTheme(puzzleHistory, profile), mistakeIds: due.map((record) => record.id), completed: [],
  };
}

export function requiredItems(plan) {
  if (!plan) return [];
  return [...(plan.lessonId ? ['lesson'] : []), 'puzzles', ...(plan.mistakeIds.length ? ['mistakes'] : [])];
}

export function planProgress(plan) {
  const items = requiredItems(plan);
  const completed = items.filter((item) => plan?.completed?.includes(item)).length;
  return { completed, total: items.length, complete: items.length > 0 && completed === items.length };
}

export function applyPlanEvent(plan, events, event) {
  const completed = new Set(plan.completed || []);
  if (event.type === 'lesson' && event.id === plan.lessonId) completed.add('lesson');
  if (event.type === 'session' && event.theme === plan.theme) completed.add('puzzles');
  const reviewed = new Set(events.filter((item) => item.type === 'mistake').map((item) => item.id));
  if (plan.mistakeIds.length && plan.mistakeIds.every((id) => reviewed.has(id))) completed.add('mistakes');
  if (event.type === 'game') completed.add('coach');
  return { ...plan, completed: [...completed] };
}
