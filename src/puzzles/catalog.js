import puzzleData from '../data/puzzles.json';

export const PUZZLE_THEMES = [
  'mateIn1', 'mateIn2', 'mateIn3', 'fork', 'pin', 'skewer', 'hangingPiece',
  'backRankMate', 'discoveredAttack', 'deflection', 'endgame', 'middlegame', 'opening',
];

export function themeLabel(theme) {
  const labels = {
    mateIn1: 'Mate in 1',
    mateIn2: 'Mate in 2',
    mateIn3: 'Mate in 3',
    hangingPiece: 'Hanging piece',
    backRankMate: 'Back rank mate',
    discoveredAttack: 'Discovered attack',
  };
  return labels[theme] || theme.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export function puzzlesForTheme(theme) {
  return puzzleData.filter((puzzle) => !theme || puzzle.themes.includes(theme));
}

export function pickPuzzleSession(rating, theme, history, size = 5) {
  const alreadyPlayed = new Set((history || []).map((entry) => entry.id));
  const session = [];
  const available = puzzlesForTheme(theme).filter((puzzle) => !alreadyPlayed.has(puzzle.id));
  const nearest = available
    .map((puzzle) => ({ puzzle, distance: Math.abs(puzzle.rating - rating) }))
    .sort((a, b) => a.distance - b.distance);

  while (session.length < size && nearest.length) {
    const poolSize = Math.min(nearest.length, Math.max(12, size * 3));
    const poolIndex = Math.floor(Math.random() * poolSize);
    session.push(nearest.splice(poolIndex, 1)[0].puzzle);
  }
  return session;
}

export function ratingAfterPuzzle(rating, puzzleRating, solved) {
  const expected = 1 / (1 + (10 ** ((puzzleRating - rating) / 400)));
  return Math.round(rating + 32 * ((solved ? 1 : 0) - expected));
}

export function uciToMove(uci) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    ...(uci.length > 4 ? { promotion: uci[4] } : {}),
  };
}

export function moveToUci(move) {
  return `${move.from}${move.to}${move.promotion || ''}`;
}

export function initialPuzzleRating(level) {
  if (level === 'I play casually') return 1000;
  if (level === 'I play regularly') return 1400;
  if (level === 'I know the rules') return 700;
  return 800;
}
