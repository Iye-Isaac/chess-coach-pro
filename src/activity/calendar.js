const pad = (value) => String(value).padStart(2, '0');

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Calendar arithmetic uses civil dates, never elapsed 24-hour intervals.
export function shiftDateKey(key, days) {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function practiced(entry, plan) {
  if (plan) return (plan.completed || []).length > 0;
  return Boolean(entry && (entry.lessons > 0 || entry.puzzles >= 5 || entry.mistakesReviewed > 0 || entry.games > 0));
}

export function computeStreaks(activity = {}, now = new Date(), plans = {}) {
  const today = localDateKey(now);
  const dates = Object.keys(activity).filter((key) => key <= today && practiced(activity[key], plans[key])).sort();
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const date of dates) {
    run = previous && shiftDateKey(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  const active = new Set(dates);
  let cursor = active.has(today) ? today : shiftDateKey(today, -1);
  let current = 0;
  while (active.has(cursor)) { current += 1; cursor = shiftDateKey(cursor, -1); }
  return { current, longest };
}

export function weekStrip(activity = {}, now = new Date(), plans = {}) {
  const today = localDateKey(now);
  const monday = shiftDateKey(today, -((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(monday, index);
    return { date, label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index], today: date === today, active: date <= today && practiced(activity[date], plans[date]) };
  });
}
