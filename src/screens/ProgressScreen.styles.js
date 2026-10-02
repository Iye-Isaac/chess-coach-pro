import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  statsPanel: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: C.paper,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: C.line,
  paddingVertical: 15,
  marginBottom: 18
},
  progressRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8
},
  progressTrack: {
  height: 8,
  backgroundColor: C.soft,
  borderRadius: 5,
  overflow: 'hidden',
  marginTop: 4
},
  progressFill: {
  height: 8,
  backgroundColor: '#6c9561',
  borderRadius: 5
}
}) };
export default styles;
