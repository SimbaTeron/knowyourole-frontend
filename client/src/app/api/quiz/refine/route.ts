import { NextResponse } from "next/server";

const headers = { "Cache-Control": "no-store" };

/**
 * Retired. The old refinement endpoint updated selected scalar columns without
 * rebuilding the stored ResultDTO, allowing the database row and canonical DTO
 * to diverge. Refinement requires a versioned follow-up answer flow and a full
 * canonical recompute; until that exists, the endpoint must not mutate results.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Result refinement is unavailable until canonical follow-up scoring is implemented" },
    { status: 410, headers },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
