import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  reviewSummary: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  padding: 13,
  borderRadius: 12,
  backgroundColor: C.amberSoft,
  marginBottom: 15
},
  reviewSummaryValue: {
  color: '#8b6324',
  fontSize: 27,
  fontWeight: '700'
},
  reviewSummaryTitle: {
  color: C.ink,
  fontSize: 12,
  fontWeight: '700'
},
  reviewSummarySub: {
  color: C.muted,
  fontSize: 10,
  marginTop: 3
}
}) };
export default styles;
