import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAuth } from '@/app/api/_lib/auth';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/premium/quiz-results — Save authenticated user's quiz result
export const POST = requireAuth(async (req: Request, ctx: { user: { sub: string } }) => {
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
      return NextResponse.json(
        { error: 'Failed to save quiz result' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, result: data }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/premium/quiz-results] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});

// GET /api/premium/quiz-results — Get authenticated user's quiz results
export const GET = requireAuth(async (req: Request, ctx: { user: { sub: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data, error } = await getSupabaseAdmin()
      .from('quiz_results')
      .select('*')
      .eq('user_id', ctx.user.sub)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/premium/quiz-results] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz results' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, results: data }, { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/premium/quiz-results] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});
