import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { requireAuth } from "@/app/api/_lib/auth";

export const dynamic = "force-dynamic";

// Legacy session enumeration is now account-scoped. Anonymous results are never
// enumerable; they can only be accessed through their capability-protected item route.
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  const { searchParams } = new URL(req.url);
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const requestedOffset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 10;
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;

  const { data, error, count } = await getSupabaseAdmin()
    .from("quiz_results")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.user.sub)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("[quiz sessions] account query failed", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ sessions: data ?? [], total: count ?? 0, limit, offset }, { headers: { "Cache-Control": "no-store" } });
});

// Canonical result persistence is POST /api/results/compute. This route formerly
// trusted client scores and client user IDs, so it is deliberately retired.
export async function POST() {
  return NextResponse.json({ error: "Use /api/results/compute for canonical quiz persistence" }, { status: 410, headers: { "Cache-Control": "no-store" } });
}
