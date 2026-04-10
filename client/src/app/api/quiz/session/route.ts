import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

// GET /api/quiz/session - Get all sessions or search
export async function GET(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    let query = getSupabaseAdmin()
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Failed to fetch sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500, headers }
      );
    }

    return NextResponse.json({
      sessions: data || [],
      total: count || 0,
      limit,
      offset,
    }, { headers });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500, headers }
    );
  }
}

// POST /api/quiz/session - Create a new quiz session
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const { data, error } = await getSupabaseAdmin()
      .from("quiz_results")
      .insert({
        session_id: b.sessionId as string || `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        user_id: b.userId as string || null,
        tier: b.tier as string || "free",
        mood: b.mood as string || "neutral",
        fun_mode: b.funMode as boolean || false,
        landmark: b.landmark as string,
        mbti_type: b.mbtiType as string || "INTP",
        mbti_blend: b.mbtiBlend as string,
        disc_style: b.discStyle as string || "Balanced",
        big_five_o: b.bigFiveO as number || 50,
        big_five_c: b.bigFiveC as number || 50,
        big_five_e: b.bigFiveE as number || 50,
        big_five_a: b.bigFiveA as number || 50,
        big_five_n: b.bigFiveN as number || 50,
        primary_role_title: b.primaryRoleTitle as string,
        critical_thinking: b.criticalThinking as number,
        first_principles: b.firstPrinciples as number,
        total_questions: b.totalQuestions as number,
        avg_response_time: b.avgResponseTime as number,
        responses: b.responses || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500, headers }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
    }, { headers });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500, headers }
    );
  }
}
