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

// FakeStream queues each operator<< fragment, not each newline-delimited UCI
// line. Assemble output before crossing the native bridge so parsers never
// receive "bestmove " and "e2e4" as unrelated events. Leave stdin unchanged.
const adapter = path.join(__dirname, '..', 'node_modules', '@loloof64', 'react-native-stockfish', 'cpp', 'react-native-stockfish.cpp');
let nativeSource = fs.readFileSync(adapter, 'utf8');
if (!nativeSource.includes('chesscoach_read_line')) {
  const helper = `
bool chesscoach_read_line(FakeStream& stream, std::string& line, std::string& pending) {
  for (;;) {
    const auto newline = pending.find('\\n');
    if (newline != std::string::npos) {
      line = pending.substr(0, newline);
      pending.erase(0, newline + 1);
      return true;
    }
    std::string fragment;
    if (!getline(stream, fragment)) return false;
    pending += fragment;
  }
}
std::string chesscoach_stdout_pending;
std::string chesscoach_stderr_pending;
`;
  if (!nativeSource.includes('namespace reactnativestockfish')) throw new Error('Stockfish output adapter changed.');
  nativeSource = nativeSource.replace('namespace reactnativestockfish', `${helper}\nnamespace reactnativestockfish`)
    .replace('getline(fakeout, data)', 'chesscoach_read_line(fakeout, data, chesscoach_stdout_pending)')
    .replace('getline(fakeerr, err_data)', 'chesscoach_read_line(fakeerr, err_data, chesscoach_stderr_pending)');
}
fs.writeFileSync(adapter, nativeSource);
console.log('Patched Stockfish output to emit complete UCI lines.');
