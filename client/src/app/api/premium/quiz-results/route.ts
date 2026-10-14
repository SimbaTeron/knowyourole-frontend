import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { requireAuth } from "@/app/api/_lib/auth";
import { jsonResponse, noContentResponse } from "@/app/api/_lib/security";
import { summarizePersistedQuizResult, type PersistedQuizResultRow } from "@/lib/results/persistedQuizResult";

const RESULT_COLUMNS = "id,user_id,session_id,responses,created_at,updated_at,deleted";

export async function OPTIONS() {
  return noContentResponse({
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Retired. The legacy endpoint accepted client-computed result fields and would
// create a second persistence path. Canonical completion is server-computed at
// POST /api/results/compute.
export const POST = requireAuth(async () => jsonResponse(
  { error: "Use /api/results/compute for canonical quiz persistence" },
  { status: 410 },
));

// Authenticated historical results are derived from the canonical DTO envelope.
export const GET = requireAuth(async (req: NextRequest, ctx: { user: { sub: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
    const { data, error } = await getSupabaseAdmin()
      .from("quiz_results")
      .select(RESULT_COLUMNS)
      .eq("user_id", ctx.user.sub)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[GET /api/premium/quiz-results] Error:", error);
      return jsonResponse({ error: "Failed to fetch quiz results" }, { status: 500 });
    }

    const results = (data ?? []).flatMap((row) => {
      try {
        const summary = summarizePersistedQuizResult(row as PersistedQuizResultRow);
        return summary.deleted ? [] : [summary];
      } catch (readError) {
        console.error("[GET /api/premium/quiz-results] invalid canonical result", { id: row.id, error: readError });
        return [];
      }
    });
    return jsonResponse({ success: true, results });
  } catch (error) {
    console.error("[GET /api/premium/quiz-results] Error:", error);
    return jsonResponse({ error: "Internal server error" }, { status: 500 });
  }
});
