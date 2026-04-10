import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { getJobMatches } from '@/app/api/_lib/job-matching';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/premium/job-match/top
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mbtiType, discStyle, bigFive } = body;

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

    const matches = await getJobMatches(getSupabaseAdmin(), scores, 1);

    return NextResponse.json({ success: true, match: matches[0] || null }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/premium/job-match/top] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get top job match' },
      { status: 500, headers: corsHeaders }
    );
  }
}
