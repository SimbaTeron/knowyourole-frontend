import type { ResultEmailSummary } from "@/lib/email/emailRequestCore";
import { isProductionEnv } from "@/app/api/_lib/emailTokens";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
};

export type SendOutcome = { status: "sent" | "logged" | "failed" | "unavailable" };

const RESEND_API_URL = "https://api.resend.com/emails";

export function getFromAddress(): string | null {
  return process.env.RESULT_EMAIL_FROM || null;
}

/** Production requires a key; preview/dev fall back to logging (no real send). */
export function emailDeliveryMode(): "resend" | "log" | "unavailable" {
  if (process.env.RESEND_API_KEY && getFromAddress()) return "resend";
  return isProductionEnv() ? "unavailable" : "log";
}

export async function sendEmail(message: OutgoingEmail): Promise<SendOutcome> {
  const mode = emailDeliveryMode();
  if (mode === "unavailable") return { status: "unavailable" };
  if (mode === "log") {
    const [local, domain] = message.to.split("@");
    console.info("[email:log-fallback] RESEND_API_KEY not set, not sending", {
      to: `${(local || "").slice(0, 2)}***@${domain}`,
      subject: message.subject,
      text: message.text,
    });
    return { status: "logged" };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: getFromAddress(),
        to: message.to,
        reply_to: process.env.RESULT_EMAIL_REPLY_TO || undefined,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: {
          "List-Unsubscribe": `<${message.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    if (!response.ok) {
      console.error("[email] resend request failed", { status: response.status });
      return { status: "failed" };
    }
    return { status: "sent" };
  } catch (error) {
    console.error("[email] send failed", { name: error instanceof Error ? error.name : "unknown" });
    return { status: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Templates (site palette: paper #f8f3e8, ink #12263a, coral #c95f46, teal #315f74) ───

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function mailingAddress(): string {
  return process.env.EMAIL_MAILING_ADDRESS || "[KnowYouRole mailing address — add before launch]";
}

type Links = { resultUrl: string; unsubscribeUrl: string; deleteUrl: string; confirmUrl?: string };

function footerHtml(links: Links): string {
  return `
  <tr><td style="padding:22px 28px 28px;border-top:1px solid #e3dccd;font:12px/1.6 Arial,sans-serif;color:#637b8a;">
    You got this because someone asked knowyourole.com to email these results to this address.<br/>
    <a href="${esc(links.unsubscribeUrl)}" style="color:#315f74;">Unsubscribe</a> &nbsp;·&nbsp;
    <a href="${esc(links.deleteUrl)}" style="color:#315f74;">Delete my email</a> &nbsp;·&nbsp;
    <a href="https://knowyourole.com/privacy" style="color:#315f74;">Privacy</a><br/>
    KnowYouRole · ${esc(mailingAddress())}
  </td></tr>`;
}

function shell(inner: string, links: Links): string {
  return `<!doctype html><html><body style="margin:0;background:#f8f3e8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f3e8;padding:24px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #d9d2c3;border-radius:4px;">
  <tr><td style="height:6px;background:linear-gradient(90deg,#9ed8e6,#ffca42,#e98268);background-color:#ffca42;font-size:0;">&nbsp;</td></tr>
  ${inner}
  ${footerHtml(links)}
  </table></td></tr></table></body></html>`;
}

export function buildResultsEmail(summary: ResultEmailSummary, links: Links, opts: { updatesRequested: boolean }) {
  const confirmBlock = opts.updatesRequested && links.confirmUrl
    ? `<tr><td style="padding:0 28px 18px;"><div style="background:#eaf5f6;border:1px solid #cfe4e8;border-radius:4px;padding:14px 16px;font:14px/1.5 Arial,sans-serif;color:#12263a;">
        <strong>One more step for updates.</strong> You asked for occasional updates (about monthly). Please confirm so we know it was you:
        <div style="margin-top:10px;"><a href="${esc(links.confirmUrl)}" style="display:inline-block;background:#315f74;color:#fffdf8;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:4px;">Confirm updates</a></div>
        <div style="margin-top:8px;color:#456174;font-size:12px;">If you don't confirm, we'll delete your address within 7 days.</div>
      </div></td></tr>`
    : "";
  const inner = `
  <tr><td style="padding:26px 28px 6px;font:800 11px/1 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#315f74;">KnowYouRole · Your results</td></tr>
  <tr><td style="padding:6px 28px 4px;font:700 32px/1.05 Georgia,'Times New Roman',serif;color:#12263a;">${esc(summary.identity)}</td></tr>
  <tr><td style="padding:8px 28px 18px;font:15px/1.5 Arial,sans-serif;color:#456174;">“${esc(summary.snapshot)}”</td></tr>
  <tr><td style="padding:0 28px 16px;"><div style="background:#ffca42;background:linear-gradient(135deg,#ffca42,#f8df9a);border-radius:4px;padding:16px;box-shadow:4px 4px 0 #c95f46;">
    <div style="font:800 10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5a4320;margin-bottom:6px;">Best-fit direction</div>
    <div style="font:700 22px/1.15 Georgia,serif;color:#12263a;">${esc(summary.roleTitle)}</div></div></td></tr>
  <tr><td style="padding:0 28px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12263a;border-radius:4px;color:#fffdf8;font:13px/1.4 Arial,sans-serif;">
    <tr><td style="padding:12px 14px;"><span style="color:#9fd8e6;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Mind</span><br/><strong>${esc(summary.mbtiType)}</strong></td>
        <td style="padding:12px 14px;"><span style="color:#9fd8e6;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Work style</span><br/><strong>${esc(summary.discLabel)}</strong></td>
        <td style="padding:12px 14px;"><span style="color:#9fd8e6;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Top trait</span><br/><strong>${esc(summary.topTraits)}</strong></td></tr>
  </table>${summary.clarityHeading ? `<div style="font:12px/1.5 Arial,sans-serif;color:#456174;margin-top:8px;">${esc(summary.clarityHeading)}</div>` : ""}</td></tr>
  <tr><td style="padding:0 28px 22px;"><a href="${esc(links.resultUrl)}" style="display:inline-block;background:#c95f46;color:#fffdf8;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:13px 18px;border-radius:4px;border:1px solid #9d3e2b;">View your result summary</a>
    <div style="font:12px/1.5 Arial,sans-serif;color:#637b8a;margin-top:10px;">This is a snapshot of approximate leanings, not a diagnosis or a label. Anyone with this link can see this summary, so only share it if you want to.</div></td></tr>
  ${confirmBlock}`;
  const text = [
    "KnowYouRole: your results",
    "",
    summary.identity,
    `"${summary.snapshot}"`,
    "",
    `Best-fit direction: ${summary.roleTitle}`,
    `Mind: ${summary.mbtiType} · Work style: ${summary.discLabel} · Top trait: ${summary.topTraits}`,
    summary.clarityHeading,
    "",
    `View your result summary: ${links.resultUrl}`,
    opts.updatesRequested && links.confirmUrl ? `\nConfirm occasional updates: ${links.confirmUrl}\n(If you don't confirm, we delete your address within 7 days.)` : "",
    "",
    `Unsubscribe: ${links.unsubscribeUrl}`,
    `Delete my email: ${links.deleteUrl}`,
    `KnowYouRole · ${mailingAddress()}`,
  ].join("\n");
  return { subject: "Your KnowYouRole results", html: shell(inner, links), text };
}
