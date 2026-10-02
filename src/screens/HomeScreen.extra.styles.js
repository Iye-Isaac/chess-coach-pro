import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = StyleSheet.create({
  inputLabel: {
  color: C.muted,
  fontSize: 9,
  fontWeight: '800',
  letterSpacing: 1,
  marginTop: 18,
  marginBottom: 7
},
  statsStrip: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 16,
  paddingVertical: 12,
  backgroundColor: '#f8f8f4',
  borderRadius: 10
},
  quickGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 9,
  marginBottom: 21
},
  quickCard: {
  width: '48%',
  minHeight: 94,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: C.line,
  backgroundColor: C.paper,
  padding: 12
},
  quickIcon: {
  color: C.amber,
  fontSize: 17
},
  quickTitle: {
  color: C.ink,
  fontSize: 11,
  fontWeight: '700',
  marginTop: 7
},
  quickNote: {
  color: C.muted,
  fontSize: 9,
  marginTop: 3
}
});
export default styles;
