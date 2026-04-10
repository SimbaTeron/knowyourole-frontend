import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/traits/adventure-archetypes
export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { data: archetypes, error } = await getSupabaseAdmin()
      .from('adventure_archetypes')
      .select('*');

    if (error) {
      console.error('[GET /api/traits/adventure-archetypes] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch archetypes' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ archetypes: archetypes || [] }, { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/traits/adventure-archetypes] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
