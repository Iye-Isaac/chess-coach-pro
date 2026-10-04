import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({
  profileHero: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: S.md
},
  largeAvatar: {
  width: M.n53,
  height: M.n53,
  borderRadius: R.card,
  backgroundColor: C.greenSoft,
  alignItems: 'center',
  justifyContent: 'center'
},
  largeAvatarText: {
  color: C.ink,
  fontWeight: W.semibold,
  fontSize: F.section
}
}) };


var visualRules = StyleSheet.create({largeAvatar:{backgroundColor:C.soft,borderRadius:R.full},largeAvatarText:{color:C.ink},profileHero:{flexWrap:'wrap'},card:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.section}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
