# Visual restyle self-review

Scope: source review; no phone/emulator available. Runtime, small-phone, keyboard and 130% font-scale checks remain unverified. Existing callbacks, timers, chess rules and persistence are preserved.

## Final checklist status

| Rule | Source result | Remaining verification |
| --- | --- | --- |
| 1. One prominent primary action | Today next task emphasized; secondary buttons quietened; existing board-input actions preserved | Settings and board-only states do not need an invented new submit action |
| 2. One focal point | Promotional Review/Library heroes removed; board chrome reduced | Rendered squint test on phone |
| 3. Type/weights | Edited styles use 14/16/20/28 and 400/600; no numeric font sizes or 700+ weights remain in edited screens | Shared chessboard coordinate labels are outside this chrome refactor |
| 4. Accent budget | Supporting text neutral; existing accent preserved; selected controls and progress retain accent | Exact above-fold accent count depends on state/device; repeated selected states flagged below |
| 5. Spacing | Edited spacing uses 4/8/12/16/24/32/48; required page inset 20 | Fixed board/SVG geometry remains separate from spacing tokens |
| 6. Contrast/meaning | Neutral text meets 4.5:1 on base/surface; secondary-button outline strengthened; review move text neutral with classification symbols | Actual board-highlight contrast on phone |
| 7. Remove clutter | Decorative emoji, promotional badges/heroes, repeated resource icons, heavy weights and several boxed surfaces removed | Further removal must preserve informative states and actions |
| 8. Scaling/keyboard/small phone | Scroll behavior retained; main buttons have minimum 48 height; lesson/review controls enlarged | **Not verified** at 130% or with device keyboard/safe areas |
| 9. States/plain copy | Existing empty/loading/error branches retained; metadata sentence case | This task preserves existing flows/copy; it does not invent missing behavior |
| 10. First-use clarity | Screen titles, next task, board turn and existing actions retained | 3-second comprehension check with a first-time user |

Android bundle export passed (831 modules). Syntax parsing and token-reference checks passed for 61 source modules plus App.js. No changes to App.js, engine, storage, services or data modules. History's previously missing component imports were restored to prevent render errors. These checks do not establish on-device boot, all-tab rendering or a completed coach game.

## What changed by screen

| Screen | Removed or simplified |
| --- | --- |
| Today/Home | Flame emoji, uppercase greeting, boxed quick-link grid and tinted spotlight; next unfinished task is emphasized |
| Train | Promotional labels and flame emoji; neutral rating strip, plain theme rows, consistent puzzle/drill typography |
| Play | Promotional labels and ornamental avatar; quieter board wrapper and stacked controls; New game is secondary |
| Review | Promotional hero/chess ornament; quiet summary, readable move classification symbols and larger move controls |
| Learning | Decorative progress piece and saturated progress panel; wrapped track choices, plain lesson nodes and readable lesson controls |
| Library | Decorative hero and repeating piece icons; plain resource list, sentence-case filters and neutral author text |
| History | Promotional badge, boxed local-game rows; explicit accessibility labels |
| Progress | Decorative focus icon and tinted/stat framing; neutral statistics and retained review action |
| Profile | Promotional badge and heavy profile framing; consistent choices, reminders and picker typography |
| Onboarding | Promotional badge and colored hero; neutral title/choices, consistent diagnostic typography and radio labels |


## HomeScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## TrainScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## PlayScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## ReviewScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## LearningScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## LibraryScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## HistoryScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## ProgressScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## ProfileScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.

## OnboardingScreen

- Hierarchy: primary task retained; marketing ornaments removed or quietened.
- Typography: style literals migrated to four sizes (14/16/20/28) and regular/semibold. Shared board labels retain their own geometry.
- Accent: supporting text neutralized; selected states, progress and primary controls retain meaning. Multiple repeated selected states may exceed two visible marks; this is flagged for device review.
- Spacing/radii: edited styles use theme tokens, 4-point spacing with the required 20-point page inset; flat surfaces, no elevation.
- Contrast: primary/secondary/tertiary neutral text meets 4.5:1 on base/surface; move-quality text and legacy nested components need separate device review.
- Removal/simplification: decorative marketing labels, tinted boxes/ornaments and heavy weights reduced; interactive controls retained.
- Scaling/keyboard/small phone: not verified on a device; fixed control heights use minimum heights where safe, scroll behavior retained.
- Empty/loading/error: existing state branches preserved; no invented new behavior.
- First use: page title and task controls remain explicit; squint/3-second evaluation requires rendered phone review.
