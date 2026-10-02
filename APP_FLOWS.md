# Chess Coach Pro: screens and user flows

## Main navigation

Five persistent native tabs: **Home**, **Review**, **Train**, **Play**, and **Library**. The profile button opens **Profile & settings**. Home shortcuts lead to **Progress**, **Game history**, and **Learning path**. A game review has its own back path to Review.

## First launch

1. Welcome screen explains the coaching purpose.
2. Player selects one learning goal and a broad experience level.
3. Preferences save on-device; no account is required.
4. Player enters Home and can connect a public Chess.com username later, start a local game, or practice.

## Home and account connection

- Guest: enter a Chess.com username, connect, or skip and use local play/training.
- Connected: view imported recent games, refresh the public feed, open a review, or disconnect in settings.
- Errors: invalid/missing username, player not found, and network errors stay inline with retry available.
- Data: up to 12 games from the recent 30-day window are cached on-device. No Chess.com password is requested.

## Play

1. Setup: choose **Pass & play** or **Adaptive Stockfish Coach**.
2. Coach setup: choose White or Black; see engine readiness, recent rating seed, target strength, and record.
3. Board: tap a piece then a highlighted legal destination; flip orientation; undo (one local ply, a full human/coach turn when possible); start a new game.
4. Coach waits while Stockfish searches locally. Black selection gives Stockfish the opening move. Completed games save locally.
5. End: show the outcome, replay through Game history, or start another game.
6. Engine unavailable: use pass-and-play in Expo Go; coach play requires the installed native development build. A move timeout shows an actionable message instead of pretending the move succeeded.

Strength uses recent imported rating when available, otherwise 1400, and adjusts gradually from coach-game outcomes. Stockfish UCI Elo strength control has a 1320 floor in this build; below that the app requests multiple candidate moves and selects a lower-ranked candidate as an approximation. It is not a separately trained chess model.

## Review

- Review lists imported Chess.com games and opens a per-game review.
- Local completed games are available from Game history and can be sent to the same written-review flow.
- AI review uses the Supabase `chess-coach` Edge Function and OpenAI Responses API. If no Supabase client settings are present, the app explains that setup is missing. If the provider fails, the screen offers retry and reports the failure.
- Written model feedback is not Stockfish evaluation. Accurate move classification and tactical claims require an engine analysis pipeline; do not present generated prose as engine truth.

## Train

- **Daily tactics:** interactive mate-in-one puzzle with immediate feedback and local completion count.
- **Openings:** short opening principles and a direct path into a focused game.
- **Review cards:** local puzzle completion count and return path to today's tactic.

## Learning path

A four-step weekly loop: warm up with tactics, play a focused game, review a turning point, then study an opening/endgame/resource. Steps link directly to the relevant app areas.

## Library

Curated starter resources cover opening principles, tactics, and endgames. Content is currently static starter material; external courses, paid resources, and cloud libraries are not connected.

## Progress and history

- **Progress:** imported recent rating, game count, W/D/L totals, win-rate bar, and a link to review.
- **Game history:** recent imported games and up to 50 completed local coach/pass-and-play games; local entries open the board's PGN review flow.
- Empty states direct the player to connect an account or play a game.

## Profile & settings

Change the learning goal, connect/disconnect the Chess.com public profile, revisit first-run preferences, and open the AI/privacy setup explanation. Profile, cache, preferences, coach adjustment, training count, and local history live in app storage.

## Not connected yet

The app does not yet provide registered cloud accounts, sync across devices, online multiplayer, notifications, paid courses, a real spaced-repetition schedule, or custom-trained model weights. AI game reviews require a Supabase project, anonymous guest sign-in enabled, client URL/publishable key, and server-side OpenAI secret configured as described in `supabase/README.md`.
