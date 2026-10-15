import { NextRequest } from "next/server";
import { handleEmailAction } from "@/app/api/_lib/emailActions";

export const dynamic = "force-dynamic";

// POST only, so link scanners that prefetch GET URLs can't trigger it.
// unsubscribe also accepts RFC 8058 one-click POSTs (token in ?t=).
export async function POST(req: NextRequest) {
  return handleEmailAction(req, "confirm");
}
