import { StyleSheet } from 'react-native';
import { C, sharedStyles, S, R, F, W, T, M } from '../theme';

const styles = { ...sharedStyles, ...StyleSheet.create({

}) };


var visualRules = StyleSheet.create({card:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.section},hero:{backgroundColor:C.bg,padding:M.zero,marginBottom:S.section},heroTitle:{color:C.ink,fontSize:F.title,lineHeight:T.title,fontWeight:W.semibold},heroSub:{color:C.muted,fontSize:F.body,lineHeight:T.body}});

export default Object.fromEntries(Object.keys({ ...styles, ...visualRules }).map(key => [key, StyleSheet.flatten([styles[key], visualRules[key]])]));
