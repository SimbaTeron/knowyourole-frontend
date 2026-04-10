import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return url;
}

function getServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return key;
}

/**
 * Admin client for server-side operations (bypasses RLS)
 * Lazy singleton so it doesn't crash at build time when env vars aren't set
 */
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(getSupabaseUrl(), getServiceKey(), {
      auth: { persistSession: false }
    });
  }
  return _supabaseAdmin;
}

/**
 * Admin client alias — use getSupabaseAdmin() for lazy initialization
 */
export const supabaseAdmin = {
  get value(): SupabaseClient {
    return getSupabaseAdmin();
  }
};

/**
 * Create a user-scoped client using the user's access token
 * Use this for operations that should respect RLS policies
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}