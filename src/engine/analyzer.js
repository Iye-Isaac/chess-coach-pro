import { Chess } from 'chess.js';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';

export const ANALYSIS_CONFIG = {
  moveTimeMs: 300,
  multipv: 2,
  thresholds: { inaccuracy: 5, mistake: 10, blunder: 20 },
  decisiveEvalCp: 700,
};

let engine = null;
let engineReady = false;
let engineUnavailable = false;
let coachGameActive = false;
let lockTail = Promise.resolve();
const outputListeners = new Set();
const stateListeners = new Set();

export function registerAnalysisEngine(api) {
  engine = api;
  engineReady = false;
  engineUnavailable = false;
  notifyState();
  return () => {
    if (engine === api) {
      engine = null;
      engineReady = false;
      notifyState();
    }
  };
}

export function markAnalysisEngineReady() {
  engineReady = true;
  engineUnavailable = false;
  notifyState();
}

export function markAnalysisEngineUnavailable() {
  engineUnavailable = true;
  notifyState();
}

export function publishEngineOutput(output) {
  outputListeners.forEach((listener) => listener(String(output || '')));
}

export function setCoachGameActive(active) {
  coachGameActive = Boolean(active);
  notifyState();
}

function notifyState() { stateListeners.forEach((listener) => listener()); }

function abortError() {
  const error = new Error('Analysis cancelled.');
  error.name = 'AbortError';
  return error;
}

function assertNotAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function waitForState(signal, timeout = 300) {
  return new Promise((resolve, reject) => {
    const finish = () => {
      clearTimeout(timer);
      stateListeners.delete(check);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    };
    const check = () => finish();
    const onAbort = () => {
      clearTimeout(timer);
      stateListeners.delete(check);
      reject(abortError());
    };
    const timer = setTimeout(finish, timeout);
    stateListeners.add(check);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });
}

async function waitForAnalysisTurn(signal, onWaiting) {
  while (coachGameActive || !engine || !engineReady) {
    assertNotAborted(signal);
    if (engineUnavailable) throw new Error('On-device Stockfish could not start. Use the installed native development build; Expo Go does not include the engine.');
    onWaiting?.(coachGameActive ? 'Analysis will resume after your game' : 'Waiting for Stockfish to be ready…');
    await waitForState(signal);
  }
}

export async function withStockfishLock(task, signal) {
  let release;
  const previous = lockTail;
  lockTail = new Promise((resolve) => { release = resolve; });
  await previous;
  try {
    assertNotAborted(signal);
    return await task();
  } finally {
    release();
  }
}

function scoreToWhite(cp, mate, fen) {
  let score = mate != null ? Math.sign(mate || 1) * ANALYSIS_CONFIG.decisiveEvalCp : cp || 0;
  score = Math.max(-1000, Math.min(1000, score));
  return fen.split(' ')[1] === 'w' ? score : -score;
}

export function winPercent(cpWhite) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cpWhite)) - 1);
}

function classify(drop) {
  if (drop >= ANALYSIS_CONFIG.thresholds.blunder) return 'blunder';
  if (drop >= ANALYSIS_CONFIG.thresholds.mistake) return 'mistake';
  if (drop >= ANALYSIS_CONFIG.thresholds.inaccuracy) return 'inaccuracy';
  return drop < 1 ? 'best' : 'good';
}

function phaseFor(fen, ply) {
  const board = new Chess(fen).board();
  let material = 0;
  for (const row of board) for (const piece of row) {
    if (piece && piece.type !== 'k' && piece.type !== 'p') material += ({ q: 9, r: 5, b: 3, n: 3 })[piece.type] || 0;
  }
  if (material <= 13 || ply >= 80) return 'endgame';
  if (ply < 20 && material >= 42) return 'opening';
  return 'middlegame';
}

function uciFor(move) { return `${move.from}${move.to}${move.promotion || ''}`; }

function parseInfo(lines, fen) {
  const candidates = new Map();
  let bestMove = null;
  for (const line of lines) {
    if (line.includes('info ')) {
      const depthMatch = line.match(/\bdepth\s+(\d+)/);
      const rankMatch = line.match(/\bmultipv\s+(\d+)/);
      const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
      const pvMatch = line.match(/\bpv\s+(.+)$/);
      if (depthMatch && scoreMatch && pvMatch) {
      const rank = Number(rankMatch?.[1] || 1);
      const cp = scoreMatch[1] === 'cp' ? Number(scoreMatch[2]) : null;
      const mate = scoreMatch[1] === 'mate' ? Number(scoreMatch[2]) : null;
      const pv = pvMatch[1].trim().split(/\s+/).filter((move) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move));
      const item = { depth: Number(depthMatch[1]), cp, mate, scoreWhite: scoreToWhite(cp, mate, fen), pv, uci: pv[0] };
      if (!candidates.has(rank) || candidates.get(rank).depth <= item.depth) candidates.set(rank, item);
      }
    }
    const best = line.match(/\bbestmove\s+([a-h][1-8][a-h][1-8][qrbn]?|0000)/);
    if (best) bestMove = best[1] === '0000' ? null : best[1];
  }
  const top = candidates.get(1);
  return {
    bestMove: bestMove || top?.uci || null,
    bestLineUci: top?.pv || [],
    scoreWhite: top?.scoreWhite ?? null,
    alternatives: [...candidates.entries()].filter(([rank]) => rank > 1).map(([, item]) => ({ uci: item.uci, scoreWhite: item.scoreWhite })),
  };
}

async function analyzePosition(fen, signal, onWaiting) {
  await waitForAnalysisTurn(signal, onWaiting);
  const result = await withStockfishLock(async () => {
    if (coachGameActive) return null;
    const activeEngine = engine;
    if (!activeEngine || !engineReady) throw new Error('On-device Stockfish could not start. Use the installed native development build; Expo Go does not include the engine.');
    assertNotAborted(signal);
    const lines = [];
    let completed = false;
    let failure = null;
    let rejectSearch;
    let resolveSearch;
    const search = new Promise((resolve, reject) => { resolveSearch = resolve; rejectSearch = reject; });
    const onOutput = (chunk) => {
      const nextLines = String(chunk || '').split(/\r?\n/).filter((line) => line.trim());
      lines.push(...nextLines);
      if (nextLines.some((line) => /\bbestmove\b/.test(line))) {
        completed = true;
        if (failure) rejectSearch(failure);
        else resolveSearch(parseInfo(lines, fen));
      }
    };
    const cancel = () => {
      if (completed) return;
      failure = abortError();
      activeEngine.sendCommandToStockfish('stop');
    };
    outputListeners.add(onOutput);
    signal?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => {
      if (!completed) {
        failure = new Error('Stockfish did not finish this analysis position.');
        activeEngine.sendCommandToStockfish('stop');
        setTimeout(() => {
          if (!completed) {
            completed = true;
            rejectSearch(failure);
          }
        }, 1500);
      }
    }, ANALYSIS_CONFIG.moveTimeMs + 5000);
    try {
      activeEngine.sendCommandToStockfish(`setoption name MultiPV value ${ANALYSIS_CONFIG.multipv}`);
      activeEngine.sendCommandToStockfish('setoption name UCI_LimitStrength value false');
      activeEngine.sendCommandToStockfish(`position fen ${fen}`);
      activeEngine.sendCommandToStockfish(`go movetime ${ANALYSIS_CONFIG.moveTimeMs}`);
      return await search;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      outputListeners.delete(onOutput);
    }
  }, signal);
  return result || analyzePosition(fen, signal, onWaiting);
}

function parseGame(game) {
  if (!game?.pgn || typeof game.pgn !== 'string') throw new Error('This game has no PGN to analyze.');
  const loaded = new Chess();
  try { loaded.loadPgn(game.pgn, { strict: false }); } catch { throw new Error('This game PGN could not be read.'); }
  const moves = loaded.history({ verbose: true });
  const fenTag = game.pgn.match(/^\[FEN\s+"([^"]+)"\]/mi)?.[1];
  const initialFen = fenTag || new Chess().fen();
  const replay = new Chess(initialFen);
  const positions = [replay.fen()];
  for (const item of moves) {
    try { replay.move({ from: item.from, to: item.to, promotion: item.promotion }); } catch { throw new Error('The PGN contains an invalid move.'); }
    positions.push(replay.fen());
  }
  return { moves, positions };
}

function gameIdentity(game) {
  if (game.id || game.url) return String(game.id || game.url);
  if (game.pgn) {
    let hash = 2166136261;
    for (let index = 0; index < game.pgn.length; index += 1) hash = Math.imul(hash ^ game.pgn.charCodeAt(index), 16777619);
    return `pgn-${(hash >>> 0).toString(16)}`;
  }
  return `${game.end_time || game.date || 'game'}-${game.white?.username || ''}-${game.black?.username || ''}`;
}

function calculateReview(game, moves, positions, evaluations, username) {
  const ownColor = game.playerColor || (game.white?.username && username && game.white.username.toLowerCase() === username.toLowerCase() ? 'w'
    : game.black?.username && username && game.black.username.toLowerCase() === username.toLowerCase() ? 'b'
      : game.mode === 'coach' ? (game.white?.username === 'Stockfish Coach' ? 'b' : 'w') : null);
  const result = moves.map((move, index) => {
    const before = evaluations[index] || {};
    const after = evaluations[index + 1] || {};
    const color = move.color;
    const bestWhite = before.scoreWhite ?? 0;
    const playedWhite = after.scoreWhite ?? bestWhite;
    const bestForMover = color === 'w' ? bestWhite : -bestWhite;
    const playedForMover = color === 'w' ? playedWhite : -playedWhite;
    const lossCp = Math.max(0, bestForMover - playedForMover);
    const drop = Math.max(0, winPercent(bestForMover) - winPercent(playedForMover));
    const scratch = new Chess(positions[index]);
    const bestUci = before.bestMove;
    let bestSan = 'No legal move';
    if (bestUci) {
      try { bestSan = scratch.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] || 'q' }).san; } catch {}
    }
    const altBestSans = (before.alternatives || []).filter((alternative) => {
      if (!alternative.uci || alternative.scoreWhite == null) return false;
      const scoreForMover = color === 'w' ? alternative.scoreWhite : -alternative.scoreWhite;
      return alternative.uci !== bestUci && Math.abs(bestForMover - scoreForMover) <= 30;
    }).map((alternative) => {
      try {
        return new Chess(positions[index]).move({
          from: alternative.uci.slice(0, 2), to: alternative.uci.slice(2, 4), promotion: alternative.uci[4] || 'q',
        }).san;
      } catch { return null; }
    }).filter(Boolean);
    const lineGame = new Chess(positions[index]);
    const bestLine = [];
    for (const uci of (before.bestLineUci || []).slice(0, 5)) {
      try {
        bestLine.push(lineGame.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || 'q' }).san);
      } catch { break; }
    }
    const phase = phaseFor(positions[index], index);
    return {
      ply: index + 1, moveNumber: Math.floor(index / 2) + 1, color, san: move.san, uci: uciFor(move),
      fenBefore: positions[index], fenAfter: positions[index + 1], bestUci, bestSan,
      sideToMove: color, altBestSans, bestLine: bestLine.join(' '),
      evalWhite: bestWhite, playedEvalWhite: playedWhite, cpLoss: lossCp, winPctDrop: drop,
      classification: classify(drop), phase,
    };
  });
  const sideStats = (color) => {
    const sideMoves = result.filter((item) => item.color === color);
    const avgDrop = sideMoves.length ? sideMoves.reduce((sum, item) => sum + item.winPctDrop, 0) / sideMoves.length : 0;
    return {
      accuracy: Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * avgDrop) - 3.1669)),
      counts: ['inaccuracy', 'mistake', 'blunder'].reduce((counts, label) => ({ ...counts, [label]: sideMoves.filter((item) => item.classification === label).length }), {}),
    };
  };
  const eligible = result.filter((move) => (ownColor ? move.color === ownColor : game.mode !== 'coach' || move.color !== 'b')
    && Math.abs(move.evalWhite) < ANALYSIS_CONFIG.decisiveEvalCp && move.cpLoss >= 20);
  const criticalMoments = eligible.sort((a, b) => b.cpLoss - a.cpLoss).slice(0, 3);
  return {
    gameId: gameIdentity(game), analyzedAt: Date.now(), moves: result, positions, evaluations,
    white: sideStats('w'), black: sideStats('b'), userColor: ownColor, criticalMoments,
    totalPlies: moves.length,
  };
}

export async function analyzeGame({ pgn, game: sourceGame, username, onProgress, signal }) {
  const game = { ...(sourceGame || {}), pgn: pgn || sourceGame?.pgn };
  const id = gameIdentity(game);
  const cacheKey = STORAGE_KEYS.analysis(id);
  const cached = await getJSON(cacheKey);
  if (cached?.moves?.length != null) return cached;
  const { moves, positions } = parseGame(game);
  const partialKey = STORAGE_KEYS.analysisPartial(id);
  const partial = await getJSON(partialKey);
  const evaluations = partial?.pgn === game.pgn && partial.moveTimeMs === ANALYSIS_CONFIG.moveTimeMs && Array.isArray(partial.evaluations)
    ? partial.evaluations.slice(0, positions.length) : [];
  const total = positions.length;
  for (let index = evaluations.length; index < total; index += 1) {
    assertNotAborted(signal);
    const waitingForGame = coachGameActive;
    onProgress?.({ current: index, total, waiting: waitingForGame, message: waitingForGame ? 'Analysis will resume after your game' : `Analyzing position ${index + 1} of ${total}` });
    evaluations.push(await analyzePosition(positions[index], signal, (message) => onProgress?.({ current: index, total, waiting: true, message })));
    await setJSON(partialKey, { pgn: game.pgn, moveTimeMs: ANALYSIS_CONFIG.moveTimeMs, evaluations });
    onProgress?.({ current: index + 1, total, message: `Analyzed ${index + 1} of ${total} positions` });
  }
  const result = calculateReview(game, moves, positions, evaluations, username);
  await setJSON(cacheKey, result);
  await setJSON(partialKey, null);
  return result;
}
