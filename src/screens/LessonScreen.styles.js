import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  page: { ...sharedStyles.page, flexGrow: 1 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 12, marginBottom: 7 },
  backText: { color: C.green, fontWeight: '700', fontSize: 13 },
  lessonIntro: { marginBottom: 11 },
  lessonTitle: { color: C.ink, fontSize: 24, lineHeight: 29, letterSpacing: -0.8, fontWeight: '800', marginTop: 3 },
  lessonSummary: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  lessonMeta: { color: C.faint, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginTop: 7 },
  completionCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 18, marginTop: 26 },
  completionTitle: { color: C.ink, fontSize: 24, lineHeight: 29, fontWeight: '800', marginTop: 16 },
  stars: { color: C.amber, fontSize: 36, letterSpacing: 4, marginTop: 14 },
  completionCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginVertical: 15 },
  loading: { padding: 18, backgroundColor: C.paper, borderRadius: 14 },
  bodyMuted: { color: C.muted, fontSize: 11 },
}) };
