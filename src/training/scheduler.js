export const BOX_INTERVALS = [
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
];

function clampBox(box) {
  const value = Number(box) || 1;
  return Math.max(1, Math.min(5, Math.floor(value)));
}

export function nextState(record, correct, now = Date.now()) {
  const box = clampBox(record.box);
  const nextBox = correct ? Math.min(5, box + 1) : 1;
  return {
    ...record,
    box: nextBox,
    dueAt: now + BOX_INTERVALS[nextBox - 1],
    history: [
      ...(Array.isArray(record.history) ? record.history : []),
      { ts: now, correct: Boolean(correct) },
    ],
  };
}

export function dueRecords(records, now = Date.now()) {
  if (!Array.isArray(records)) return [];
  return records
    .filter((record) => Number.isFinite(Number(record?.dueAt)) && Number(record.dueAt) <= now)
    .slice()
    .sort((left, right) => Number(left.dueAt) - Number(right.dueAt));
}

export function getDueCount(records, now = Date.now()) {
  return dueRecords(records, now).length;
}
