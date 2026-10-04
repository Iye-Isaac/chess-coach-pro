import { StyleSheet } from 'react-native';
import { C, S, R, F, W, T, M } from '../theme';

const styles = StyleSheet.create({
  ratingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: S.md,
    marginBottom: S.md,
    backgroundColor: C.paper,
    borderWidth: M.n1,
    borderColor: C.line,
    borderRadius: R.card,
  },
  ratingValue: { color: C.ink, fontSize: F.section, fontWeight: W.semibold },
  sessionMarker: { alignItems: 'flex-end' },
  sessionMarkerText: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero },
  streakText: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold, marginTop: S.xs },
  sessionDots: { flexDirection: 'row', gap: S.xs, marginBottom: S.md },
  sessionDot: { flex: 1, height: M.n4, borderRadius: R.small, backgroundColor: C.soft },
  sessionDotActive: { backgroundColor: C.green },
  puzzleMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: S.sm, marginTop: S.sm },
  puzzleActions: { flexDirection: 'row', gap: S.sm, marginTop: S.xs },
  hintNote: { color: C.ink, fontSize: F.secondary, fontWeight: W.semibold, marginBottom: S.sm },
  ratingCallout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.md, marginTop: S.lg, marginBottom: S.md, borderRadius: R.small, backgroundColor: C.greenSoft },
  ratingCalloutLabel: { color: C.ink, fontSize: F.secondary, fontWeight: W.semibold, letterSpacing: M.zero },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: M.n55, paddingHorizontal: S.md, marginTop: S.sm, borderRadius: R.card, borderWidth: M.n1, borderColor: C.line, backgroundColor: C.paper },
  comingSoonBadge: { alignSelf: 'flex-start', paddingHorizontal: S.sm, paddingVertical: S.xs, marginTop: S.md, borderRadius: R.full, backgroundColor: C.amberSoft },
  comingSoonText: { color: C.muted, fontSize: F.secondary, fontWeight: W.semibold },
  sessionSummaryGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: S.lg, marginVertical: S.lg, borderRadius: R.card, backgroundColor: C.greenSoft },
  sessionSummaryCell: { alignItems: 'center', gap: S.xs },
  sessionSummaryValue: { color: C.ink, fontSize: F.section, fontWeight: W.semibold },
});

export default styles;
