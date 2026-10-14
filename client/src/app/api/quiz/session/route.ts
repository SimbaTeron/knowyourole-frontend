import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { requireAuth } from "@/app/api/_lib/auth";
import { summarizePersistedQuizResult, type PersistedQuizResultRow } from "@/lib/results/persistedQuizResult";

export const dynamic = "force-dynamic";
const RESULT_COLUMNS = "id,user_id,session_id,responses,created_at,updated_at,deleted";

// Account-scoped result enumeration. Anonymous results remain capability-only.
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url);
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const requestedOffset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 10;
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;

  const { data, error, count } = await getSupabaseAdmin()
    .from("quiz_results")
    .select(RESULT_COLUMNS, { count: "exact" })
    .eq("user_id", ctx.user.sub)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("[quiz sessions] account query failed", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  const sessions = (data ?? []).flatMap((row) => {
    try {
      const summary = summarizePersistedQuizResult(row as PersistedQuizResultRow);
      return summary.deleted ? [] : [summary];
    } catch (readError) {
      console.error("[quiz sessions] invalid canonical result", { id: row.id, error: readError });
      return [];
    }
  });
  return NextResponse.json({ sessions, total: count ?? 0, limit, offset }, { headers: { "Cache-Control": "no-store" } });
});

// Canonical result persistence is POST /api/results/compute. This route formerly
// trusted client scores and client user IDs, so it is deliberately retired.
export async function POST() {
  return NextResponse.json({ error: "Use /api/results/compute for canonical quiz persistence" }, { status: 410, headers: { "Cache-Control": "no-store" } });
}
