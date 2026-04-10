import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/quiz/session/[id] - Get session by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    // Try to find by id first, then by session_id
    let { data, error } = await getSupabaseAdmin()
      .from("quiz_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      // Try session_id as fallback
      const { data: sessionData, error: sessionError } = await getSupabaseAdmin()
        .from("quiz_results")
        .select("*")
        .eq("session_id", id)
        .single();

      if (sessionError || !sessionData) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404, headers }
        );
      }
      data = sessionData;
    }

    return NextResponse.json({
      sessionId: data.session_id,
      id: data.id,
      userId: data.user_id,
      tier: data.tier,
      mood: data.mood,
      funMode: data.fun_mode,
      mbtiType: data.mbti_type,
      mbtiBlend: data.mbti_blend,
      discStyle: data.disc_style,
      bigFive: {
        O: data.big_five_o,
        C: data.big_five_c,
        E: data.big_five_e,
        A: data.big_five_a,
        N: data.big_five_n,
      },
      bigFiveProfile: {
        openness: data.big_five_o,
        conscientiousness: data.big_five_c,
        extraversion: data.big_five_e,
        agreeableness: data.big_five_a,
        neuroticism: data.big_five_n,
      },
      primaryRoleTitle: data.primary_role_title,
      criticalThinking: data.critical_thinking,
      firstPrinciples: data.first_principles,
      totalQuestions: data.total_questions,
      avgResponseTime: data.avg_response_time,
      createdAt: data.created_at,
    }, { headers });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500, headers }
    );
  }
}

// PATCH /api/quiz/session/[id] - Update session data
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const b = body as Record<string, unknown>;

  try {
    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (b.mbtiType !== undefined) updates.mbti_type = b.mbtiType;
    if (b.mbtiBlend !== undefined) updates.mbti_blend = b.mbtiBlend;
    if (b.discStyle !== undefined) updates.disc_style = b.discStyle;
    if (b.bigFiveO !== undefined) updates.big_five_o = b.bigFiveO;
    if (b.bigFiveC !== undefined) updates.big_five_c = b.bigFiveC;
    if (b.bigFiveE !== undefined) updates.big_five_e = b.bigFiveE;
    if (b.bigFiveA !== undefined) updates.big_five_a = b.bigFiveA;
    if (b.bigFiveN !== undefined) updates.big_five_n = b.bigFiveN;
    if (b.primaryRoleTitle !== undefined) updates.primary_role_title = b.primaryRoleTitle;
    if (b.criticalThinking !== undefined) updates.critical_thinking = b.criticalThinking;
    if (b.firstPrinciples !== undefined) updates.first_principles = b.firstPrinciples;
    if (b.responses !== undefined) updates.responses = b.responses;

    // Try to update by id first
    let { data, error } = await getSupabaseAdmin()
      .from("quiz_results")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      // Try session_id as fallback
      const { data: sessionData, error: sessionError } = await getSupabaseAdmin()
        .from("quiz_results")
        .update(updates)
        .eq("session_id", id)
        .select()
        .single();

      if (sessionError || !sessionData) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404, headers }
        );
      }
      data = sessionData;
    }

    return NextResponse.json({
      success: true,
      session: data,
    }, { headers });
  } catch (err) {
    console.error("Session update error:", err);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500, headers }
    );
  }
}
