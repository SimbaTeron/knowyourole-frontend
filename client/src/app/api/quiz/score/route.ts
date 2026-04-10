import { NextRequest, NextResponse } from "next/server";
import { calculatePersonality, checkRateLimit, quizSubmitSchema, getRateLimitKey } from "@/app/api/_lib/scoring";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405, headers });
  }

  // Rate limit: 10 submissions per hour per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "unknown";
  
  if (!checkRateLimit(getRateLimitKey(ip), 10, 3600000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 10 quiz submissions per hour." },
      { status: 429, headers }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  // Validate with Zod schema
  const parsed = quizSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid quiz submission",
        details: parsed.error.issues.map(i => i.message),
      },
      { status: 400, headers }
    );
  }

  try {
    const result = calculatePersonality(parsed.data);

    const sessionId = result.sessionId;

    // Store session in Supabase
    const { data: sessionData, error: sessionError } = await getSupabaseAdmin()
      .from("quiz_results")
      .insert({
        session_id: sessionId,
        tier: parsed.data.tier,
        mood: parsed.data.mood || "neutral",
        fun_mode: parsed.data.funMode || false,
        landmark: parsed.data.landmark,
        mbti_type: result.mbtiType,
        mbti_blend: result.mbtiBlend,
        disc_style: result.discStyle,
        big_five_o: result.bigFive.O,
        big_five_c: result.bigFive.C,
        big_five_e: result.bigFive.E,
        big_five_a: result.bigFive.A,
        big_five_n: result.bigFive.N,
        primary_role_title: result.title,
        critical_thinking: result.criticalThinking,
        first_principles: result.firstPrinciples,
        total_questions: result.totalQuestions,
        avg_response_time: Math.round(result.avgResponseTime),
        responses: parsed.data.scores?.responses || [],
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Failed to save quiz session:", sessionError);
    }

    // Return response without internal sessionId
    const { sessionId: _discarded, ...resultData } = result;
    return NextResponse.json({
      sessionId: sessionData?.id || sessionId,
      ...resultData,
    }, { headers });
  } catch (err) {
    console.error("Score calculation error:", err);
    return NextResponse.json(
      { error: "Failed to calculate personality scores" },
      { status: 500, headers }
    );
  }
}
