import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  historyCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  minHeight: 64,
  paddingHorizontal: 11,
  marginBottom: 7,
  backgroundColor: C.paper,
  borderRadius: 11,
  borderWidth: 1,
  borderColor: C.line
}
}) };
export default styles;
