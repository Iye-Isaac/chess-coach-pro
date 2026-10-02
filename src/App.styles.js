import { StyleSheet } from 'react-native';
import { C, sharedStyles } from './theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  loadingScreen: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12
},
  app: {
  flex: 1,
  backgroundColor: C.bg
},
  topBar: {
  height: 58,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: C.line,
  backgroundColor: C.bg
},
  brand: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10
},
  brandMark: {
  width: 37,
  height: 37,
  borderRadius: 12,
  backgroundColor: C.green,
  alignItems: 'center',
  justifyContent: 'center'
},
  brandMarkText: {
  color: '#f4d394',
  fontSize: 23,
  marginTop: -2
},
  brandName: {
  color: C.ink,
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: -0.6
},
  brandSub: {
  color: C.muted,
  fontSize: 8,
  fontWeight: '700',
  letterSpacing: 1.15,
  marginTop: 2
},
  profileMark: {
  width: 33,
  height: 33,
  borderRadius: 17,
  backgroundColor: '#e5e7df',
  alignItems: 'center',
  justifyContent: 'center'
},
  profileText: {
  color: C.green,
  fontSize: 13,
  fontWeight: '700'
},
  content: {
  flex: 1
},
  persistentPlayLayer: {
  flex: 1
},
  tabBar: {
  height: 67,
  paddingBottom: 5,
  backgroundColor: C.paper,
  borderTopWidth: 1,
  borderTopColor: C.line,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'stretch'
},
  tabItem: {
  width: '20%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 3
},
  tabMark: {
  color: '#94998e',
  fontSize: 19,
  height: 22,
  fontWeight: '600'
},
  tabMarkActive: {
  color: C.green
},
  tabLabel: {
  color: '#92968d',
  fontSize: 10,
  fontWeight: '600'
},
  tabLabelActive: {
  color: C.green,
  fontWeight: '800'
},
  tabIndicator: {
  position: 'absolute',
  top: 0,
  width: 19,
  height: 2,
  borderBottomLeftRadius: 2,
  borderBottomRightRadius: 2,
  backgroundColor: C.amber
}
}) };
export default styles;
