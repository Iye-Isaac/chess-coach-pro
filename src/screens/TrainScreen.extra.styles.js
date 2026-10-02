import { StyleSheet } from 'react-native';
import { C } from '../theme';

const styles = StyleSheet.create({
  ratingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    marginBottom: 14,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
  },
  ratingValue: { color: C.green, fontSize: 25, fontWeight: '800' },
  sessionMarker: { alignItems: 'flex-end' },
  sessionMarkerText: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  streakText: { color: C.amber, fontSize: 10, fontWeight: '700', marginTop: 5 },
  sessionDots: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  sessionDot: { flex: 1, height: 4, borderRadius: 3, backgroundColor: C.soft },
  sessionDotActive: { backgroundColor: C.green },
  puzzleMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  puzzleActions: { flexDirection: 'row', gap: 8, marginTop: 5 },
  hintNote: { color: C.green, fontSize: 10, fontWeight: '700', marginBottom: 8 },
  ratingCallout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginTop: 15, marginBottom: 13, borderRadius: 10, backgroundColor: C.greenSoft },
  ratingCalloutLabel: { color: C.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 55, paddingHorizontal: 12, marginTop: 7, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper },
  comingSoonBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, marginTop: 14, borderRadius: 20, backgroundColor: C.amberSoft },
  comingSoonText: { color: C.amber, fontSize: 10, fontWeight: '800' },
  sessionSummaryGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, marginVertical: 15, borderRadius: 12, backgroundColor: C.greenSoft },
  sessionSummaryCell: { alignItems: 'center', gap: 4 },
  sessionSummaryValue: { color: C.green, fontSize: 22, fontWeight: '800' },
});

export default styles;
