import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';
import sessionStyles from './TrainScreen.extra.styles';

const styles = { ...sharedStyles, ...StyleSheet.create({
  drillStat: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  borderTopWidth: 1,
  borderTopColor: C.line,
  paddingTop: 12,
  marginTop: 13
},
  drillNumber: {
  color: C.green,
  fontSize: 23,
  fontWeight: '700'
},
  drillStatLabel: {
  color: C.muted,
  fontSize: 9,
  fontWeight: '800',
  letterSpacing: 0.7
},
  puzzleHeading: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 5
},
  puzzleTitle: {
  color: C.ink,
  fontWeight: '700',
  fontSize: 19,
  marginTop: 4
},
  puzzleBadge: {
  height: 36,
  width: 36,
  borderRadius: 12,
  backgroundColor: C.amberSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  puzzleBadgeText: {
  color: '#92691f',
  fontWeight: '800',
  fontSize: 12
},
  puzzlePrompt: {
  color: C.muted,
  fontSize: 12,
  marginTop: 6,
  marginBottom: 12
},
  puzzleBoardWrap: {
  alignItems: 'center'
},
  feedbackBox: {
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
  backgroundColor: '#f4f0e6',
  padding: 12,
  borderRadius: 10,
  marginTop: 12,
  marginBottom: 9
},
  feedbackSuccess: {
  backgroundColor: '#e8f0e4'
},
  feedbackMark: {
  color: C.amber,
  fontSize: 15
},
  feedbackText: {
  color: C.ink,
  fontSize: 11,
  lineHeight: 16,
  flex: 1
},
  drillCard: {
  marginTop: 22,
  padding: 16,
  backgroundColor: C.paper,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 14
},
  drillTitle: {
  color: C.ink,
  fontSize: 16,
  fontWeight: '700',
  marginTop: 4
}
}), ...sessionStyles };
export default styles;
