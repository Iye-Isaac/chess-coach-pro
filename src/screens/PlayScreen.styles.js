import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  opponentBar: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.sm,
  marginBottom: S.sm
},
  avatar: {
  width: M.n36,
  height: M.n36,
  borderRadius: R.card,
  backgroundColor: C.greenSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  avatarText: {
  color: C.ink,
  fontSize: F.section
},
  engineDot: {
  width: M.n8,
  height: M.n8,
  borderRadius: R.small
},
  playStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.sm,
  marginBottom: S.sm
},
  turnDot: {
  width: M.n7,
  height: M.n7,
  borderRadius: R.small
},
  playStatusText: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  flex: 1
},
  flipText: {
  color: C.muted,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  padding: S.xs
},
  playBoardWrap: {
  alignItems: 'center',
  backgroundColor: C.paper,
  borderWidth: M.n1,
  borderColor: C.line,
  borderRadius: R.card,
  padding: S.sm
},
  playTools: {
  flexDirection: 'row',
  gap: S.sm,
  marginTop: S.md,
  marginBottom: S.md
},
  moveList: {
  backgroundColor: C.paper,
  borderWidth: M.n1,
  borderColor: C.line,
  borderRadius: R.card,
  padding: S.md,
  marginTop: S.md
},
  movePairs: {
  marginTop: S.sm
},
  movePair: {
  minHeight: M.n26,
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.md,
  borderBottomWidth: M.n1,
  borderBottomColor: C.paper
},
  moveNumber: {
  width: M.n23,
  color: C.faint,
  fontSize: F.secondary
},
  moveSan: {
  width: M.n50,
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold
}
}) };


var visualRules = StyleSheet.create({avatar:{display:'none'},playBoardWrap:{padding:S.sm,borderWidth:M.zero,backgroundColor:C.bg},playTools:{flexDirection:'column',gap:S.sm},movePair:{minHeight:M.n48},flipText:{fontSize:F.secondary},opponentBar:{marginBottom:S.lg}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
