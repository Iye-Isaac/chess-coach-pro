# Project rules: Chess Coach Pro

- Native Expo SDK 57 / React Native 0.86 app, plain JavaScript (no TypeScript, no web build).
- Offline-first: everything must work with no network and no account. Chess.com sync and AI review are optional extras.
- Chess rules and move legality: chess.js only. Never let an LLM choose or validate moves.
- Engine: Stockfish 17 via @loloof64/react-native-stockfish (native dev build only). In Expo Go the engine is unavailable; keep the existing graceful fallback.
- Persistence: AsyncStorage, keys prefixed "chesscoach." Never rename or break existing keys: chesscoach.username, .games, .localGames, .profile, .onboarding.done, .training.solved, .adaptive.<player>. Add new keys; migrate, don't replace.
- Do not add dependencies unless the task says so. If you think one is needed, say why and wait.
- Keep the existing visual language (color tokens in C, card/badge/Button components, tone of copy).
- Every interactive element needs an accessibilityLabel/role. Respect reduce-motion.
- Never bundle secrets. The OpenAI key stays server-side in the Supabase Edge Function.
- After each task: app must boot, all tabs must open without errors, and existing features (play vs coach, pass-and-play, Chess.com sync, history) must still work. Summarize what changed and list anything you could not verify on a device.
