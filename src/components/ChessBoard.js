import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { C, PIECE_NAMES, sharedStyles } from '../theme';
import { ChessPiece } from './ChessPiece';
import { playMoveSound } from '../services/moveSound';


const styles = { ...sharedStyles, ...StyleSheet.create({
  board: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  overflow: 'hidden',
  borderRadius: 4,
  alignSelf: 'center'
},
  square: {
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
},
  legalDot: {
  position: 'absolute',
  width: '24%',
  height: '24%',
  borderRadius: 30,
  backgroundColor: '#25362950'
},
  captureRing: {
  position: 'absolute',
  inset: 2,
  borderRadius: 50,
  borderWidth: 4,
  borderColor: '#2536299a'
},
  pieceWrap: {
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center'
},
  rankLabel: {
  position: 'absolute',
  top: 2,
  left: 3,
  fontSize: 8,
  fontWeight: '800'
},
  fileLabel: {
  position: 'absolute',
  right: 3,
  bottom: 2,
  fontSize: 8,
  fontWeight: '800'
}
}) };

const ChessSquare = memo(function ChessSquare({
  square, color, type, selected, legal, capture, pale, rank, file,
  orientation, onSquare, pieceSize, highlighted, highlightColor,
}) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${type ? `${color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[type]}, ` : ''}${square}`}
    onPress={() => onSquare(square)}
    style={[styles.square, {
      width: pieceSize / 0.96,
      height: pieceSize / 0.96,
      backgroundColor: selected ? '#c4cd76' : highlighted ? `${highlightColor}55` : pale ? C.boardLight : C.boardDark,
    }]}
  >
    {legal && !type && <View style={styles.legalDot} />}
    {capture && <View style={styles.captureRing} />}
    {!!type && <View pointerEvents="none" style={styles.pieceWrap}><ChessPiece color={color} type={type} size={pieceSize} /></View>}
    {file === (orientation === 'w' ? 0 : 7) && <Text style={[styles.rankLabel, { color: pale ? C.boardDark : C.boardLight }]}>{rank + 1}</Text>}
    {rank === (orientation === 'w' ? 0 : 7) && <Text style={[styles.fileLabel, { color: pale ? C.boardDark : C.boardLight }]}>{'abcdefgh'[file]}</Text>}
  </Pressable>;
});

export function ChessBoard({
  game,
  fen,
  selected,
  legalMoves,
  onSquare,
  width,
  orientation = 'w',
  bestMove = null,
  highlightedSquares = [],
  highlightColor = C.green,
  bestMoveColor = '#243b2c'
}) {
  const previousFen = useRef(fen);
  const previousPly = useRef(getFenPly(fen));
  useEffect(() => {
    if (!fen || fen === previousFen.current) return;
    const nextPly = getFenPly(fen);
    if (nextPly > previousPly.current) playMoveSound();
    previousFen.current = fen;
    previousPly.current = nextPly;
  }, [fen]);
  const board = game.board();
  const size = Math.min(width, 430);
  const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const point = (square) => {
    if (!square || square.length < 4) return null;
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]) - 1;
    const xFile = orientation === 'w' ? file : 7 - file;
    const yRank = orientation === 'w' ? 7 - rank : rank;
    return { x: (xFile + 0.5) * size / 8, y: (yRank + 0.5) * size / 8 };
  };
  const from = point(bestMove?.slice(0, 2));
  const to = point(bestMove?.slice(2, 4));
  return <View style={{ width: size, height: size, position: 'relative', alignSelf: 'center' }}>
  <View style={[styles.board, {
    width: size,
    height: size
  }]}>
    {ranks.map(rank => files.map(file => {
      const square = `${'abcdefgh'[file]}${rank + 1}`;
      const piece = board[7 - rank][file];
      const chosen = selected === square;
      const legal = legalMoves.includes(square);
      const capture = legal && !!piece;
      const pale = (rank + file) % 2 === 1;
      return <ChessSquare
        key={square}
        square={square}
        color={piece?.color}
        type={piece?.type}
        selected={chosen}
        legal={legal}
        capture={capture}
        pale={pale}
        rank={rank}
        file={file}
        orientation={orientation}
        onSquare={onSquare}
        pieceSize={size / 8 * 0.96}
        highlighted={highlightedSquares.includes(square)}
        highlightColor={highlightColor}
      />;
    }))}
  </View>
  {from && to && <Svg pointerEvents="none" width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
    <Line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={bestMoveColor} strokeWidth={Math.max(3, size / 34)} opacity={0.9} />
    <Circle cx={to.x} cy={to.y} r={size / 18} fill={bestMoveColor} opacity={0.55} />
  </Svg>}
  </View>;
}

function getFenPly(fen) {
  if (!fen) return 0;
  const [, turn = 'w', , , , fullmove = '1'] = fen.split(' ');
  return (Math.max(1, Number(fullmove) || 1) - 1) * 2 + (turn === 'b' ? 1 : 0);
}

