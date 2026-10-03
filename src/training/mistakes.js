import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';
import { getDueCount } from './scheduler';

function idForFen(fen) {
  let hash = 2166136261;
  for (let index = 0; index < fen.length; index += 1) hash = Math.imul(hash ^ fen.charCodeAt(index), 16777619);
  return `mistake-${(hash >>> 0).toString(16)}`;
}

export function normalizeMistake(record, now = Date.now()) {
  const fen = String(record?.fen || '');
  if (!fen) return null;
  const createdAt = Number(record.createdAt || record.ts) || now;
  const box = Math.max(1, Math.min(5, Math.floor(Number(record.box) || 1)));
  return {
    id: String(record.id || idForFen(fen)),
    fen,
    sideToMove: record.sideToMove || fen.split(' ')[1] || 'w',
    playedSan: String(record.playedSan || ''),
    bestSan: String(record.bestSan || ''),
    altBestSans: Array.isArray(record.altBestSans) ? record.altBestSans : [],
    bestLine: String(record.bestLine || record.bestSan || ''),
    cpLoss: Math.max(0, Number(record.cpLoss) || 0),
    phase: String(record.phase || 'middlegame'),
    sourceGameId: String(record.sourceGameId || record.gameId || ''),
    createdAt,
    box,
    dueAt: Number.isFinite(Number(record.dueAt)) ? Number(record.dueAt) : createdAt,
    history: Array.isArray(record.history) ? record.history : [],
  };
}

export function normalizeMistakes(records, now = Date.now()) {
  const unique = [];
  const seenFens = new Set();
  for (const raw of Array.isArray(records) ? records : []) {
    const record = normalizeMistake(raw, now);
    if (!record || seenFens.has(record.fen)) continue;
    seenFens.add(record.fen);
    unique.push(record);
  }
  return unique;
}

export function makeMistakeRecord(moment, sourceGameId, now = Date.now()) {
  const fen = String(moment.fenBefore || moment.fen || '');
  return normalizeMistake({
    id: idForFen(fen),
    fen,
    sideToMove: fen.split(' ')[1] || 'w',
    playedSan: moment.san || moment.playedSan,
    bestSan: moment.bestSan,
    altBestSans: moment.altBestSans || [],
    bestLine: moment.bestLine || moment.bestSan,
    cpLoss: moment.cpLoss,
    phase: moment.phase,
    sourceGameId,
    createdAt: now,
    box: 1,
    dueAt: now,
    history: [],
  }, now);
}

export async function loadMistakes() {
  const saved = await getJSON(STORAGE_KEYS.mistakes, []);
  const records = normalizeMistakes(saved);
  if (JSON.stringify(saved) !== JSON.stringify(records)) await setJSON(STORAGE_KEYS.mistakes, records);
  return records;
}

export async function saveMistakeMoments(moments, sourceGameId, now = Date.now()) {
  const records = await loadMistakes();
  const seenFens = new Set(records.map((record) => record.fen));
  let addedCount = 0;
  for (const moment of moments || []) {
    const fen = String(moment?.fenBefore || moment?.fen || '');
    if (!fen || seenFens.has(fen)) continue;
    records.unshift(makeMistakeRecord(moment, sourceGameId, now));
    seenFens.add(fen);
    addedCount += 1;
  }
  const saved = await setJSON(STORAGE_KEYS.mistakes, records);
  if (!saved) throw new Error('Could not save these positions on this device.');
  return { records, addedCount, dueCount: getDueCount(records, now) };
}

export async function loadAutoSaveBlunders() {
  const setting = await getJSON(STORAGE_KEYS.autoSaveBlunders, true);
  return setting !== false;
}

export async function saveAutoSaveBlunders(enabled) {
  return setJSON(STORAGE_KEYS.autoSaveBlunders, Boolean(enabled));
}
