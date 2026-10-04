// Palette source: palette.txt. Existing accent and semantic feedback colors are retained.
export const palette = Object.freeze({ black: '#020202', evergreen: '#0d2818', forest: '#04471c', seaGreen: '#058c42', malachite: '#16db65' });
export const colors = Object.freeze({
  background: '#f6f5f0', surface: '#fffdf3', border: '#d9ddd7',
  textPrimary: palette.black, textSecondary: '#4e554f', textTertiary: '#626963',
  accent: '#243b2c', accentPressed: palette.evergreen,
  success: palette.forest, danger: '#b54d43', warning: '#87601e',
});
export const S = Object.freeze({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, section: 32, huge: 48, screen: 20 });
export const R = Object.freeze({ small: 8, card: 12, full: 999 });
export const F = Object.freeze({ caption: 12, secondary: 14, body: 16, section: 20, title: 28, hero: 40 });
export const W = Object.freeze({ regular: '400', semibold: '600' });
export const T = Object.freeze({ caption: 18, secondary: 21, body: 24, section: 24, title: 34, hero: 48 });
export const C = Object.freeze({
  ...colors, bg: colors.background, paper: colors.surface, ink: colors.textPrimary,
  muted: colors.textSecondary, faint: colors.textTertiary, line: colors.border,
  soft: '#eeeee8', green: colors.accent, green2: colors.accentPressed,
  amber: colors.warning, amberSoft: '#f6ebd8', greenSoft: '#e9efe6',
  boardLight: '#f0eee2', boardDark: '#83927b', red: colors.danger, white: '#fffdf3',
  overlay: '#02020288', best: '#183b26', good: '#4f8a55', inaccuracy: '#e2bd36', mistake: '#ed8a26', blunder: '#cf4141',
});
export const M = Object.freeze({ zero: 0, nminus9: -9, n0: 0, n1: 1, n2: 2, n3: 3, n4: 4, n5: 5, n6: 6, n7: 7, n8: 8, n12: 12, n13: 13, n14: 14, n17: 17, n19: 19, n22: 22, n23: 23, n24: 24, n26: 26, n29: 29, n30: 30, n31: 31, n33: 33, n34: 34, n36: 36, n37: 37, n38: 38, n39: 39, n41: 41, n44: 44, n46: 46, n48: 48, n50: 50, n52: 52, n53: 53, n54: 54, n55: 55, n56: 56, n58: 58, n64: 64, n65: 65, n67: 67, n70: 70, n74: 74, n76: 76, n82: 82, n94: 94, n174: 174, n181: 181, n220: 220, n230: 230, n240: 240, n255: 255 });

export const PIECE_NAMES = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn'
};

import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  pressed:{opacity:0.76},
  sectionHead:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop: S.sm,marginBottom: S.md,gap: S.sm},
  eyebrow:{color:C.muted,fontSize: F.secondary,fontWeight: W.semibold,letterSpacing: M.zero,marginBottom: S.xs},
  sectionTitle:{color:C.ink,fontSize: F.section,fontWeight: W.semibold,letterSpacing: M.zero},
  bodyMuted:{color:C.muted,fontSize: F.secondary,lineHeight: T.body,marginTop: S.xs},
  resultDot:{height: M.n8,width: M.n8,borderRadius: R.small},
  rowTitle:{color:C.ink,fontWeight: W.semibold,fontSize: F.secondary},
  rowSub:{color:C.muted,fontSize: F.secondary,marginTop: S.xs},
  resultText:{fontSize: F.secondary,fontWeight: W.semibold},
  rowChevron:{color:C.faint,fontSize: F.section,marginLeft: S.xs},
  page:{paddingHorizontal: S.lg,paddingTop: S.md,paddingBottom: S.xl},
  hero:{minHeight: M.n240,borderRadius: R.card,padding: S.lg,backgroundColor:C.green,overflow:'hidden',marginBottom: S.lg},
  heroTitle:{color:C.white,fontSize: F.title,lineHeight: T.body,letterSpacing: M.zero,fontWeight: W.semibold,marginTop: S.xl},
  heroSub:{color:C.paper,fontSize: F.secondary,lineHeight: T.body,marginTop: S.sm,maxWidth: M.n255},
  card:{backgroundColor:C.paper,borderRadius: R.card,padding: S.lg,borderWidth: M.n1,borderColor:C.line,marginBottom: S.xl},
  cardTitle:{color:C.ink,fontSize: F.section,fontWeight: W.semibold,letterSpacing: M.zero,marginTop: S.md},
  cardCopy:{color:C.muted,fontSize: F.secondary,lineHeight: T.body,marginTop: S.xs},
  input:{height: M.n46,borderWidth: M.n1,borderColor:C.paper,borderRadius: R.small,paddingHorizontal: S.md,color:C.ink,fontSize: F.secondary,backgroundColor:C.white,marginBottom: S.sm},
  errorText:{color:C.red,fontSize: F.secondary,lineHeight: T.body,marginBottom: S.sm,marginTop: S.sm},
  privacyNote:{textAlign:'center',marginTop: S.sm,fontSize: F.secondary,color:C.faint},
  stat:{flex:1,alignItems:'center'},
  statValue:{color:C.green,fontSize: F.section,fontWeight: W.semibold},
  statLabel:{color:C.muted,fontSize: F.secondary,fontWeight: W.semibold,letterSpacing: M.zero,marginTop: S.xs},
  statDivider:{width: M.n1,height: M.n31,backgroundColor:C.line},
  focusCard:{flexDirection:'row',alignItems:'center',gap: S.md,padding: S.md,backgroundColor:C.paper,borderWidth: M.n1,borderColor:C.line,borderRadius: R.card,marginBottom: S.xl},
  focusIcon:{height: M.n39,width: M.n39,borderRadius: R.card,backgroundColor:C.amberSoft,alignItems:'center',justifyContent:'center'},
  focusIconText:{color:C.amber,fontSize: F.section},
  focusTitle:{fontSize: F.secondary,color:C.ink,fontWeight: W.semibold},
  focusCopy:{fontSize: F.secondary,color:C.muted,marginTop: S.xs,lineHeight: T.body,flexShrink:1},
  roundArrow:{width: M.n30,height: M.n30,borderRadius: R.card,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  roundArrowText:{color:C.white,fontSize: F.body,marginTop: -S.xs},
  linkText:{color:C.green,fontSize: F.secondary,fontWeight: W.semibold,paddingVertical: S.xs},
  smallEmpty:{paddingVertical: S.lg,paddingHorizontal: S.md,backgroundColor:C.paper,borderRadius: R.card,borderWidth: M.n1,borderColor:C.line},
  smallEmptyText:{color:C.muted,fontSize: F.secondary,lineHeight: T.body},
  bottomSpace:{height: M.n12},
  pageIntro:{marginTop: S.sm,marginBottom: S.lg},
  pageTitle:{color:C.ink,fontSize: F.title,lineHeight: T.body,letterSpacing: M.zero,fontWeight: W.semibold,marginTop: S.sm},
  pageSubtitle:{color:C.muted,fontSize: F.secondary,lineHeight: T.body,marginTop: S.xs},
  insightCard:{minHeight: M.n174,borderRadius: R.card,padding: S.lg,backgroundColor:C.green,marginBottom: S.lg,overflow:'hidden'},
  eyebrowLight:{color:C.muted,fontSize: F.secondary,fontWeight: W.semibold,letterSpacing: M.zero},
  insightTitle:{color:C.white,fontSize: F.section,lineHeight: T.body,letterSpacing: M.zero,fontWeight: W.semibold,marginTop: S.md},
  insightCopy:{color:C.muted,fontSize: F.secondary,lineHeight: T.body,maxWidth: M.n230,marginTop: S.sm},
  insightMark:{position:'absolute',right: M.n13,bottom: M.n5,fontSize: F.title,color:C.muted,opacity:0.43},
  noticeCard:{flexDirection:'row',alignItems:'flex-start',gap: S.sm,backgroundColor:C.paper,padding: S.md,borderRadius: R.card,borderWidth: M.n1,borderColor:C.line},
  noticeIcon:{fontSize: F.section,color:C.amber,width: M.n22,textAlign:'center'},
  noticeTitle:{fontSize: F.secondary,fontWeight: W.semibold,color:C.ink},
  noticeCopy:{color:C.muted,fontSize: F.secondary,lineHeight: T.body,marginTop: S.xs},
  backButton:{alignSelf:'flex-start',paddingVertical: S.xs,paddingRight: S.md,marginBottom: S.sm},
  backText:{color:C.green,fontWeight: W.semibold,fontSize: F.secondary},
  modeSwitch:{flexDirection:'row',padding: S.xs,backgroundColor:C.paper,borderRadius: R.card,marginBottom: S.md},
  modeOption:{flex:1,alignItems:'center',paddingVertical: S.sm,borderRadius: R.small},
  modeOptionActive:{backgroundColor:C.paper,shadowColor: C.ink,shadowOpacity: M.zero,shadowRadius: M.zero,elevation: M.zero},
  modeText:{color:C.muted,fontSize: F.secondary,fontWeight: W.semibold},
  modeTextActive:{color:C.green,fontWeight: W.semibold},
  pathCard:{flexDirection:'row',alignItems:'center',gap: S.md,minHeight: M.n70,padding: S.md,marginBottom: S.sm,borderRadius: R.card,backgroundColor:C.paper,borderWidth: M.n1,borderColor:C.line},
  pathNumber:{width: M.n34,height: M.n34,borderRadius: R.card,backgroundColor:C.amberSoft,alignItems:'center',justifyContent:'center'},
  pathNumberText:{color:C.muted,fontSize: F.secondary,fontWeight: W.semibold},
  setupChoice:{padding: S.md,borderWidth: M.n1,borderColor:C.line,backgroundColor:C.white,borderRadius: R.card,marginTop: S.sm},
  setupChoiceActive:{borderColor:C.green,backgroundColor:C.greenSoft}
});


Object.assign(sharedStyles, StyleSheet.create({
  page: { paddingHorizontal: S.screen, paddingTop: S.lg, paddingBottom: S.xl },
  pageIntro: { marginBottom: S.section },
  pageTitle: { color: C.ink, fontSize: F.title, lineHeight: T.title, fontWeight: W.semibold, marginTop: S.sm },
  pageSubtitle: { color: C.muted, fontSize: F.body, lineHeight: T.body, marginTop: S.sm },
  eyebrow: { color: C.muted, fontSize: F.secondary, lineHeight: T.secondary, fontWeight: W.regular, marginBottom: S.sm },
  card: { padding: S.lg, borderWidth: M.zero, borderRadius: R.card, backgroundColor: C.paper, marginBottom: S.section },
  cardTitle: { color: C.ink, fontSize: F.section, lineHeight: T.section, fontWeight: W.semibold, marginTop: S.sm },
  cardCopy: { color: C.muted, fontSize: F.body, lineHeight: T.body, marginTop: S.sm },
  bodyMuted: { color: C.muted, fontSize: F.secondary, lineHeight: T.secondary, marginTop: S.sm },
  rowTitle: { color: C.ink, fontSize: F.body, lineHeight: T.body, fontWeight: W.semibold },
  rowSub: { color: C.muted, fontSize: F.secondary, lineHeight: T.secondary, marginTop: S.xs },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', gap: S.md, marginTop: S.section, marginBottom: S.lg },
  input: { minHeight: M.n48, borderWidth: M.n1, borderColor: C.muted, borderRadius: R.small, padding: S.md, color: C.ink, fontSize: F.body, backgroundColor: C.paper, marginBottom: S.md },
  hero: { padding: M.zero, backgroundColor: C.bg, marginBottom: S.section },
  heroTitle: { color: C.ink, fontSize: F.title, lineHeight: T.title, fontWeight: W.semibold, marginTop: S.sm },
  heroSub: { color: C.muted, fontSize: F.body, lineHeight: T.body, marginTop: S.md },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.lg, backgroundColor: C.soft, borderRadius: R.card, marginTop: S.lg },
  noticeIcon: { display: 'none' },
  noticeTitle: { color: C.ink, fontSize: F.body, fontWeight: W.semibold, lineHeight: T.body },
  noticeCopy: { color: C.muted, fontSize: F.secondary, lineHeight: T.secondary, marginTop: S.sm },
  backButton: { minHeight: M.n48, justifyContent: 'center', alignSelf: 'flex-start', paddingRight: S.md, marginBottom: S.sm },
  modeOption: { flex: 1, minHeight: M.n48, alignItems: 'center', justifyContent: 'center', padding: S.sm, borderRadius: R.small },
  setupChoice: { minHeight: M.n56, padding: S.lg, backgroundColor: C.paper, borderRadius: R.small, borderWidth: M.n1, borderColor: C.line, marginTop: S.sm },
  setupChoiceActive: { backgroundColor: C.greenSoft, borderColor: C.green },
}));
