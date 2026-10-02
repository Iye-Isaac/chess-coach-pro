import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';
import extraStyles from './HomeScreen.extra.styles';

const styles = { ...sharedStyles, ...StyleSheet.create({
  heroTop: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between'
},
  heroCrown: {
  color: '#d8b671',
  fontSize: 40,
  position: 'absolute',
  right: 7,
  top: 24,
  opacity: 0.45
},
  heroRule: {
  height: 1,
  backgroundColor: '#ffffff27',
  marginTop: 17,
  marginBottom: 10
},
  heroFoot: {
  color: '#b9c8b3',
  fontSize: 10,
  letterSpacing: 0.15
},
  cardTop: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between'
},
  cardIcon: {
  width: 37,
  height: 37,
  borderRadius: 12,
  backgroundColor: C.amberSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  cardIconText: {
  color: '#94651b',
  fontWeight: '800',
  fontSize: 19
}
}), ...extraStyles };
export default styles;
