import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  statsPanel: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: C.paper,
  borderRadius: R.card,
  borderWidth: M.n1,
  borderColor: C.line,
  paddingVertical: S.lg,
  marginBottom: S.lg
},
  progressRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: S.sm
},
  progressTrack: {
  height: M.n8,
  backgroundColor: C.soft,
  borderRadius: R.small,
  overflow: 'hidden',
  marginTop: S.xs
},
  progressFill: {
  height: M.n8,
  backgroundColor: C.success,
  borderRadius: R.small
}
}) };


var visualRules = StyleSheet.create({statsPanel:{backgroundColor:C.bg,borderWidth:M.zero,alignItems:'flex-start',paddingVertical:S.lg},stat:{alignItems:'flex-start'},statValue:{color:C.ink},statLabel:{fontSize:F.secondary},focusCard:{backgroundColor:C.bg,borderWidth:M.zero,padding:M.zero,marginTop:S.section},roundArrow:{minWidth:M.n48,minHeight:M.n48,borderRadius:R.small,backgroundColor:C.green},progressFill:{backgroundColor:C.green}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
