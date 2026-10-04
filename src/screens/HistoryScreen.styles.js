import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  historyCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.sm,
  minHeight: M.n64,
  paddingHorizontal: S.md,
  marginBottom: S.sm,
  backgroundColor: C.paper,
  borderRadius: R.card,
  borderWidth: M.n1,
  borderColor: C.line
}
}) };


var visualRules = StyleSheet.create({historyCard:{backgroundColor:C.bg,borderWidth:M.zero,paddingHorizontal:M.zero,paddingVertical:S.md,minHeight:M.n64,marginBottom:S.sm}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
