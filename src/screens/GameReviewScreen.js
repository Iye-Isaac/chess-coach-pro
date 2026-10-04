import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PanResponder, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Chess } from 'chess.js';
import styles from './GameReviewScreen.styles';
import { C, S, R, F, W, T, M } from '../theme';
import { Badge, Button, Empty, ChessBoard } from '../components';
import { isCoachBackendConfigured, requestGameAnalysis } from '../services/coachApi';
import { gameDate, opponentName } from '../services/chessCom';
import { ANALYSIS_CONFIG, analyzeGame } from '../engine/analyzer';
import { getJSON, STORAGE_KEYS } from '../storage/keys';
import { loadAutoSaveBlunders, saveMistakeMoments } from '../training/mistakes';
import { savePendingAnalysis } from '../activity/store';

const COLORS = { best: C.best, good: C.good, inaccuracy: C.inaccuracy, mistake: C.mistake, blunder: C.blunder };
const LABELS = { best: 'Best', good: 'Good', inaccuracy: 'Inaccuracy', mistake: 'Mistake', blunder: 'Blunder' };
const NOOP = () => {};

const ReviewMoveChip = memo(function ReviewMoveChip({ move, index, active, onSelect }) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Move ${move.moveNumber} ${move.color === 'w' ? 'White' : 'Black'} ${move.san}, ${LABELS[move.classification]}`}
    onPress={() => onSelect(index + 1)}
    style={[styles.moveChip, active && styles.moveChipActive]}
  >
    <Text style={styles.moveNumber}>{move.color === 'w' ? `${move.moveNumber}.` : ''}</Text>
    <Text style={[styles.moveSan, { color: C.ink }]}>{move.san}{({ best: ' ★', good: ' ✓', inaccuracy: ' ?!', mistake: ' ?', blunder: ' ??' })[move.classification]}</Text>
  </Pressable>;
});

const ReviewMoveList = memo(function ReviewMoveList({ moves, currentPly, onSelect }) {
  return <View style={styles.movesCard}>
    <Text style={styles.sectionTitle}>Move list</Text>
    <View style={styles.moveGrid}>{moves.map((move, index) => <ReviewMoveChip
      key={move.ply}
      move={move}
      index={index}
      active={currentPly === index + 1}
      onSelect={onSelect}
    />)}</View>
  </View>;
});

const CriticalMomentCard = memo(function CriticalMomentCard({ moment, orientation, saved, onSave }) {
  const miniGame = useMemo(() => new Chess(moment.fenBefore), [moment.fenBefore]);
  return <View style={styles.criticalCard}>
    <View style={styles.criticalTop}><View style={styles.miniBoard}><ChessBoard game={miniGame} fen={moment.fenBefore} selected={null} legalMoves={[]} onSquare={NOOP} width={76} orientation={orientation} /></View>
      <View style={styles.criticalDetails}><Badge tone={moment.classification === 'blunder' ? 'amber' : 'neutral'}>{LABELS[moment.classification]}</Badge><Text style={styles.criticalPlayed}>You played {moment.san}</Text><Text style={styles.criticalBest}>Best was {moment.bestSan}</Text><Text style={styles.criticalLoss}>{Math.round(moment.cpLoss)} cp · {Math.round(moment.winPctDrop)}% win chance lost</Text><Text style={styles.phaseTag}>{moment.phase} · Move {moment.moveNumber}</Text></View>
    </View>
    <Button title={saved ? 'Saved to My mistakes' : 'Train this'} onPress={() => onSave(moment)} disabled={saved} secondary />
  </View>;
});

function EvalGraph({ analysis, currentPly, onSelect }) {
  const [width, setWidth] = useState(300);
  const evaluations = analysis.evaluations || [];
  const height = 116;
  const points = evaluations.map((item, index) => {
    const x = evaluations.length < 2 ? width / 2 : index * width / (evaluations.length - 1);
    const score = Math.max(-1000, Math.min(1000, item.scoreWhite || 0));
    return { x, y: height / 2 - score * (height * 0.44 / 1000) };
  });
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = points.length ? `${line} L ${width} ${height / 2} L 0 ${height / 2} Z` : '';
  const activeX = evaluations.length > 1 ? (currentPly / (evaluations.length - 1)) * width : 0;
  const selectAt = (x) => onSelect(Math.max(0, Math.min(evaluations.length - 1, Math.round((x / Math.max(width, 1)) * Math.max(0, evaluations.length - 1)))));
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => selectAt(event.nativeEvent.locationX),
    onPanResponderMove: (event) => selectAt(event.nativeEvent.locationX),
  }), [width, evaluations.length]);
  return <View style={styles.graphWrap} onLayout={(event) => setWidth(event.nativeEvent.layout.width)} {...responder.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Evaluation graph. Drag to move through the game.">
    <View style={styles.graphLabels}><Text style={styles.eyebrow}>White advantage</Text><Text style={styles.graphHint}>Drag to explore</Text></View>
    <Svg width={width} height={height}>
      <Path d={`M 0 ${height / 2} L ${width} ${height / 2}`} stroke={C.paper} strokeWidth="1" strokeDasharray="4 4" />
      {area ? <Path d={area} fill={C.greenSoft} opacity="0.8" /> : null}
      {line ? <Path d={line} fill="none" stroke={C.green} strokeWidth="2.5" /> : null}
      {(analysis.criticalMoments || []).map((move) => {
        const x = (move.ply / Math.max(evaluations.length - 1, 1)) * width;
        const y = points[move.ply - 1]?.y ?? height / 2;
        return <Circle key={move.ply} cx={x} cy={y} r="4" fill={C.amber} stroke={C.white} strokeWidth="1.5" />;
      })}
      <Path d={`M ${activeX} 0 L ${activeX} ${height}`} stroke={C.red} strokeWidth="1.5" opacity="0.8" />
    </Svg>
    <View style={styles.graphAxis}><Text style={styles.graphHint}>White</Text><Text style={styles.graphHint}>Even</Text><Text style={styles.graphHint}>Black</Text></View>
  </View>;
}

export function GameReviewScreen({ game, username, onBack }) {
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [savedMoments, setSavedMoments] = useState({});
  const [autoSaveBlunders, setAutoSaveBlunders] = useState(null);
  const [currentPly, setCurrentPly] = useState(0);
  const controller = useRef(null);
  const autoSavedGameRef = useRef(null);
  const { width } = useWindowDimensions();
  const backendReady = isCoachBackendConfigured();
  const gameId = String(game.id || game.url || `${game.end_time || game.date}-${game.white?.username || ''}-${game.black?.username || ''}`);
  const selectPly = useCallback((ply) => setCurrentPly(ply), []);

  const load = useCallback(async () => {
    controller.current?.abort();
    const abortController = new AbortController();
    controller.current = abortController;
    setError('');
    try {
      const saved = await getJSON(STORAGE_KEYS.analysis(gameId));
      if (saved?.moves) {
        setAnalysis(saved);
        setProgress(null);
        await savePendingAnalysis(null, gameId);
        return;
      }
      setProgress({ current: 0, total: 1, message: 'Preparing game…' });
      await savePendingAnalysis({ gameId, game, ts: Date.now() });
      const result = await analyzeGame({ game, username, signal: abortController.signal, onProgress: setProgress });
      if (!abortController.signal.aborted) { setAnalysis(result); await savePendingAnalysis(null, gameId); }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'On-device analysis could not be completed.');
    } finally {
      if (controller.current === abortController) setProgress(null);
    }
  }, [game, gameId, username]);

  useEffect(() => {
    load();
    return () => controller.current?.abort();
  }, [load]);

  useEffect(() => {
    loadAutoSaveBlunders().then(setAutoSaveBlunders);
  }, []);

  useEffect(() => {
    if (!analysis) return;
    getJSON(STORAGE_KEYS.mistakes, []).then((records) => {
      const savedFens = new Set((Array.isArray(records) ? records : []).map((record) => record.fen));
      const saved = {};
      for (const moment of analysis.criticalMoments) {
        if (savedFens.has(moment.fenBefore)) saved[moment.ply] = true;
      }
      setSavedMoments(saved);
    });
  }, [analysis]);

  useEffect(() => {
    if (!analysis || autoSaveBlunders !== true || autoSavedGameRef.current === gameId) return;
    const blunders = analysis.criticalMoments.filter((moment) => moment.winPctDrop >= ANALYSIS_CONFIG.thresholds.blunder);
    if (!blunders.length) {
      autoSavedGameRef.current = gameId;
      return;
    }
    autoSavedGameRef.current = gameId;
    saveMistakeMoments(blunders, gameId).then(({ records }) => {
      const saved = {};
      for (const moment of blunders) if (records.some((record) => record.fen === moment.fenBefore)) saved[moment.ply] = true;
      setSavedMoments((current) => ({ ...current, ...saved }));
    }).catch(() => {});
  }, [analysis, autoSaveBlunders, gameId]);

  const position = analysis?.positions?.[currentPly];
  const activeMove = analysis?.moves?.[currentPly - 1];
  const arrowIsUseful = activeMove && ['inaccuracy', 'mistake', 'blunder'].includes(activeMove.classification);
  const boardPosition = arrowIsUseful ? activeMove.fenBefore : position;
  const moveHighlight = activeMove?.uci ? [activeMove.uci.slice(0, 2), activeMove.uci.slice(2, 4)] : [];
  const boardGame = useMemo(() => {
    try { return boardPosition ? new Chess(boardPosition) : new Chess(); } catch { return new Chess(); }
  }, [boardPosition]);
  const boardWidth = Math.min(width - 48, 420);
  const counts = analysis ? ['inaccuracy', 'mistake', 'blunder'].map((kind) => ({
    kind,
    white: analysis.white.counts[kind],
    black: analysis.black.counts[kind],
  })) : [];

  const askCoach = async () => {
    if (!analysis || !backendReady) return;
    setCoachBusy(true);
    setError('');
    try {
      const result = await requestGameAnalysis({
        username,
        criticalMoments: analysis.criticalMoments.map(({ fenBefore, san, bestSan, cpLoss, phase }) => ({ fen: fenBefore, playedSan: san, bestSan, cpLoss, phase })),
        stats: { whiteAccuracy: analysis.white.accuracy, blackAccuracy: analysis.black.accuracy, plies: analysis.totalPlies },
      });
      setReview(result);
    } catch (err) {
      setError(err.message || 'The written coach could not complete this review.');
    } finally {
      setCoachBusy(false);
    }
  };

  const saveMoment = useCallback(async (moment) => {
    try {
      const result = await saveMistakeMoments([moment], gameId);
      setSavedMoments((current) => ({ ...current, [moment.ply]: true }));
      Alert.alert('Position saved', `${result.addedCount ? 'Added to your mistake bank.' : 'This position was already saved.'}\n${result.dueCount} position${result.dueCount === 1 ? '' : 's'} due now.`);
    } catch (err) {
      Alert.alert('Could not save position', err.message || 'Try again in a moment.');
    }
  }, [gameId]);

  const saveAllMoments = async () => {
    try {
      const result = await saveMistakeMoments(analysis.criticalMoments, gameId);
      const saved = {};
      for (const moment of analysis.criticalMoments) saved[moment.ply] = true;
      setSavedMoments((current) => ({ ...current, ...saved }));
      Alert.alert('Critical moments saved', `${result.addedCount} new position${result.addedCount === 1 ? '' : 's'} added. ${result.dueCount} position${result.dueCount === 1 ? '' : 's'} due now.`);
    } catch (err) {
      Alert.alert('Could not save positions', err.message || 'Try again in a moment.');
    }
  };

  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to game list" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  All games</Text></Pressable>
    <View style={styles.pageIntro}>
      <Badge tone="amber">Game review</Badge>
      <Text style={styles.pageTitle}>A game is a lesson.</Text>
      <Text style={styles.pageSubtitle}>vs. {opponentName(game, username)}  ·  {gameDate(game.end_time || Math.floor((game.date || Date.now()) / 1000))}  ·  {game.time_class || 'chess'}</Text>
    </View>

    {analysis ? <>
      <View style={styles.statsCard}>
        <Text style={styles.eyebrow}>Accuracy</Text>
        <View style={styles.accuracyRow}>
          <View style={styles.accuracySide}><Text style={styles.accuracyValue}>{Math.round(analysis.white.accuracy)}%</Text><Text style={styles.accuracyLabel}>White</Text></View>
          <View style={styles.accuracyDivider} />
          <View style={styles.accuracySide}><Text style={styles.accuracyValue}>{Math.round(analysis.black.accuracy)}%</Text><Text style={styles.accuracyLabel}>Black</Text></View>
        </View>
        <View style={styles.countRow}>{counts.map((item) => <View key={item.kind} style={styles.countItem}><View style={[styles.countDot, { backgroundColor: COLORS[item.kind] }]} /><Text style={styles.countText}>{({ inaccuracy: 'Inaccuracies', mistake: 'Mistakes', blunder: 'Blunders' })[item.kind]}</Text><Text style={styles.countNumber}>{item.white} / {item.black}</Text></View>)}</View>
        <Text style={styles.countLegend}>White / Black</Text>
      </View>

      <EvalGraph analysis={analysis} currentPly={currentPly} onSelect={selectPly} />

      <View style={styles.boardCard}>
        <View style={styles.boardHead}><Text style={styles.boardTitle}>Move {currentPly ? `${Math.ceil(currentPly / 2)}${currentPly % 2 ? '…' : '.'}` : '0'}</Text><Text style={styles.boardEval}>{currentPly ? `${activeMove?.san || ''}  ·  ${LABELS[activeMove?.classification] || 'Position'}` : 'Starting position'}</Text></View>
        <ChessBoard game={boardGame} fen={boardPosition} selected={null} legalMoves={[]} onSquare={NOOP} width={boardWidth} orientation={analysis.userColor || 'w'} bestMove={arrowIsUseful ? activeMove.bestUci : null} bestMoveColor={COLORS.best} highlightedSquares={moveHighlight} highlightColor={COLORS[activeMove?.classification] || COLORS.best} />
        <View style={styles.reviewLegend}>{Object.entries(LABELS).map(([kind, label]) => <View key={kind} style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS[kind] }]} /><Text style={styles.legendLabel}>{label}</Text></View>)}</View>
        <View style={styles.stepRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous move" onPress={() => setCurrentPly((ply) => Math.max(0, ply - 1))} style={styles.stepButton}><Text style={styles.stepText}>‹  Previous</Text></Pressable>
          <Text style={styles.plyText}>{currentPly} / {analysis.totalPlies}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next move" onPress={() => setCurrentPly((ply) => Math.min(analysis.totalPlies, ply + 1))} style={styles.stepButton}><Text style={styles.stepText}>Next  ›</Text></Pressable>
        </View>
        {activeMove && <Text style={styles.bestMoveNote}>Played {activeMove.san} · Best was {activeMove.bestSan}{activeMove.cpLoss ? ` · ${Math.round(activeMove.cpLoss)} cp lost` : ''}</Text>}
      </View>

      <ReviewMoveList moves={analysis.moves} currentPly={currentPly} onSelect={selectPly} />

      <View style={styles.criticalSection}>
        <Text style={styles.sectionTitle}>Critical moments</Text>
        <Text style={styles.sectionCopy}>The biggest turning points from your side of the board.</Text>
        {!!analysis.criticalMoments.length && <Button title="Save all critical moments" onPress={saveAllMoments} secondary />}
        {analysis.criticalMoments.length ? analysis.criticalMoments.map((moment) => <CriticalMomentCard key={moment.ply} moment={moment} orientation={analysis.userColor || 'w'} saved={savedMoments[moment.ply]} onSave={saveMoment} />) : <View style={styles.noticeCard}><Text style={styles.noticeCopy}>No major turning points were found among the moves played from a balanced position.</Text></View>}
      </View>
    </> : <View style={styles.card}>
      {progress ? <View style={styles.loadingCard}><ActivityIndicator color={C.green} /><Text style={styles.cardTitle}>{progress.message}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, progress.total ? progress.current / progress.total * 100 : 0)}%` }]} /></View><Text style={styles.cardCopy}>Analysis runs locally. You can cancel it at any time.</Text><Button title="Cancel analysis" onPress={() => controller.current?.abort()} secondary /></View>
        : <><Empty mark="♟" title="On-device analysis unavailable" detail={error || 'Install the native development build to analyze this game offline.'} /><Button title="Try analysis again" onPress={load} secondary /></>}
    </View>}

    {error && analysis && <Text style={styles.errorText}>{error}</Text>}
    {analysis && <View style={styles.coachCard}><View style={styles.coachHead}><View style={{ flex: 1 }}><Text style={styles.coachTitle}>Written coach notes</Text><Text style={styles.coachCopy}>Optional feedback based only on the engine-verified critical moments above.</Text></View><Text style={styles.coachMark}>✦</Text></View>
      {review ? <><Text style={styles.coachSummary}>{review.overall_summary}</Text>{['opening_review', 'middlegame_review', 'endgame_review'].map((key) => review[key] ? <Text key={key} style={styles.coachPhase}>{review[key]}</Text> : null)}</> : <Button title={coachBusy ? 'Coach is writing…' : backendReady ? 'Ask the written coach' : 'AI coach setup needed'} onPress={askCoach} disabled={!backendReady || coachBusy} secondary />}
      {coachBusy && <ActivityIndicator color={C.green} />}
      {!backendReady && !review && <Text style={styles.cardCopy}>Local engine analysis is complete. Connect the optional coach service in app setup to request written notes.</Text>}
    </View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
