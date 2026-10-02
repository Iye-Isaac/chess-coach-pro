import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  resourceFeature: {
  minHeight: 181,
  padding: 17,
  backgroundColor: C.green,
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 20
},
  resourceFeatureTitle: {
  color: '#fffdf6',
  fontSize: 23,
  fontWeight: '700',
  letterSpacing: -0.7,
  marginTop: 11
},
  resourceFeatureCopy: {
  maxWidth: 255,
  color: '#d7dfd3',
  fontSize: 11,
  lineHeight: 17,
  marginTop: 8
},
  resourceFeatureMark: {
  position: 'absolute',
  right: 8,
  bottom: -9,
  fontSize: 83,
  color: '#d7bb80',
  opacity: 0.45
},
  filterRail: {
  flexGrow: 0,
  marginBottom: 12
},
  filterChip: {
  paddingHorizontal: 11,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: C.soft,
  marginRight: 6
},
  filterChipActive: {
  backgroundColor: C.green
},
  filterText: {
  color: C.muted,
  fontSize: 9,
  fontWeight: '800'
},
  filterTextActive: {
  color: '#fff'
},
  resourceCard: {
  flexDirection: 'row',
  gap: 12,
  backgroundColor: C.paper,
  padding: 13,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 13,
  marginBottom: 9
},
  resourceIcon: {
  height: 41,
  width: 41,
  borderRadius: 13,
  alignItems: 'center',
  justifyContent: 'center'
},
  resourceIconGreen: {
  backgroundColor: C.greenSoft
},
  resourceIconAmber: {
  backgroundColor: C.amberSoft
},
  resourceIconText: {
  color: C.green,
  fontSize: 20
},
  resourceKind: {
  color: C.muted,
  fontSize: 8,
  fontWeight: '800',
  letterSpacing: 1
},
  resourceTitle: {
  color: C.ink,
  fontSize: 13,
  fontWeight: '700',
  marginTop: 3
},
  resourceAuthor: {
  color: C.green,
  fontSize: 10,
  fontWeight: '600',
  marginTop: 2
},
  resourceNote: {
  color: C.muted,
  fontSize: 10,
  lineHeight: 14,
  marginTop: 5
}
}) };
export default styles;
