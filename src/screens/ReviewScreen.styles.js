import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  reviewSummary: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.md,
  padding: S.md,
  borderRadius: R.card,
  backgroundColor: C.amberSoft,
  marginBottom: S.lg
},
  reviewSummaryValue: {
  color: C.muted,
  fontSize: F.title,
  fontWeight: W.semibold
},
  reviewSummaryTitle: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold
},
  reviewSummarySub: {
  color: C.muted,
  fontSize: F.secondary,
  marginTop: S.xs
}
}) };


var visualRules = StyleSheet.create({reviewSummary:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.xl},reviewSummaryValue:{color:C.ink}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
