import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { getJobMatches } from '@/app/api/_lib/job-matching';
import { requireAuthInProduction } from '@/app/api/_lib/auth';
import { jsonResponse, noContentResponse } from '@/app/api/_lib/security';

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// POST /api/premium/job-match-top
// Local/dev remains open for preview. Production requires a valid Auth0 bearer token.
export async function POST(req: NextRequest) {
  const authError = await requireAuthInProduction(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { mbtiType, discStyle, bigFive } = body;

    if (!mbtiType || !discStyle || !bigFive) {
      return jsonResponse(
        { error: 'mbtiType, discStyle, and bigFive are required' },
        { status: 400 }
      );
    }

    const scores = {
      mbtiType: typeof mbtiType === 'string' && mbtiType.length >= 4 ? mbtiType.slice(0, 4) : mbtiType,
      disc: typeof discStyle === 'string' ? discStyle.charAt(0).toUpperCase() : 'S',
      bigFive,
    };

    const matches = await getJobMatches(getSupabaseAdmin(), scores, 1);

    return jsonResponse({ success: true, match: matches[0] || null });
  } catch (error) {
    console.error('[POST /api/premium/job-match-top] Error:', error);
    return jsonResponse(
      { error: 'Failed to get top job match' },
      { status: 500 }
    );
  }
}
