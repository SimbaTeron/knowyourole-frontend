import { NextResponse } from "next/server";

const headers = { "Cache-Control": "no-store" };

/**
 * Retired. This endpoint formerly recomputed client-provided score maps and wrote
 * directly to quiz_results, creating a second persistence path. Live quiz
 * completion is exclusively POST /api/results/compute, which validates all 28
 * versioned answers and persists one canonical ResultDTO.
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
