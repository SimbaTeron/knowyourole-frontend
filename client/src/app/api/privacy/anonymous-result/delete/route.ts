import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteAnonymousResult } from "@/app/api/_lib/anonymous-result-capability";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sessionId: z.string().trim().min(1).max(160),
  capability: z.string().trim().min(40).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid deletion request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const deleted = await deleteAnonymousResult(parsed.data.sessionId, parsed.data.capability);
    // Do not reveal whether a result existed or whether a capability was valid.
    return NextResponse.json({ success: true, deleted }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[anonymous delete] failed", error);
    return NextResponse.json({ error: "Unable to process deletion" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
