import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = StyleSheet.create({
  inputLabel: {
  color: C.muted,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  letterSpacing: M.zero,
  marginTop: S.lg,
  marginBottom: S.sm
},
  statsStrip: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: S.lg,
  paddingVertical: S.md,
  backgroundColor: C.white,
  borderRadius: R.small
},
  quickGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: S.sm,
  marginBottom: S.xl
},
  quickCard: {
  width: '48%',
  minHeight: M.n94,
  borderRadius: R.card,
  borderWidth: M.n1,
  borderColor: C.line,
  backgroundColor: C.paper,
  padding: S.md
},
  quickIcon: {
  color: C.muted,
  fontSize: F.body
},
  quickTitle: {
  color: C.ink,
  fontSize: F.secondary,
  fontWeight: W.semibold,
  marginTop: S.sm
},
  quickNote: {
  color: C.muted,
  fontSize: F.secondary,
  marginTop: S.xs
}
});
export default styles;
