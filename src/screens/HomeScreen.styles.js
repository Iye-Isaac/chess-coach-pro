import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const screenStyles = { ...sharedStyles, ...StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: S.lg, marginTop: S.sm, gap: S.md },
  streak: { alignItems: 'center', minWidth: M.n74 },
  flame: { fontSize: F.section },
  streakValue: { fontSize: F.title, fontWeight: W.semibold, color: C.ink },
  streakLabel: { fontSize: F.secondary, fontWeight: W.semibold, color: C.muted, letterSpacing: M.zero },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.sm, marginBottom: S.xl },
  weekDay: { flex: 1, alignItems: 'center', gap: S.sm },
  weekLabel: { color: C.muted, fontSize: F.secondary },
  weekDot: { width: M.n14, height: M.n14, borderRadius: R.small, backgroundColor: C.soft, borderWidth: M.n1, borderColor: C.line },
  weekDotFilled: { backgroundColor: C.green, borderColor: C.green },
  weekDotToday: { borderWidth: M.n2, borderColor: C.amber },
  longest: { fontSize: F.secondary, color: C.muted, textAlign: 'center' },
  planHeading: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  ring: { width: M.n76, height: M.n76, alignItems: 'center', justifyContent: 'center' },
  ringValue: { position: 'absolute', fontSize: F.body, fontWeight: W.semibold, color: C.ink },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.lg, borderTopWidth: M.n1, borderTopColor: C.line, minHeight: M.n65 },
  check: { width: M.n29, height: M.n29, borderRadius: R.card, alignItems: 'center', justifyContent: 'center', backgroundColor: C.soft },
  checkDone: { backgroundColor: C.green },
  checkDoneText: { color: C.white, fontWeight: W.semibold, fontSize: F.body },
  checkText: { color: C.muted, fontWeight: W.semibold, fontSize: F.body },
  rowDetail: { color: C.muted, fontSize: F.secondary, marginTop: S.xs },
  arrow: { color: C.ink, fontSize: F.section },
  spotlight: { backgroundColor: C.amberSoft, borderRadius: R.card, padding: S.lg, marginBottom: S.lg },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg },
  quickCard: { flexBasis: '47%', flexGrow: 1, padding: S.lg, minHeight: M.n54, backgroundColor: C.paper, borderRadius: R.card, borderWidth: M.n1, borderColor: C.line },
  quickTitle: { color: C.ink, fontWeight: W.semibold, fontSize: F.secondary },
}) };

const visualRules = StyleSheet.create({streakValue: {color:C.ink,fontSize:F.section,fontWeight:W.semibold}, streakLabel:{fontSize:F.secondary}, weekRow:{flexWrap:'wrap'}, weekDay:{minWidth:M.n24}, longest:{textAlign:'left'}, card:{padding:M.zero,backgroundColor:C.bg,marginBottom:S.section}, spotlight:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.section},quickGrid:{flexDirection:'column',gap:M.zero},quickCard:{flexBasis:'auto',minHeight:M.n56,borderWidth:M.zero,backgroundColor:C.bg,paddingHorizontal:M.zero,paddingVertical:S.lg},quickTitle:{color:C.ink,fontSize:F.body},planRow:{minHeight:M.n64,borderTopWidth:M.zero},checkDone:{backgroundColor:C.soft},checkDoneText:{color:C.ink},arrow:{color:C.muted},weekDotFilled:{backgroundColor:C.ink,borderColor:C.ink},weekDotToday:{borderColor:C.ink}});

export default Object.fromEntries(Object.keys({ ...screenStyles, ...visualRules }).map(key => [key, StyleSheet.flatten([screenStyles[key], visualRules[key]])]));
