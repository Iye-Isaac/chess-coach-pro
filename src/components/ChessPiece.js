import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { C, PIECE_NAMES, sharedStyles } from '../theme';

const PIECE_SHAPES = {
  k: <><Path d="M47 8h6v9h9v6h-9v8h-6v-8h-9v-6h9z" />
        <Path d="M35 34c0-5 6-8 15-8s15 3 15 8l-3 7H38z" />
        <Path d="M39 40h22l4 25H35z" />
        <Path d="M31 65h38l5 9H26z" />
        <Path d="M22 74h56v9H22z" /></>,
  q: <><Path d="M23 24l13 12 14-20 14 20 13-12-7 29H30z" />
        <Circle cx="23" cy="20" r="5" />
        <Circle cx="50" cy="14" r="5" />
        <Circle cx="77" cy="20" r="5" />
        <Path d="M31 53h38l4 12H27z" />
        <Path d="M25 65h50v9H25z" />
        <Path d="M21 74h58v9H21z" /></>,
  r: <><Path d="M27 18h12v9h8v-9h9v9h8v-9h10v22H27z" />
        <Path d="M32 40h36l-4 25H36z" />
        <Path d="M28 65h44v9H28z" />
        <Path d="M22 74h56v9H22z" /></>,
  b: <><Path d="M50 13c11 8 15 15 13 24l-6 8H43l-6-8c-2-9 2-16 13-24z" />
        <Path d="M43 31l14 12" />
        <Path d="M36 47h28l4 18H32z" />
        <Path d="M28 65h44v9H28z" />
        <Path d="M22 74h56v9H22z" /></>,
  n: <><Path d="M31 65c2-10-1-21 1-30 2-9 11-15 23-21l5 14 10 8-6 9 5 20z" />
        <Path d="M41 36l3 2" />
        <Path d="M35 65h34l5 9H29z" />
        <Path d="M22 74h56v9H22z" /></>,
  p: <><Circle cx="50" cy="25" r="12" />
        <Path d="M42 38h16c-1 9 3 14 8 21l3 6H31l3-6c5-7 9-12 8-21z" />
        <Path d="M29 65h42v9H29z" />
        <Path d="M22 74h56v9H22z" /></>
};
function GPiece({ children, fill, stroke }) { return <G fill={fill} stroke={stroke} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">{children}</G>; }

const styles = { ...sharedStyles, ...StyleSheet.create({

}) };

export function ChessPiece({
  color,
  type,
  size
}) {
  const light = color === 'w';
  const fill = light ? '#fffdf5' : '#26352b';
  const stroke = light ? '#26352b' : '#fffdf5';
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${light ? 'White' : 'Black'} ${PIECE_NAMES[type]}`}>
    <Path d="M22 84h56v4H22z" fill="#18251c" opacity="0.18" />
    <GPiece fill={fill} stroke={stroke}>{PIECE_SHAPES[type]}</GPiece>
  </Svg>;
}

