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
    // Also verify the user in the handler: a public API key is not a guest identity.
    const authorization = request.headers.get('Authorization');
    const projectUrl = Deno.env.get('SUPABASE_URL');
    const publicKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!projectUrl || !publicKey) return Response.json({ error: 'The coaching server authentication is not configured.' }, { status: 503, headers: corsHeaders });
    if (!authorization?.startsWith('Bearer ')) return Response.json({ error: 'A guest coaching session is required.' }, { status: 401, headers: corsHeaders });
    const identity = await fetch(`${projectUrl}/auth/v1/user`, {
      headers: { apikey: publicKey, Authorization: authorization }, signal: AbortSignal.timeout(10000),
    });
    const user = await identity.json().catch(() => ({}));
    if (!identity.ok || !user.id) return Response.json({ error: 'The guest coaching session has expired.' }, { status: 401, headers: corsHeaders });
    const body = await request.text();
    if (body.length > 16000) return Response.json({ error: 'The review request is too large.' }, { status: 413, headers: corsHeaders });
    const { criticalMoments, stats, username } = JSON.parse(body);
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
      userColor: ['w', 'b'].includes(stats.userColor) ? stats.userColor : null,
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(70000),
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_COACH_MODEL') || 'gpt-5-mini', store: false,
        reasoning: { effort: 'low' }, max_output_tokens: 4000,
        instructions: 'You are a careful chess coach. The supplied critical moments and accuracy values were verified by the on-device chess engine. Explain only those supplied moments and their listed played move, best move, centipawn loss, and phase. Do not infer or claim anything about another position, unprovided move, opening, game result, or game story. Never invent chess facts. If no moments are supplied, say that no specific position can be coached from the provided evidence. Be concise, kind, and practical. Coaching scores are impressions, not engine evaluations. Return brief phase notes and lessons only for phases represented in the critical moments; for other phases say no verified critical moment was supplied.',
        input: JSON.stringify({ username: typeof username === 'string' ? username.slice(0, 80) : '', stats: gameStats, criticalMoments: moments }),
        text: { format: { type: 'json_schema', name: 'chess_game_review', strict: true, schema } },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const code = payload.error?.code;
      const quotaExhausted = payload.error?.type === 'insufficient_quota'
        || ['insufficient_quota', 'credit_balance_exhausted', 'billing_hard_limit_reached'].includes(code);
      const message = quotaExhausted ? 'The OpenAI project has no API credit remaining. Add API credit to enable written coaching.'
        : response.status === 429 ? 'The written coach is busy. Wait a moment and try again.'
        : response.status === 401 ? 'The coaching server key is invalid. Update the server secret.'
        : 'The AI provider could not complete this review. Check the server model configuration.';
      return Response.json({ error: message }, { status: response.status === 429 ? 429 : 502, headers: corsHeaders });
    }
    if (payload.status === 'incomplete') return Response.json({ error: 'The written notes were incomplete. Try again.' }, { status: 502, headers: corsHeaders });
    if (payload.output?.some((item) => item.content?.some((part) => part.type === 'refusal'))) return Response.json({ error: 'The coach could not explain these positions. Try another game.' }, { status: 422, headers: corsHeaders });
    const text = payload.output?.flatMap((item) => item.content || []).find((part) => part.type === 'output_text')?.text;
    if (!text) return Response.json({ error: 'The AI provider returned an empty review.' }, { status: 502, headers: corsHeaders });
    const review = JSON.parse(text);
    // Phases without supplied positions must never acquire invented coaching.
    for (const phase of ['opening', 'middlegame', 'endgame']) {
      if (!moments.some((moment) => moment.phase === phase)) {
        review[`${phase}_review`] = `No engine-verified ${phase} moment was supplied.`;
        review[`${phase}_lessons`] = [];
      }
    }
    return Response.json(review, { headers: corsHeaders });
  } catch (error) {
    if (['TimeoutError', 'AbortError'].includes(error.name)) return Response.json({ error: 'The written coach took too long. Try again.' }, { status: 504, headers: corsHeaders });
    return Response.json({ error: 'Could not write notes for these engine-verified moments. Try again.' }, { status: error instanceof SyntaxError ? 400 : 502, headers: corsHeaders });
  }
});
