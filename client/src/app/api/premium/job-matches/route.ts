import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { getJobMatches } from '@/app/api/_lib/job-matching';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/premium/job-matches
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mbtiType, discStyle, bigFive, limit = 5 } = body;

    if (!mbtiType || !discStyle || !bigFive) {
      return NextResponse.json(
        { error: 'mbtiType, discStyle, and bigFive are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const scores = {
      mbtiType: typeof mbtiType === 'string' && mbtiType.length >= 4 ? mbtiType.slice(0, 4) : mbtiType,
      disc: typeof discStyle === 'string' ? discStyle.charAt(0).toUpperCase() : 'S',
      bigFive,
    };

    const matches = await getJobMatches(getSupabaseAdmin(), scores, Number(limit));

    return NextResponse.json({ success: true, matches }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/premium/job-matches] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get job matches' },
      { status: 500, headers: corsHeaders }
    );
  }
}
