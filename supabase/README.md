# Secure OpenAI review setup

The phone app only receives a Supabase project URL and publishable key. The OpenAI API key belongs in Supabase Edge Function secrets only; do not rename it to `EXPO_PUBLIC_OPENAI_API_KEY`, add it to app config, or bundle it into an Android/iOS build.

## One-time Supabase setup

1. Create a Supabase project and enable anonymous sign-ins in **Authentication → Providers**. This app uses a persistent anonymous guest session for requests.
2. In the Supabase project's Edge Function secrets, add `OPENAI_API_KEY` using the secret manager's protected input. The key was created in this task and is stored in the ignored local `.env.local`; it must be entered into the server secret store before cloud review works. Optionally set `OPENAI_COACH_MODEL` to a model available to your OpenAI project; the function defaults to `gpt-5-mini`.
3. Deploy the function in `supabase/functions/chess-coach` and keep JWT verification enabled. `supabase/config.toml` specifies that requirement.
4. Set these client values in the project's root `.env.local` (this file is gitignored):

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

5. Restart the Expo development server. A guest token is created through Supabase Auth on first review; the game PGN is then sent to the protected Edge Function.

## Privacy and service limits

- The OpenAI key remains server-side. The mobile app sends the game PGN to the configured Supabase function for review.
- Reviews are generated prose, not Stockfish tactical analysis. The prompt tells the model not to claim engine scores.
- `store: false` is set in the Responses request. Review the provider and Supabase data terms/settings before shipping to users.
- For a public release, add request rate limits, abuse monitoring, account deletion/data controls, and a usage budget before enabling AI review for unauthenticated guest accounts.
