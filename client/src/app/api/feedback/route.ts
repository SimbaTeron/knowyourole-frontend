import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';
import { requireAdminRequest } from '@/app/api/_lib/admin-guard';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// POST /api/feedback — Save feedback entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session_id = body.session_id ?? body.sessionId ?? null;
    // Legacy fields (kept for backward compat) — accept both DB snake_case and current client camelCase.
    const useful_app = body.useful_app ?? body.usefulApp ?? null;
    const results_accurate = body.results_accurate ?? body.resultsAccurate ?? null;
    const questions_engaging = body.questions_engaging ?? body.questionsEngaging ?? null;
    const would_share = body.would_share ?? body.wouldShare ?? null;
    const suggestions = body.suggestions ?? null;
    const mbti_type = body.mbti_type ?? body.mbtiType ?? null;
    const disc_style = body.disc_style ?? body.discStyle ?? null;
    const primary_role = body.primary_role ?? body.primaryRole ?? null;
    const tier = body.tier ?? null;
    const mood = body.mood ?? null;
    const fun_mode = body.fun_mode ?? body.funMode ?? null;
    // New rich feedback form fields
    const first_reaction = body.first_reaction ?? body.firstReaction ?? null;
    const first_reaction_text = body.first_reaction_text ?? body.firstReactionText ?? null;
    const accuracy_score = body.accuracy_score ?? body.accuracyScore ?? null;
    const accuracy_surprise = body.accuracy_surprise ?? body.accuracySurprise ?? null;
    const personality_rating = body.personality_rating ?? body.personalityRating ?? null;
    const career_rating = body.career_rating ?? body.careerRating ?? null;
    const mood_lab_rating = body.mood_lab_rating ?? body.moodLabRating ?? null;
    const visual_rating = body.visual_rating ?? body.visualRating ?? null;
    const share_card_rating = body.share_card_rating ?? body.shareCardRating ?? null;
    const most_valuable_feature = body.most_valuable_feature ?? body.mostValuableFeature ?? null;
    const retake_quiz = body.retake_quiz ?? body.retakeQuiz ?? null;
    const shared_results = body.shared_results ?? body.sharedResults ?? null;
    const nps_score = body.nps_score ?? body.npsScore ?? null;
    const career_relevance = body.career_relevance ?? body.careerRelevance ?? null;
    const feels_designed_for_you = body.feels_designed_for_you ?? body.feelsDesignedForYou ?? null;
    const college_suggestions = body.college_suggestions ?? body.collegeSuggestions ?? null;
    const bugs_issues = body.bugs_issues ?? body.bugsIssues ?? null;
    const email = body.email ?? null;
    const anything_else = body.anything_else ?? body.anythingElse ?? null;
    const quiz_type = body.quiz_type ?? body.quizType ?? null;

    const { data, error } = await getSupabaseAdmin()
      .from('feedback')
      .insert({
        session_id,
        // Legacy
        useful_app,
        results_accurate,
        questions_engaging,
        would_share,
        suggestions,
        mbti_type,
        disc_style,
        primary_role,
        tier,
        mood,
        fun_mode,
        // New rich fields
        first_reaction,
        first_reaction_text,
        accuracy_score,
        accuracy_surprise,
        personality_rating,
        career_rating,
        mood_lab_rating,
        visual_rating,
        share_card_rating,
        most_valuable_feature,
        retake_quiz,
        shared_results,
        nps_score,
        career_relevance,
        feels_designed_for_you,
        college_suggestions,
        bugs_issues,
        email,
        anything_else,
        quiz_type,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/feedback] Error:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET /api/feedback — Get all feedback entries (admin)
export async function GET(req: NextRequest) {
  const unauthorized = requireAdminRequest(req);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await getSupabaseAdmin()
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, count: data?.length || 0, feedback: data },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[GET /api/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
