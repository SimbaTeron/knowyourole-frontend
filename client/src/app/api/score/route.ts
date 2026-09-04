import { NextResponse } from "next/server";

const headers = { "Cache-Control": "no-store" };

/**
 * Retired. This legacy endpoint accepted client-computed score totals and
 * returned a noncanonical result shape. All active quiz completion must use
 * POST /api/results/compute, which validates fixed-question evidence, computes
 * server-side, persists once, and returns the canonical ResultDTO.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Use /api/results/compute for canonical quiz completion" },
    { status: 410, headers },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
