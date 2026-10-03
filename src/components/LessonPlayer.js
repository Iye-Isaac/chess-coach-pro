import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Chess } from 'chess.js';
import { Badge } from './Badge';
import { Button } from './Button';
import { ChessBoard } from './ChessBoard';
import { C } from '../theme';
import styles from './LessonPlayer.styles';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const sanKey = (value) => String(value || '').replace(/[+#?!]+$/g, '').replace(/0/g, 'O');

export function LessonPlayer({ lesson, stepIndex, totalSteps, onNext, onMistake, isLastStep }) {
  const step = lesson.steps[stepIndex];
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(START_FEN);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [wrongCount, setWrongCount] = useState(0);
  const [answerShown, setAnswerShown] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [solved, setSolved] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoRun, setDemoRun] = useState(0);
  const [boardVersion, setBoardVersion] = useState(0);
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width - 48, 420);
  const legalMoves = useMemo(() => selected
    ? gameRef.current.moves({ square: selected, verbose: true }).map((move) => move.to)
    : [], [selected, boardVersion]);

  useEffect(() => {
    gameRef.current = new Chess(step.fen || START_FEN);
    setFen(gameRef.current.fen());
    setSelected(null);
    setFeedback('');
    setWrongCount(0);
    setAnswerShown(false);
    setHintShown(false);
    setSolved(false);
    setQuizChoice(null);
    setDemoIndex(0);
    setBoardVersion((value) => value + 1);
  }, [step]);

  useEffect(() => {
    if (step.type !== 'demo') return undefined;
    let index = 0;
    let timer;
    let active = true;
    const advance = () => {
      if (!active || index >= step.moves.length) return;
      const uci = step.moves[index];
      gameRef.current.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        ...(uci[4] ? { promotion: uci[4] } : {}),
      });
      index += 1;
      setDemoIndex(index);
      setFen(gameRef.current.fen());
      setBoardVersion((value) => value + 1);
      if (index < step.moves.length) timer = setTimeout(advance, 700);
    };
    timer = setTimeout(advance, 700);
    return () => { active = false; clearTimeout(timer); };
  }, [step, demoRun]);

  const replay = () => {
    gameRef.current = new Chess(step.fen);
    setFen(gameRef.current.fen());
    setDemoIndex(0);
    setDemoRun((value) => value + 1);
  };

  const chooseSquare = (square) => {
    if (step.type !== 'try' || solved) return;
    const piece = gameRef.current.get(square);
    if (!selected) {
      if (piece?.color === gameRef.current.turn()) setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      return;
    }
    const candidate = gameRef.current.moves({ square: selected, verbose: true }).find((move) => move.to === square);
    if (!candidate) {
      setSelected(piece?.color === gameRef.current.turn() ? square : null);
      return;
    }
    setSelected(null);
    const move = gameRef.current.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion || 'q' });
    const expected = (step.expect || []).map(sanKey);
    if (expected.includes(sanKey(move.san))) {
      setFen(gameRef.current.fen());
      setBoardVersion((value) => value + 1);
      setSolved(true);
      setFeedback(step.successFeedback || 'Correct.');
      return;
    }
    gameRef.current.undo();
    onMistake();
    const attempt = wrongCount + 1;
    setWrongCount(attempt);
    setFeedback(`${step.wrongFeedback || 'That move does not solve this position.'}${attempt >= 2 ? ` Answer: ${(step.expect || [])[0]}.` : ''}`);
    if (attempt >= 2) setAnswerShown(true);
  };

  const chooseQuiz = (index) => {
    if (solved) return;
    setQuizChoice(index);
    if (index === step.answerIndex) {
      setSolved(true);
      setFeedback(step.explain);
    } else {
      onMistake();
      setFeedback(`Not quite. ${step.explain}`);
    }
  };

  const hasBoard = step.type !== 'quiz';
  const orientation = step.fen?.split(' ')[1] || 'w';
  const caption = step.type === 'quiz' ? step.question : step.text;

  return <View style={styles.container}>
    {hasBoard && <View style={styles.boardWrap}>
      <ChessBoard
        game={gameRef.current}
        fen={fen}
        selected={selected}
        legalMoves={legalMoves}
        onSquare={chooseSquare}
        width={boardWidth}
        orientation={orientation}
      />
      {step.type === 'demo' && <View style={styles.demoTools}>
        <Text style={styles.demoCount}>MOVE {demoIndex} / {step.moves.length}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Replay demonstration" onPress={replay} style={styles.replayButton}><Text style={styles.replayText}>↻  Replay</Text></Pressable>
      </View>}
    </View>}

    <View style={styles.captionCard}>
      <View style={styles.captionTop}><Badge tone="amber">STEP {stepIndex + 1} OF {totalSteps}</Badge><Text style={styles.stepType}>{step.type.toUpperCase()}</Text></View>
      <Text style={styles.captionTitle}>{caption}</Text>

      {step.type === 'try' && !solved && <View style={styles.inlineActions}>
        <Button title={hintShown ? 'Hint shown' : 'Hint'} compact secondary disabled={hintShown} onPress={() => { setHintShown(true); setFeedback(step.hint); }} />
        {answerShown && <Text style={styles.answerText}>Solution: {(step.expect || [])[0]}</Text>}
      </View>}

      {step.type === 'quiz' && <View style={styles.options}>
        {step.options.map((option, index) => <Pressable
          key={option}
          accessibilityRole="radio"
          accessibilityState={{ checked: quizChoice === index }}
          accessibilityLabel={`Answer ${index + 1}: ${option}`}
          onPress={() => chooseQuiz(index)}
          style={[styles.option, quizChoice === index && (index === step.answerIndex ? styles.optionCorrect : styles.optionChosen)]}
        ><Text style={styles.optionText}>{option}</Text></Pressable>)}
      </View>}

      {!!feedback && <View style={[styles.feedback, solved && styles.feedbackSuccess]}><Text style={styles.feedbackText}>{feedback}</Text></View>}
      {step.type === 'demo' && <Text style={styles.helperText}>Moves play automatically. You can replay them at any time.</Text>}
      {step.type === 'try' && !solved && !hintShown && <Text style={styles.helperText}>Tap a piece, then its destination square.</Text>}
    </View>

    <View style={styles.progressDots} accessibilityLabel={`Step ${stepIndex + 1} of ${totalSteps}`}>
      {lesson.steps.map((_, index) => <View key={index} style={[styles.dot, index === stepIndex && styles.dotActive, index < stepIndex && styles.dotDone]} />)}
    </View>
    <View style={styles.bottomAction}>
      <Button title={isLastStep ? 'Finish lesson' : solved || ['text', 'demo'].includes(step.type) ? 'Continue' : 'Complete this step to continue'} onPress={onNext} disabled={!(solved || ['text', 'demo'].includes(step.type))} />
    </View>
  </View>;
}
