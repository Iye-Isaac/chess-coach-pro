import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  page: { ...sharedStyles.page, flexGrow: 1 },
  backButton: { alignSelf: 'flex-start', paddingVertical: S.xs, paddingRight: S.md, marginBottom: S.sm },
  backText: { color: C.ink, fontWeight: W.semibold, fontSize: F.secondary },
  lessonIntro: { marginBottom: S.md },
  lessonTitle: { color: C.ink, fontSize: F.section, lineHeight: T.body, letterSpacing: M.zero, fontWeight: W.semibold, marginTop: S.xs },
  lessonSummary: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginTop: S.xs },
  lessonMeta: { color: C.faint, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero, marginTop: S.sm },
  completionCard: { backgroundColor: C.paper, borderWidth: M.n1, borderColor: C.line, borderRadius: R.card, padding: S.lg, marginTop: S.xl },
  completionTitle: { color: C.ink, fontSize: F.section, lineHeight: T.body, fontWeight: W.semibold, marginTop: S.lg },
  stars: { color: C.muted, fontSize: F.title, letterSpacing: M.zero, marginTop: S.md },
  completionCopy: { color: C.muted, fontSize: F.secondary, lineHeight: T.body, marginVertical: S.lg },
  loading: { padding: S.lg, backgroundColor: C.paper, borderRadius: R.card },
  bodyMuted: { color: C.muted, fontSize: F.secondary },
}) };
