import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/job-roles/search?q=<query>
export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ roles: [] }, { headers });
  }

  try {
    // Search role_name column via Supabase (case-insensitive via ilike)
    const { data: roles, error } = await getSupabaseAdmin()
      .from('job_roles')
      .select('role_number, role_name, category, description')
      .ilike('role_name', `%${q}%`)
      .order('role_name')
      .limit(8);

    if (error) {
      console.error('[GET /api/job-roles/search] Supabase error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500, headers });
    }

    // Return the frontend DTO shape; keep DB snake_case behind the API boundary.
    return NextResponse.json({
      roles: (roles || []).map(r => ({
        roleNumber: r.role_number,
        roleName: r.role_name,
        category: r.category,
        description: r.description,
      })),
    }, { headers });
  } catch (err) {
    console.error('[GET /api/job-roles/search] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500, headers });
  }
}
