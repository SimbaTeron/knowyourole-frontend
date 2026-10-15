import { NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/_lib/security";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { getEmailTokenSecret, verifyActionToken, type EmailTokenPurpose } from "@/app/api/_lib/emailTokens";
import { allowRateLimited, getClientIp } from "@/app/api/_lib/emailRateLimit";
import { hashBucket } from "@/app/api/_lib/emailTokens";

async function readToken(req: NextRequest): Promise<unknown> {
  const fromQuery = req.nextUrl.searchParams.get("t");
  if (fromQuery) return fromQuery;
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) return (await req.json())?.t;
    if (type.includes("form")) return (await req.formData()).get("t");
  } catch { /* fallthrough */ }
  return null;
}

/** Shared handler for confirm / unsubscribe / delete. Idempotent; never reveals whether an address exists. */
export async function handleEmailAction(req: NextRequest, purpose: EmailTokenPurpose) {
  const secret = getEmailTokenSecret();
  if (!secret) return jsonResponse({ success: false, error: "Email links are not available right now." }, { status: 503 });
  if (!(await allowRateLimited(hashBucket(`act-${purpose}`, getClientIp(req.headers), secret), 30, 3600))) {
    return jsonResponse({ success: false, error: "Too many requests. Try again later." }, { status: 429 });
  }
  const emailHash = verifyActionToken(await readToken(req), purpose, secret);
  if (!emailHash) return jsonResponse({ success: false, error: "This link is invalid or has been changed." }, { status: 400 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.info(`[email:${purpose}] no database configured (dev); treating as done`);
    return jsonResponse({ success: true, purpose });
  }
  const db = getSupabaseAdmin().from("email_requests");
  const now = new Date().toISOString();
  const { error } =
    purpose === "confirm"
      ? await db.update({ confirmed_at: now }).eq("email_hash", emailHash).is("confirmed_at", null).is("unsubscribed_at", null)
      : purpose === "unsubscribe"
        ? await db.update({ updates: false, unsubscribed_at: now }).eq("email_hash", emailHash)
        : await db.delete().eq("email_hash", emailHash);
  if (error) {
    console.error(`[email:${purpose}] db error`, { code: error.code });
    return jsonResponse({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
  return jsonResponse({ success: true, purpose });
}
