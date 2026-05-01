import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { adminCorsHeaders, requireAdminRequest } from '@/app/api/_lib/admin-guard';


const corsHeaders = adminCorsHeaders;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/export/sheets/full
export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req);
  if (unauthorized) return unauthorized;

  // Check for Google Sheets credentials
  const googleClientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const googlePrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHE_ID;

  if (!googleClientEmail || !googlePrivateKey || !spreadsheetId) {
    return NextResponse.json({
      error: 'not configured',
      message: 'Google Sheets API credentials not configured. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHE_ID environment variables.',
    }, { status: 200, headers: corsHeaders });
  }

  try {
    const { GoogleAuth } = await import('google-auth-library');
    const { google } = await import('googleapis');

    const auth = new GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: googleClientEmail,
        private_key: googlePrivateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch all data
    const [sessions, feedback, jobRoles] = await Promise.all([
      getSupabaseAdmin().from('quiz_sessions').select('*').limit(1000),
      getSupabaseAdmin().from('feedback').select('*').limit(1000),
      getSupabaseAdmin().from('job_roles').select('*').limit(200),
    ]);

    const feedbackMap = new Map<string, any>();
    feedback.data?.forEach(f => {
      if (f.session_id) feedbackMap.set(f.session_id, f);
    });

    const timestamp = new Date().toISOString();

    // Sheet 1: Overview
    const overviewRows = [
      ['KnowYouRole Blueprint Export'],
      ['Generated', timestamp],
      ['Total Sessions', sessions.data?.length || 0],
      ['Total Feedback Entries', feedback.data?.length || 0],
      ['Total Job Roles', jobRoles.data?.length || 0],
    ];

    // Sheet 2: Sessions
    const sessionsHeader = [
      'Timestamp', 'Session ID', 'Age Tier', 'Mood', 'Fun Mode', 'Theme',
      'MBTI Type', 'DISC Style', 'Title', 'Openness', 'Conscientiousness',
      'Extraversion', 'Agreeableness', 'Neuroticism', 'Engagement',
      'Useful?', 'Accurate?', 'Engaging?', 'Would Share?',
    ];
    const sessionsRows = [sessionsHeader];
    for (const session of sessions.data || []) {
      const fb = feedbackMap.get(session.id);
      const result = session.result || {};
      const bigFive = result.bigFiveProfile || {};
      sessionsRows.push([
        session.created_at || '', session.id || '', session.tier || '', session.mood || '',
        session.fun_mode ? 'Yes' : 'No', session.theme || '',
        result.mbtiType || '', result.discStyle || '', result.title || '',
        bigFive.openness ?? '', bigFive.conscientiousness ?? '',
        bigFive.extraversion ?? '', bigFive.agreeableness ?? '', bigFive.neuroticism ?? '',
        result.engagement ?? '',
        fb?.useful_app || '', fb?.results_accurate || '', fb?.questions_engaging || '', fb?.would_share || '',
      ]);
    }

    // Sheet 3: Feedback
    const feedbackHeader = [
      'Timestamp', 'Session ID', 'MBTI', 'DISC', 'Primary Role', 'Age Tier',
      'Mood', 'Fun Mode', 'Useful App?', 'Results Accurate?',
      'Questions Engaging?', 'Would Share?', 'Suggestions',
    ];
    const feedbackRows = [feedbackHeader];
    for (const f of feedback.data || []) {
      feedbackRows.push([
        f.created_at || '', f.session_id || '', f.mbti_type || '', f.disc_style || '',
        f.primary_role || '', f.tier || '', f.mood || '',
        f.fun_mode ? 'Yes' : 'No',
        f.useful_app || '', f.results_accurate || '',
        f.questions_engaging || '', f.would_share || '', f.suggestions || '',
      ]);
    }

    // Sheet 4: Job Roles
    const rolesHeader = [
      'Role Number', 'Role Name', 'MBTI EI', 'MBTI SN', 'MBTI TF', 'MBTI JP',
      'DISC D', 'DISC I', 'DISC S', 'DISC C',
      'Big5 O', 'Big5 C', 'Big5 E', 'Big5 A', 'Big5 N',
      'Job Collar',
    ];
    const rolesRows = [rolesHeader];
    for (const role of jobRoles.data || []) {
      rolesRows.push([
        role.role_number || '', role.role_name || '',
        role.mbti_ei || '', role.mbti_sn || '', role.mbti_tf || '', role.mbti_jp || '',
        role.disc_d || '', role.disc_i || '', role.disc_s || '', role.disc_c || '',
        role.big5_o || '', role.big5_c || '', role.big5_e || '',
        role.big5_a || '', role.big5_n || '',
        role.job_collar || '',
      ]);
    }

    // Write sheets sequentially
    const sheetUpdates = [
      { name: '1. Overview', data: overviewRows },
      { name: '2. Sessions', data: sessionsRows },
      { name: '3. Feedback', data: feedbackRows },
      { name: '4. Job Roles', data: rolesRows },
    ];

    for (const sheet of sheetUpdates) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheet.name}!A:Z`,
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheet.name}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: sheet.data },
      });
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheets: sheetUpdates.map(s => s.name),
      sessionsExported: sessions.data?.length || 0,
      feedbackExported: feedback.data?.length || 0,
      jobRolesExported: jobRoles.data?.length || 0,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/export/sheets/full] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500, headers: corsHeaders }
    );
  }
}
