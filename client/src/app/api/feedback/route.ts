import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/feedback — Save feedback entry
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      session_id, useful_app, results_accurate, questions_engaging,
      would_share, suggestions, mbti_type, disc_style,
      primary_role, tier, mood, fun_mode,
    } = body;

    const { data, error } = await getSupabaseAdmin()
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
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET /api/feedback — Get all feedback entries (admin)
export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await getSupabaseAdmin()
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, count: data?.length || 0, feedback: data },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[GET /api/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
