import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginVertical: S.lg },
  settingCopy: { color: C.muted, fontSize: F.secondary, marginTop: S.xs },
  overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'center', padding: S.xl },
  picker: { backgroundColor: C.paper, borderRadius: R.card, padding: S.xl },
  timeColumns: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.lg },
  column: { flex: 1 },
  inputLabel: { color: C.muted, fontSize: F.secondary, textAlign: 'center', marginBottom: S.sm },
  timeList: { height: M.n220 },
  timeOption: { height: M.n44, alignItems: 'center', justifyContent: 'center', borderRadius: R.small },
  selectedOption: { backgroundColor: C.greenSoft },
  timeNumber: { fontSize: F.section, color: C.muted },
  selectedNumber: { color: C.ink, fontWeight: W.semibold },
  colon: { fontSize: F.section, color: C.ink },
}) };
