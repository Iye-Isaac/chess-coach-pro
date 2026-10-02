export const resources = [
  { kind: 'BOOK', title: 'Logical Chess: Move by Move', author: 'Irving Chernev', note: 'Learn how strong players make every move count.' },
  { kind: 'OPENING', title: 'Build a dependable opening', author: 'A practical study plan', note: 'Focus on development, king safety, and the centre.' },
  { kind: 'ENDGAME', title: 'The essential king and pawn endings', author: 'Core technique', note: 'Practise opposition and the rule of the square.' },
  { kind: 'TACTICS', title: 'Look for forcing moves', author: 'Daily habit', note: 'Checks, captures, and threats reveal candidate moves.' },
];

export const samplePuzzle = {
  fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
  from: 'g6',
  to: 'g7',
  title: 'Find the checkmate',
  prompt: 'White to move. Finish the game in one move.',
  solution: 'Qg7#',
};
