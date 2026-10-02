# Chess Coach Pro AI plan

## Recommended split

- **Chess decisions:** Stockfish 17 runs on the phone. It validates and chooses moves, and its strength adapts from the player's recent Chess.com rating and coach-game results.
- **Written coaching:** OpenAI's Responses API explains submitted games. Calls go through the `chess-coach` Supabase Edge Function; the OpenAI key is a server secret and must never be added to an `EXPO_PUBLIC_` variable or a mobile build.
- **Personalization:** Start with transparent on-device signals: recent rating, coach-game results, puzzle completions, game outcomes, and selected learning goal. Do not ask a language model to choose legal chess moves.

The mobile client and Edge Function are scaffolded. A Supabase project is still needed before cloud reviews can run; setup is in `supabase/README.md`.

## Training a custom model

There is no custom model trained for this app. Start with a hosted model and measure whether users benefit. Fine-tuning is a later option only after collecting a rights-cleared set of coach-reviewed examples. PGNs alone are not coaching labels.

Each training example should include a position, player's move, Stockfish best move and alternatives, evaluations, phase, rating band, a reviewed explanation, and lesson tags. Split the data by whole game and player. Evaluate chess factual accuracy against Stockfish and have human coaches judge clarity and usefulness on held-out games.

```json
{
  "position_fen": "position before the player's move",
  "played_move_san": "the move from the game",
  "best_move_san": "the Stockfish move",
  "played_move_eval_cp": -180,
  "best_move_eval_cp": 35,
  "phase": "middlegame",
  "rating_band": "1200-1400",
  "coach_explanation": "Coach-reviewed explanation of the missed idea and a practical cue.",
  "lesson_tags": ["king_safety", "candidate_moves"]
}
```
