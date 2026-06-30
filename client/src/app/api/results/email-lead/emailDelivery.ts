type ResultEmailDeliveryStatus = "not_sent" | "queued" | "sent" | "failed";

type ResultEmailSummary = {
  leadId: string;
  email: string;
  mbtiType: string | null;
  discStyle: string | null;
  primaryRoleTitle: string | null;
};

type DeliveryResult = {
  status: ResultEmailDeliveryStatus;
  provider: "none" | "resend";
};

const RESEND_API_URL = "https://api.resend.com/emails";

export function isResultEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESULT_EMAIL_FROM);
}

export async function sendResultSummaryEmail(summary: ResultEmailSummary): Promise<DeliveryResult> {
  if (!isResultEmailDeliveryConfigured()) {
    return { status: "not_sent", provider: "none" };
  }

  const provider = (process.env.RESULT_EMAIL_DELIVERY_PROVIDER || "resend").toLowerCase();
  if (provider !== "resend") {
    console.error("[result email delivery] unsupported provider", { provider });
    return { status: "failed", provider: "resend" };
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10_000);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      signal: abortController.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESULT_EMAIL_FROM,
        to: summary.email,
        reply_to: process.env.RESULT_EMAIL_REPLY_TO || undefined,
        subject: "Your KnowYouRole result summary",
        text: buildResultSummaryText(summary),
        html: buildResultSummaryHtml(summary),
      }),
    });

    if (!response.ok) {
      console.error("[result email delivery] provider request failed", {
        provider,
        status: response.status,
      });
      return { status: "failed", provider: "resend" };
    }

    return { status: "sent", provider: "resend" };
  } catch (error) {
    console.error("[result email delivery] send failed", {
      provider,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { status: "failed", provider: "resend" };
  } finally {
    clearTimeout(timeout);
  }
}

function buildResultSummaryText(summary: ResultEmailSummary) {
  const mbtiLine = summary.mbtiType ? `MBTI-style pattern: ${summary.mbtiType}` : "MBTI-style pattern: Not available";
  const discLine = summary.discStyle ? `DISC-style communication: ${summary.discStyle}` : "DISC-style communication: Not available";
  const roleLine = summary.primaryRoleTitle ? `Primary career role: ${summary.primaryRoleTitle}` : "Primary career role: Not available";

  return [
    "Your KnowYouRole result summary",
    "",
    mbtiLine,
    discLine,
    roleLine,
    "",
    "This is a high-level snapshot, not a diagnosis or credential. Your full result stays available in the app after quiz completion.",
    "",
    "KnowYouRole",
  ].join("\n");
}

function buildResultSummaryHtml(summary: ResultEmailSummary) {
  const mbti = escapeHtml(summary.mbtiType || "Not available");
  const disc = escapeHtml(summary.discStyle || "Not available");
  const role = escapeHtml(summary.primaryRoleTitle || "Not available");

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.55; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #0891b2; margin: 0 0 8px;">KnowYouRole</p>
      <h1 style="font-size: 24px; line-height: 1.2; margin: 0 0 16px; color: #111827;">Your result summary</h1>
      <p style="margin: 0 0 18px; color: #374151;">Here is the high-level snapshot you asked KnowYouRole to save with your email.</p>
      <div style="border: 1px solid #dbeafe; border-radius: 16px; padding: 16px; background: #f8fbff;">
        <p style="margin: 0 0 10px;"><strong>MBTI-style pattern:</strong> ${mbti}</p>
        <p style="margin: 0 0 10px;"><strong>DISC-style communication:</strong> ${disc}</p>
        <p style="margin: 0;"><strong>Primary career role:</strong> ${role}</p>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 18px 0 0;">This is a high-level snapshot, not a diagnosis or credential. No raw quiz answers are included in this email.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
