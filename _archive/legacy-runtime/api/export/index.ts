import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

export const config = { runtime: 'nodejs' };

// GET /api/export/blueprint — requires auth
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Wire Auth0 validation
  // const user = await validateAuth0Token(token);
  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'placeholder';

    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      blueprint: {
        summary: `KnowYouRole Personal Blueprint — ${results?.length || 0} sessions recorded`,
        results: results || [],
        generatedAt: new Date().toISOString(),
        note: 'Export requires Auth0 to be wired — currently returns placeholder data',
      },
    });
  } catch (error) {
    console.error('[GET /api/export/blueprint] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}