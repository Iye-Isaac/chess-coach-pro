import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chess } from 'chess.js';
import styles from './TrainScreen.styles';
import { STORAGE_KEYS, getJSON, setJSON } from '../storage/keys';
import { Badge, Button, ChessBoard } from '../components';
import { initialPuzzleRating, moveToUci, pickPuzzleSession, puzzlesForTheme, PUZZLE_THEMES, ratingAfterPuzzle, themeLabel, uciToMove } from '../puzzles/catalog';

const SESSION_LENGTH = 5;
const OPPONENT_MOVE_DELAY = 450;

export function TrainScreen({ onTab, profile }) {
  const [section, setSection] = useState('puzzles');
  const [learnedCount, setLearnedCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [puzzleRating, setPuzzleRating] = useState(800);
  const [storageReady, setStorageReady] = useState(false);
  const [session, setSession] = useState([]);
  const [sessionTheme, setSessionTheme] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(false);
  const [sessionRatingStart, setSessionRatingStart] = useState(800);
  const [streak, setStreak] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [fen, setFen] = useState('');
  const [orientation, setOrientation] = useState('w');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [hintStep, setHintStep] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [opponentThinking, setOpponentThinking] = useState(false);
  const [showingSolution, setShowingSolution] = useState(false);
  const [notice, setNotice] = useState('');
  const [boardVersion, setBoardVersion] = useState(0);
  const { width } = useWindowDimensions();
  const gameRef = useRef(new Chess());
  const timerRef = useRef(null);
  const currentPuzzleRef = useRef(null);
  const moveIndexRef = useRef(1);
  const puzzleFinishedRef = useRef(false);
  const hintUsedRef = useRef(false);
  const historyRef = useRef([]);
  const ratingRef = useRef(800);
  const sessionResultsRef = useRef([]);
  const solvedCountRef = useRef(0);
  const streakRef = useRef(0);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [savedTotal, savedHistory, savedRating] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.trainingSolved).catch(() => null),
        getJSON(STORAGE_KEYS.puzzleHistory, []),
        AsyncStorage.getItem(STORAGE_KEYS.puzzleRating).catch(() => null),
      ]);
      if (!active) return;
      const total = Number(savedTotal) || 0;
      const entries = Array.isArray(savedHistory) ? savedHistory : [];
      const initialRating = initialPuzzleRating(profile?.level);
      const rating = Number(savedRating) || initialRating;
      solvedCountRef.current = total;
      historyRef.current = entries;
      ratingRef.current = rating;
      setLearnedCount(total);
      setHistory(entries);
      setPuzzleRating(rating);
      setSessionRatingStart(rating);
      setStorageReady(true);
    })();
    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [profile?.level]);

  const clearPuzzleState = () => {
    setSelectedSquare(null);
    setHintStep(0);
    hintUsedRef.current = false;
    setWrongAttempts(0);
    setAttempts(0);
    attemptsRef.current = 0;
    setFeedback('');
    setPuzzleComplete(false);
    setPuzzleSolved(false);
    setOpponentThinking(true);
    setShowingSolution(false);
    puzzleFinishedRef.current = false;
  };

  const loadPuzzle = (puzzle) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    currentPuzzleRef.current = puzzle;
    gameRef.current = new Chess(puzzle.fen);
    moveIndexRef.current = 1;
    clearPuzzleState();
    setCurrentPuzzle(puzzle);
    setFen(gameRef.current.fen());
    setNotice('');
    timerRef.current = setTimeout(() => {
      if (currentPuzzleRef.current?.id !== puzzle.id) return;
      try {
        gameRef.current.move(uciToMove(puzzle.moves[0]));
        setFen(gameRef.current.fen());
        setOrientation(gameRef.current.turn());
        setBoardVersion((version) => version + 1);
        setOpponentThinking(false);
        setFeedback('Find the best continuation.');
      } catch {
        setOpponentThinking(false);
        setNotice('This puzzle line could not be loaded. Start another session to continue.');
      }
    }, OPPONENT_MOVE_DELAY);
  };

  const startSession = (theme = null) => {
    if (!storageReady) return;
    const nextSession = pickPuzzleSession(ratingRef.current, theme, historyRef.current, SESSION_LENGTH);
    if (nextSession.length < SESSION_LENGTH) {
      setNotice(nextSession.length
        ? `There are only ${nextSession.length} unused puzzles for this selection. Choose another theme or use the full puzzle set.`
        : 'No unused puzzles are available for this selection.');
      return;
    }
    sessionResultsRef.current = [];
    setSessionResults([]);
    setSession(nextSession);
    setSessionTheme(theme);
    setSessionRatingStart(ratingRef.current);
    setSessionSummary(false);
    setStreak(0);
    streakRef.current = 0;
    setSection('puzzles');
    loadPuzzle(nextSession[0]);
  };

  const finishPuzzle = (solved) => {
    if (puzzleFinishedRef.current || !currentPuzzleRef.current) return;
    puzzleFinishedRef.current = true;
    const puzzle = currentPuzzleRef.current;
    const passed = solved && !hintUsedRef.current;
    setPuzzleComplete(true);
    setPuzzleSolved(passed);
    setOpponentThinking(false);
    setShowingSolution(false);
    setSelectedSquare(null);
    setFeedback(passed ? 'Solved. Nice work.' : 'Puzzle complete. Review the idea, then keep going.');

    const result = {
      id: puzzle.id,
      solved: passed,
      attempts: attemptsRef.current,
      hintUsed: hintUsedRef.current,
      themes: puzzle.themes,
      ts: Date.now(),
    };
    const nextResults = [...sessionResultsRef.current, result];
    sessionResultsRef.current = nextResults;
    setSessionResults(nextResults);
    const nextRating = ratingAfterPuzzle(ratingRef.current, puzzle.rating, passed);
    ratingRef.current = nextRating;
    setPuzzleRating(nextRating);
    AsyncStorage.setItem(STORAGE_KEYS.puzzleRating, String(nextRating)).catch(() => {});

    const nextHistory = [...historyRef.current, result].slice(-500);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    setJSON(STORAGE_KEYS.puzzleHistory, nextHistory);
    if (passed) {
      solvedCountRef.current += 1;
      setLearnedCount(solvedCountRef.current);
      AsyncStorage.setItem(STORAGE_KEYS.trainingSolved, String(solvedCountRef.current)).catch(() => {});
      streakRef.current += 1;
    } else {
      streakRef.current = 0;
    }
    setStreak(streakRef.current);
  };

  const playOpponentReply = (replyIndex) => {
    setOpponentThinking(true);
    setSelectedSquare(null);
    timerRef.current = setTimeout(() => {
      if (puzzleFinishedRef.current) return;
      try {
        gameRef.current.move(uciToMove(currentPuzzleRef.current.moves[replyIndex]));
        moveIndexRef.current = replyIndex + 1;
        setFen(gameRef.current.fen());
        setBoardVersion((version) => version + 1);
        setOpponentThinking(false);
        setFeedback('Your turn.');
        if (moveIndexRef.current >= currentPuzzleRef.current.moves.length) finishPuzzle(true);
      } catch {
        setOpponentThinking(false);
        setNotice('The puzzle reply could not be played.');
      }
    }, OPPONENT_MOVE_DELAY);
  };

  const chooseSquare = (square) => {
    if (!currentPuzzle || puzzleComplete || opponentThinking || showingSolution) return;
    const piece = gameRef.current.get(square);
    const sideToMove = gameRef.current.turn();
    if (!selectedSquare) {
      if (piece?.color === sideToMove) {
        setSelectedSquare(square);
        setHintStep(0);
      }
      return;
    }
    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }
    const candidate = gameRef.current.moves({ square: selectedSquare, verbose: true })
      .find((move) => move.to === square);
    if (!candidate) {
      if (piece?.color === sideToMove) setSelectedSquare(square);
      else setFeedback('That move is not legal. Choose one of the highlighted squares.');
      return;
    }

    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);
    const candidateUci = moveToUci(candidate);
    const expectedUci = currentPuzzle.moves[moveIndexRef.current];
    gameRef.current.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion });
    setFen(gameRef.current.fen());
    setBoardVersion((version) => version + 1);
    const isMateTheme = currentPuzzle.themes.some((theme) => /^mateIn[123]$/.test(theme));
    if (isMateTheme && gameRef.current.isCheckmate()) {
      moveIndexRef.current += 1;
      finishPuzzle(true);
      return;
    }
    if (candidateUci !== expectedUci) {
      gameRef.current.undo();
      setFen(gameRef.current.fen());
      setBoardVersion((version) => version + 1);
      setSelectedSquare(null);
      setWrongAttempts((count) => count + 1);
      setFeedback('Not quite. Try another move.');
      return;
    }

    setSelectedSquare(null);
    setFeedback('Good move.');
    const replyIndex = moveIndexRef.current + 1;
    moveIndexRef.current += 2;
    if (replyIndex < currentPuzzle.moves.length) {
      playOpponentReply(replyIndex);
    } else {
      finishPuzzle(true);
    }
  };

  const useHint = () => {
    if (!currentPuzzle || puzzleComplete || opponentThinking || showingSolution) return;
    hintUsedRef.current = true;
    setHintStep((step) => Math.min(2, step + 1));
    setFeedback(hintStep === 0 ? 'Look at the piece that starts the combination.' : 'Now look at the destination square.');
  };

  const showSolution = () => {
    if (!currentPuzzle || puzzleComplete || showingSolution) return;
    hintUsedRef.current = true;
    setShowingSolution(true);
    setOpponentThinking(true);
    setFeedback('Showing the solution…');
    let index = moveIndexRef.current;
    const playNext = () => {
      if (index >= currentPuzzle.moves.length) {
        finishPuzzle(false);
        return;
      }
      try {
        gameRef.current.move(uciToMove(currentPuzzle.moves[index]));
        index += 1;
        moveIndexRef.current = index;
        setFen(gameRef.current.fen());
        setBoardVersion((version) => version + 1);
        timerRef.current = setTimeout(playNext, OPPONENT_MOVE_DELAY);
      } catch {
        finishPuzzle(false);
      }
    };
    timerRef.current = setTimeout(playNext, OPPONENT_MOVE_DELAY);
  };

  const continueSession = () => {
    if (!puzzleComplete) return;
    const nextIndex = sessionResultsRef.current.length;
    if (nextIndex >= SESSION_LENGTH) {
      setSessionSummary(true);
      setCurrentPuzzle(null);
      return;
    }
    loadPuzzle(session[nextIndex]);
  };

  const legalMoves = currentPuzzle && selectedSquare && !puzzleComplete
    ? gameRef.current.moves({ square: selectedSquare, verbose: true }).map((move) => move.to)
    : hintStep === 1 && currentPuzzle && !puzzleComplete
      ? [currentPuzzle.moves[moveIndexRef.current]?.slice(2, 4)].filter(Boolean)
      : [];
  const selected = hintStep === 1 && currentPuzzle
    ? currentPuzzle.moves[moveIndexRef.current]?.slice(0, 2)
    : hintStep === 2 && currentPuzzle
      ? currentPuzzle.moves[moveIndexRef.current]?.slice(2, 4)
      : selectedSquare;
  const currentIndex = Math.max(0, sessionResults.length);
  const missedThemes = [...new Set(sessionResults.filter((result) => !result.solved).flatMap((result) => result.themes))];
  const boardWidth = width - 40;
  const themeSolvedCount = (theme) => history.filter((entry) => entry.solved && entry.themes?.includes(theme)).length;
  const tagsAreMate = currentPuzzle?.themes?.some((theme) => /^mateIn[123]$/.test(theme));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.pageIntro}>
        <Badge tone="amber">TRAIN WITH PURPOSE</Badge>
        <Text style={styles.pageTitle}>Make the next move.</Text>
        <Text style={styles.pageSubtitle}>Small, consistent practice is how good instincts grow.</Text>
      </View>

      <View style={styles.modeSwitch}>
        {[
          ['puzzles', 'Puzzles'],
          ['themes', 'Themes'],
          ['mistakes', 'My mistakes'],
          ['openings', 'Openings'],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setSection(key)}
            style={[styles.modeOption, section === key && styles.modeOptionActive]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${label}`}
          >
            <Text style={[styles.modeText, section === key && styles.modeTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {!storageReady ? (
        <View style={styles.card}>
          <Text style={styles.bodyMuted}>Loading your offline puzzle progress…</Text>
        </View>
      ) : section === 'themes' ? (
        <View>
          <Text style={styles.cardTitle}>Practice by theme</Text>
          <Text style={styles.cardCopy}>Choose an idea to focus your next five puzzles.</Text>
          {PUZZLE_THEMES.map((theme) => (
            <Pressable
              key={theme}
              style={styles.themeRow}
              onPress={() => startSession(theme)}
              accessibilityRole="button"
              accessibilityLabel={`Practice ${themeLabel(theme)}, ${themeSolvedCount(theme)} solved`}
            >
              <Text style={styles.rowTitle}>{themeLabel(theme)}</Text>
              <Text style={styles.rowSub}>{themeSolvedCount(theme)} solved</Text>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : section === 'mistakes' ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>MY MISTAKES</Text>
          <Text style={styles.cardTitle}>A review list is on the way.</Text>
          <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Coming next</Text></View>
        </View>
      ) : section === 'openings' ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>OPENING PRACTICE</Text>
          <Text style={styles.cardTitle}>Play the first moves with a plan.</Text>
          <Text style={styles.cardCopy}>For now, practise these three habits in your next game: claim or challenge the centre, develop knights and bishops, then castle before launching an attack.</Text>
          {['Control the centre', 'Develop a piece each move', 'Keep your king safe'].map((item, index) => (
            <View key={item} style={styles.pathCard}>
              <View style={styles.pathNumber}><Text style={styles.pathNumberText}>{index + 1}</Text></View>
              <Text style={[styles.rowTitle, { flex: 1 }]}>{item}</Text>
              <Text style={styles.rowChevron}>✓</Text>
            </View>
          ))}
          <Button title="Play a focused game" onPress={() => onTab('play')} secondary />
        </View>
      ) : sessionSummary ? (
        <View style={styles.card}>
          <Badge tone="amber">SESSION COMPLETE</Badge>
          <Text style={styles.cardTitle}>Five thoughtful puzzles.</Text>
          <View style={styles.sessionSummaryGrid}>
            <View style={styles.sessionSummaryCell}>
              <Text style={styles.sessionSummaryValue}>{sessionResults.filter((item) => item.solved).length}</Text>
              <Text style={styles.drillStatLabel}>SOLVED</Text>
            </View>
            <View style={styles.sessionSummaryCell}>
              <Text style={styles.sessionSummaryValue}>{Math.round((sessionResults.filter((item) => item.solved).length / SESSION_LENGTH) * 100)}%</Text>
              <Text style={styles.drillStatLabel}>ACCURACY</Text>
            </View>
            <View style={styles.sessionSummaryCell}>
              <Text style={styles.sessionSummaryValue}>{puzzleRating - sessionRatingStart > 0 ? '+' : ''}{puzzleRating - sessionRatingStart}</Text>
              <Text style={styles.drillStatLabel}>RATING</Text>
            </View>
          </View>
          <Text style={styles.bodyMuted}>Themes to revisit: {missedThemes.length ? missedThemes.map(themeLabel).join(', ') : 'None this session'}.</Text>
          <Button title="Next session" onPress={() => startSession(sessionTheme)} />
          <Button title="Back" onPress={() => { setSessionSummary(false); setSession([]); setCurrentPuzzle(null); }} secondary />
        </View>
      ) : currentPuzzle ? (
        <View>
          <View style={styles.ratingStrip}>
            <View>
              <Text style={styles.eyebrow}>PUZZLE RATING</Text>
              <Text style={styles.ratingValue}>{puzzleRating}</Text>
            </View>
            <View style={styles.sessionMarker}>
              <Text style={styles.sessionMarkerText}>PUZZLE {Math.min(currentIndex + 1, SESSION_LENGTH)} / {SESSION_LENGTH}</Text>
              <Text style={styles.streakText}>{streak ? `🔥 ${streak} in a row` : 'Build your streak'}</Text>
            </View>
          </View>
          <View style={styles.puzzleHeading}>
            <View>
              <Text style={styles.eyebrow}>{opponentThinking ? 'THE POSITION IS SETTING UP' : 'YOUR TURN'}</Text>
              <Text style={styles.puzzleTitle}>{gameRef.current.turn() === 'w' ? 'White' : 'Black'} to move</Text>
            </View>
            <View style={styles.puzzleBadge}><Text style={styles.puzzleBadgeText}>{String(currentIndex + 1).padStart(2, '0')}</Text></View>
          </View>
          <View style={styles.sessionDots}>
            {session.map((puzzle, index) => (
              <View key={puzzle.id} style={[styles.sessionDot, index <= currentIndex && styles.sessionDotActive]} />
            ))}
          </View>
          <View style={styles.puzzleBoardWrap}>
            <ChessBoard
              key={`${currentPuzzle.id}-${boardVersion}`}
              game={gameRef.current}
              fen={fen}
              selected={selected}
              legalMoves={legalMoves}
              onSquare={chooseSquare}
              width={boardWidth}
              orientation={orientation}
            />
          </View>
          <View style={styles.puzzleMetaRow}>
            <Text style={styles.puzzlePrompt}>{opponentThinking ? 'Opponent is moving…' : `Puzzle · ${currentPuzzle.rating}`}</Text>
            {puzzleComplete && currentPuzzle.themes.map((theme) => <Badge key={theme}>{themeLabel(theme)}</Badge>)}
          </View>
          <View style={[styles.feedbackBox, puzzleSolved && styles.feedbackSuccess]}>
            <Text style={styles.feedbackMark}>{puzzleSolved ? '✓' : '✦'}</Text>
            <Text style={styles.feedbackText}>{feedback || 'Select a piece, then choose its destination.'}</Text>
          </View>
          {hintStep === 1 && !puzzleComplete && <Text style={styles.hintNote}>The highlighted piece starts the line.</Text>}
          {hintStep === 2 && !puzzleComplete && <Text style={styles.hintNote}>The highlighted square is the destination.</Text>}
          <View style={styles.puzzleActions}>
            {!puzzleComplete && <Button title={hintStep === 1 ? 'Show destination' : 'Hint'} onPress={useHint} secondary compact disabled={opponentThinking || showingSolution} style={{ flex: 1 }} />}
            {!puzzleComplete && wrongAttempts >= 2 && <Button title="Show solution" onPress={showSolution} secondary compact disabled={showingSolution} style={{ flex: 1 }} />}
            {puzzleComplete && <Button title={sessionResults.length >= SESSION_LENGTH ? 'See session results' : 'Next puzzle'} onPress={continueSession} style={{ flex: 1 }} />}
          </View>
          {!!notice && <Text style={styles.errorText}>{notice}</Text>}
        </View>
      ) : (
        <View style={styles.card}>
          <Badge tone="amber">FIVE PUZZLES · OFFLINE</Badge>
          <Text style={styles.cardTitle}>Build your tactical instincts.</Text>
          <Text style={styles.cardCopy}>Your puzzle rating adjusts as you solve. Each session uses new positions from the offline library.</Text>
          <View style={styles.ratingCallout}>
            <Text style={styles.ratingCalloutLabel}>CURRENT PUZZLE RATING</Text>
            <Text style={styles.ratingValue}>{puzzleRating}</Text>
          </View>
          <Text style={styles.drillStatLabel}>{learnedCount} PUZZLES SOLVED ON THIS DEVICE</Text>
          <Button title="Start a 5-puzzle session" onPress={() => startSession()} busy={!storageReady} />
          {!!notice && <Text style={styles.errorText}>{notice}</Text>}
          {!puzzlesForTheme(null).length && <Text style={styles.errorText}>The offline puzzle set has not been built yet.</Text>}
        </View>
      )}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}
