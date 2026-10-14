import { NextRequest, NextResponse } from "next/server";
import { getOptionalAuthUser } from "@/app/api/_lib/auth";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "no-store" };
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{12,128}$/;
const VALID_TIERS = new Set(["13-18", "19-25", "25+", "25plus"]);

/**
 * Records the first server-observed moment that a participant begins a quiz.
 * The endpoint is deliberately idempotent: retries never reset started_at.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: responseHeaders });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400, headers: responseHeaders });
  }

  const payload = body as Record<string, unknown>;
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";
  const tier = typeof payload.tier === "string" && VALID_TIERS.has(payload.tier) ? payload.tier : null;
  if (!SESSION_ID_PATTERN.test(sessionId) || !tier) {
    return NextResponse.json({ error: "Invalid quiz session" }, { status: 400, headers: responseHeaders });
  }

  const mood = typeof payload.mood === "string" ? payload.mood.slice(0, 80) : "neutral";
  const funMode = typeof payload.funMode === "boolean" ? payload.funMode : false;
  const verifiedUser = await getOptionalAuthUser(req);
  const now = new Date().toISOString();

  const { error } = await getSupabaseAdmin()
    .from("quiz_sessions")
    .upsert({
      id: sessionId,
      user_id: verifiedUser?.sub ?? null,
      tier,
      mood,
      fun_mode: funMode,
      started_at: now,
    }, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    console.error("[POST /api/quiz/session/start] failed", { error, sessionId });
    return NextResponse.json({ error: "Could not start quiz session" }, { status: 503, headers: responseHeaders });
  }

  return NextResponse.json({ success: true, sessionId, startedAt: now }, { status: 201, headers: responseHeaders });
}
