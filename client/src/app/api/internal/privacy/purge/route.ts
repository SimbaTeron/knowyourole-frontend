import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!configuredSecret || authorization !== `Bearer ${configuredSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const { data, error } = await getSupabaseAdmin().rpc("purge_expired_anonymous_result_data");
  if (error) {
    console.error("[anonymous retention purge] failed", error);
    return NextResponse.json({ error: "Purge failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ success: true, purge: data }, { headers: { "Cache-Control": "no-store" } });
}
