import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  headerCard: { backgroundColor: C.paper, borderRadius: R.card, padding: S.md, borderWidth: M.n1, borderColor: C.line, marginBottom: S.md },
  eyebrow: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero },
  headerTitle: { color: C.ink, fontSize: F.section, fontWeight: W.semibold, letterSpacing: M.zero, marginTop: S.xs },
  headerCopy: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: M.n1, borderTopColor: C.line, paddingTop: S.md, marginTop: S.md, gap: S.sm },
  settingTitle: { color: C.ink, fontSize: F.secondary, fontWeight: W.semibold },
  settingCopy: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs },
  card: { backgroundColor: C.paper, borderRadius: R.card, padding: S.lg, borderWidth: M.n1, borderColor: C.line, marginBottom: S.lg },
  cardTitle: { color: C.ink, fontSize: F.body, lineHeight: T.body, fontWeight: W.semibold, letterSpacing: M.zero, marginTop: S.xs },
  cardCopy: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs, marginBottom: S.sm },
  drillCard: { backgroundColor: C.paper, borderRadius: R.card, padding: S.md, borderWidth: M.n1, borderColor: C.line },
  drillTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillCount: { color: C.faint, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero },
  prompt: { color: C.ink, fontSize: F.body, fontWeight: W.semibold, lineHeight: T.body, marginTop: S.md, marginBottom: S.md },
  boardWrap: { alignItems: 'center' },
  feedback: { backgroundColor: C.amberSoft, padding: S.md, borderRadius: R.small, marginTop: S.md },
  feedbackResolved: { backgroundColor: C.greenSoft },
  feedbackText: { color: C.ink, fontSize: F.secondary, lineHeight: T.body },
  drillActions: { marginTop: S.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: S.md, marginVertical: S.md, borderRadius: R.card, backgroundColor: C.greenSoft },
  summaryCell: { alignItems: 'center', gap: S.xs, flex: 1 },
  summaryValue: { color: C.ink, fontSize: F.section, fontWeight: W.semibold },
  summaryLabel: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold, textAlign: 'center' },
}) };
