#!/usr/bin/env node

// Build the app's offline puzzle catalog from an already decompressed Lichess CSV.
// Usage: node scripts/build-puzzles.js path/to/lichess_db_puzzle.csv
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const THEMES = [
  'mateIn1', 'mateIn2', 'mateIn3', 'fork', 'pin', 'skewer', 'hangingPiece',
  'backRankMate', 'discoveredAttack', 'deflection', 'endgame', 'middlegame', 'opening',
];
const THEME_SET = new Set(THEMES);
const RATING_MIN = 400;
const RATING_MAX = 2000;
const RATING_BUCKET_SIZE = 200;
const PER_THEME_CAP = 46;
const TARGET_SIZE = 598;
const CANDIDATES_PER_THEME_RATING = 256;
const REQUIRED_COLUMNS = [
  'PuzzleId', 'FEN', 'Moves', 'Rating', 'RatingDeviation', 'Popularity',
  'NbPlays', 'Themes', 'GameUrl', 'OpeningTags',
];

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function hash32(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableOrder(a, b) {
  return a.rank - b.rank || a.id.localeCompare(b.id);
}

function ratingBucket(rating) {
  return Math.min(
    (RATING_MAX - RATING_MIN) / RATING_BUCKET_SIZE,
    Math.floor((rating - RATING_MIN) / RATING_BUCKET_SIZE),
  );
}

function createPools() {
  return Array.from({ length: 9 }, () => new Map());
}

function addToPool(pools, bucket, theme, puzzle) {
  let pool = pools[bucket].get(theme);
  if (!pool) {
    pool = { seen: 0, entries: [] };
    pools[bucket].set(theme, pool);
  }
  pool.seen += 1;
  if (pool.entries.length < CANDIDATES_PER_THEME_RATING) {
    pool.entries.push(puzzle);
    return;
  }
  const sampleIndex = hash32(`${puzzle.id}:${theme}:${pool.seen}`) % pool.seen;
  if (sampleIndex < CANDIDATES_PER_THEME_RATING) pool.entries[sampleIndex] = puzzle;
}

async function readPuzzles(csvPath) {
  const input = fs.createReadStream(csvPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let columnIndex;
  const pools = createPools();

  for await (const line of lines) {
    if (!columnIndex) {
      const headers = parseCsvLine(line).map((name) => name.replace(/^\uFEFF/, ''));
      const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
      if (missing.length) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
      columnIndex = Object.fromEntries(headers.map((name, index) => [name, index]));
      continue;
    }

    if (!line) continue;
    const row = parseCsvLine(line);
    const value = (name) => row[columnIndex[name]] || '';
    const rating = Number(value('Rating'));
    const ratingDeviation = Number(value('RatingDeviation'));
    const popularity = Number(value('Popularity'));
    const plays = Number(value('NbPlays'));
    if (
      !Number.isFinite(rating) || rating < RATING_MIN || rating > RATING_MAX
      || !value('RatingDeviation') || !(ratingDeviation < 100)
      || popularity < 85 || plays < 500
    ) continue;

    const themes = value('Themes').split(/\s+/).filter((theme) => THEME_SET.has(theme));
    const moves = value('Moves').trim().split(/\s+/).filter(Boolean);
    if (!themes.length || moves.length < 2) continue;
    const puzzle = {
      id: value('PuzzleId'),
      fen: value('FEN'),
      moves,
      rating,
      themes,
      rank: hash32(value('PuzzleId')),
    };
    const bucket = ratingBucket(rating);
    for (const theme of themes) addToPool(pools, bucket, theme, puzzle);
  }

  if (!columnIndex) throw new Error('CSV is empty.');
  return pools;
}

function selectPuzzles(buckets) {
  for (const bucket of buckets) {
    for (const pool of bucket.values()) pool.entries.sort(stableOrder);
  }
  const selected = new Map();
  const selectedCountByTheme = new Map(THEMES.map((theme) => [theme, 0]));
  const cursors = new Map();
  let round = 0;
  let madeProgress = true;

  while (selected.size < TARGET_SIZE && madeProgress) {
    madeProgress = false;
    const bucketIndex = round % buckets.length;
    for (const theme of THEMES) {
      if (selectedCountByTheme.get(theme) >= PER_THEME_CAP) continue;
        const key = `${theme}:${bucketIndex}`;
        const entries = buckets[bucketIndex].get(theme)?.entries || [];
        let cursor = cursors.get(key) || 0;
        while (cursor < entries.length && selected.has(entries[cursor].id)) cursor += 1;
        cursors.set(key, cursor + 1);
        if (cursor >= entries.length) continue;

        const puzzle = entries[cursor];
        // Give each selected puzzle one balanced practice category. Keeping every
        // source tag would consume several theme quotas for the same puzzle and
        // leave the offline catalog far below its ~600-puzzle target.
        selected.set(puzzle.id, { ...puzzle, themes: [theme] });
        selectedCountByTheme.set(theme, selectedCountByTheme.get(theme) + 1);
        madeProgress = true;
      if (selected.size >= TARGET_SIZE) break;
    }
    round += 1;
  }

  return {
    puzzles: [...selected.values()].sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id)),
    counts: Object.fromEntries(selectedCountByTheme),
  };
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    throw new Error('Provide the path to an already decompressed Lichess puzzle CSV.');
  }
  if (!fs.existsSync(csvPath) || !fs.statSync(csvPath).isFile()) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const pools = await readPuzzles(path.resolve(csvPath));
  const { puzzles, counts } = selectPuzzles(pools);
  const outputPath = path.resolve(__dirname, '../src/data/puzzles.json');
  fs.writeFileSync(outputPath, JSON.stringify(puzzles.map(({ rank, ...puzzle }) => puzzle)));
  console.log(`Wrote ${puzzles.length} puzzles to ${outputPath}`);
  console.log(`Per-theme totals: ${JSON.stringify(counts)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
