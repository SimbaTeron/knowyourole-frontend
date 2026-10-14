import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_CAREER_CATALOG, CAREER_CATALOG_MINIMUM } from '@/data/careerCatalog';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
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

    const managedRoles = data || [];
    const publicRoles = !category && managedRoles.length < CAREER_CATALOG_MINIMUM
      ? FALLBACK_CAREER_CATALOG.slice(0, limit).map((role) => ({
          role_number: role.id,
          role_name: role.roleName,
          category: role.category,
        }))
      : managedRoles;

    return NextResponse.json({
      success: true,
      count: publicRoles.length,
      jobRoles: publicRoles,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[GET /api/job-roles] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
