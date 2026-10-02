import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  scoreHero: {
  backgroundColor: C.green,
  borderRadius: 16,
  padding: 17,
  marginBottom: 13
},
  scoreLine: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 6
},
  scoreBig: {
  color: '#fff',
  fontSize: 47,
  fontWeight: '700',
  letterSpacing: -2
},
  scoreOutOf: {
  color: '#d4decf',
  fontSize: 14,
  marginLeft: 4
},
  scoreBrand: {
  color: '#cfb071',
  fontSize: 8,
  fontWeight: '800',
  letterSpacing: 1.1,
  marginLeft: 'auto'
},
  scoreSummary: {
  color: '#e2e8df',
  fontSize: 12,
  lineHeight: 18,
  marginTop: 6
},
  phaseCard: {
  backgroundColor: C.paper,
  borderRadius: 13,
  padding: 14,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: C.line
},
  phaseHead: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
},
  phaseTitle: {
  color: C.ink,
  fontWeight: '700',
  fontSize: 14
},
  phaseScore: {
  color: C.green,
  fontWeight: '700',
  fontSize: 16
},
  phaseOutOf: {
  color: C.muted,
  fontSize: 10,
  fontWeight: '500'
},
  phaseBody: {
  color: C.muted,
  fontSize: 11,
  lineHeight: 17,
  marginTop: 8
},
  lesson: {
  color: C.green,
  fontSize: 11,
  lineHeight: 16,
  marginTop: 6
},
  loadingCard: {
  alignItems: 'center',
  paddingVertical: 20
}
}) };
export default styles;
