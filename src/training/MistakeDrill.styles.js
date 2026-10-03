import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  headerCard: { backgroundColor: C.paper, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  eyebrow: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  headerTitle: { color: C.ink, fontSize: 23, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  headerCopy: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 11, marginTop: 12, gap: 10 },
  settingTitle: { color: C.ink, fontSize: 11, fontWeight: '700' },
  settingCopy: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  card: { backgroundColor: C.paper, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 15 },
  cardTitle: { color: C.ink, fontSize: 18, lineHeight: 23, fontWeight: '700', letterSpacing: -0.4, marginTop: 4 },
  cardCopy: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6, marginBottom: 10 },
  drillCard: { backgroundColor: C.paper, borderRadius: 15, padding: 13, borderWidth: 1, borderColor: C.line },
  drillTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillCount: { color: C.faint, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  prompt: { color: C.ink, fontSize: 18, fontWeight: '700', lineHeight: 24, marginTop: 14, marginBottom: 13 },
  boardWrap: { alignItems: 'center' },
  feedback: { backgroundColor: C.amberSoft, padding: 11, borderRadius: 10, marginTop: 12 },
  feedbackResolved: { backgroundColor: C.greenSoft },
  feedbackText: { color: C.ink, fontSize: 11, lineHeight: 17 },
  drillActions: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, marginVertical: 13, borderRadius: 11, backgroundColor: C.greenSoft },
  summaryCell: { alignItems: 'center', gap: 4, flex: 1 },
  summaryValue: { color: C.green, fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: C.muted, fontSize: 8, fontWeight: '800', textAlign: 'center' },
}) };
