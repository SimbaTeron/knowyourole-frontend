import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { requireAuth } from '../../_lib/auth';

export const config = { runtime: 'nodejs' };

// GET /api/auth/user — Get current user info
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Wire Auth0 token validation when credentials are available
  // For now: return placeholder until auth is wired
  return NextResponse.json({
    sub: 'placeholder',
    email: null,
    is_premium: false,
    message: 'Auth0 not yet wired — set AUTH0_DOMAIN + AUTH0_CLIENT_SECRET in env vars',
  });
}

// POST /api/auth/user — Upsert user from Auth0 token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, first_name, last_name, avatar_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'id (Auth0 sub) is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({ id, email, first_name, last_name, avatar_url, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/auth/user] Upsert error:', error);
      return NextResponse.json({ error: 'Failed to upsert user' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/auth/user] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}