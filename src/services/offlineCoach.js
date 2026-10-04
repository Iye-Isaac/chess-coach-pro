import { Chess } from 'chess.js';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';

const PHASES = ['opening', 'middlegame', 'endgame'];
const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const ADVICE = {
  opening: 'Before developing a piece, check forcing moves and whether any piece is undefended.',
  middlegame: 'Before committing, compare checks, captures, and threats for both sides.',
  endgame: 'Check forcing moves first, then consider king activity and pawn promotion.',
};

function fingerprint(input) { return JSON.stringify({ version: 1, provider: 'offline', ...input }); }
function canceled(signal) {
  if (signal?.aborted) throw Object.assign(new Error('Coaching canceled.'), { name: 'AbortError' });
}

function describeBest(moment) {
  try {
    const board = new Chess(moment.fen);
    const move = board.move(moment.bestSan);
    if (board.isCheckmate()) return 'The engine’s preferred move delivers checkmate.';
    const details = [];
    if (move.captured) details.push(`captures a ${NAMES[move.captured]}`);
    if (move.promotion) details.push(`promotes to a ${NAMES[move.promotion]}`);
    if (move.flags.includes('k') || move.flags.includes('q')) details.push('castles');
    if (board.isCheck()) details.push('gives check');
    return details.length ? `This move ${details.join(' and ')}.`
      : `This moves the ${NAMES[move.piece]} from ${move.from} to ${move.to}.`;
  } catch {
    return 'Compare the engine’s preferred move with your move on the board.';
  }
}

function momentNote(moment) {
  const loss = Math.max(0, Number(moment.cpLoss) || 0);
  const label = moment.moveNumber ? `Move ${moment.moveNumber}: ` : '';
  const evaluation = loss > 0
    ? `The engine evaluated your move about ${(loss / 100).toFixed(1)} pawn${loss === 100 ? '' : 's'} below its preferred move. This is an evaluation difference, not necessarily lost material.`
    : 'The engine preferred the alternative in this position.';
  const chance = Number.isFinite(moment.winPctDrop) ? ` Estimated win chance dropped by ${Math.round(moment.winPctDrop)} percentage points.` : '';
  const line = moment.bestLine ? ` Engine continuation: ${moment.bestLine}.` : '';
  return `${label}You played ${moment.playedSan}; Stockfish preferred ${moment.bestSan}. ${describeBest(moment)} ${evaluation}${chance}${line}`;
}

export function createOfflineNotes({ criticalMoments = [], stats = {} }) {
  const moments = criticalMoments.slice(0, 3);
  const accuracy = (value) => Number.isFinite(value) ? `${Math.round(value)}%` : 'unavailable';
  const summary = `Engine accuracy: White ${accuracy(stats.whiteAccuracy)}, Black ${accuracy(stats.blackAccuracy)}. `
    + (moments.length ? `Focus on ${moments.length === 1 ? 'this verified turning point' : `these ${moments.length} verified turning points`}. Replay the best continuation, then save the position to My mistakes.`
      : 'No qualifying critical moments were found. This does not mean every move was best. Keep practicing checks, captures, and threats.');
  const notes = { overall_summary: summary, provider: 'offline' };
  for (const phase of PHASES) {
    const matching = moments.filter((moment) => moment.phase === phase);
    notes[`${phase}_review`] = matching.length ? matching.map(momentNote).join('\n\n') : '';
    notes[`${phase}_lessons`] = matching.length ? [ADVICE[phase]] : [];
  }
  return notes;
}

export async function getCachedCoachNotes(gameId, input) {
  const saved = gameId ? await getJSON(STORAGE_KEYS.writtenReview(gameId)) : null;
  return saved?.fingerprint === fingerprint(input) && saved.review?.provider === 'offline' ? saved.review : null;
}

export async function requestGameAnalysis({ gameId, signal, criticalMoments, stats }) {
  canceled(signal);
  const input = { criticalMoments, stats };
  const cached = await getCachedCoachNotes(gameId, input);
  canceled(signal);
  if (cached) return cached;
  const review = createOfflineNotes(input);
  if (gameId) await setJSON(STORAGE_KEYS.writtenReview(gameId), { fingerprint: fingerprint(input), review, createdAt: Date.now() });
  canceled(signal);
  return review;
}
