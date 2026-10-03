import assert from 'node:assert/strict';
import { BOX_INTERVALS, dueRecords, getDueCount, nextState } from '../src/training/scheduler.js';

const now = 1_000_000;
const original = { id: 'm1', box: 1, dueAt: now, history: [] };

const promoted = nextState(original, true, now);
assert.equal(promoted.box, 2);
assert.equal(promoted.dueAt, now + BOX_INTERVALS[1]);
assert.deepEqual(promoted.history, [{ ts: now, correct: true }]);

const reset = nextState({ ...original, box: 4 }, false, now);
assert.equal(reset.box, 1);
assert.equal(reset.dueAt, now + BOX_INTERVALS[0]);
assert.deepEqual(reset.history, [{ ts: now, correct: false }]);

const mature = nextState({ ...original, box: 5 }, true, now);
assert.equal(mature.box, 5);
assert.equal(mature.dueAt, now + BOX_INTERVALS[4]);

const records = [original, { id: 'future', box: 1, dueAt: now + 5 }];
assert.deepEqual(dueRecords(records, now).map((record) => record.id), ['m1']);
assert.equal(getDueCount(records, now), 1);

console.log('Scheduler checks passed.');
