# Chess Coach Pro

Chess Coach Pro is a native iOS and Android app built with Expo and React Native. It does not use a browser view or a web build.

## Run on a phone

### Expo Go preview (without Stockfish)

1. Install Expo Go on your phone.
2. In PowerShell, from this folder, run `.\run-preview.ps1`. The helper uses the bundled Node runtime, so a global Node installation is not required.
3. Scan the QR code. Keep your phone and computer on the same Wi-Fi network.

### Stockfish development build

Stockfish uses native code and therefore requires the development build; Android Studio and its emulator are optional if you install the APK on a real Android phone. Run `.\build-android-dev.ps1` and follow the Expo/EAS sign-in prompts. Open the EAS build page when it completes and install the APK on your phone. Then run `.\run-preview.ps1 -DevClient` and open its QR code with the installed Chess Coach Pro development app or your phone camera. Expo Go cannot load the native Stockfish module.

## Included app flows

- Native first-run onboarding, Home, Profile & settings, Progress, Game history, Learning path, Game review, Train, Play, and Library.
- Optional Chess.com public game sync for recent games, cached locally on the device.
- Native high-contrast Staunton-style vector chess pieces, legal moves, move list, undo, board flip, and pass-and-play.
- On-device Stockfish 17 opponent with White/Black choice and adaptive target strength based on recent rating plus coach-game results. Lower targets use a weaker candidate-move selection approximation below Stockfish's configured Elo floor.
- Mate-in-one training, opening principles, saved local puzzle count, starter learning resources, and local match history.
- Secure OpenAI written game-review function scaffolded through Supabase Edge Functions. The cloud feature needs a Supabase project and server secret configuration before it can run.

## AI review setup

Follow [the Supabase setup guide](supabase/README.md). The OpenAI key is kept server-side and is never bundled with the app. The ignored root `.env.local` is where the client-only Supabase URL and publishable key belong; do not put an OpenAI secret under an `EXPO_PUBLIC_` name.

## App journeys

See [APP_FLOWS.md](APP_FLOWS.md) for screen paths, empty/error states, and features that still need external services or further implementation.

## Stack

- Expo SDK 57 / React Native 0.86 and a development client for native Stockfish
- `@loloof64/react-native-stockfish` wrapping Stockfish 17 (MIT wrapper; the engine itself is GPLv3)
- `chess.js` for legal chess moves and game state
- Async Storage for player preferences and local game data
- Supabase Edge Functions and OpenAI Responses API for optional written game reviews
