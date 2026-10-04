import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './PlayScreen.styles';
import { C, PIECE_NAMES, S, R, F, W, T, M } from '../theme';
import { getJSON, setJSON, STORAGE_KEYS } from '../storage/keys';
import { Chess } from 'chess.js';
import { Badge, Button, ChessBoard, SectionTitle } from '../components';
import { hasNativeStockfish, useStockfishEngine } from '../engine/useStockfishEngine';
import { markAnalysisEngineReady, markAnalysisEngineUnavailable, publishEngineOutput, registerAnalysisEngine, setCoachGameActive, withStockfishLock } from '../engine/analyzer';
import { recordActivity } from '../activity/store';

export function PlayScreen({
  playerRating,
  startingRating,
  coachPlanLaunch,
  playerKey,
  onSaveGame,
  onOpenHistory
}) {
  const [mode, setMode] = useState('local');
  const [playerColor, setPlayerColor] = useState('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState(null);
  const [orientation, setOrientation] = useState('w');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [engineStatus, setEngineStatus] = useState(hasNativeStockfish ? 'Starting Stockfish…' : 'Development build required');
  const [ratingAdjustment, setRatingAdjustment] = useState(0);
  const [adaptation, setAdaptation] = useState({
    wins: 0,
    draws: 0,
    losses: 0
  });
  const gameRef = useRef(new Chess());
  const engineReady = useRef(false);
  const engineCandidates = useRef({
    depth: 0,
    moves: {}
  });
  const resultRecorded = useRef(false);
  const savedGameKey = useRef(null);
  const bestMoveResolver = useRef(null);
  const autoStartBot = useRef(false);
  const engineTimer = useRef(null);
  const engineApiRef = useRef(null);
  const storageKey = STORAGE_KEYS.adaptive(playerKey);
  const baseRating = playerRating || startingRating || 1400;
  const requestedRating = Math.max(400, Math.min(3190, Math.round(baseRating + ratingAdjustment)));
  const targetRating = Math.max(1320, requestedRating);
  const requestedRatingRef = useRef(requestedRating);
  requestedRatingRef.current = requestedRating;
  useEffect(() => {
    if (coachPlanLaunch && (!gameStarted || gameRef.current.isGameOver())) { setMode('coach'); setGameStarted(false); setError(''); }
  }, [coachPlanLaunch]);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then(saved => {
      if (!active || !saved) return;
      const profile = JSON.parse(saved);
      setRatingAdjustment(Number(profile.adjustment) || 0);
      setAdaptation({
        wins: profile.wins || 0,
        draws: profile.draws || 0,
        losses: profile.losses || 0
      });
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [storageKey]);
  const handleEngineError = useCallback(message => {
    markAnalysisEngineUnavailable();
    engineReady.current = false;
    setEngineStatus('Engine error');
    if (bestMoveResolver.current) {
      bestMoveResolver.current(null);
      bestMoveResolver.current = null;
    }
    setError(message || 'Stockfish could not start.');
  }, []);
  const handleEngineOutput = useCallback(output => {
    publishEngineOutput(output);
    const lines = String(output || '').split(/\r?\n/).filter(line => line.trim());
    for (const line of lines) {
      if (line.includes('uciok')) engineApiRef.current?.sendCommandToStockfish('isready');
      if (line.includes('readyok')) {
        engineReady.current = true;
        markAnalysisEngineReady();
        setEngineStatus('Stockfish ready');
      }
      const candidate = line.match(/\binfo depth (\d+).*?\bmultipv (\d+).*?\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (candidate) {
        const depth = Number(candidate[1]);
        if (depth > engineCandidates.current.depth) engineCandidates.current = {
          depth,
          moves: {}
        };
        if (depth === engineCandidates.current.depth) engineCandidates.current.moves[Number(candidate[2])] = candidate[3];
      }
      const match = line.match(/\bbestmove\s+([a-h][1-8][a-h][1-8][qrbn]?|0000)/);
      if (match && bestMoveResolver.current) {
        clearTimeout(engineTimer.current);
        const resolve = bestMoveResolver.current;
        bestMoveResolver.current = null;
        const ranked = Object.keys(engineCandidates.current.moves).map(Number).sort((a, b) => a - b).map(rank => engineCandidates.current.moves[rank]);
        const currentTarget = requestedRatingRef.current;
        const weakerRank = currentTarget < 1320 ? Math.min(ranked.length - 1, Math.ceil((1320 - currentTarget) / 150)) : 0;
        resolve(match[1] === '0000' ? null : ranked[weakerRank] || match[1]);
      }
    }
  }, []);
  const engineApi = useStockfishEngine({
    onOutput: handleEngineOutput,
    onError: handleEngineError
  });
  engineApiRef.current = engineApi;
  useEffect(() => registerAnalysisEngine(engineApi), [engineApi.stockfishLoop, engineApi.stopStockfish, engineApi.sendCommandToStockfish]);
  useEffect(() => {
    if (!hasNativeStockfish) {
      markAnalysisEngineUnavailable();
      return undefined;
    }
    try {
      engineApi.stockfishLoop();
      engineApi.sendCommandToStockfish('uci');
    } catch {
      markAnalysisEngineUnavailable();
      setEngineStatus('Engine unavailable');
    }
    return () => {
      clearTimeout(engineTimer.current);
    };
  }, [engineApi.stockfishLoop, engineApi.sendCommandToStockfish]);
  const {
    width
  } = useWindowDimensions();
  const moves = gameRef.current.history({
    verbose: true
  });
  const legalMoves = selected ? gameRef.current.moves({
    square: selected,
    verbose: true
  }).map(m => m.to) : [];
  const piece = selected ? gameRef.current.get(selected) : null;
  const turn = gameRef.current.turn();
  const boardWidth = width - 64;
  const reset = () => {
    gameRef.current = new Chess();
    resultRecorded.current = false;
    autoStartBot.current = false;
    setFen(gameRef.current.fen());
    setSelected(null);
    setError('');
    setBusy(false);
  };
  const recordCoachResult = async () => {
    if (mode !== 'coach' || !gameRef.current.isGameOver() || resultRecorded.current) return;
    resultRecorded.current = true;
    const botColor = playerColor === 'w' ? 'b' : 'w';
    const outcome = gameRef.current.isDraw() ? 'draw' : gameRef.current.isCheckmate() && gameRef.current.turn() === botColor ? 'win' : 'loss';
    const adjustment = Math.max(-450, Math.min(450, ratingAdjustment + (outcome === 'win' ? 55 : outcome === 'loss' ? -55 : 0)));
    const next = {
      adjustment,
      wins: adaptation.wins + (outcome === 'win' ? 1 : 0),
      draws: adaptation.draws + (outcome === 'draw' ? 1 : 0),
      losses: adaptation.losses + (outcome === 'loss' ? 1 : 0)
    };
    setRatingAdjustment(adjustment);
    setAdaptation({
      wins: next.wins,
      draws: next.draws,
      losses: next.losses
    });
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };
  const doCoachMove = async () => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (mode !== 'coach' || gameRef.current.turn() !== botColor || gameRef.current.isGameOver()) return;
    setBusy(true);
    setError('');
    try {
      if (!engineReady.current) throw new Error('Stockfish is still starting. Please wait for it to be ready.');
      const move = await withStockfishLock(async () => {
        engineCandidates.current = { depth: 0, moves: {} };
        const multiPv = requestedRating < 1320 ? Math.min(5, 1 + Math.ceil((1320 - requestedRating) / 150)) : 1;
        engineApi.sendCommandToStockfish(`setoption name MultiPV value ${multiPv}`);
        engineApi.sendCommandToStockfish('setoption name UCI_LimitStrength value true');
        engineApi.sendCommandToStockfish(`setoption name UCI_Elo value ${targetRating}`);
        engineApi.sendCommandToStockfish(`position fen ${gameRef.current.fen()}`);
        return new Promise((resolve, reject) => {
          bestMoveResolver.current = resolve;
          engineTimer.current = setTimeout(() => {
            bestMoveResolver.current = null;
            engineApiRef.current?.sendCommandToStockfish('stop');
            reject(new Error('Stockfish did not respond. Try again or return to game setup.'));
          }, 12000);
          engineApi.sendCommandToStockfish('go movetime 1200');
        });
      });
      if (!move) throw new Error('Stockfish did not return a move.');
      gameRef.current.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] || 'q'
      });
      setFen(gameRef.current.fen());
      setSelected(null);
      await recordCoachResult();
    } catch (err) {
      setError(err.message || 'Coach move unavailable.');
    } finally {
      setBusy(false);
    }
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
    setFen(gameRef.current.fen());
    setSelected(null);
    setError('');
    setBusy(false);
    setOrientation(mode === 'coach' ? playerColor : 'w');
    autoStartBot.current = mode === 'coach' && playerColor === 'b';
    setGameStarted(true);
  };
  const tapSquare = async square => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (busy || mode === 'coach' && (!gameStarted || turn === botColor) || gameRef.current.isGameOver()) return;
    const selectedMoves = selected ? gameRef.current.moves({
      square: selected,
      verbose: true
    }) : [];
    const move = selectedMoves.find(candidate => candidate.to === square);
    if (move) {
      gameRef.current.move({
        from: move.from,
        to: move.to,
        promotion: 'q'
      });
      setFen(gameRef.current.fen());
      setSelected(null);
      await recordCoachResult();
      if (mode === 'coach' && !gameRef.current.isGameOver()) await doCoachMove();
      return;
    }
    const p = gameRef.current.get(square);
    if (p && p.color === turn) setSelected(square);else setSelected(null);
  };
  const undo = () => {
    gameRef.current.undo();
    if (mode === 'coach' && gameRef.current.history().length) gameRef.current.undo();
    setFen(gameRef.current.fen());
    setSelected(null);
    setError('');
  };
  const checkmate = gameRef.current.isCheckmate();
  const gameOver = gameRef.current.isGameOver();
  useEffect(() => {
    setCoachGameActive(mode === 'coach' && gameStarted && !gameOver);
    return () => setCoachGameActive(false);
  }, [mode, gameStarted, gameOver]);
  const status = checkmate ? `${turn === 'w' ? 'Black' : 'White'} wins by checkmate.` : gameRef.current.isStalemate() ? 'Draw by stalemate.' : gameRef.current.isCheck() ? `${turn === 'w' ? 'White' : 'Black'} is in check.` : `${turn === 'w' ? 'White' : 'Black'} to move`;
  useEffect(() => {
    if (!gameStarted || !gameOver || savedGameKey.current === fen) return;
    savedGameKey.current = fen;
    const draw = gameRef.current.isDraw();
    const whiteResult = draw ? 'draw' : gameRef.current.isCheckmate() ? gameRef.current.turn() === 'b' ? 'win' : 'loss' : 'draw';
    const blackResult = draw ? 'draw' : whiteResult === 'win' ? 'loss' : 'win';
    const stamp = Math.floor(Date.now() / 1000);
    const id = `local-${stamp}-${fen.slice(0, 8)}`;
    const game = {
      id,
      date: stamp * 1000,
      end_time: stamp,
      pgn: gameRef.current.pgn(),
      mode,
      playerColor: mode === 'coach' ? playerColor : null,
      resultLabel: mode === 'coach' ? draw ? 'draw' : playerColor === 'w' ? whiteResult : blackResult : status,
      opponentName: mode === 'coach' ? 'Adaptive Stockfish Coach' : 'Pass & play',
      time_class: 'local',
      white: {
        username: mode === 'coach' && playerColor === 'b' ? 'Stockfish Coach' : 'White',
        result: whiteResult
      },
      black: {
        username: mode === 'coach' && playerColor === 'w' ? 'Stockfish Coach' : 'Black',
        result: blackResult
      }
    };
    onSaveGame?.(game);
    if (mode === 'coach') recordActivity('game', id).catch(() => setError('Today’s activity could not be saved.'));
  }, [fen, gameOver, gameStarted, mode, playerColor, status, onSaveGame]);
  if (!gameStarted) return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Choose your game.</Text>
        <Text style={styles.pageSubtitle}>Play a friend on this device or face an adaptive Stockfish coach.</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>Opponent</Text>
      <Pressable accessibilityRole="radio" accessibilityLabel="Pass and play" accessibilityState={{ checked: mode === 'local' }} onPress={() => setMode('local')} style={[styles.setupChoice, mode === 'local' && styles.setupChoiceActive]}><Text style={styles.rowTitle}>Pass & play</Text>
        <Text style={styles.rowSub}>Take turns on this device.</Text></Pressable>
      <Pressable accessibilityRole="radio" accessibilityLabel="Adaptive Stockfish coach" accessibilityState={{ checked: mode === 'coach' }} onPress={() => setMode('coach')} style={[styles.setupChoice, mode === 'coach' && styles.setupChoiceActive]}><Text style={styles.rowTitle}>Adaptive Stockfish Coach</Text>
        <Text style={styles.rowSub}>Strength starts from your rating and adjusts from match results.</Text></Pressable>
      {mode === 'coach' && <><Text style={[styles.eyebrow, {
          marginTop: S.lg
        }]}>Play as</Text>
        <View style={styles.modeSwitch}>
        {['w', 'b'].map(color => <Pressable key={color} accessibilityRole="radio" accessibilityLabel={color === 'w' ? 'Play as White' : 'Play as Black'} accessibilityState={{ checked: playerColor === color }} onPress={() => setPlayerColor(color)} style={[styles.modeOption, playerColor === color && styles.modeOptionActive]}><Text style={[styles.modeText, playerColor === color && styles.modeTextActive]}>{color === 'w' ? 'White' : 'Black'}</Text></Pressable>)}
      </View>
        <Text style={styles.bodyMuted}>{playerColor === 'b' ? 'Stockfish will make the first move.' : 'You will make the first move.'}  ·  {playerRating ? `Chess.com rating ${playerRating}` : `Starting target ${startingRating || 1400}`}</Text>
      <View style={[styles.noticeCard, {
          marginTop: S.md
        }]}><Text style={styles.noticeIcon}>{engineReady.current ? '✓' : '…'}</Text>
        <View style={{
            flex: 1
          }}><Text style={styles.noticeTitle}>{engineStatus}</Text>
        <Text style={styles.noticeCopy}>{engineReady.current ? 'Ready to play offline.' : 'Keep this screen open while Stockfish starts.'}</Text></View></View></>}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <Button title={mode === 'coach' ? 'Start coach game' : 'Start pass & play'} onPress={startGame} disabled={mode === 'coach' && !engineReady.current} />
    </View>
        <View style={styles.bottomSpace} />
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>{mode === 'coach' ? `You are ${playerColor === 'w' ? 'White' : 'Black'}.` : 'Over the board.'}</Text>
        <Text style={styles.pageSubtitle}>{mode === 'coach' ? 'The coach adapts to your rating and results.' : 'Take turns with a friend on this device.'}</Text></View>
    <View style={styles.opponentBar}><View style={styles.avatar}><Text style={styles.avatarText}>{mode === 'coach' ? '♛' : '♙'}</Text></View>
        <View style={{
        flex: 1
      }}><Text style={styles.rowTitle}>{mode === 'coach' ? 'Adaptive Chess Coach' : 'Local game'}</Text>
        <Text style={styles.rowSub}>{mode === 'coach' ? `${engineStatus} · ~${requestedRating} target${playerRating ? ' from rating' : ' starting level'} · ${adaptation.wins}W ${adaptation.draws}D ${adaptation.losses}L` : 'Pass & play · White at bottom'}</Text></View>
        <View style={[styles.engineDot, {
        backgroundColor: mode === 'coach' && engineReady.current ? C.success : C.warning
      }]} /></View>
    <View style={styles.playStatus}><View style={[styles.turnDot, {
        backgroundColor: gameOver ? C.faint : C.amber
      }]} />
        <Text style={styles.playStatusText}>{busy ? 'Coach is thinking…' : mode === 'coach' && !gameOver ? turn === playerColor ? 'Your move' : 'Coach to move' : status}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Flip board" style={styles.backButton} onPress={() => {
        setOrientation(orientation === 'w' ? 'b' : 'w');
        setSelected(null);
      }}><Text style={styles.flipText}>⇅ Flip</Text></Pressable></View>
    <View style={styles.playBoardWrap}><ChessBoard game={gameRef.current} fen={fen} selected={selected} legalMoves={legalMoves} onSquare={tapSquare} width={boardWidth} orientation={orientation} /></View>
    <View style={styles.playTools}><Button title="↶ Undo" onPress={undo} secondary compact disabled={!moves.length || busy || gameOver} style={{
        flex: 1
      }} />
        <Button title="New game" secondary onPress={() => {
        reset();
        setGameStarted(false);
      }} compact style={{
        flex: 1
      }} /></View>
    {gameOver && <View style={styles.card}><Text style={styles.eyebrow}>Game complete</Text>
        <Text style={styles.cardTitle}>{status}</Text>
        <Text style={styles.cardCopy}>This game has been saved to your history on this device.</Text>
        <View style={styles.playTools}><Button title="Play again" onPress={startGame} compact style={{
          flex: 1
        }} />
        <Button title="Game history" onPress={onOpenHistory} compact secondary style={{
          flex: 1
        }} /></View></View>}
    {mode === 'coach' && !hasNativeStockfish && <View style={styles.noticeCard}><Text style={styles.noticeIcon}>⌁</Text>
        <View style={{
        flex: 1
      }}><Text style={styles.noticeTitle}>Install the development build</Text>
        <Text style={styles.noticeCopy}>Stockfish is included in the app’s native build. Expo Go does not include the engine module.</Text></View></View>}
    {!!error && <Text style={styles.errorText}>{error}</Text>}
    {!!error && mode === 'coach' && !gameOver && turn === (playerColor === 'w' ? 'b' : 'w') && <Button title={engineReady.current ? 'Ask coach again' : 'Return to game setup'} onPress={engineReady.current ? doCoachMove : () => {
      reset();
      setGameStarted(false);
    }} secondary />}
    <View style={styles.moveList}><Text style={styles.eyebrow}>Move list</Text>{moves.length ? <View style={styles.movePairs}>{Array.from({
          length: Math.ceil(moves.length / 2)
        }, (_, i) => <View key={i} style={styles.movePair}><Text style={styles.moveNumber}>{i + 1}.</Text>
        <Text style={styles.moveSan}>{moves[i * 2]?.san}</Text>
        <Text style={styles.moveSan}>{moves[i * 2 + 1]?.san || ''}</Text></View>)}</View> : <Text style={styles.bodyMuted}>Your game begins with the first move.</Text>}</View>
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
