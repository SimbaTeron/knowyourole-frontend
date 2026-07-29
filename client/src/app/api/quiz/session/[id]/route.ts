import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { canAccessResult } from "@/app/api/_lib/anonymous-result-capability";

interface RouteParams { params: Promise<{ id: string }>; }
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  let { data, error } = await supabase.from("quiz_results").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[quiz result access] lookup failed", error);
    return NextResponse.json({ error: "Unable to retrieve result" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  if (!data) {
    const bySession = await supabase.from("quiz_results").select("*").eq("session_id", id).maybeSingle();
    data = bySession.data;
    error = bySession.error;
  }
  // Return indistinguishable 404s for unknown and unauthorized identifiers.
  if (error || !data || !(await canAccessResult(req, data))) {
    return NextResponse.json({ error: "Result not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({
    sessionId: data.session_id,
    id: data.id,
    tier: data.tier,
    mood: data.mood,
    funMode: data.fun_mode,
    mbtiType: data.mbti_type,
    mbtiBlend: data.mbti_blend,
    discStyle: data.disc_style,
    bigFive: { O: data.big_five_o, C: data.big_five_c, E: data.big_five_e, A: data.big_five_a, N: data.big_five_n },
    primaryRoleTitle: data.primary_role_title,
    criticalThinking: data.critical_thinking,
    firstPrinciples: data.first_principles,
    totalQuestions: data.total_questions,
    avgResponseTime: data.avg_response_time,
    createdAt: data.created_at,
  }, { headers: { "Cache-Control": "no-store" } });
}

// Canonical results are immutable. The previous endpoint allowed arbitrary
// unauthenticated mutation of score/result material.
export async function PATCH() {
  return NextResponse.json({ error: "Canonical results are immutable" }, { status: 405, headers: { "Cache-Control": "no-store" } });
}
