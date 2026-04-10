import { NextResponse } from "next/server";
import { validateInput, calculatePersonality, checkRateLimit } from "@/lib/scoring";

export async function POST(req: Request) {
  // CORS headers
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

  // Rate limit: 10 submissions per hour
  if (!checkRateLimit(req, 10, 3600000)) {
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

  const validation = validateInput(body);
  if (!validation.valid) {
    const { error } = validation as { valid: false; error: string };
    return NextResponse.json(
      { error: `Invalid quiz submission: ${error}` },
      { status: 400, headers }
    );
  }

  try {
    const result = calculatePersonality(validation.data);

    // Return session ID + computed results
    return NextResponse.json({
      sessionId: result.sessionId,
      mbtiType: result.mbtiType,
      mbtiBlend: result.mbtiBlend,
      discStyle: result.discStyle,
      bigFive: result.bigFive,
      bigFiveProfile: result.bigFiveProfile,
      title: result.title,
      spark: result.spark,
      proxyNudge: result.proxyNudge,
      engagement: result.engagement,
      totalQuestions: result.totalQuestions,
      avgResponseTime: result.avgResponseTime,
      scales: result.scales,
      hybridTypes: result.hybridTypes,
      earnedBadges: result.earnedBadges,
      traitConsistency: result.traitConsistency,
      swipeAnalytics: result.swipeAnalytics,
      consistency: result.consistency,
      proxyBreakdown: result.proxyBreakdown,
      criticalThinking: result.criticalThinking,
      firstPrinciples: result.firstPrinciples,
      criticalQuest: result.criticalQuest,
      firstPrinciplesQuest: result.firstPrinciplesQuest,
    }, { headers });
  } catch (err) {
    console.error("Score calculation error:", err);
    return NextResponse.json(
      { error: "Failed to calculate personality scores" },
      { status: 500, headers }
    );
  }
}
