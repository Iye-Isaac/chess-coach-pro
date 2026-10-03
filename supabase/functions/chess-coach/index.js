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
    const { criticalMoments, stats, username } = await request.json();
    if (!Array.isArray(criticalMoments) || criticalMoments.length > 3 || !stats || typeof stats !== 'object') {
      return Response.json({ error: 'This review needs engine-verified critical moments and game accuracy stats.' }, { status: 400, headers: corsHeaders });
    }
    const moments = criticalMoments.map((moment) => ({
      fen: String(moment?.fen || '').slice(0, 160),
      playedSan: String(moment?.playedSan || '').slice(0, 20),
      bestSan: String(moment?.bestSan || '').slice(0, 20),
      cpLoss: Math.max(0, Math.min(2000, Number(moment?.cpLoss) || 0)),
      phase: ['opening', 'middlegame', 'endgame'].includes(moment?.phase) ? moment.phase : 'middlegame',
    }));
    if (moments.some((moment) => !moment.fen || !moment.playedSan || !moment.bestSan)) {
      return Response.json({ error: 'A critical moment was missing its verified position or moves.' }, { status: 400, headers: corsHeaders });
    }
    const gameStats = {
      whiteAccuracy: Math.max(0, Math.min(100, Number(stats.whiteAccuracy) || 0)),
      blackAccuracy: Math.max(0, Math.min(100, Number(stats.blackAccuracy) || 0)),
      plies: Math.max(0, Math.min(1000, Number(stats.plies) || 0)),
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_COACH_MODEL') || 'gpt-5-mini', store: false,
        instructions: 'You are a careful chess coach. The supplied critical moments and accuracy values were verified by the on-device chess engine. Explain only those supplied moments and their listed played move, best move, centipawn loss, and phase. Do not infer or claim anything about another position, unprovided move, opening, game result, or game story. Never invent chess facts. If no moments are supplied, say that no specific position can be coached from the provided evidence. Be concise, kind, and practical. Coaching scores are impressions, not engine evaluations. Return brief phase notes and lessons only for phases represented in the critical moments; for other phases say no verified critical moment was supplied.',
        input: JSON.stringify({ username: typeof username === 'string' ? username.slice(0, 80) : '', stats: gameStats, criticalMoments: moments }),
        text: { format: { type: 'json_schema', name: 'chess_game_review', strict: true, schema } },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return Response.json({ error: 'The AI provider could not complete this review.' }, { status: 502, headers: corsHeaders });
    const text = payload.output?.flatMap((item) => item.content || []).find((part) => part.type === 'output_text')?.text;
    if (!text) return Response.json({ error: 'The AI provider returned an empty review.' }, { status: 502, headers: corsHeaders });
    return Response.json(JSON.parse(text), { headers: corsHeaders });
  } catch {
    return Response.json({ error: 'Could not write notes for these engine-verified moments. Try again.' }, { status: 400, headers: corsHeaders });
  }
});
