import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

export default { ...sharedStyles, ...StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 15 },
  settingCopy: { color: C.muted, fontSize: 12, marginTop: 5 },
  overlay: { flex: 1, backgroundColor: '#1d211b88', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: C.paper, borderRadius: 18, padding: 24 },
  timeColumns: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  column: { flex: 1 },
  inputLabel: { color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  timeList: { height: 220 },
  timeOption: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  selectedOption: { backgroundColor: C.greenSoft },
  timeNumber: { fontSize: 20, color: C.muted },
  selectedNumber: { color: C.green, fontWeight: '800' },
  colon: { fontSize: 25, color: C.green },
}) };
