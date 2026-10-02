const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'node_modules', '@loloof64', 'react-native-stockfish', 'android', 'src', 'main', 'java', 'com', 'loloof64', 'reactnativestockfish', 'ReactNativeStockfishModule.kt');
if (!fs.existsSync(file)) {
  console.log('Stockfish Android module not installed; skipping its Android-only output patch.');
  process.exit(0);
}

let source = fs.readFileSync(file, 'utf8');
for (const channel of ['stockfish-output', 'stockfish-error']) {
  const expression = new RegExp(`(\\.emit\\("${channel}", output\\))\\r?\\n\\s*delay\\(delayTimeMs\\)`);
  if (expression.test(source)) source = source.replace(expression, '$1');
  else if (!source.includes(`.emit("${channel}", output)`)) throw new Error(`Could not find ${channel} emission in the installed Stockfish wrapper.`);
}

fs.writeFileSync(file, source);
console.log('Patched Stockfish native output polling to avoid delaying each UCI fragment.');
