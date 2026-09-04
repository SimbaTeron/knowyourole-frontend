import { NextRequest, NextResponse } from "next/server";
import { SHORTFORM_V2_QUESTIONS } from "@/data/shortformV2Questions";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Local-only smoke route for the Autonomous Results Engine.
 *
 * This simulates the quiz completion payload, calls /api/results/compute, persists
 * to Supabase, and returns/logs the canonical resultId. It is intentionally blocked
 * outside localhost so it cannot become a production/admin backdoor. Delete after
 * the ResultDTO migration is fully wired and verified.
 */
export async function GET(req: NextRequest) {
  return runSmoke(req);
}

export async function POST(req: NextRequest) {
  return runSmoke(req);
}

async function runSmoke(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isLocalhost = host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host.startsWith("0.0.0.0:");
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  if (isProduction || !isLocalhost) {
    return NextResponse.json(
      { success: false, error: "Smoke route is local-only" },
      { status: 403, headers: corsHeaders },
    );
  }

  const origin = `${req.nextUrl.protocol}//${host}`;
  const requestedSessionId = req.nextUrl.searchParams.get("sessionId");
  const sessionId = requestedSessionId && /^smoke-[a-zA-Z0-9-]{1,140}$/.test(requestedSessionId)
    ? requestedSessionId
    : `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    tier: "19-25",
    mood: "focused",
    moodBlend: "focused+creative",
    funMode: false,
    landmark: "local-smoke-test",
    theme: "dark",
    sessionId,
    source: "dev_test",
    // Submit evidence only. The compute route derives all framework totals from
    // these fixed-question answers; no client score maps are present.
    responses: SHORTFORM_V2_QUESTIONS.map((question, index) => ({
      questionId: question.id,
      choice: index % question.answers.length,
      timeSpent: 2 + (index % 3) * 0.25,
      swipeDirection: index % 2 === 0 ? "left" : "right",
    })),
  };

  console.log("[ResultDTO Smoke] Starting local smoke compute", { host, sessionId });

  try {
    const response = await fetch(`${origin}/api/results/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-request-id": sessionId },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    console.log("[ResultDTO Smoke] Finished", {
      ok: response.ok,
      success: data?.success,
      resultId: data?.result?.meta?.resultId,
      sessionId: data?.result?.meta?.sessionId,
      validation: data?.validation,
    });

    return NextResponse.json(
      {
        success: response.ok && data?.success === true,
        smoke: true,
        resultId: data?.result?.meta?.resultId,
        sessionId: data?.result?.meta?.sessionId,
        computeStatus: response.status,
        compute: data,
      },
      { status: response.ok ? 200 : response.status, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[ResultDTO Smoke] Failed", { sessionId, error });
    return NextResponse.json(
      { success: false, smoke: true, sessionId, error: error instanceof Error ? error.message : "Smoke test failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
