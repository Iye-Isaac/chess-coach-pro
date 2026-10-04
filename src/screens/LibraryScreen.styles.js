import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  resourceFeature: {
  minHeight: M.n181,
  padding: S.lg,
  backgroundColor: C.green,
  borderRadius: R.card,
  overflow: 'hidden',
  marginBottom: S.lg
},
  resourceFeatureTitle: {
  color: C.white,
  fontSize: F.section,
  fontWeight: W.semibold,
  letterSpacing: M.zero,
  marginTop: S.md
},
  resourceFeatureCopy: {
  maxWidth: M.n255,
  color: C.paper,
  fontSize: F.secondary,
  lineHeight: T.body,
  marginTop: S.sm
},
  resourceFeatureMark: {
  position: 'absolute',
  right: M.n8,
  bottom: M.nminus9,
  fontSize: F.title,
  color: C.muted,
  opacity: 0.45
},
  filterRail: {
  flexGrow: 0,
  marginBottom: S.md
},
  filterChip: {
  paddingHorizontal: S.md,
  paddingVertical: S.sm,
  borderRadius: R.full,
  backgroundColor: C.soft,
  marginRight: S.xs
},
  filterChipActive: {
  backgroundColor: C.green
},
  filterText: {
  color: C.muted,
  fontSize: F.secondary,
  fontWeight: W.semibold
},
  filterTextActive: {
  color: C.white
},
  resourceCard: {
  flexDirection: 'row',
  gap: S.md,
  backgroundColor: C.paper,
  padding: S.md,
  borderWidth: M.n1,
  borderColor: C.line,
  borderRadius: R.card,
  marginBottom: S.sm
},
  resourceIcon: {
  height: M.n41,
  width: M.n41,
  borderRadius: R.card,
  alignItems: 'center',
  justifyContent: 'center'
},
  resourceIconGreen: {
  backgroundColor: C.greenSoft
},
  resourceIconAmber: {
  backgroundColor: C.amberSoft
},
  resourceIconText: {
  color: C.ink,
  fontSize: F.section
},
  resourceKind: {
  color: C.muted,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  letterSpacing: M.zero
},
  resourceTitle: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  marginTop: S.xs
},
  resourceAuthor: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  marginTop: S.xs
},
  resourceNote: {
  color: C.muted,
  fontSize: F.secondary,
  lineHeight: T.body,
  marginTop: S.xs
}
}) };


var visualRules = StyleSheet.create({resourceCard:{backgroundColor:C.bg,borderWidth:M.zero,paddingHorizontal:M.zero,marginBottom:S.xl},resourceAuthor:{color:C.muted,fontWeight:W.regular},filterChip:{minHeight:M.n48,justifyContent:'center'},resourceNote:{fontSize:F.body,lineHeight:T.body}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
