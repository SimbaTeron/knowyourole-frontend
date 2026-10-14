import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/_lib/auth';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (_req: NextRequest, ctx) => {
  const supabase = getSupabaseAdmin();
  const userId = ctx.user.sub;
  const [user, results, sessions, preferences, directLeads, directFeedback] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).maybeSingle(),
    supabase.from('quiz_results').select('*').eq('user_id', userId),
    supabase.from('quiz_sessions').select('*').eq('user_id', userId),
    supabase.from('user_privacy_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('result_email_leads').select('*').eq('user_id', userId),
    supabase.from('feedback').select('*').eq('user_id', userId),
  ]);

  const errors = [user.error, results.error, sessions.error, preferences.error, directLeads.error, directFeedback.error]
    .filter((error) => error && error.code !== 'PGRST116');
  if (errors.length) {
    console.error('Account export failed', errors);
    return NextResponse.json({ error: 'Failed to export account data' }, { status: 500 });
  }

  const sessionIds = (sessions.data ?? []).map((session) => session.id);
  const [sessionLeads, sessionFeedback] = sessionIds.length
    ? await Promise.all([
      supabase.from('result_email_leads').select('*').in('session_id', sessionIds),
      supabase.from('feedback').select('*').in('session_id', sessionIds),
    ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (sessionLeads.error || sessionFeedback.error) {
    console.error('Account export related-data failed', { sessionLeads: sessionLeads.error, sessionFeedback: sessionFeedback.error });
    return NextResponse.json({ error: 'Failed to export related account data' }, { status: 500 });
  }

  const uniqueById = <T extends { id: string }>(rows: T[]) => Array.from(new Map(rows.map((row) => [row.id, row])).values());
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    scope: 'signed-in-account-data',
    user: user.data ?? null,
    quizResults: results.data ?? [],
    quizSessions: sessions.data ?? [],
    resultEmailLeads: uniqueById([...(directLeads.data ?? []), ...(sessionLeads.data ?? [])]),
    feedback: uniqueById([...(directFeedback.data ?? []), ...(sessionFeedback.data ?? [])]),
    privacyPreferences: preferences.data ?? null,
  }, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
});
