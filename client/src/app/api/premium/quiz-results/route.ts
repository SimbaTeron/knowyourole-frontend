import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAuth } from '@/app/api/_lib/auth';
import { jsonResponse, noContentResponse } from '@/app/api/_lib/security';

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// POST /api/premium/quiz-results — Save authenticated user's quiz result
export const POST = requireAuth(async (req: NextRequest, ctx: { user: { sub: string } }) => {
  try {
    const body = await req.json();
    const {
      session_id, tier, mood, fun_mode, landmark,
      mbti_type, mbti_blend, disc_style,
      big_five_o, big_five_c, big_five_e, big_five_a, big_five_n,
      primary_role_title, secondary_role_title,
      critical_thinking, first_principles,
      total_questions, avg_response_time,
      responses,
    } = body;

    const { data, error } = await getSupabaseAdmin()
      .from('quiz_results')
      .insert({
        user_id: ctx.user.sub,
        session_id,
        tier,
        mood,
        fun_mode,
        landmark,
        mbti_type,
        mbti_blend,
        disc_style,
        big_five_o,
        big_five_c,
        big_five_e,
        big_five_a,
        big_five_n,
        primary_role_title,
        secondary_role_title,
        critical_thinking,
        first_principles,
        total_questions,
        avg_response_time,
        responses,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/premium/quiz-results] Error:', error);
      return jsonResponse(
        { error: 'Failed to save quiz result' },
        { status: 500 }
      );
    }

    return jsonResponse({ success: true, result: data });
  } catch (error) {
    console.error('[POST /api/premium/quiz-results] Error:', error);
    return jsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// GET /api/premium/quiz-results — Get authenticated user's quiz results
export const GET = requireAuth(async (req: NextRequest, ctx: { user: { sub: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100);

    const { data, error } = await getSupabaseAdmin()
      .from('quiz_results')
      .select('*')
      .eq('user_id', ctx.user.sub)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/premium/quiz-results] Error:', error);
      return jsonResponse(
        { error: 'Failed to fetch quiz results' },
        { status: 500 }
      );
    }

    return jsonResponse({ success: true, results: data });
  } catch (error) {
    console.error('[GET /api/premium/quiz-results] Error:', error);
    return jsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
