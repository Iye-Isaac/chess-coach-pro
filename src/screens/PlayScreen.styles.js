import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  opponentBar: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginBottom: 9
},
  avatar: {
  width: 36,
  height: 36,
  borderRadius: 12,
  backgroundColor: C.greenSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  avatarText: {
  color: C.green,
  fontSize: 19
},
  engineDot: {
  width: 8,
  height: 8,
  borderRadius: 4
},
  playStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7,
  marginBottom: 8
},
  turnDot: {
  width: 7,
  height: 7,
  borderRadius: 4
},
  playStatusText: {
  color: C.ink,
  fontSize: 11,
  fontWeight: '700',
  flex: 1
},
  flipText: {
  color: C.muted,
  fontSize: 10,
  fontWeight: '700',
  padding: 5
},
  playBoardWrap: {
  alignItems: 'center',
  backgroundColor: C.paper,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 12,
  padding: 7
},
  playTools: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 11,
  marginBottom: 13
},
  moveList: {
  backgroundColor: C.paper,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 12,
  padding: 13,
  marginTop: 12
},
  movePairs: {
  marginTop: 7
},
  movePair: {
  minHeight: 26,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#f1f1ed'
},
  moveNumber: {
  width: 23,
  color: C.faint,
  fontSize: 10
},
  moveSan: {
  width: 50,
  color: C.ink,
  fontSize: 11,
  fontWeight: '600'
}
}) };
export default styles;
