const fs = require('node:fs');
const path = require('node:path');
const { Chess } = require('chess.js');

const file = path.join(__dirname, '..', 'src', 'data', 'lessons.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];

for (const lesson of catalog.lessons || []) {
  if (!Array.isArray(lesson.steps)) {
    errors.push(`${lesson.id}: steps must be an array`);
    continue;
  }
  for (const [index, step] of lesson.steps.entries()) {
    const label = `${lesson.id}, step ${index + 1}`;
    if (step.fen) {
      try {
        new Chess(step.fen);
      } catch (error) {
        errors.push(`${label}: illegal FEN: ${error.message}`);
        continue;
      }
    }
    if (step.type === 'demo') {
      try {
        const game = new Chess(step.fen);
        for (const uci of step.moves || []) {
          const from = uci.slice(0, 2);
          const to = uci.slice(2, 4);
          const promotion = uci[4];
          const move = game.move({ from, to, ...(promotion ? { promotion } : {}) });
          if (!move) throw new Error(`move ${uci} was rejected`);
        }
      } catch (error) {
        errors.push(`${label}: illegal demo line: ${error.message}`);
      }
    }
    if (step.type === 'try') {
      try {
        const position = new Chess(step.fen);
        for (const san of step.expect || []) {
          const game = new Chess(position.fen());
          const move = game.move(san);
          if (!move) errors.push(`${label}: expected move is illegal: ${san}`);
        }
        if (!step.expect?.length) errors.push(`${label}: try step needs at least one expected SAN move`);
      } catch (error) {
        errors.push(`${label}: expected move is illegal: ${error.message}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Lesson validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${catalog.lessons.length} lessons and all FENs, demo moves, and try moves.`);
}
