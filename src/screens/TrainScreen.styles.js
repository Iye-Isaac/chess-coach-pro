import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';
import sessionStyles from './TrainScreen.extra.styles';

const styles = { ...sharedStyles, ...StyleSheet.create({
  drillStat: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.sm,
  borderTopWidth: M.n1,
  borderTopColor: C.line,
  paddingTop: S.md,
  marginTop: S.md
},
  drillNumber: {
  color: C.ink,
  fontSize: F.section,
  fontWeight: W.semibold
},
  drillStatLabel: {
  color: C.muted,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  letterSpacing: M.zero
},
  puzzleHeading: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: S.xs
},
  puzzleTitle: {
  color: C.ink,
  fontWeight: W.semibold,
  fontSize: F.section,
  marginTop: S.xs
},
  puzzleBadge: {
  height: M.n36,
  width: M.n36,
  borderRadius: R.card,
  backgroundColor: C.amberSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  puzzleBadgeText: {
  color: C.muted,
  fontWeight: W.semibold,
  fontSize: F.secondary
},
  puzzlePrompt: {
  color: C.muted,
  fontSize: F.secondary,
  marginTop: S.xs,
  marginBottom: S.md
},
  puzzleBoardWrap: {
  alignItems: 'center'
},
  feedbackBox: {
  flexDirection: 'row',
  gap: S.sm,
  alignItems: 'center',
  backgroundColor: C.paper,
  padding: S.md,
  borderRadius: R.small,
  marginTop: S.md,
  marginBottom: S.sm
},
  feedbackSuccess: {
  backgroundColor: C.paper
},
  feedbackMark: {
  color: C.muted,
  fontSize: F.body
},
  feedbackText: {
  color: C.ink,
  fontSize: F.secondary,
  lineHeight: T.body,
  flex: 1
},
  drillCard: {
  marginTop: S.xl,
  padding: S.lg,
  backgroundColor: C.paper,
  borderWidth: M.n1,
  borderColor: C.line,
  borderRadius: R.card
},
  drillTitle: {
  color: C.ink,
  fontSize: F.body,
  fontWeight: W.semibold,
  marginTop: S.xs
}
}), ...sessionStyles };


var visualRules = StyleSheet.create({ratingStrip:{backgroundColor:C.bg,borderWidth:M.zero,padding:M.zero,marginBottom:S.xl},ratingValue:{color:C.ink},themeRow:{minHeight:M.n64,borderWidth:M.zero,backgroundColor:C.bg,paddingHorizontal:M.zero},ratingCallout:{backgroundColor:C.soft},sessionSummaryGrid:{backgroundColor:C.bg,flexWrap:'wrap',gap:S.lg},streakText:{color:C.muted}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
