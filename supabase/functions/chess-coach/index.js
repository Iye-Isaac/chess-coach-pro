const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    overall_score: { type: 'integer', minimum: 1, maximum: 10 },
    overall_summary: { type: 'string' },
    opening_score: { type: 'integer', minimum: 1, maximum: 10 },
    opening_review: { type: 'string' }, opening_lessons: { type: 'array', items: { type: 'string' } },
    middlegame_score: { type: 'integer', minimum: 1, maximum: 10 },
    middlegame_review: { type: 'string' }, middlegame_lessons: { type: 'array', items: { type: 'string' } },
    endgame_score: { type: 'integer', minimum: 1, maximum: 10 },
    endgame_review: { type: 'string' }, endgame_lessons: { type: 'array', items: { type: 'string' } },
  },
  required: ['overall_score', 'overall_summary', 'opening_score', 'opening_review', 'opening_lessons', 'middlegame_score', 'middlegame_review', 'middlegame_lessons', 'endgame_score', 'endgame_review', 'endgame_lessons'],
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Use POST for a game review.' }, { status: 405, headers: corsHeaders });

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return Response.json({ error: 'The AI review service is missing its server key.' }, { status: 503, headers: corsHeaders });

  try {
    const { game, username } = await request.json();
    if (!game || typeof game.pgn !== 'string' || game.pgn.length > 100_000) {
      return Response.json({ error: 'This game is missing a valid PGN.' }, { status: 400, headers: corsHeaders });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_COACH_MODEL') || 'gpt-5-mini', store: false,
        instructions: 'You are a careful chess coach. Review only the submitted PGN and basic game metadata. Never claim an engine evaluation or invent a move that is absent from the PGN. Give practical, kind feedback for a club player. Scores are coaching impressions, not Stockfish analysis. Return concise phase notes and 1-3 lessons per phase; say when a phase did not occur.',
        input: JSON.stringify({ username: typeof username === 'string' ? username.slice(0, 80) : '', pgn: game.pgn, time_class: game.time_class || '', result: game.result || '' }),
        text: { format: { type: 'json_schema', name: 'chess_game_review', strict: true, schema } },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return Response.json({ error: 'The AI provider could not complete this review.' }, { status: 502, headers: corsHeaders });
    const text = payload.output?.flatMap((item) => item.content || []).find((part) => part.type === 'output_text')?.text;
    if (!text) return Response.json({ error: 'The AI provider returned an empty review.' }, { status: 502, headers: corsHeaders });
    return Response.json(JSON.parse(text), { headers: corsHeaders });
  } catch {
    return Response.json({ error: 'Could not review this game. Check the PGN and try again.' }, { status: 400, headers: corsHeaders });
  }
});
