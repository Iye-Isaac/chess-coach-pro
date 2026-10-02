import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Chess } from 'chess.js';
let useNativeStockfish = null;
try { useNativeStockfish = require('@loloof64/react-native-stockfish').useStockfish; } catch { /* Expo Go has no Stockfish native module. */ }
import { fetchRecentGames, gameDate, opponentName, recentPlayerRating, resultLabel } from './src/services/chessCom';
import { isCoachBackendConfigured, requestGameAnalysis } from './src/services/coachApi';
import { resources, samplePuzzle } from './src/data/resources';

const C = {
  bg: '#f6f5f0', paper: '#ffffff', ink: '#1d211b', muted: '#787d73', faint: '#a2a59c',
  line: '#e9e8e1', soft: '#eeeee8', green: '#243b2c', green2: '#354c38', amber: '#c88927',
  amberSoft: '#f6ebd8', greenSoft: '#e9efe6', boardLight: '#f0eee2', boardDark: '#83927b',
  red: '#b54d43', white: '#fffdf3',
};
const TABS = [
  { id: 'home', mark: '⌂', label: 'Home' }, { id: 'review', mark: '◉', label: 'Review' },
  { id: 'train', mark: '♟', label: 'Train' }, { id: 'play', mark: '♜', label: 'Play' },
  { id: 'library', mark: '▤', label: 'Library' },
];
const PIECE_NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

const PIECE_SHAPES = {
  k: <><Path d="M47 8h6v9h9v6h-9v8h-6v-8h-9v-6h9z" /><Path d="M35 34c0-5 6-8 15-8s15 3 15 8l-3 7H38z" /><Path d="M39 40h22l4 25H35z" /><Path d="M31 65h38l5 9H26z" /><Path d="M22 74h56v9H22z" /></>,
  q: <><Path d="M23 24l13 12 14-20 14 20 13-12-7 29H30z" /><Circle cx="23" cy="20" r="5" /><Circle cx="50" cy="14" r="5" /><Circle cx="77" cy="20" r="5" /><Path d="M31 53h38l4 12H27z" /><Path d="M25 65h50v9H25z" /><Path d="M21 74h58v9H21z" /></>,
  r: <><Path d="M27 18h12v9h8v-9h9v9h8v-9h10v22H27z" /><Path d="M32 40h36l-4 25H36z" /><Path d="M28 65h44v9H28z" /><Path d="M22 74h56v9H22z" /></>,
  b: <><Path d="M50 13c11 8 15 15 13 24l-6 8H43l-6-8c-2-9 2-16 13-24z" /><Path d="M43 31l14 12" /><Path d="M36 47h28l4 18H32z" /><Path d="M28 65h44v9H28z" /><Path d="M22 74h56v9H22z" /></>,
  n: <><Path d="M31 65c2-10-1-21 1-30 2-9 11-15 23-21l5 14 10 8-6 9 5 20z" /><Path d="M41 36l3 2" /><Path d="M35 65h34l5 9H29z" /><Path d="M22 74h56v9H22z" /></>,
  p: <><Circle cx="50" cy="25" r="12" /><Path d="M42 38h16c-1 9 3 14 8 21l3 6H31l3-6c5-7 9-12 8-21z" /><Path d="M29 65h42v9H29z" /><Path d="M22 74h56v9H22z" /></>,
};

function ChessPiece({ color, type, size }) {
  const light = color === 'w';
  const fill = light ? '#fffdf5' : '#26352b';
  const stroke = light ? '#26352b' : '#fffdf5';
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${light ? 'White' : 'Black'} ${PIECE_NAMES[type]}`}>
    <Path d="M22 84h56v4H22z" fill="#18251c" opacity="0.18" />
    <GPiece fill={fill} stroke={stroke}>{PIECE_SHAPES[type]}</GPiece>
  </Svg>;
}

function GPiece({ children, fill, stroke }) {
  return <G fill={fill} stroke={stroke} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">{children}</G>;
}

function useStockfishEngine({ onOutput, onError }) {
  if (useNativeStockfish) return useNativeStockfish({ onOutput, onError });
  useEffect(() => {}, []);
  return { stockfishLoop: () => {}, stopStockfish: () => {}, sendCommandToStockfish: () => {} };
}

function Button({ title, onPress, secondary = false, disabled = false, busy = false, compact = false, style }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || busy} style={({ pressed }) => [
      styles.button, secondary ? styles.buttonSecondary : styles.buttonPrimary,
      compact && styles.buttonCompact, (disabled || busy) && styles.buttonDisabled,
      pressed && !disabled && styles.pressed, style,
    ]}>
      {busy ? <ActivityIndicator color={secondary ? C.green : '#fff'} size="small" /> :
        <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary, compact && styles.buttonTextCompact]}>{title}</Text>}
    </Pressable>
  );
}

function SectionTitle({ eyebrow, title, detail, action }) {
  return <View style={styles.sectionHead}>
    <View style={{ flex: 1 }}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!detail && <Text style={styles.bodyMuted}>{detail}</Text>}
    </View>
    {action}
  </View>;
}

function Badge({ children, tone = 'green' }) {
  return <View style={[styles.badge, tone === 'amber' ? styles.badgeAmber : tone === 'neutral' ? styles.badgeNeutral : null]}>
    <Text style={[styles.badgeText, tone === 'amber' ? styles.badgeTextAmber : tone === 'neutral' ? styles.badgeTextNeutral : null]}>{children}</Text>
  </View>;
}

function Empty({ mark = '♟', title, detail }) {
  return <View style={styles.empty}>
    <View style={styles.emptyMark}><Text style={styles.emptyMarkText}>{mark}</Text></View>
    <Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>
  </View>;
}

function GameRow({ game, username, onPress }) {
  const won = resultLabel(game, username) === 'Win';
  const drawn = resultLabel(game, username) === 'Draw';
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.gameRow, pressed && styles.pressed]}>
    <View style={[styles.resultDot, { backgroundColor: won ? '#6c9561' : drawn ? '#b29a66' : '#b87469' }]} />
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>vs. {opponentName(game, username)}</Text>
      <Text style={styles.rowSub}>{gameDate(game.end_time)}  ·  {game.time_class || 'chess'}  ·  {game.white?.rating || '—'}–{game.black?.rating || '—'}</Text>
    </View>
    <Text style={[styles.resultText, { color: won ? '#557e4d' : drawn ? '#947735' : C.muted }]}>{resultLabel(game, username)}</Text>
    <Text style={styles.rowChevron}>›</Text>
  </Pressable>;
}

function ChessBoard({ game, fen, selected, legalMoves, onSquare, width, orientation = 'w' }) {
  const board = game.board();
  const size = Math.min(width, 430);
  const ranks = orientation === 'w' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const files = orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  return <View style={[styles.board, { width: size, height: size }]}>
    {ranks.map((rank) => files.map((file) => {
      const square = `${'abcdefgh'[file]}${rank + 1}`;
      const piece = board[7 - rank][file];
      const chosen = selected === square;
      const legal = legalMoves.includes(square);
      const capture = legal && !!piece;
      const pale = (rank + file) % 2 === 1;
      return <Pressable key={square} accessibilityRole="button" accessibilityLabel={`${piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[piece.type]}, ` : ''}${square}`} onPress={() => onSquare(square)} style={[
        styles.square, { width: size / 8, height: size / 8, backgroundColor: chosen ? '#c4cd76' : pale ? C.boardLight : C.boardDark },
      ]}>
        {legal && !piece && <View style={styles.legalDot} />}
        {capture && <View style={styles.captureRing} />}
        {!!piece && <View pointerEvents="none" style={styles.pieceWrap}><ChessPiece color={piece.color} type={piece.type} size={size / 8 * 0.96} /></View>}
        {file === (orientation === 'w' ? 0 : 7) && <Text style={[styles.rankLabel, { color: pale ? C.boardDark : C.boardLight }]}>{rank + 1}</Text>}
        {rank === (orientation === 'w' ? 0 : 7) && <Text style={[styles.fileLabel, { color: pale ? C.boardDark : C.boardLight }]}>{'abcdefgh'[file]}</Text>}
      </Pressable>;
    }))}
  </View>;
}

function HomeScreen({ username, games, onConnect, onRefresh, syncing, syncError, onOpenReview, onTab }) {
  const [input, setInput] = useState(username || '');
  useEffect(() => { setInput(username || ''); }, [username]);
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.hero}>
      <View style={styles.heroTop}><Badge tone="amber">YOUR PERSONAL CHESS COACH</Badge><Text style={styles.heroCrown}>♛</Text></View>
      <Text style={styles.heroTitle}>Play with{`\n`}more purpose.</Text>
      <Text style={styles.heroSub}>A little reflection. A clearer plan. A stronger next game.</Text>
      <View style={styles.heroRule} />
      <Text style={styles.heroFoot}>A better player is built one thoughtful move at a time.</Text>
    </View>

    {!username ? <View style={styles.card}>
      <View style={styles.cardTop}><View style={styles.cardIcon}><Text style={styles.cardIconText}>♟</Text></View><Badge>STEP 01</Badge></View>
      <Text style={styles.cardTitle}>Start with your games</Text>
      <Text style={styles.cardCopy}>Connect your Chess.com username to bring in your recent games and shape a training plan around your play.</Text>
      <Text style={styles.inputLabel}>CHESS.COM USERNAME</Text>
      <TextInput value={input} onChangeText={setInput} autoCapitalize="none" autoCorrect={false} placeholder="Your username" placeholderTextColor="#a7a99f" returnKeyType="go" onSubmitEditing={() => { Keyboard.dismiss(); onConnect(input); }} style={styles.input} />
      {!!syncError && <Text style={styles.errorText}>{syncError}</Text>}
      <Button title="Connect account  →" onPress={() => { Keyboard.dismiss(); onConnect(input); }} busy={syncing} />
      <Text style={styles.privacyNote}>Chess.com public games only · No password needed</Text>
    </View> : <View style={styles.card}>
      <View style={styles.cardTop}><View style={styles.cardIcon}><Text style={styles.cardIconText}>✓</Text></View><Badge>CONNECTED</Badge></View>
      <Text style={styles.cardTitle}>Welcome back, {username}</Text>
      <Text style={styles.cardCopy}>Your recent Chess.com games are ready. Your game data stays on this device.</Text>
      <View style={styles.statsStrip}>
        <View style={styles.stat}><Text style={styles.statValue}>{games.length}</Text><Text style={styles.statLabel}>GAMES SYNCED</Text></View>
        <View style={styles.statDivider} /><View style={styles.stat}><Text style={styles.statValue}>30</Text><Text style={styles.statLabel}>DAYS REVIEWED</Text></View>
      </View>
      <Button title="Refresh my games" onPress={() => onRefresh(username)} secondary busy={syncing} />
      {!!syncError && <Text style={styles.errorText}>{syncError}</Text>}
    </View>}

    <SectionTitle eyebrow="YOUR NEXT STEP" title="Build your training habit" />
    <View style={styles.focusCard}><View style={styles.focusIcon}><Text style={styles.focusIconText}>✦</Text></View><View style={{ flex: 1 }}><Text style={styles.focusTitle}>Make time for one puzzle</Text><Text style={styles.focusCopy}>A few focused minutes can change how you see the board.</Text></View><Pressable onPress={() => onTab('train')} style={styles.roundArrow}><Text style={styles.roundArrowText}>→</Text></Pressable></View>

    <View style={styles.quickGrid}>
      {[
        ['progress', '◷', 'Progress', 'Recent results'], ['history', '♟', 'Game history', 'Return to a game'],
        ['learning', '✦', 'Learning path', 'Your weekly plan'], ['profile', '⚙', 'Profile & settings', 'Preferences & privacy'],
      ].map(([tab, icon, title, note]) => <Pressable key={tab} onPress={() => onTab(tab)} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickNote}>{note}</Text></Pressable>)}
    </View>

    <View style={styles.sectionHead}><View><Text style={styles.eyebrow}>FROM YOUR CHESS.COM ACCOUNT</Text><Text style={styles.sectionTitle}>Recent games</Text></View>{games.length > 0 && <Pressable onPress={() => onTab('review')}><Text style={styles.linkText}>See all  →</Text></Pressable>}</View>
    {games.length ? games.slice(0, 3).map((game) => <GameRow key={game.url || `${game.end_time}-${gameDate(game.end_time)}`} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Connect your Chess.com account to see your games here.</Text></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function ReviewScreen({ username, games, onOpenReview, syncing, onRefresh, backendReady }) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">REFLECT & IMPROVE</Badge><Text style={styles.pageTitle}>Game review</Text><Text style={styles.pageSubtitle}>Find the moments that shaped your game and turn them into your next lesson.</Text></View>
    <View style={styles.insightCard}><Text style={styles.eyebrowLight}>YOUR COACH</Text><Text style={styles.insightTitle}>See the game{`\n`}behind the result.</Text><Text style={styles.insightCopy}>Opening, middlegame, endgame: each phase has something to teach you.</Text><Text style={styles.insightMark}>♛</Text></View>
    {games.length > 0 && <View style={styles.reviewSummary}><Text style={styles.reviewSummaryValue}>{games.length}</Text><View><Text style={styles.reviewSummaryTitle}>recent games found</Text><Text style={styles.reviewSummarySub}>Choose a game to open its review.</Text></View></View>}
    <SectionTitle eyebrow="LAST 30 DAYS" title="Choose a game" action={username ? <Pressable onPress={() => onRefresh(username)} disabled={syncing}><Text style={styles.linkText}>{syncing ? 'Syncing…' : '↻ Refresh'}</Text></Pressable> : null} />
    {games.length ? games.map((game) => <GameRow key={game.url || String(game.end_time)} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.card}><Empty title="Your reviews start here" detail="Connect a Chess.com account on Home to import games from the last 30 days." /></View>}
    <View style={[styles.noticeCard, { marginTop: 18 }]}><Text style={styles.noticeIcon}>{backendReady ? '✦' : '⌁'}</Text><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>{backendReady ? 'AI review service connected' : 'AI review setup needed'}</Text><Text style={styles.noticeCopy}>{backendReady ? 'Open a game to request a phase-by-phase coach review.' : 'Connect a Supabase project to turn on private AI game reviews. Stockfish stays on-device.'}</Text></View></View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function GameReviewScreen({ game, username, onBack }) {
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const backendReady = isCoachBackendConfigured();
  const load = useCallback(async () => {
    if (!game || !backendReady) return;
    setBusy(true); setError('');
    try { setReview(await requestGameAnalysis({ game, username })); }
    catch (err) { setError(err.message || 'The review is not available yet.'); }
    finally { setBusy(false); }
  }, [game, username, backendReady]);
  useEffect(() => { load(); }, [load]);
  const phases = review ? [
    ['Opening', review.opening_score, review.opening_review, review.opening_lessons],
    ['Middlegame', review.middlegame_score, review.middlegame_review, review.middlegame_lessons],
    ['Endgame', review.endgame_score, review.endgame_review, review.endgame_lessons],
  ] : [];
  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  All games</Text></Pressable>
    <View style={styles.pageIntro}><Badge tone="amber">GAME REVIEW</Badge><Text style={styles.pageTitle}>A game is a lesson.</Text><Text style={styles.pageSubtitle}>vs. {opponentName(game, username)}  ·  {gameDate(game.end_time)}  ·  {game.time_class || 'chess'}</Text></View>
    {review ? <>
      <View style={styles.scoreHero}><Text style={styles.eyebrowLight}>OVERALL GAME SCORE</Text><View style={styles.scoreLine}><Text style={styles.scoreBig}>{review.overall_score ?? '—'}</Text><Text style={styles.scoreOutOf}>/ 10</Text><Text style={styles.scoreBrand}>AI COACH NOTES</Text></View><Text style={styles.scoreSummary}>{review.overall_summary || 'Your full game review is ready.'}</Text><Text style={[styles.eyebrowLight, { marginTop: 8 }]}>WRITTEN FEEDBACK · NOT A STOCKFISH EVALUATION</Text></View>
      {phases.map(([title, score, body, lessons]) => <View key={title} style={styles.phaseCard}><View style={styles.phaseHead}><Text style={styles.phaseTitle}>{title}</Text><Text style={styles.phaseScore}>{score ?? '—'}<Text style={styles.phaseOutOf}> / 10</Text></Text></View><Text style={styles.phaseBody}>{body || 'No phase notes were returned.'}</Text>{Array.isArray(lessons) && lessons.map((lesson, index) => <Text key={index} style={styles.lesson}>•  {lesson}</Text>)}</View>)}
    </> : <View style={styles.card}>
      {busy ? <View style={styles.loadingCard}><ActivityIndicator color={C.green} /><Text style={styles.cardTitle}>Your coach is reviewing the game…</Text><Text style={styles.cardCopy}>Looking at the turning points and lessons across all three phases.</Text></View> : <>
        <Empty mark={backendReady ? '✦' : '⌁'} title={backendReady ? 'Ready for your review' : 'AI reviews need setup'} detail={error || 'The game is imported. Connect the secure Supabase coach service to get written feedback. Local Stockfish analysis is separate.'} />
        {backendReady && <Button title="Review this game" onPress={load} />}
      </>}
    </View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function TrainScreen({ onTab }) {
  const [solved, setSolved] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [section, setSection] = useState('tactics');
  const [learnedCount, setLearnedCount] = useState(0);
  const gameRef = useRef(new Chess(samplePuzzle.fen));
  useEffect(() => { AsyncStorage.getItem('chesscoach.training.solved').then((value) => setLearnedCount(Number(value) || 0)).catch(() => {}); }, []);
  const { width } = useWindowDimensions();
  const boardWidth = width - 40;
  const legalMoves = solved ? [] : gameRef.current.moves({ square: 'g6', verbose: true }).map((move) => move.to);
  const choose = (square) => {
    if (solved) return;
    const move = gameRef.current.moves({ square: 'g6', verbose: true }).find((candidate) => candidate.to === square);
    if (!move) { setAttempt('Try the queen’s forcing move. Look for checkmate.'); return; }
    if (move.san === samplePuzzle.solution) { gameRef.current.move({ from: move.from, to: move.to }); setSolved(true); setAttempt('Beautiful. Checkmate.'); setLearnedCount((count) => { const next = count + 1; AsyncStorage.setItem('chesscoach.training.solved', String(next)).catch(() => {}); return next; }); }
    else setAttempt('That move doesn’t finish the game. Look for a move that checks the king and covers every escape square.');
  };
  const restart = () => { gameRef.current = new Chess(samplePuzzle.fen); setSolved(false); setAttempt(''); };
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">TRAIN WITH PURPOSE</Badge><Text style={styles.pageTitle}>Make the next move.</Text><Text style={styles.pageSubtitle}>Small, consistent practice is how good instincts grow.</Text></View>
    <View style={styles.modeSwitch}>{[['tactics','Daily tactics'],['openings','Openings'],['review','Review cards']].map(([key,label]) => <Pressable key={key} onPress={() => setSection(key)} style={[styles.modeOption, section === key && styles.modeOptionActive]}><Text style={[styles.modeText, section === key && styles.modeTextActive]}>{label}</Text></Pressable>)}</View>
    {section === 'openings' ? <View style={styles.card}><Text style={styles.eyebrow}>OPENING PRACTICE</Text><Text style={styles.cardTitle}>Play the first moves with a plan.</Text><Text style={styles.cardCopy}>For now, practise these three habits in your next game: claim or challenge the centre, develop knights and bishops, then castle before launching an attack.</Text>{['Control the centre', 'Develop a piece each move', 'Keep your king safe'].map((item, index) => <View key={item} style={styles.pathCard}><View style={styles.pathNumber}><Text style={styles.pathNumberText}>{index + 1}</Text></View><Text style={[styles.rowTitle, { flex: 1 }]}>{item}</Text><Text style={styles.rowChevron}>✓</Text></View>)}<Button title="Play a focused game" onPress={() => onTab('play')} secondary /></View>
      : section === 'review' ? <View style={styles.card}><Text style={styles.eyebrow}>SPACED REPETITION</Text><Text style={styles.cardTitle}>Bring back the ideas you learned.</Text><Text style={styles.cardCopy}>Solved exercises are counted here. Revisit a tactic later to strengthen recall.</Text><View style={styles.drillStat}><Text style={styles.drillNumber}>{learnedCount}</Text><Text style={styles.drillStatLabel}>PUZZLES SOLVED ON THIS DEVICE</Text></View><Button title="Review today’s tactic" onPress={() => setSection('tactics')} /></View>
      : <>
    <View style={styles.puzzleHeading}><View><Text style={styles.eyebrow}>DAILY TACTIC  ·  MATE IN 1</Text><Text style={styles.puzzleTitle}>{samplePuzzle.title}</Text></View><View style={styles.puzzleBadge}><Text style={styles.puzzleBadgeText}>01</Text></View></View>
    <Text style={styles.puzzlePrompt}>{samplePuzzle.prompt}</Text>
    <View style={styles.puzzleBoardWrap}><ChessBoard game={gameRef.current} fen={gameRef.current.fen()} selected={solved ? null : 'g6'} legalMoves={legalMoves} onSquare={choose} width={boardWidth} /></View>
    <View style={[styles.feedbackBox, solved && styles.feedbackSuccess]}><Text style={styles.feedbackMark}>{solved ? '✓' : '✦'}</Text><Text style={styles.feedbackText}>{attempt || 'Find the strongest move. Tap the destination square.'}</Text></View>
    {solved ? <Button title="Try another time" onPress={restart} secondary /> : <Button title="Show a fresh board" onPress={restart} secondary />}
    <View style={styles.drillCard}><Text style={styles.eyebrow}>SPACED REPETITION</Text><Text style={styles.drillTitle}>Keep the ideas you learn.</Text><Text style={styles.bodyMuted}>Completed exercises are saved on this device for your next review session.</Text><View style={styles.drillStat}><Text style={styles.drillNumber}>{learnedCount}</Text><Text style={styles.drillStatLabel}>PUZZLES SOLVED</Text></View></View>
      </>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function PlayScreen({ playerRating, playerKey, onSaveGame, onOpenHistory }) {
  const [mode, setMode] = useState('local');
  const [playerColor, setPlayerColor] = useState('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState(null);
  const [orientation, setOrientation] = useState('w');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [engineStatus, setEngineStatus] = useState(useNativeStockfish ? 'Starting Stockfish…' : 'Development build required');
  const [ratingAdjustment, setRatingAdjustment] = useState(0);
  const [adaptation, setAdaptation] = useState({ wins: 0, draws: 0, losses: 0 });
  const gameRef = useRef(new Chess());
  const engineReady = useRef(false);
  const engineCandidates = useRef({ depth: 0, moves: {} });
  const engineOutputBuffer = useRef('');
  const resultRecorded = useRef(false);
  const savedGameKey = useRef(null);
  const bestMoveResolver = useRef(null);
  const autoStartBot = useRef(false);
  const engineTimer = useRef(null);
  const engineApiRef = useRef(null);
  const storageKey = `chesscoach.adaptive.${playerKey || 'guest'}`;
  const baseRating = playerRating || 1400;
  const requestedRating = Math.max(400, Math.min(3190, Math.round(baseRating + ratingAdjustment)));
  const targetRating = Math.max(1320, requestedRating);
  const requestedRatingRef = useRef(requestedRating);
  requestedRatingRef.current = requestedRating;
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then((saved) => {
      if (!active || !saved) return;
      const profile = JSON.parse(saved);
      setRatingAdjustment(Number(profile.adjustment) || 0);
      setAdaptation({ wins: profile.wins || 0, draws: profile.draws || 0, losses: profile.losses || 0 });
    }).catch(() => {});
    return () => { active = false; };
  }, [storageKey]);
  const handleEngineError = useCallback((message) => {
    engineReady.current = false;
    setEngineStatus('Engine error');
    if (bestMoveResolver.current) { bestMoveResolver.current(null); bestMoveResolver.current = null; }
    setError(message || 'Stockfish could not start.');
  }, []);
  const handleEngineOutput = useCallback((output) => {
    const chunks = `${engineOutputBuffer.current}${String(output || '')}`.split(/\r?\n/);
    engineOutputBuffer.current = chunks.pop() || '';
    const lines = chunks;
    for (const line of lines) {
      if (line.includes('uciok')) engineApiRef.current?.sendCommandToStockfish('isready');
      if (line.includes('readyok')) {
        engineReady.current = true;
        setEngineStatus('Stockfish ready');
      }
      const candidate = line.match(/\binfo depth (\d+).*?\bmultipv (\d+).*?\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (candidate) {
        const depth = Number(candidate[1]);
        if (depth > engineCandidates.current.depth) engineCandidates.current = { depth, moves: {} };
        if (depth === engineCandidates.current.depth) engineCandidates.current.moves[Number(candidate[2])] = candidate[3];
      }
      const match = line.match(/\bbestmove\s+([a-h][1-8][a-h][1-8][qrbn]?|0000)/);
      if (match && bestMoveResolver.current) {
        clearTimeout(engineTimer.current);
        const resolve = bestMoveResolver.current; bestMoveResolver.current = null;
        const ranked = Object.keys(engineCandidates.current.moves).map(Number).sort((a, b) => a - b).map((rank) => engineCandidates.current.moves[rank]);
        const currentTarget = requestedRatingRef.current;
        const weakerRank = currentTarget < 1320 ? Math.min(ranked.length - 1, Math.ceil((1320 - currentTarget) / 150)) : 0;
        resolve(match[1] === '0000' ? null : ranked[weakerRank] || match[1]);
      }
    }
  }, []);
  const engineApi = useStockfishEngine({ onOutput: handleEngineOutput, onError: handleEngineError });
  engineApiRef.current = engineApi;
  useEffect(() => {
    if (!useNativeStockfish) return undefined;
    try { engineApi.stockfishLoop(); engineApi.sendCommandToStockfish('uci'); }
    catch { setEngineStatus('Engine unavailable'); }
    return () => { clearTimeout(engineTimer.current); engineApi.stopStockfish(); };
  }, [engineApi.stockfishLoop, engineApi.sendCommandToStockfish, engineApi.stopStockfish]);
  const { width } = useWindowDimensions();
  const moves = gameRef.current.history({ verbose: true });
  const legalMoves = selected ? gameRef.current.moves({ square: selected, verbose: true }).map((m) => m.to) : [];
  const piece = selected ? gameRef.current.get(selected) : null;
  const turn = gameRef.current.turn();
  const boardWidth = width - 64;
  const reset = () => { gameRef.current = new Chess(); resultRecorded.current = false; autoStartBot.current = false; setFen(gameRef.current.fen()); setSelected(null); setError(''); setBusy(false); };
  const recordCoachResult = async () => {
    if (mode !== 'coach' || !gameRef.current.isGameOver() || resultRecorded.current) return;
    resultRecorded.current = true;
    const botColor = playerColor === 'w' ? 'b' : 'w';
    const outcome = gameRef.current.isDraw() ? 'draw' : gameRef.current.isCheckmate() && gameRef.current.turn() === botColor ? 'win' : 'loss';
    const adjustment = Math.max(-450, Math.min(450, ratingAdjustment + (outcome === 'win' ? 55 : outcome === 'loss' ? -55 : 0)));
    const next = { adjustment, wins: adaptation.wins + (outcome === 'win' ? 1 : 0), draws: adaptation.draws + (outcome === 'draw' ? 1 : 0), losses: adaptation.losses + (outcome === 'loss' ? 1 : 0) };
    setRatingAdjustment(adjustment);
    setAdaptation({ wins: next.wins, draws: next.draws, losses: next.losses });
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };
  const doCoachMove = async () => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (mode !== 'coach' || gameRef.current.turn() !== botColor || gameRef.current.isGameOver()) return;
    setBusy(true); setError('');
    try {
      if (!engineReady.current) throw new Error('Stockfish is still starting. Please wait for it to be ready.');
      engineCandidates.current = { depth: 0, moves: {} };
      const multiPv = requestedRating < 1320 ? Math.min(5, 1 + Math.ceil((1320 - requestedRating) / 150)) : 1;
      engineApi.sendCommandToStockfish(`setoption name MultiPV value ${multiPv}`);
      engineApi.sendCommandToStockfish('setoption name UCI_LimitStrength value true');
      engineApi.sendCommandToStockfish(`setoption name UCI_Elo value ${targetRating}`);
      engineApi.sendCommandToStockfish(`position fen ${gameRef.current.fen()}`);
      const move = await new Promise((resolve, reject) => {
        bestMoveResolver.current = resolve;
        engineTimer.current = setTimeout(() => { bestMoveResolver.current = null; engineApiRef.current?.sendCommandToStockfish('stop'); reject(new Error('Stockfish did not respond. Try again or return to game setup.')); }, 12000);
        engineApi.sendCommandToStockfish('go movetime 1200');
      });
      if (!move) throw new Error('Stockfish did not return a move.');
      gameRef.current.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] || 'q' });
      setFen(gameRef.current.fen()); setSelected(null);
      await recordCoachResult();
    } catch (err) { setError(err.message || 'Coach move unavailable.'); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (!autoStartBot.current || !gameStarted || mode !== 'coach' || gameRef.current.history().length !== 0) return;
    autoStartBot.current = false;
    doCoachMove();
  }, [fen, gameStarted, mode, playerColor]);
  const startGame = () => {
    gameRef.current = new Chess();
    resultRecorded.current = false;
    savedGameKey.current = null;
    setFen(gameRef.current.fen()); setSelected(null); setError(''); setBusy(false);
    setOrientation(mode === 'coach' ? playerColor : 'w');
    autoStartBot.current = mode === 'coach' && playerColor === 'b';
    setGameStarted(true);
  };
  const tapSquare = async (square) => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (busy || (mode === 'coach' && (!gameStarted || turn === botColor)) || gameRef.current.isGameOver()) return;
    const selectedMoves = selected ? gameRef.current.moves({ square: selected, verbose: true }) : [];
    const move = selectedMoves.find((candidate) => candidate.to === square);
    if (move) {
      gameRef.current.move({ from: move.from, to: move.to, promotion: 'q' });
      setFen(gameRef.current.fen()); setSelected(null);
      await recordCoachResult();
      if (mode === 'coach' && !gameRef.current.isGameOver()) await doCoachMove();
      return;
    }
    const p = gameRef.current.get(square);
    if (p && p.color === turn) setSelected(square);
    else setSelected(null);
  };
  const undo = () => {
    gameRef.current.undo();
    if (mode === 'coach' && gameRef.current.history().length) gameRef.current.undo();
    setFen(gameRef.current.fen()); setSelected(null); setError('');
  };
  const checkmate = gameRef.current.isCheckmate();
  const gameOver = gameRef.current.isGameOver();
  const status = checkmate ? `${turn === 'w' ? 'Black' : 'White'} wins by checkmate.` : gameRef.current.isStalemate() ? 'Draw by stalemate.' : gameRef.current.isCheck() ? `${turn === 'w' ? 'White' : 'Black'} is in check.` : `${turn === 'w' ? 'White' : 'Black'} to move`;
  useEffect(() => {
    if (!gameStarted || !gameOver || savedGameKey.current === fen) return;
    savedGameKey.current = fen;
    const draw = gameRef.current.isDraw();
    const whiteResult = draw ? 'draw' : gameRef.current.isCheckmate() ? (gameRef.current.turn() === 'b' ? 'win' : 'loss') : 'draw';
    const blackResult = draw ? 'draw' : whiteResult === 'win' ? 'loss' : 'win';
    const stamp = Math.floor(Date.now() / 1000);
    const id = `local-${stamp}-${fen.slice(0, 8)}`;
    const game = {
      id, date: stamp * 1000, end_time: stamp, pgn: gameRef.current.pgn(), mode,
      resultLabel: mode === 'coach' ? (draw ? 'draw' : (playerColor === 'w' ? whiteResult : blackResult)) : status,
      opponentName: mode === 'coach' ? 'Adaptive Stockfish Coach' : 'Pass & play', time_class: 'local',
      white: { username: mode === 'coach' && playerColor === 'b' ? 'Stockfish Coach' : 'White', result: whiteResult },
      black: { username: mode === 'coach' && playerColor === 'w' ? 'Stockfish Coach' : 'Black', result: blackResult },
    };
    onSaveGame?.(game);
  }, [fen, gameOver, gameStarted, mode, playerColor, status, onSaveGame]);
  if (!gameStarted) return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">GAME SETUP</Badge><Text style={styles.pageTitle}>Choose your game.</Text><Text style={styles.pageSubtitle}>Play a friend on this device or face an adaptive Stockfish coach.</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>OPPONENT</Text>
      <Pressable onPress={() => setMode('local')} style={[styles.setupChoice, mode === 'local' && styles.setupChoiceActive]}><Text style={styles.rowTitle}>Pass & play</Text><Text style={styles.rowSub}>Take turns on this device.</Text></Pressable>
      <Pressable onPress={() => setMode('coach')} style={[styles.setupChoice, mode === 'coach' && styles.setupChoiceActive]}><Text style={styles.rowTitle}>Adaptive Stockfish Coach</Text><Text style={styles.rowSub}>Strength starts from your rating and adjusts from match results.</Text></Pressable>
      {mode === 'coach' && <><Text style={[styles.eyebrow, { marginTop: 17 }]}>PLAY AS</Text><View style={styles.modeSwitch}>
        {['w', 'b'].map((color) => <Pressable key={color} onPress={() => setPlayerColor(color)} style={[styles.modeOption, playerColor === color && styles.modeOptionActive]}><Text style={[styles.modeText, playerColor === color && styles.modeTextActive]}>{color === 'w' ? 'White' : 'Black'}</Text></Pressable>)}
      </View><Text style={styles.bodyMuted}>{playerColor === 'b' ? 'Stockfish will make the first move.' : 'You will make the first move.'}  ·  {playerRating ? `Chess.com rating ${playerRating}` : 'Starting target 1400'}</Text>
      <View style={[styles.noticeCard, { marginTop: 12 }]}><Text style={styles.noticeIcon}>{engineReady.current ? '✓' : '…'}</Text><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>{engineStatus}</Text><Text style={styles.noticeCopy}>{engineReady.current ? 'Ready to play offline.' : 'Keep this screen open while Stockfish starts.'}</Text></View></View></>}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <Button title={mode === 'coach' ? 'Start coach game' : 'Start pass & play'} onPress={startGame} disabled={mode === 'coach' && !engineReady.current} />
    </View><View style={styles.bottomSpace} />
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">PLAY & PRACTISE</Badge><Text style={styles.pageTitle}>{mode === 'coach' ? `You are ${playerColor === 'w' ? 'White' : 'Black'}.` : 'Over the board.'}</Text><Text style={styles.pageSubtitle}>{mode === 'coach' ? 'The coach adapts to your rating and results.' : 'Take turns with a friend on this device.'}</Text></View>
    <View style={styles.opponentBar}><View style={styles.avatar}><Text style={styles.avatarText}>{mode === 'coach' ? '♛' : '♙'}</Text></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{mode === 'coach' ? 'Adaptive Chess Coach' : 'Local game'}</Text><Text style={styles.rowSub}>{mode === 'coach' ? `${engineStatus} · ~${requestedRating} target${playerRating ? ' from rating' : ' starting level'} · ${adaptation.wins}W ${adaptation.draws}D ${adaptation.losses}L` : 'Pass & play · White at bottom'}</Text></View><View style={[styles.engineDot, { backgroundColor: mode === 'coach' && engineReady.current ? '#6c9561' : '#c7a866' }]} /></View>
    <View style={styles.playStatus}><View style={[styles.turnDot, { backgroundColor: gameOver ? C.faint : C.amber }]} /><Text style={styles.playStatusText}>{busy ? 'Coach is thinking…' : mode === 'coach' && !gameOver ? (turn === playerColor ? 'Your move' : 'Coach to move') : status}</Text><Pressable onPress={() => { setOrientation(orientation === 'w' ? 'b' : 'w'); setSelected(null); }}><Text style={styles.flipText}>⇅ Flip</Text></Pressable></View>
    <View style={styles.playBoardWrap}><ChessBoard game={gameRef.current} fen={fen} selected={selected} legalMoves={legalMoves} onSquare={tapSquare} width={boardWidth} orientation={orientation} /></View>
    <View style={styles.playTools}><Button title="↶ Undo" onPress={undo} secondary compact disabled={!moves.length || busy || gameOver} style={{ flex: 1 }} /><Button title="＋ New game" onPress={() => { reset(); setGameStarted(false); }} compact style={{ flex: 1 }} /></View>
    {gameOver && <View style={styles.card}><Text style={styles.eyebrow}>GAME COMPLETE</Text><Text style={styles.cardTitle}>{status}</Text><Text style={styles.cardCopy}>This game has been saved to your history on this device.</Text><View style={styles.playTools}><Button title="Play again" onPress={startGame} compact style={{ flex: 1 }} /><Button title="Game history" onPress={onOpenHistory} compact secondary style={{ flex: 1 }} /></View></View>}
    {mode === 'coach' && !useNativeStockfish && <View style={styles.noticeCard}><Text style={styles.noticeIcon}>⌁</Text><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>Install the development build</Text><Text style={styles.noticeCopy}>Stockfish is included in the app’s native build. Expo Go does not include the engine module.</Text></View></View>}
    {!!error && <Text style={styles.errorText}>{error}</Text>}
    {!!error && mode === 'coach' && !gameOver && turn === (playerColor === 'w' ? 'b' : 'w') && <Button title={engineReady.current ? 'Ask coach again' : 'Return to game setup'} onPress={engineReady.current ? doCoachMove : () => { reset(); setGameStarted(false); }} secondary />}
    <View style={styles.moveList}><Text style={styles.eyebrow}>MOVE LIST</Text>{moves.length ? <View style={styles.movePairs}>{Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => <View key={i} style={styles.movePair}><Text style={styles.moveNumber}>{i + 1}.</Text><Text style={styles.moveSan}>{moves[i * 2]?.san}</Text><Text style={styles.moveSan}>{moves[i * 2 + 1]?.san || ''}</Text></View>)}</View> : <Text style={styles.bodyMuted}>Your game begins with the first move.</Text>}</View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function LibraryScreen({ onTab }) {
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const visible = resources.filter((item) => (category === 'ALL' || item.kind === category) && `${item.title} ${item.kind} ${item.author} ${item.note}`.toLowerCase().includes(query.toLowerCase()));
  if (selected) return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => setSelected(null)} style={styles.backButton}><Text style={styles.backText}>‹  Library</Text></Pressable>
    <View style={styles.pageIntro}><Badge tone="amber">{selected.kind} · STARTER GUIDE</Badge><Text style={styles.pageTitle}>{selected.title}</Text><Text style={styles.pageSubtitle}>{selected.author}</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>THE IDEA</Text><Text style={styles.cardCopy}>{selected.note}</Text><Text style={styles.cardCopy}>Try this idea in a real position. Ask what your opponent is threatening, then choose a move that improves your pieces while keeping your king safe.</Text><Button title="Put it into practice" onPress={() => onTab(selected.kind === 'TACTICS' ? 'train' : 'play')} /><Button title="Back to library" secondary onPress={() => setSelected(null)} /></View>
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">A LIBRARY THAT GROWS WITH YOU</Badge><Text style={styles.pageTitle}>Learn, your way.</Text><Text style={styles.pageSubtitle}>A few good ideas to carry into your next game.</Text></View>
    <View style={styles.resourceFeature}><Text style={styles.eyebrowLight}>A GOOD PLACE TO BEGIN</Text><Text style={styles.resourceFeatureTitle}>Study the whole game.</Text><Text style={styles.resourceFeatureCopy}>Build a clear foundation in openings, tactics, and endgames. Then connect the lessons to your own games.</Text><Text style={styles.resourceFeatureMark}>♘</Text></View>
    <SectionTitle eyebrow="CURATED FOR YOUR STUDY" title="Explore the library" />
    <TextInput value={query} onChangeText={setQuery} placeholder="Search lessons" placeholderTextColor="#a7a99f" style={styles.input} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRail}>{['ALL','OPENING','TACTICS','ENDGAME','BOOK'].map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, category === item && styles.filterChipActive]}><Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    {visible.map((item, index) => <Pressable key={item.title} onPress={() => setSelected(item)} style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}><View style={[styles.resourceIcon, index % 2 === 0 ? styles.resourceIconGreen : styles.resourceIconAmber]}><Text style={styles.resourceIconText}>{['♜','♙','♔','✦'][index % 4]}</Text></View><View style={{ flex: 1 }}><Text style={styles.resourceKind}>{item.kind}</Text><Text style={styles.resourceTitle}>{item.title}</Text><Text style={styles.resourceAuthor}>{item.author}</Text><Text style={styles.resourceNote}>{item.note}</Text></View><Text style={styles.rowChevron}>›</Text></Pressable>)}
    {!visible.length && <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>No lessons match that search.</Text></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function OnboardingScreen({ onFinish }) {
  const [goal, setGoal] = useState('Improve tactics');
  const [level, setLevel] = useState('I know the rules');
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={[styles.hero, { marginTop: 20 }]}><Badge tone="amber">YOUR PERSONAL CHESS COACH</Badge><Text style={styles.heroTitle}>Think clearly.{`\n`}Play confidently.</Text><Text style={styles.heroSub}>Build a practice routine around the chess you actually play.</Text></View>
    <View style={styles.pageIntro}><Text style={styles.pageTitle}>Let’s make this yours.</Text><Text style={styles.pageSubtitle}>Pick a starting point. You can change it any time, and you can skip account setup.</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>WHAT WOULD YOU LIKE TO WORK ON?</Text>
      {['Improve tactics', 'Understand my games', 'Learn openings'].map((item) => <Pressable key={item} onPress={() => setGoal(item)} style={[styles.setupChoice, goal === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Text style={[styles.eyebrow, { marginTop: 18 }]}>YOUR CHESS EXPERIENCE</Text>
      {['I know the rules', 'I play casually', 'I play regularly'].map((item) => <Pressable key={item} onPress={() => setLevel(item)} style={[styles.setupChoice, level === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Button title="Build my starting plan  →" onPress={() => onFinish({ goal, level })} />
      <Text style={styles.privacyNote}>No account or Chess.com connection required.</Text>
    </View>
  </ScrollView>;
}

function ProgressScreen({ games, username, onTab }) {
  const totals = games.reduce((acc, game) => { const result = resultLabel(game, username).toLowerCase(); acc[result] = (acc[result] || 0) + 1; return acc; }, {});
  const rated = recentPlayerRating(games, username);
  const winRate = games.length ? Math.round((totals.win || 0) / games.length * 100) : 0;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">YOUR CHESS JOURNEY</Badge><Text style={styles.pageTitle}>Progress</Text><Text style={styles.pageSubtitle}>A simple view of your recent play and practice.</Text></View>
    <View style={styles.statsPanel}><View style={styles.stat}><Text style={styles.statValue}>{rated || '—'}</Text><Text style={styles.statLabel}>RECENT RATING</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={styles.statValue}>{games.length}</Text><Text style={styles.statLabel}>GAMES · 30 DAYS</Text></View></View>
    {games.length ? <><SectionTitle eyebrow="RECENT RESULTS" title="What your games show" />
      <View style={styles.card}><View style={styles.progressRow}><Text style={styles.rowTitle}>Wins</Text><Text style={styles.resultText}>{totals.win || 0}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${winRate}%` }]} /></View><Text style={styles.bodyMuted}>{winRate}% win rate in the imported games shown here.</Text><View style={styles.progressRow}><Text style={styles.rowTitle}>Draws</Text><Text style={styles.resultText}>{totals.draw || 0}</Text></View><View style={styles.progressRow}><Text style={styles.rowTitle}>Losses</Text><Text style={styles.resultText}>{totals.loss || 0}</Text></View></View>
      <View style={styles.focusCard}><View style={styles.focusIcon}><Text style={styles.focusIconText}>✦</Text></View><View style={{ flex: 1 }}><Text style={styles.focusTitle}>Next: review one turning point</Text><Text style={styles.focusCopy}>Use game review to choose a lesson for your next practice session.</Text></View><Pressable onPress={() => onTab('review')} style={styles.roundArrow}><Text style={styles.roundArrowText}>→</Text></Pressable></View>
    </> : <View style={styles.card}><Empty mark="◉" title="Your progress starts with a game" detail="Connect a public Chess.com profile on Home, or play locally and come back to your training plan." /><Button title="Connect Chess.com" onPress={() => onTab('home')} secondary /></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}

function HistoryScreen({ games, username, localGames, onOpenReview, onTab }) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">YOUR RECENT PLAY</Badge><Text style={styles.pageTitle}>Game history</Text><Text style={styles.pageSubtitle}>Return to imported games or review a local game you finished on this device.</Text></View>
    <SectionTitle eyebrow="PLAYED ON THIS DEVICE" title="Coach & pass-and-play" />
    {localGames.length ? localGames.map((game) => <Pressable key={game.id} onPress={() => onOpenReview(game)} style={styles.historyCard}><View style={styles.resultDot} /><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{game.opponentName || 'Local game'}</Text><Text style={styles.rowSub}>{new Date(game.date).toLocaleDateString()} · {game.mode === 'coach' ? 'Stockfish Coach' : 'Pass & play'}</Text></View><Badge tone="neutral">{game.resultLabel || 'Review'}</Badge><Text style={styles.rowChevron}>›</Text></Pressable>) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Completed local games will appear here.</Text></View>}
    <SectionTitle eyebrow="CHESS.COM" title="Imported games" action={games.length > 0 ? <Text style={styles.linkText}>{games.length} recent</Text> : null} />
    {games.length ? games.map((game) => <GameRow key={game.url || String(game.end_time)} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Connect a public Chess.com profile to see past games.</Text></View>}
    <Button title="Play a game" onPress={() => onTab('play')} secondary /><View style={styles.bottomSpace} />
  </ScrollView>;
}

function LearningScreen({ onTab, profile }) {
  const steps = [
    { n: '01', title: 'Warm up with a tactic', note: 'Train forcing moves and calculation.', tab: 'train' },
    { n: '02', title: 'Play a focused game', note: 'Apply one idea against the coach.', tab: 'play' },
    { n: '03', title: 'Review one game', note: 'Turn a mistake into a specific lesson.', tab: 'review' },
    { n: '04', title: 'Study a useful idea', note: 'Build a foundation in openings and endings.', tab: 'library' },
  ];
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">A PLAN YOU CAN KEEP</Badge><Text style={styles.pageTitle}>Your learning path</Text><Text style={styles.pageSubtitle}>A short repeatable loop, shaped around: {profile.goal || 'steady improvement'}.</Text></View>
    <View style={styles.insightCard}><Text style={styles.eyebrowLight}>THIS WEEK</Text><Text style={styles.insightTitle}>Four small steps.{`\n`}One stronger habit.</Text><Text style={styles.insightCopy}>Start anywhere and return when you are ready.</Text><Text style={styles.insightMark}>♘</Text></View>
    {steps.map((step) => <Pressable key={step.n} onPress={() => onTab(step.tab)} style={styles.pathCard}><View style={styles.pathNumber}><Text style={styles.pathNumberText}>{step.n}</Text></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{step.title}</Text><Text style={styles.rowSub}>{step.note}</Text></View><Text style={styles.rowChevron}>›</Text></Pressable>)}
  </ScrollView>;
}

function ProfileScreen({ username, profile, rating, onTab, onDisconnect, onUpdateProfile, onRestart }) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">YOUR SPACE</Badge><Text style={styles.pageTitle}>Profile & settings</Text><Text style={styles.pageSubtitle}>Manage your local preferences and connected game data.</Text></View>
    <View style={styles.card}><View style={styles.profileHero}><View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{username ? username.slice(0,1).toUpperCase() : '♘'}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{username || 'Guest player'}</Text><Text style={styles.bodyMuted}>{rating ? `Recent rating ${rating}` : 'Your progress is saved on this device.'}</Text></View></View>
      <SectionTitle eyebrow="CURRENT FOCUS" title={profile.goal || 'Improve tactics'} />
      {['Improve tactics', 'Understand my games', 'Learn openings'].map((item) => <Pressable key={item} onPress={() => onUpdateProfile({ ...profile, goal: item })} style={[styles.setupChoice, profile.goal === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Text style={[styles.eyebrow, { marginTop: 18 }]}>CHESS.COM CONNECTION</Text><Text style={styles.bodyMuted}>{username ? `Connected as ${username}. Only public game data is read.` : 'No account connected.'}</Text>
      {username ? <Button title="Disconnect account" secondary onPress={onDisconnect} /> : <Button title="Connect on Home" secondary onPress={() => onTab('home')} />}
      <Button title="Review your privacy & app setup" secondary onPress={() => onTab('setup')} />
      <Button title="Change my starting preferences" secondary onPress={onRestart} />
    </View>
    <View style={styles.noticeCard}><Text style={styles.noticeIcon}>⌂</Text><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>Saved on this device</Text><Text style={styles.noticeCopy}>Profile preferences, recent imported games, match history, and coach adjustment stay in local app storage.</Text></View></View>
  </ScrollView>;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [localGames, setLocalGames] = useState([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [profile, setProfile] = useState({ goal: 'Improve tactics', level: 'I know the rules' });
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedGames, savedLocalGames, savedProfile, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem('chesscoach.username'), AsyncStorage.getItem('chesscoach.games'), AsyncStorage.getItem('chesscoach.localGames'),
          AsyncStorage.getItem('chesscoach.profile'), AsyncStorage.getItem('chesscoach.onboarding.done'),
        ]);
        if (savedUser) setUsername(savedUser);
        if (savedGames) setGames(JSON.parse(savedGames));
        if (savedLocalGames) setLocalGames(JSON.parse(savedLocalGames));
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        setOnboardingDone(savedOnboarding === 'yes');
      } catch { /* A missing local cache does not prevent the app opening. */ }
      finally { setReady(true); }
    })();
  }, []);

  const connect = async (value) => {
    const clean = value.trim();
    if (!clean) { setSyncError('Enter your Chess.com username to continue.'); return; }
    setSyncing(true); setSyncError('');
    try {
      const recent = await fetchRecentGames(clean);
      await Promise.all([AsyncStorage.setItem('chesscoach.username', clean), AsyncStorage.setItem('chesscoach.games', JSON.stringify(recent))]);
      setUsername(clean); setGames(recent);
    } catch (error) { setSyncError(error.message || 'Could not sync the account.'); }
    finally { setSyncing(false); }
  };
  const refresh = async (value) => {
    if (!value) return;
    setSyncing(true); setSyncError('');
    try {
      const recent = await fetchRecentGames(value);
      await AsyncStorage.setItem('chesscoach.games', JSON.stringify(recent)); setGames(recent);
    } catch (error) { setSyncError(error.message || 'Could not refresh games.'); }
    finally { setSyncing(false); }
  };
  const openReview = (game) => { setSelectedGame(game); setTab('game'); };
  const finishOnboarding = async (next) => {
    setProfile(next); setOnboardingDone(true); setTab('home');
    await Promise.all([AsyncStorage.setItem('chesscoach.profile', JSON.stringify(next)), AsyncStorage.setItem('chesscoach.onboarding.done', 'yes')]);
  };
  const updateProfile = async (next) => { setProfile(next); await AsyncStorage.setItem('chesscoach.profile', JSON.stringify(next)); };
  const saveLocalGame = (game) => {
    setLocalGames((current) => {
      if (current.some((item) => item.id === game.id)) return current;
      const next = [game, ...current].slice(0, 50);
      AsyncStorage.setItem('chesscoach.localGames', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const disconnect = () => Alert.alert('Disconnect Chess.com?', 'This removes the cached username and imported games from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Disconnect', style: 'destructive', onPress: async () => { await Promise.all([AsyncStorage.removeItem('chesscoach.username'), AsyncStorage.removeItem('chesscoach.games')]); setUsername(''); setGames([]); setTab('home'); } },
  ]);
  const restartOnboarding = async () => { setOnboardingDone(false); await AsyncStorage.removeItem('chesscoach.onboarding.done'); };
  const body = !ready ? <View style={styles.loadingScreen}><ActivityIndicator color={C.green} /><Text style={styles.bodyMuted}>Getting your training space ready…</Text></View>
    : !onboardingDone ? <OnboardingScreen onFinish={finishOnboarding} />
    : tab === 'home'
    ? <HomeScreen username={username} games={games} onConnect={connect} onRefresh={refresh} syncing={syncing} syncError={syncError} onOpenReview={openReview} onTab={setTab} />
    : tab === 'review' ? <ReviewScreen username={username} games={games} onOpenReview={openReview} syncing={syncing} onRefresh={refresh} backendReady={isCoachBackendConfigured()} />
    : tab === 'game' && selectedGame ? <GameReviewScreen key={selectedGame.url || selectedGame.end_time} game={selectedGame} username={username} onBack={() => setTab('review')} />
    : tab === 'train' ? <TrainScreen onTab={setTab} />
    : tab === 'play' ? null
    : tab === 'progress' ? <ProgressScreen games={games} username={username} onTab={setTab} />
    : tab === 'history' ? <HistoryScreen games={games} username={username} localGames={localGames} onOpenReview={openReview} onTab={setTab} />
    : tab === 'learning' ? <LearningScreen onTab={setTab} profile={profile} />
    : tab === 'profile' ? <ProfileScreen username={username} profile={profile} rating={recentPlayerRating(games, username)} onTab={setTab} onDisconnect={disconnect} onUpdateProfile={updateProfile} onRestart={restartOnboarding} />
    : tab === 'setup' ? <View style={styles.page}><Pressable onPress={() => setTab('profile')} style={styles.backButton}><Text style={styles.backText}>‹  Profile</Text></Pressable><View style={styles.pageIntro}><Badge tone="amber">APP SETUP</Badge><Text style={styles.pageTitle}>Privacy & AI</Text><Text style={styles.pageSubtitle}>Stockfish is a local chess engine and needs the installed development build. AI-written reviews run through a protected Supabase Edge Function and the OpenAI Responses API; provider credentials stay on the server.</Text></View><View style={styles.noticeCard}><Text style={styles.noticeIcon}>{isCoachBackendConfigured() ? '✓' : '⌁'}</Text><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>{isCoachBackendConfigured() ? 'Supabase app settings found' : 'Supabase project setup required'}</Text><Text style={styles.noticeCopy}>The server function and client connection are scaffolded in this project. Project URL and publishable key, anonymous guest sign-in, and the server-side OPENAI_API_KEY still need configuring before cloud reviews work.</Text></View></View></View>
    : <LibraryScreen onTab={setTab} />;

  return <SafeAreaView style={styles.app}>
    <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
    <View style={styles.topBar}><Pressable onPress={() => setTab('home')} style={styles.brand}>
      <View style={styles.brandMark}><Text style={styles.brandMarkText}>♛</Text></View><View><Text style={styles.brandName}>chess coach</Text><Text style={styles.brandSub}>PRO · YOUR NEXT MOVE</Text></View>
    </Pressable><Pressable accessibilityRole="button" accessibilityLabel="Open profile and settings" onPress={() => onboardingDone && setTab('profile')} style={styles.profileMark}><Text style={styles.profileText}>{username ? username.slice(0,1).toUpperCase() : '♘'}</Text></Pressable></View>
    <View style={styles.content}>
      {ready && onboardingDone && <View style={[styles.persistentPlayLayer, { display: tab === 'play' ? 'flex' : 'none' }]}><PlayScreen playerRating={recentPlayerRating(games, username)} playerKey={username.toLowerCase()} onSaveGame={saveLocalGame} onOpenHistory={() => setTab('history')} /></View>}
      {tab !== 'play' && <View style={{ flex: 1 }}>{body}</View>}
    </View>
    {onboardingDone && <View style={styles.tabBar}>{TABS.map((item) => {
      const active = tab === item.id || (item.id === 'review' && tab === 'game');
      return <Pressable key={item.id} onPress={() => setTab(item.id)} style={styles.tabItem} accessibilityRole="tab" accessibilityState={{ selected: active }}>
        <Text style={[styles.tabMark, active && styles.tabMarkActive]}>{item.mark}</Text><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
        {active && <View style={styles.tabIndicator} />}
      </Pressable>;
    })}</View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg }, content: { flex: 1 }, persistentPlayLayer: { flex: 1 }, page: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: 24 }, bottomSpace: { height: 12 },
  topBar: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: C.bg }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { width: 37, height: 37, borderRadius: 12, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }, brandMarkText: { color: '#f4d394', fontSize: 23, marginTop: -2 }, brandName: { color: C.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.6 }, brandSub: { color: C.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.15, marginTop: 2 }, profileMark: { width: 33, height: 33, borderRadius: 17, backgroundColor: '#e5e7df', alignItems: 'center', justifyContent: 'center' }, profileText: { color: C.green, fontSize: 13, fontWeight: '700' },
  tabBar: { height: 67, paddingBottom: 5, backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'stretch' }, tabItem: { width: '20%', alignItems: 'center', justifyContent: 'center', gap: 3 }, tabMark: { color: '#94998e', fontSize: 19, height: 22, fontWeight: '600' }, tabMarkActive: { color: C.green }, tabLabel: { color: '#92968d', fontSize: 10, fontWeight: '600' }, tabLabelActive: { color: C.green, fontWeight: '800' }, tabIndicator: { position: 'absolute', top: 0, width: 19, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: C.amber },
  hero: { minHeight: 240, borderRadius: 19, padding: 20, backgroundColor: C.green, overflow: 'hidden', marginBottom: 15 }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroCrown: { color: '#d8b671', fontSize: 40, position: 'absolute', right: 7, top: 24, opacity: 0.45 }, heroTitle: { color: '#fffdf6', fontSize: 35, lineHeight: 38, letterSpacing: -1.5, fontWeight: '700', marginTop: 22 }, heroSub: { color: '#e0e5da', fontSize: 13, lineHeight: 19, marginTop: 10, maxWidth: 255 }, heroRule: { height: 1, backgroundColor: '#ffffff27', marginTop: 17, marginBottom: 10 }, heroFoot: { color: '#b9c8b3', fontSize: 10, letterSpacing: 0.15 },
  badge: { backgroundColor: C.greenSoft, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start' }, badgeAmber: { backgroundColor: '#f3e7d0' }, badgeNeutral: { backgroundColor: C.soft }, badgeText: { color: C.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 }, badgeTextAmber: { color: '#87601e' }, badgeTextNeutral: { color: C.muted },
  card: { backgroundColor: C.paper, borderRadius: 16, padding: 17, borderWidth: 1, borderColor: C.line, marginBottom: 22 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' }, cardIconText: { color: '#94651b', fontWeight: '800', fontSize: 19 }, cardTitle: { color: C.ink, fontSize: 19, fontWeight: '700', letterSpacing: -0.4, marginTop: 13 }, cardCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }, inputLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 18, marginBottom: 7 }, input: { height: 46, borderWidth: 1, borderColor: '#e3e4dc', borderRadius: 10, paddingHorizontal: 13, color: C.ink, fontSize: 14, backgroundColor: '#fcfcfa', marginBottom: 10 }, privacyNote: { textAlign: 'center', marginTop: 10, fontSize: 10, color: C.faint }, errorText: { color: C.red, fontSize: 12, lineHeight: 17, marginBottom: 10, marginTop: 7 }, button: { minHeight: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, flexDirection: 'row', marginTop: 5 }, buttonPrimary: { backgroundColor: C.green }, buttonSecondary: { backgroundColor: '#f4f5f0', borderWidth: 1, borderColor: C.line }, buttonCompact: { minHeight: 39, paddingHorizontal: 11, marginTop: 0 }, buttonDisabled: { opacity: 0.48 }, pressed: { opacity: 0.76 }, buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 }, buttonTextSecondary: { color: C.green }, buttonTextCompact: { fontSize: 12 },
  statsStrip: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingVertical: 12, backgroundColor: '#f8f8f4', borderRadius: 10 }, stat: { flex: 1, alignItems: 'center' }, statValue: { color: C.green, fontSize: 20, fontWeight: '700' }, statLabel: { color: C.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.65, marginTop: 2 }, statDivider: { width: 1, height: 31, backgroundColor: C.line },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 7, marginBottom: 11, gap: 8 }, eyebrow: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.05, marginBottom: 5 }, sectionTitle: { color: C.ink, fontSize: 20, fontWeight: '700', letterSpacing: -0.65 }, bodyMuted: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }, focusCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 13, marginBottom: 22 }, focusIcon: { height: 39, width: 39, borderRadius: 13, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' }, focusIconText: { color: C.amber, fontSize: 20 }, focusTitle: { fontSize: 13, color: C.ink, fontWeight: '700' }, focusCopy: { fontSize: 10, color: C.muted, marginTop: 3, lineHeight: 14, flexShrink: 1 }, roundArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }, roundArrowText: { color: '#fff', fontSize: 16, marginTop: -1 }, linkText: { color: C.green, fontSize: 11, fontWeight: '700', paddingVertical: 4 },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 65, paddingHorizontal: 10, backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.line }, resultDot: { height: 8, width: 8, borderRadius: 4 }, rowTitle: { color: C.ink, fontWeight: '700', fontSize: 12 }, rowSub: { color: C.muted, fontSize: 9, marginTop: 4 }, resultText: { fontSize: 10, fontWeight: '700' }, rowChevron: { color: C.faint, fontSize: 20, marginLeft: 1 }, smallEmpty: { paddingVertical: 17, paddingHorizontal: 13, backgroundColor: C.paper, borderRadius: 11, borderWidth: 1, borderColor: C.line }, smallEmptyText: { color: C.muted, fontSize: 12, lineHeight: 17 },
  pageIntro: { marginTop: 9, marginBottom: 19 }, pageTitle: { color: C.ink, fontSize: 31, lineHeight: 37, letterSpacing: -1.3, fontWeight: '700', marginTop: 10 }, pageSubtitle: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 5 }, insightCard: { minHeight: 174, borderRadius: 16, padding: 17, backgroundColor: C.green, marginBottom: 15, overflow: 'hidden' }, eyebrowLight: { color: '#c5d1bf', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, insightTitle: { color: '#fffdf6', fontSize: 24, lineHeight: 27, letterSpacing: -0.6, fontWeight: '700', marginTop: 13 }, insightCopy: { color: '#d3ddce', fontSize: 11, lineHeight: 16, maxWidth: 230, marginTop: 7 }, insightMark: { position: 'absolute', right: 13, bottom: 5, fontSize: 71, color: '#c8a767', opacity: 0.43 }, reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 12, backgroundColor: C.amberSoft, marginBottom: 15 }, reviewSummaryValue: { color: '#8b6324', fontSize: 27, fontWeight: '700' }, reviewSummaryTitle: { color: C.ink, fontSize: 12, fontWeight: '700' }, reviewSummarySub: { color: C.muted, fontSize: 10, marginTop: 3 },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#f0f1eb', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.line }, noticeIcon: { fontSize: 20, color: C.amber, width: 22, textAlign: 'center' }, noticeTitle: { fontSize: 11, fontWeight: '700', color: C.ink }, noticeCopy: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  empty: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 9 }, emptyMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 11 }, emptyMarkText: { color: '#94651b', fontSize: 23 }, emptyTitle: { color: C.ink, fontWeight: '700', fontSize: 14, textAlign: 'center' }, emptyDetail: { color: C.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 12, marginBottom: 8 }, backText: { color: C.green, fontWeight: '700', fontSize: 13 }, scoreHero: { backgroundColor: C.green, borderRadius: 16, padding: 17, marginBottom: 13 }, scoreLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }, scoreBig: { color: '#fff', fontSize: 47, fontWeight: '700', letterSpacing: -2 }, scoreOutOf: { color: '#d4decf', fontSize: 14, marginLeft: 4 }, scoreBrand: { color: '#cfb071', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginLeft: 'auto' }, scoreSummary: { color: '#e2e8df', fontSize: 12, lineHeight: 18, marginTop: 6 }, phaseCard: { backgroundColor: C.paper, borderRadius: 13, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line }, phaseHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, phaseTitle: { color: C.ink, fontWeight: '700', fontSize: 14 }, phaseScore: { color: C.green, fontWeight: '700', fontSize: 16 }, phaseOutOf: { color: C.muted, fontSize: 10, fontWeight: '500' }, phaseBody: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 8 }, lesson: { color: C.green, fontSize: 11, lineHeight: 16, marginTop: 6 }, loadingCard: { alignItems: 'center', paddingVertical: 20 },
  puzzleHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }, puzzleTitle: { color: C.ink, fontWeight: '700', fontSize: 19, marginTop: 4 }, puzzleBadge: { height: 36, width: 36, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' }, puzzleBadgeText: { color: '#92691f', fontWeight: '800', fontSize: 12 }, puzzlePrompt: { color: C.muted, fontSize: 12, marginTop: 6, marginBottom: 12 }, puzzleBoardWrap: { alignItems: 'center' }, board: { flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', borderRadius: 4, alignSelf: 'center' }, square: { alignItems: 'center', justifyContent: 'center', position: 'relative' }, pieceWrap: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }, legalDot: { position: 'absolute', width: '24%', height: '24%', borderRadius: 30, backgroundColor: '#25362950' }, captureRing: { position: 'absolute', inset: 2, borderRadius: 50, borderWidth: 4, borderColor: '#2536299a' }, rankLabel: { position: 'absolute', top: 2, left: 3, fontSize: 8, fontWeight: '800' }, fileLabel: { position: 'absolute', right: 3, bottom: 2, fontSize: 8, fontWeight: '800' }, feedbackBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#f4f0e6', padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 9 }, feedbackSuccess: { backgroundColor: '#e8f0e4' }, feedbackMark: { color: C.amber, fontSize: 15 }, feedbackText: { color: C.ink, fontSize: 11, lineHeight: 16, flex: 1 }, drillCard: { marginTop: 22, padding: 16, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 14 }, drillTitle: { color: C.ink, fontSize: 16, fontWeight: '700', marginTop: 4 }, drillStat: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12, marginTop: 13 }, drillNumber: { color: C.green, fontSize: 23, fontWeight: '700' }, drillStatLabel: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  modeSwitch: { flexDirection: 'row', padding: 4, backgroundColor: '#eaeae4', borderRadius: 11, marginBottom: 13 }, modeOption: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8 }, modeOptionActive: { backgroundColor: C.paper, shadowColor: '#182018', shadowOpacity: 0.07, shadowRadius: 5, elevation: 1 }, modeText: { color: C.muted, fontSize: 11, fontWeight: '600' }, modeTextActive: { color: C.green, fontWeight: '800' }, setupChoice: { padding: 13, borderWidth: 1, borderColor: C.line, backgroundColor: '#fbfbf8', borderRadius: 11, marginTop: 7 }, setupChoiceActive: { borderColor: C.green, backgroundColor: C.greenSoft }, opponentBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 }, avatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.green, fontSize: 19 }, engineDot: { width: 8, height: 8, borderRadius: 4 }, playStatus: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }, turnDot: { width: 7, height: 7, borderRadius: 4 }, playStatusText: { color: C.ink, fontSize: 11, fontWeight: '700', flex: 1 }, flipText: { color: C.muted, fontSize: 10, fontWeight: '700', padding: 5 }, playBoardWrap: { alignItems: 'center', backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 7 }, playTools: { flexDirection: 'row', gap: 8, marginTop: 11, marginBottom: 13 }, moveList: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 13, marginTop: 12 }, movePairs: { marginTop: 7 }, movePair: { minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#f1f1ed' }, moveNumber: { width: 23, color: C.faint, fontSize: 10 }, moveSan: { width: 50, color: C.ink, fontSize: 11, fontWeight: '600' },
  resourceFeature: { minHeight: 181, padding: 17, backgroundColor: C.green, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }, resourceFeatureTitle: { color: '#fffdf6', fontSize: 23, fontWeight: '700', letterSpacing: -0.7, marginTop: 11 }, resourceFeatureCopy: { maxWidth: 255, color: '#d7dfd3', fontSize: 11, lineHeight: 17, marginTop: 8 }, resourceFeatureMark: { position: 'absolute', right: 8, bottom: -9, fontSize: 83, color: '#d7bb80', opacity: 0.45 }, resourceCard: { flexDirection: 'row', gap: 12, backgroundColor: C.paper, padding: 13, borderWidth: 1, borderColor: C.line, borderRadius: 13, marginBottom: 9 }, resourceIcon: { height: 41, width: 41, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, resourceIconGreen: { backgroundColor: C.greenSoft }, resourceIconAmber: { backgroundColor: C.amberSoft }, resourceIconText: { color: C.green, fontSize: 20 }, resourceKind: { color: C.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, resourceTitle: { color: C.ink, fontSize: 13, fontWeight: '700', marginTop: 3 }, resourceAuthor: { color: C.green, fontSize: 10, fontWeight: '600', marginTop: 2 }, resourceNote: { color: C.muted, fontSize: 10, lineHeight: 14, marginTop: 5 }, filterRail: { flexGrow: 0, marginBottom: 12 }, filterChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: C.soft, marginRight: 6 }, filterChipActive: { backgroundColor: C.green }, filterText: { color: C.muted, fontSize: 9, fontWeight: '800' }, filterTextActive: { color: '#fff' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 21 }, quickCard: { width: '48%', minHeight: 94, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, padding: 12 }, quickIcon: { color: C.amber, fontSize: 17 }, quickTitle: { color: C.ink, fontSize: 11, fontWeight: '700', marginTop: 7 }, quickNote: { color: C.muted, fontSize: 9, marginTop: 3 },
  statsPanel: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.paper, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingVertical: 15, marginBottom: 18 }, progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }, progressTrack: { height: 8, backgroundColor: C.soft, borderRadius: 5, overflow: 'hidden', marginTop: 4 }, progressFill: { height: 8, backgroundColor: '#6c9561', borderRadius: 5 }, historyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 11, marginBottom: 7, backgroundColor: C.paper, borderRadius: 11, borderWidth: 1, borderColor: C.line },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 12 }, largeAvatar: { width: 53, height: 53, borderRadius: 18, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }, largeAvatarText: { color: C.green, fontWeight: '800', fontSize: 22 }, pathCard: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 70, padding: 12, marginBottom: 9, borderRadius: 12, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line }, pathNumber: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' }, pathNumberText: { color: '#8b6324', fontSize: 10, fontWeight: '800' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
