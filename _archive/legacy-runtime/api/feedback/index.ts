import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

export const config = { runtime: 'nodejs' };

// POST /api/feedback — public
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id, useful_app, results_accurate, questions_engaging,
      would_share, suggestions, mbti_type, disc_style,
      primary_role, tier, mood, fun_mode,
    } = body;

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        session_id,
        useful_app,
        results_accurate,
        questions_engaging,
        would_share,
        suggestions,
        mbti_type,
        disc_style,
        primary_role,
        tier,
        mood,
        fun_mode,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/feedback] Error:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[POST /api/feedback] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/feedback — public (for admin dashboard)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0, feedback: data });
  } catch (error) {
    console.error('[GET /api/feedback] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}