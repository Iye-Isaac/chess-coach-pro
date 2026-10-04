import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const screenStyles = { ...sharedStyles, ...StyleSheet.create({
  trackRail: { flexDirection: 'row', padding: S.xs, backgroundColor: C.paper, borderRadius: R.card, marginBottom: S.md },
  trackTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: S.sm, borderRadius: R.small },
  trackTabActive: { backgroundColor: C.paper, elevation: M.zero },
  trackTabText: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold },
  trackTabTextActive: { color: C.ink },
  progressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.green, borderRadius: R.card, padding: S.lg, marginBottom: S.md },
  eyebrow: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero },
  progressTitle: { color: C.white, fontSize: F.section, fontWeight: W.semibold, marginTop: S.xs },
  progressMark: { color: C.muted, fontSize: F.title, marginHorizontal: S.sm },
  lessonNode: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, minHeight: M.n82, backgroundColor: C.paper, borderWidth: M.n1, borderColor: C.line, borderRadius: R.card, marginBottom: S.sm },
  lessonNodeLocked: { opacity: 0.58 },
  nodeMark: { width: M.n37, height: M.n37, borderRadius: R.card, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  nodeMarkComplete: { backgroundColor: C.greenSoft },
  nodeMarkLocked: { backgroundColor: C.soft },
  nodeMarkText: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold },
  nodeMarkTextComplete: { color: C.ink, fontSize: F.body },
  nodeCopy: { flex: 1 },
  nodeTitle: { color: C.ink, fontSize: F.secondary, fontWeight: W.semibold },
  nodeSummary: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs },
  nodeMeta: { color: C.faint, fontSize: F.secondary, fontWeight: W.semibold, marginTop: S.xs },
  emptyCard: { padding: S.lg, backgroundColor: C.paper, borderWidth: M.n1, borderColor: C.line, borderRadius: R.card, marginBottom: S.md },
  emptyTitle: { color: C.ink, fontSize: F.secondary, fontWeight: W.semibold },
  bodyMuted: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs },
  resourcesCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md, backgroundColor: C.paper, borderRadius: R.card, borderWidth: M.n1, borderColor: C.line, marginTop: S.sm },
  resourcesTitle: { color: C.ink, fontSize: F.body, fontWeight: W.semibold, marginTop: S.xs },
}) };

const visualRules = StyleSheet.create({trackRail:{flexWrap:'wrap',backgroundColor:C.bg,gap:S.sm},trackTab:{flexBasis:'40%',minHeight:M.n48},trackTabActive:{backgroundColor:C.greenSoft,elevation:M.zero},progressCard:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.section},progressTitle:{color:C.ink},eyebrow:{color:C.muted,fontSize:F.secondary},lessonNode:{backgroundColor:C.bg,borderWidth:M.zero,paddingHorizontal:M.zero,marginBottom:S.lg},lessonNodeLocked:{opacity:1},nodeMark:{backgroundColor:C.soft},nodeMarkText:{color:C.ink},resourcesCard:{flexDirection:'column',alignItems:'stretch',backgroundColor:C.bg,borderWidth:M.zero,padding:M.zero,marginTop:S.section}});

export default Object.fromEntries(Object.keys({ ...screenStyles, ...visualRules }).map(key => [key, StyleSheet.flatten([screenStyles[key], visualRules[key]])]));
