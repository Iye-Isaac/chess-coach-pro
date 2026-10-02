import { StyleSheet } from 'react-native';
import { C, sharedStyles } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  profileHero: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12
},
  largeAvatar: {
  width: 53,
  height: 53,
  borderRadius: 18,
  backgroundColor: C.greenSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  largeAvatarText: {
  color: C.green,
  fontWeight: '800',
  fontSize: 22
}
}) };
export default styles;
