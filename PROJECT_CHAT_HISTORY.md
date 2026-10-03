# Chess Coach Pro — Project Chat History

This file summarizes the requests, decisions, and implementation milestones recorded in the Chess Coach Pro project conversation. It contains no credentials.

## Product and setup

- Requested a complete native mobile chess-coaching app, not a web app, with a way to preview it and run it on a phone.
- Chose Android Studio for an early run, then preferred running without Android Studio. Worked through missing Node.js, Git, and Android tooling, and asked how to build and launch the app.
- Asked to replace weak piece visibility with a familiar, high-contrast chess-piece style and add Stockfish with strength adapted to a player's rating and play.
- Reported Stockfish timeouts and missing player-color selection. Requested complete app flows and screens instead of a skeleton experience.
- Chose a securely configured OpenAI-backed AI feature rather than Base44. Confirmed there was no Supabase project, so the app remains offline-first and AI review is optional.
- Asked to push the project to GitHub and chose a private repository: `Iye-Isaac/chess-coach-pro`.

## Training and analysis features

- Requested a Lichess puzzle data pipeline and offline five-puzzle sessions, including theme practice, hints, rating, history, and no repeats within consecutive sessions.
- Requested on-device Stockfish game review for imported Chess.com games and local games, including move accuracy, an evaluation graph, critical moments, and cached results.
- Asked how to test changes on a phone and reported an AsyncStorage missing error and a recurring Stockfish response error.
- Requested a mistake-review loop: save critical positions, practise them later with Leitner scheduling, retries, saved progress, and an optional automatic blunder-save setting.
- Requested a data-driven lesson path and lesson player with demonstrations, legal-move exercises, quizzes, stars, resume support, four tracks, and the existing Library available as more resources.

## Latest UI and build request

- Asked for review moves to be highlighted on the board by classification: best dark green, good green, inaccuracies yellow, mistakes orange, and blunders red.
- Asked for a sound on each move. Approved adding the Expo `expo-audio` dependency.
- Asked to build an Android APK. The EAS `preview` build was accepted for remote compilation under build ID `527811d6-21d2-4d9f-ba88-b1838a919438`:
  <https://expo.dev/accounts/iye_isaac/projects/chess-coach-pro/builds/527811d6-21d2-4d9f-ba88-b1838a919438>
- Asked whether the project can continue under another Codex account. The repository can be opened from another account after connecting GitHub and granting it access to the private repository; chat history does not transfer with the source repository.
- Asked to commit and push the updates and save this project chat history as a Markdown file.
- Requested a skippable onboarding skill check with five timed offline puzzles, Elo-style rating, theme strengths and weaknesses, and a three-part lesson / puzzle / coach plan. Added a returning-user reminder and a Profile retake entry point; the selected coach estimate seeds the adaptive target while stored adjustment history remains intact.

## Project constraints

- Native Expo / React Native JavaScript app; offline-first and no account required for core chess features.
- Use `chess.js` for chess rules and legal moves. Stockfish is native-build-only; keep the Expo Go fallback.
- Preserve existing AsyncStorage keys and data shapes; prefix new keys with `chesscoach.`.
- Keep the OpenAI key server-side; never bundle secrets.
- Avoid new dependencies unless required and approved. Keep controls accessible and respect reduced motion.
- Validate the Android JavaScript bundle, lesson data, and scheduler changes; device behavior still requires a phone test.
