import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { canAccessResult } from "@/app/api/_lib/anonymous-result-capability";
import { summarizePersistedQuizResult, type PersistedQuizResultRow } from "@/lib/results/persistedQuizResult";

interface RouteParams { params: Promise<{ id: string }>; }
export const dynamic = "force-dynamic";

const RESULT_COLUMNS = "id,user_id,session_id,responses,created_at,updated_at,deleted";

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  let { data, error } = await supabase.from("quiz_results").select(RESULT_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    console.error("[quiz result access] lookup failed", error);
    return NextResponse.json({ error: "Unable to retrieve result" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  if (!data) {
    const bySession = await supabase.from("quiz_results").select(RESULT_COLUMNS).eq("session_id", id).maybeSingle();
    data = bySession.data;
    error = bySession.error;
  }

  // Return indistinguishable 404s for unknown, malformed, and unauthorized identifiers.
  if (error || !data || !(await canAccessResult(req, data))) {
    return NextResponse.json({ error: "Result not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const result = summarizePersistedQuizResult(data as PersistedQuizResultRow);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (readError) {
    console.error("[quiz result access] invalid canonical result", { id: data.id, error: readError });
    return NextResponse.json({ error: "Result not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}

// Canonical results are immutable. The previous endpoint allowed arbitrary
// unauthenticated mutation of score/result material.
export async function PATCH() {
  return NextResponse.json({ error: "Canonical results are immutable" }, { status: 405, headers: { "Cache-Control": "no-store" } });
}
