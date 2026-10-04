import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Switch, Text, View, useWindowDimensions } from 'react-native';
import { Chess } from 'chess.js';
import { Badge, Button, ChessBoard } from '../components';
import { C, S, R, F, W, T, M } from '../theme';
import { STORAGE_KEYS, setJSON } from '../storage/keys';
import { loadAutoSaveBlunders, loadMistakes } from './mistakes';
import { dueRecords, getDueCount, nextState } from './scheduler';
import styles from './MistakeDrill.styles';
import { readToday, recordActivity } from '../activity/store';

const normalizeSan = (san) => String(san || '').trim().replace(/[+#?!]+$/g, '').replace(/0/g, 'O');

function nextDueCopy(timestamp) {
  if (!timestamp) return '';
  const hours = Math.max(1, Math.ceil((timestamp - Date.now()) / (60 * 60 * 1000)));
  if (hours < 24) return `Next position due in ${hours} hour${hours === 1 ? '' : 's'}.`;
  const days = Math.ceil(hours / 24);
  if (days < 7) return `Next position due in ${days} day${days === 1 ? '' : 's'}.`;
  return `Next position due ${new Date(timestamp).toLocaleDateString()}.`;
}

function whyItMatters(cpLoss) {
  const pawns = Math.max(0.1, cpLoss / 100).toFixed(1);
  return `Your move gave up about ${pawns} pawns of evaluation. Look for this idea next time.`;
}

export function MistakeDrill({ onTab, initialIds }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [queue, setQueue] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [fen, setFen] = useState('');
  const [orientation, setOrientation] = useState('w');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [resolved, setResolved] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [boardVersion, setBoardVersion] = useState(0);
  const { width } = useWindowDimensions();
  const gameRef = useRef(new Chess());
  const recordsRef = useRef([]);
  const startedFromPlan = useRef(false);
  const processing = useRef(false);
  const mistakesQueue = queue[cursor];
  const current = mistakesQueue ? records.find((record) => record.id === mistakesQueue.id) : null;
  const due = useMemo(() => dueRecords(records), [records]);
  const future = useMemo(() => records.filter((record) => record.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt), [records]);
  const boardWidth = Math.min(width - 40, 420);
  const legalMoves = selected && current && !resolved
    ? gameRef.current.moves({ square: selected, verbose: true }).map((move) => move.to)
    : [];

  useEffect(() => {
    let active = true;
    loadMistakes().then(async (saved) => {
      if (!active) return;
      recordsRef.current = saved;
      setRecords(saved);
      setLoading(false);
    });
    loadAutoSaveBlunders().then((enabled) => { if (active) setAutoSave(enabled); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!current) return;
    try {
      gameRef.current = new Chess(current.fen);
      setFen(current.fen);
      setOrientation(current.sideToMove || current.fen.split(' ')[1] || 'w');
      setSelected(null);
      setFeedback('');
      setResolved(false);
      setWrongAttempts(0);
      setBoardVersion((version) => version + 1);
    } catch {
      setFeedback('This saved position is no longer valid and cannot be played.');
      setResolved(true);
    }
  }, [current?.id, cursor]);

  const startSession = () => {
    const ready = dueRecords(recordsRef.current).filter((record) => !initialIds || initialIds.includes(record.id));
    if (!ready.length) return;
    setQueue(ready.map((record) => ({ id: record.id, retry: false })));
    setCursor(0);
    setSessionSummary(null);
    setSessionActive(true);
  };

  const persistRecord = async (record, correct) => {
    await readToday();
    const next = nextState(record, correct, Date.now());
    const updated = recordsRef.current.map((item) => item.id === record.id ? next : item);
    recordsRef.current = updated;
    setRecords(updated);
    const saved = await setJSON(STORAGE_KEYS.mistakes, updated);
    if (!saved) Alert.alert('Could not save progress', 'Your answer could not be saved to this device.');
    return next;
  };

  useEffect(() => {
    if (!loading && initialIds?.length && !startedFromPlan.current) {
      startedFromPlan.current = true;
      startSession();
    }
  }, [loading, initialIds]);

  const chooseSquare = async (square) => {
    if (!current || resolved || !sessionActive || processing.current) return;
    const piece = gameRef.current.get(square);
    if (!selected) {
      if (piece?.color === orientation) setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      return;
    }
    const move = gameRef.current.moves({ square: selected, verbose: true }).find((candidate) => candidate.to === square);
    if (!move) {
      if (piece?.color === orientation) setSelected(square);
      return;
    }
    setSelected(null);
    const accepted = [current.bestSan, ...(current.altBestSans || [])].map(normalizeSan);
    const correct = accepted.includes(normalizeSan(move.san));
    const wasBox = current.box;
    processing.current = true;
    let updated;
    try { updated = await persistRecord(current, correct); }
    catch { Alert.alert('Could not save progress', 'Please try this move again.'); return; }
    finally { processing.current = false; }
    if (correct) {
      recordActivity('mistake', current.id).catch(() => Alert.alert('Practice log', 'Today’s activity could not be saved.'));
      gameRef.current.move({ from: move.from, to: move.to, promotion: move.promotion });
      setFen(gameRef.current.fen());
      setBoardVersion((version) => version + 1);
      setSessionSummary((summary) => ({ ...(summary || { right: M.n0, wrong: 0, promoted: 0 }), right: (summary?.right || 0) + 1, promoted: (summary?.promoted || 0) + (updated.box > wasBox ? 1 : 0) }));
      setFeedback(`Correct. ${current.bestLine || current.bestSan}. ${whyItMatters(current.cpLoss)}`);
      setResolved(true);
      return;
    }

    const attempt = wrongAttempts + 1;
    setWrongAttempts(attempt);
    setFeedback(attempt === 1
      ? `The best move was ${current.bestSan}. Try once more. Best line: ${current.bestLine || current.bestSan}.`
      : `The best move was ${current.bestSan}. ${whyItMatters(current.cpLoss)} This position will return once after the other due positions.`);
    if (attempt >= 2) {
      recordActivity('mistake', current.id).catch(() => Alert.alert('Practice log', 'Today’s activity could not be saved.'));
      setResolved(true);
      setSessionSummary((summary) => ({ ...(summary || { right: M.n0, wrong: 0, promoted: 0 }), wrong: (summary?.wrong || 0) + 1 }));
      if (!mistakesQueue.retry) setQueue((items) => [...items, { id: current.id, retry: true }]);
    }
  };

  const continueSession = () => {
    const nextCursor = cursor + 1;
    if (nextCursor >= queue.length) {
      setSessionActive(false);
      setSessionSummary((summary) => summary || { right: M.n0, wrong: 0, promoted: 0 });
      return;
    }
    setCursor(nextCursor);
  };

  const toggleAutoSave = async (enabled) => {
    setAutoSave(enabled);
    if (!await setJSON(STORAGE_KEYS.autoSaveBlunders, enabled)) setAutoSave(!enabled);
  };

  const resetSession = () => {
    setSessionSummary(null);
    setQueue([]);
    setCursor(0);
  };

  return <View>
    <View style={styles.headerCard}>
      <Text style={styles.eyebrow}>My mistakes</Text>
      <Text style={styles.headerTitle}>{getDueCount(records)} positions due</Text>
      <Text style={styles.headerCopy}>{records.length} saved position{records.length === 1 ? '' : 's'}{!due.length && future.length ? ` · ${nextDueCopy(future[0].dueAt)}` : ''}</Text>
      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}><Text style={styles.settingTitle}>Save blunders automatically</Text><Text style={styles.settingCopy}>Add critical blunders from game reviews to this bank.</Text></View>
        <Switch value={autoSave} onValueChange={toggleAutoSave} accessibilityRole="switch" accessibilityLabel="Automatically save blunders from game reviews" trackColor={{ false: C.line, true: C.greenSoft }} thumbColor={autoSave ? C.green : C.faint} />
      </View>
    </View>

    {loading ? <View style={styles.card}><Text style={styles.cardCopy}>Loading your saved positions…</Text></View>
      : sessionSummary && !sessionActive ? <View style={styles.card}>
        <Badge tone="amber">Session complete</Badge>
        <Text style={styles.cardTitle}>A little wiser each time.</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}><Text style={styles.summaryValue}>{sessionSummary.right}</Text><Text style={styles.summaryLabel}>Right</Text></View>
          <View style={styles.summaryCell}><Text style={styles.summaryValue}>{sessionSummary.wrong}</Text><Text style={styles.summaryLabel}>Wrong</Text></View>
          <View style={styles.summaryCell}><Text style={styles.summaryValue}>{sessionSummary.promoted}</Text><Text style={styles.summaryLabel}>Boxes promoted</Text></View>
        </View>
        <Button title="Practice due positions" onPress={startSession} disabled={!due.length} />
        <Button title="Back to training" onPress={resetSession} secondary />
      </View>
      : sessionActive && current ? <View style={styles.drillCard}>
        <View style={styles.drillTop}><Badge>BOX {current.box}</Badge><Text style={styles.drillCount}>POSITION {cursor + 1} / {queue.length}</Text></View>
        <Text style={styles.prompt}>Find a better move than {current.playedSan}</Text>
        <View style={styles.boardWrap}><ChessBoard key={`${current.id}-${cursor}-${boardVersion}`} game={gameRef.current} fen={fen} selected={selected} legalMoves={legalMoves} onSquare={chooseSquare} width={boardWidth} orientation={orientation} /></View>
        {!!feedback && <View style={[styles.feedback, resolved && styles.feedbackResolved]}><Text style={styles.feedbackText}>{feedback}</Text></View>}
        <View style={styles.drillActions}>
          {!resolved && wrongAttempts === 1 && <Button title="Try once more" onPress={() => { setFeedback('Your turn. Look for a stronger move.'); setSelected(null); }} secondary />}
          {resolved && <Button title={cursor + 1 >= queue.length ? 'See session results' : 'Next position'} onPress={continueSession} />}
        </View>
      </View>
      : records.length === 0 ? <View style={styles.card}>
        <Text style={styles.cardTitle}>Play and review a game to start your mistake bank.</Text>
        <Text style={styles.cardCopy}>Save a critical moment in Game Review, then practise finding a stronger move.</Text>
        <Button title="Play a game" onPress={() => onTab('play')} />
        <Button title="Review games" onPress={() => onTab('review')} secondary />
      </View>
      : !due.length ? <View style={styles.card}>
        <Text style={styles.cardTitle}>You’re all caught up.</Text>
        <Text style={styles.cardCopy}>{nextDueCopy(future[0]?.dueAt)}</Text>
        <Button title="Review games" onPress={() => onTab('review')} secondary />
      </View>
      : <View style={styles.card}>
        <Text style={styles.cardTitle}>Turn past mistakes into better instincts.</Text>
        <Text style={styles.cardCopy}>{due.length} position{due.length === 1 ? '' : 's'} are ready to practise.</Text>
        <Button title={`Start ${due.length}-position session`} onPress={startSession} />
      </View>}
  </View>;
}
