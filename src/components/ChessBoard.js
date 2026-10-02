import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, PIECE_NAMES, sharedStyles } from '../theme';
import { ChessPiece } from './ChessPiece';


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

export function ChessBoard({
  game,
  fen,
  selected,
  legalMoves,
  onSquare,
  width,
  orientation = 'w'
}) {
  const board = game.board();
  const size = Math.min(width, 430);
  const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  return <View style={[styles.board, {
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
      return <Pressable key={square} accessibilityRole="button" accessibilityLabel={`${piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[piece.type]}, ` : ''}${square}`} onPress={() => onSquare(square)} style={[styles.square, {
        width: size / 8,
        height: size / 8,
        backgroundColor: chosen ? '#c4cd76' : pale ? C.boardLight : C.boardDark
      }]}>
        {legal && !piece && <View style={styles.legalDot} />}
        {capture && <View style={styles.captureRing} />}
        {!!piece && <View pointerEvents="none" style={styles.pieceWrap}><ChessPiece color={piece.color} type={piece.type} size={size / 8 * 0.96} /></View>}
        {file === (orientation === 'w' ? 0 : 7) && <Text style={[styles.rankLabel, {
          color: pale ? C.boardDark : C.boardLight
        }]}>{rank + 1}</Text>}
        {rank === (orientation === 'w' ? 0 : 7) && <Text style={[styles.fileLabel, {
          color: pale ? C.boardDark : C.boardLight
        }]}>{'abcdefgh'[file]}</Text>}
      </Pressable>;
    }))}
  </View>;
}

