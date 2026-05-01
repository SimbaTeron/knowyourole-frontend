import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// ─── Environment ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

// ─── Admin client (server-side only — bypasses RLS) ──────────────────────────
// Falls back to anon key if service role key is not configured
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

// ─── User-scoped client (validates Auth0 token, applies RLS) ─────────────────
// Note: Auth0 validation is applied per-route in handlers
export function createUserClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}

// ─── Generic auth check ─────────────────────────────────────────────────────
export async function getAuthUser(token: string | null): Promise<{ sub: string; email?: string } | null> {
  if (!token) return null;
  // TODO: Wire Auth0 JWT validation when AUTH0_DOMAIN + AUTH0_CLIENT_SECRET are set
  // For now: placeholder that always returns null (auth bypassed until real creds provided)
  return null;
}

// ─── Auth middleware helper ─────────────────────────────────────────────────
export function withAuth(
  handler: (req: NextRequest, context: { user: { sub: string } }) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getAuthUser(token);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, { user });
  };
}