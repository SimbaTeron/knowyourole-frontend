import { NextRequest } from "next/server";
import { jsonResponse, getAppOrigin } from "@/app/api/_lib/security";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";
import { CONSENT_TEXT_VERSION, RATE_LIMITS, decideStorage, parseEmailRequest } from "@/lib/email/emailRequestCore";
import { createActionToken, createSummaryToken, getEmailTokenSecret, hashBucket, hashEmail } from "@/app/api/_lib/emailTokens";
import { allowRateLimited, getClientIp } from "@/app/api/_lib/emailRateLimit";
import { buildResultsEmail, emailDeliveryMode, sendEmail } from "@/app/api/_lib/emailSender";

export const dynamic = "force-dynamic";

const UNAVAILABLE = "Email isn't available right now. You can still copy, print or download your results.";

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (error) {
    console.error("[email/results] fatal", { name: error instanceof Error ? error.name : "unknown" });
    return jsonResponse({ success: false, error: "Something went wrong. You can still copy, print or download your results." }, { status: 500 });
  }
}

async function handle(req: NextRequest) {
  const secret = getEmailTokenSecret();
  if (!secret || emailDeliveryMode() === "unavailable") {
    return jsonResponse({ success: false, error: UNAVAILABLE }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return jsonResponse({ success: false, error: "Invalid request." }, { status: 400 }); }

  const parsed = parseEmailRequest(body);
  if (!parsed.ok) {
    // Honeypot: pretend success so bots learn nothing; send and store nothing.
    if (parsed.reason === "honeypot") return jsonResponse({ success: true });
    return jsonResponse({ success: false, error: parsed.message, reason: parsed.reason }, { status: 400 });
  }

  const ip = getClientIp(req.headers);
  const emailHash = hashEmail(parsed.email, secret);
  const ipOk = await allowRateLimited(hashBucket("ip", ip, secret), RATE_LIMITS.perIp.max, RATE_LIMITS.perIp.windowSeconds);
  const emailOk = ipOk && (await allowRateLimited(`em:${emailHash.slice(0, 40)}`, RATE_LIMITS.perEmail.max, RATE_LIMITS.perEmail.windowSeconds));
  if (!ipOk || !emailOk) {
    return jsonResponse({ success: false, error: "That's a lot of emails in a short time. Please try again later." }, { status: 429 });
  }

  const storage = decideStorage(parsed.flags);
  const hasDb = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  let insertedNewRow = false;
  let alreadyConfirmed = false;

  if (storage === "store_pending_confirmation" && hasDb) {
    const db = getSupabaseAdmin();
    // Opportunistic cleanup: unconfirmed opt-ins older than 7 days are deleted.
    await db.from("email_requests").delete().is("confirmed_at", null).lt("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
    const { data: existing } = await db.from("email_requests").select("id, confirmed_at, unsubscribed_at").eq("email_hash", emailHash).maybeSingle();
    if (existing) {
      alreadyConfirmed = Boolean(existing.confirmed_at) && !existing.unsubscribed_at;
      const { error } = await db.from("email_requests").update({
        updates: true,
        send_only: false,
        consent_text_version: CONSENT_TEXT_VERSION,
        unsubscribed_at: null,
        ...(alreadyConfirmed ? {} : { confirmed_at: null }),
      }).eq("id", existing.id);
      if (error) console.error("[email/results] update failed", { code: error.code });
    } else {
      const { error } = await db.from("email_requests").insert({
        email: parsed.email,
        email_hash: emailHash,
        send_only: false,
        updates: true,
        age_gate_passed: true,
        consent_text_version: CONSENT_TEXT_VERSION,
      });
      if (error) {
        console.error("[email/results] insert failed", { code: error.code });
        return jsonResponse({ success: false, error: "We couldn't save your update preference. Try again, or untick updates." }, { status: 500 });
      }
      insertedNewRow = true;
    }
  }

  const origin = getAppOrigin(req);
  const links = {
    resultUrl: `${origin}/my-result?s=${encodeURIComponent(createSummaryToken(parsed.summary, secret))}`,
    unsubscribeUrl: `${origin}/email/unsubscribe?t=${encodeURIComponent(createActionToken("unsubscribe", emailHash, secret))}`,
    deleteUrl: `${origin}/email/delete?t=${encodeURIComponent(createActionToken("delete", emailHash, secret))}`,
    confirmUrl: `${origin}/email/confirm?t=${encodeURIComponent(createActionToken("confirm", emailHash, secret))}`,
  };
  const oneClickUnsubscribe = `${origin}/api/email/unsubscribe?t=${encodeURIComponent(createActionToken("unsubscribe", emailHash, secret))}`;
  const updatesNeedConfirm = parsed.flags.updates && !alreadyConfirmed;
  const message = buildResultsEmail(parsed.summary, links, { updatesRequested: updatesNeedConfirm });

  const outcome = await sendEmail({ to: parsed.email, ...message, unsubscribeUrl: oneClickUnsubscribe });
  if (outcome.status === "failed" || outcome.status === "unavailable") {
    if (insertedNewRow) await getSupabaseAdmin().from("email_requests").delete().eq("email_hash", emailHash);
    return jsonResponse({ success: false, error: "We couldn't send that email. You can still copy, print or download your results." }, { status: 502 });
  }
  return jsonResponse({ success: true, delivery: outcome.status, updatesPendingConfirmation: updatesNeedConfirm });
}
