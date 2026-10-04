import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Chess } from 'chess.js';
import puzzles from '../data/puzzles.json';
import { ChessBoard, Button } from '../components';
import { C, S, R, F, W, T, M } from '../theme';
import { moveToUci, ratingAfterPuzzle, uciToMove } from '../puzzles/catalog';

const pick = (rating, used) => {
  const pool = puzzles.filter((p) => p.moves?.length >= 2 && !used.has(p.id))
    .sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)).slice(0, 20);
  return pool[Math.floor(Math.random() * Math.min(pool.length, 10))] || null;
};

export function DiagnosticStep({ startingRating, onComplete, onSkip }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [fen, setFen] = useState('');
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [legal, setLegal] = useState([]);
  const [seconds, setSeconds] = useState(45);
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);
  const game = useRef(new Chess());
  const used = useRef(new Set());
  const difficulty = useRef(startingRating);
  const estimate = useRef(startingRating);
  const answers = useRef([]);
  const indexRef = useRef(0);
  const answeredRef = useRef(false);
  const finished = useRef(false);

  const next = useCallback(() => {
    if (indexRef.current >= 5) {
      if (!finished.current) { finished.current = true; onComplete({ estimatedRating: estimate.current, answers: answers.current }); }
      return;
    }
    const nextPuzzle = pick(difficulty.current, used.current);
    if (!nextPuzzle) {
      if (!finished.current) { finished.current = true; onComplete({ estimatedRating: estimate.current, answers: answers.current }); }
      return;
    }
    used.current.add(nextPuzzle.id);
    game.current = new Chess(nextPuzzle.fen);
    indexRef.current += 1;
    setPuzzle(nextPuzzle); setFen(game.current.fen()); setIndex(indexRef.current);
    setReady(false); setSelected(null); setLegal([]); setSeconds(45); setFeedback(''); setAnswered(false); answeredRef.current = false;
    setTimeout(() => {
      if (finished.current) return;
      try { game.current.move(uciToMove(nextPuzzle.moves[0])); setFen(game.current.fen()); setReady(true); }
      catch { answers.current.push({ correct: false, themes: nextPuzzle.themes }); estimate.current = ratingAfterPuzzle(estimate.current, nextPuzzle.rating, false); difficulty.current = Math.max(400, difficulty.current - 250); setFeedback('This position could not be loaded. Continue to the next puzzle.'); setAnswered(true); answeredRef.current = true; }
    }, 350);
  }, [index, onComplete]);

  useEffect(() => { next(); }, []);
  const answer = useCallback((correct, timedOut = false) => {
    if (answeredRef.current || !puzzle) return;
    answeredRef.current = true; setAnswered(true); setReady(false); setSelected(null); setLegal([]);
    answers.current.push({ correct, themes: puzzle.themes });
    estimate.current = ratingAfterPuzzle(estimate.current, puzzle.rating, correct);
    difficulty.current = Math.max(400, difficulty.current + (correct ? 250 : -250));
    if (correct) setFeedback('Correct.');
    else {
      const line = new Chess(game.current.fen());
      const best = line.move(uciToMove(puzzle.moves[1]));
      setFeedback(`${timedOut ? 'Time is up. ' : ''}The answer was ${best?.san || 'the best move'}.`);
    }
  }, [puzzle]);
  useEffect(() => {
    if (!ready || answered) return undefined;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) { clearInterval(timer); answer(false, true); return 0; }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [ready, answered, answer]);

  const onSquare = (square) => {
    if (!ready || answered) return;
    const current = game.current;
    if (selected && legal.includes(square)) {
      const move = current.move({ from: selected, to: square, promotion: 'q' });
      if (!move) return;
      setFen(current.fen()); setSelected(null); setLegal([]);
      answer(moveToUci(move) === puzzle.moves[1]);
      return;
    }
    const moves = current.moves({ square, verbose: true });
    if (moves.length) { setSelected(square); setLegal(moves.map((move) => move.to)); }
    else { setSelected(null); setLegal([]); }
  };
  const finishEarly = () => { if (!finished.current) { finished.current = true; onSkip({ estimatedRating: estimate.current, answers: answers.current }); } };
  return <View style={{ gap: S.md }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: F.body, lineHeight: T.body, color: C.ink, fontWeight: W.semibold }}>Puzzle {Math.min(index, 5)} of 5</Text>
      <Text style={{ fontSize: F.body, lineHeight: T.body, color: seconds <= 10 ? C.amber : C.muted, fontWeight: W.semibold }} accessibilityRole="timer">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
    </View>
    <Text style={{ fontSize: F.body, lineHeight: T.body, color: C.muted }}>{ready ? `${game.current.turn() === 'w' ? 'White' : 'Black'} to move` : 'Get ready…'} · Difficulty ${difficulty.current}</Text>
    {puzzle && <ChessBoard game={game.current} fen={fen} width={Math.min(width - 48, 430)} orientation={game.current.turn()} selected={selected} legalMoves={legal} onSquare={onSquare} />}
    {!!feedback && <Text style={{ fontSize: F.body, lineHeight: T.body, color: C.ink, minHeight: M.n24 }}>{feedback}</Text>}
    {answered ? <Button title={index >= 5 ? 'See my results' : 'Continue'} onPress={next} /> : <Text style={{ fontSize: F.body, lineHeight: T.body, color: C.muted }}>Take your time. Choose one move.</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel="Skip diagnostic" onPress={finishEarly} style={{ alignSelf: 'center', padding: S.sm }}><Text style={{ fontSize: F.body, lineHeight: T.body, color: C.muted, textDecorationLine: 'underline' }}>Skip diagnostic</Text></Pressable>
  </View>;
}
