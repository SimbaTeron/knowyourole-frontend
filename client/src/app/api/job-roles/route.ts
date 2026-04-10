import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/job-roles
export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '150');
    const category = searchParams.get('category');

    let query = getSupabaseAdmin()
      .from('job_roles')
      .select('*')
      .order('role_number', { ascending: true })
      .limit(limit);

    if (category) {
      query = query.eq('job_collar', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/job-roles] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job roles' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      jobRoles: data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/job-roles] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
