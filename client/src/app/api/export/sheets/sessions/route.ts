import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/export/sheets/sessions
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

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

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await getSupabaseAdmin()
      .from('quiz_sessions')
      .select('*')
      .limit(1000);

    if (sessionsError) {
      console.error('[POST /api/export/sheets/sessions] Sessions error:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch feedback
    const { data: feedback, error: feedbackError } = await getSupabaseAdmin()
      .from('feedback')
      .select('*')
      .limit(1000);

    if (feedbackError) {
      console.error('[POST /api/export/sheets/sessions] Feedback error:', feedbackError);
    }

    const feedbackMap = new Map<string, any>();
    feedback?.forEach(f => {
      if (f.session_id) feedbackMap.set(f.session_id, f);
    });

    // Build header row
    const headerRow = [
      'Timestamp', 'Session ID', 'Age Tier', 'Mood', 'Fun Mode', 'Theme',
      'MBTI Type', 'DISC Style', 'Title', 'Spark',
      'Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism',
      'Total Questions', 'Engagement',
      'Useful App?', 'Results Accurate?', 'Questions Engaging?', 'Would Share?', 'Suggestions',
    ];

    const rows = [headerRow];

    for (const session of sessions || []) {
      const fb = feedbackMap.get(session.id);
      const result = session.result || {};
      const bigFive = result.bigFiveProfile || {};

      rows.push([
        session.created_at || '',
        session.id || '',
        session.tier || '',
        session.mood || '',
        session.fun_mode ? 'Yes' : 'No',
        session.theme || '',
        result.mbtiType || '',
        result.discStyle || '',
        result.title || '',
        result.spark || '',
        bigFive.openness ?? '',
        bigFive.conscientiousness ?? '',
        bigFive.extraversion ?? '',
        bigFive.agreeableness ?? '',
        bigFive.neuroticism ?? '',
        result.totalQuestions ?? '',
        result.engagement ?? '',
        fb?.useful_app || '',
        fb?.results_accurate || '',
        fb?.questions_engaging || '',
        fb?.would_share || '',
        fb?.suggestions || '',
      ]);
    }

    // Write to Google Sheets
    const sheetName = 'Quiz Sessions';
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });

    return NextResponse.json({
      success: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sessionsExported: sessions?.length || 0,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/export/sheets/sessions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500, headers: corsHeaders }
    );
  }
}
