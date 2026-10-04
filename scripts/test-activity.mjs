import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { localDateKey, shiftDateKey, computeStreaks, weekStrip } from '../src/activity/calendar.js';
import { buildDailyPlan, applyPlanEvent, planProgress, weakestTheme } from '../src/activity/plan.js';
import { reminderRequests } from '../src/reminders/schedule.js';

const day = { lessons: 1, puzzles: 0, mistakesReviewed: 0, games: 0 };
assert.equal(localDateKey(new Date(2026, 0, 1, 0, 0)), '2026-01-01');
assert.equal(shiftDateKey('2026-01-01', -1), '2025-12-31');
assert.equal(shiftDateKey('2024-02-28', 1), '2024-02-29');
assert.equal(shiftDateKey('2024-02-29', 1), '2024-03-01');
const log = { '2025-12-30': day, '2025-12-31': day, '2026-01-01': day };
assert.deepEqual(computeStreaks(log, new Date(2026, 0, 1, 23, 59)), { current: 3, longest: 3 });
assert.deepEqual(computeStreaks(log, new Date(2026, 0, 2, 0, 0)), { current: 3, longest: 3 });
assert.deepEqual(computeStreaks(log, new Date(2026, 0, 3, 0, 0)), { current: 0, longest: 3 });
assert.deepEqual(computeStreaks({ ...log, '2026-01-03': day }, new Date(2026, 0, 3)), { current: 1, longest: 3 });
assert.equal(computeStreaks({ '2026-01-01': { puzzles: 4 } }, new Date(2026, 0, 1)).current, 0);
assert.equal(computeStreaks({ '2026-01-01': { mistakesReviewed: 1 } }, new Date(2026, 0, 1), { '2026-01-01': { completed: [] } }).current, 0);
assert.equal(weekStrip(log, new Date(2026, 0, 1)).length, 7);
assert.equal(weekStrip(log, new Date(2026, 0, 1)).filter(d => d.today).length, 1);

const options = {
  date: '2026-01-01', profile: { puzzleRating: 1000, weakThemes: ['pin'] },
  lessons: [{ id: 'f1', track: 'foundations', order: 1, title: 'First' }, { id: 'f2', track: 'foundations', order: 2, title: 'Second' }],
  progress: { f1: { completedAt: 1 } }, mistakes: [{ id: 'm1', dueAt: 1 }, { id: 'm2', dueAt: 2 }], now: 10,
};
const plan = buildDailyPlan(options);
assert.deepEqual(plan, buildDailyPlan(options));
assert.equal(plan.lessonId, 'f2');
assert.equal(plan.theme, 'pin');
assert.equal(weakestTheme([{ solved: false, themes: ['fork'] }, { solved: false, themes: ['fork', 'pin'] }]), 'fork');
assert.equal(buildDailyPlan({ ...options, progress: { f1: { completedAt: 1 }, f2: { completedAt: 2 } } }).lessonId, null);
assert.equal(buildDailyPlan({ ...options, mistakes: Array.from({ length: 10 }, (_, n) => ({ id: `m${n}`, dueAt: n })) }).mistakeIds.length, 5);
let events = [{ type: 'lesson', id: 'f2' }];
let updated = applyPlanEvent(plan, events, events[0]);
assert.deepEqual(updated.completed, ['lesson']);
events.push({ type: 'session', id: 's1', theme: 'fork' });
assert.equal(applyPlanEvent(updated, events, events.at(-1)).completed.includes('puzzles'), false);
events.push({ type: 'session', id: 's2', theme: 'pin' });
updated = applyPlanEvent(updated, events, events.at(-1));
events.push({ type: 'mistake', id: 'm1' });
updated = applyPlanEvent(updated, events, events.at(-1));
assert.equal(planProgress(updated).complete, false);
events.push({ type: 'mistake', id: 'm2' });
updated = applyPlanEvent(updated, events, events.at(-1));
assert.equal(planProgress(updated).complete, true);
assert.equal(planProgress(applyPlanEvent(plan, [{ type: 'game', id: 'g1' }], { type: 'game', id: 'g1' })).completed, 0);
const snapshot = { plan, day: {}, events: [] };
const settings = { enabled: true, hour: 18, minute: 0 };
assert.equal(reminderRequests({ ...settings, enabled: false }, snapshot, new Date(2026, 0, 1, 12)).length, 0);
assert.equal(reminderRequests(settings, snapshot, new Date(2026, 0, 1, 12))[0].day, '2026-01-01');
assert.equal(reminderRequests(settings, { ...snapshot, plan: updated }, new Date(2026, 0, 1, 12))[0].day, '2026-01-02');
assert.equal(reminderRequests(settings, snapshot, new Date(2026, 0, 1, 19))[0].day, '2026-01-02');
assert.equal(reminderRequests({ ...settings, hour: 20, minute: 15 }, snapshot, new Date(2026, 0, 1, 12))[0].date.getHours(), 20);
assert.match(reminderRequests(settings, { ...snapshot, events: Array.from({ length: 3 }, (_, n) => ({ type: 'puzzle', id: n, theme: 'pin' })) }, new Date(2026, 0, 1, 12))[0].body, /2 puzzles/);

for (const zone of ['America/New_York', 'Europe/London', 'Pacific/Auckland', 'Asia/Tokyo', 'Africa/Lagos']) {
  const script = `
    import assert from 'node:assert/strict';
    import {localDateKey,computeStreaks,shiftDateKey} from './src/activity/calendar.js';
    import {reminderRequests} from './src/reminders/schedule.js';
    for (const [month,day] of [[2,8],[10,1],[2,29],[9,25]]) {
      const now=new Date(2026,month,day,23,59);
      const key=localDateKey(now);
      const log={}; for(let n=-2;n<=0;n++) log[shiftDateKey(key,n)]={lessons:1};
      assert.equal(computeStreaks(log,now).current,3);
      assert.equal(computeStreaks(log,new Date(2026,month,day+1,0,1)).current,3);
      const plan={lessonId:'a',theme:'pin',mistakeIds:[],completed:[]};
      const requests=reminderRequests({enabled:true,hour:18,minute:0},{plan,events:[],day:{}},new Date(2026,month,day-1,12));
      assert.equal(requests[1].day,shiftDateKey(requests[0].day,1));
      assert.equal(requests[1].date.getHours(),18);
    }
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: process.cwd(), env: { ...process.env, TZ: zone }, encoding: 'utf8' });
  assert.equal(result.status, 0, `${zone}: ${result.stderr}`);
}
console.log('Activity, daily plan, reminder timing, calendar boundaries, and five timezone/DST checks passed.');
