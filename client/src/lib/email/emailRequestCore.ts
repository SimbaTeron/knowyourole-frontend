/**
 * Pure, dependency-free logic for the optional "Email me my results" card.
 * Shared by the client card, the API routes and the unit tests.
 *
 * Privacy model (see docs/email-results.md):
 *  - Results are never gated; this is an optional add-on below them.
 *  - Under-13 (or unanswered) => no email field, nothing sent, nothing stored.
 *  - Send-only => the email is used once to send and is NOT stored.
 *  - Updates opt-in => one row in public.email_requests, pending until the
 *    person clicks the double opt-in confirm link.
 */

export const CONSENT_TEXT_VERSION = "2026-10-15.v1";

export const EMAIL_CARD_COPY = {
  title: "Want a copy? Email me my results.",
  ageQuestion: "Are you 13 or older?",
  updatesLabel: "Also send me occasional updates (about monthly, unsubscribe anytime).",
  under13: "Ask a parent or teacher to email it",
  sendOnlyNote: "We send one email and don't keep your address.",
} as const;

export type AgeAnswer = "unanswered" | "yes" | "no";

export type AgeGateState = {
  showEmailField: boolean;
  showUnder13Help: boolean;
  ageGatePassed: boolean;
};

/** Neutral age gate: only an explicit "yes" reveals the email field. */
export function getAgeGateState(answer: AgeAnswer): AgeGateState {
  if (answer === "yes") return { showEmailField: true, showUnder13Help: false, ageGatePassed: true };
  if (answer === "no") return { showEmailField: false, showUnder13Help: true, ageGatePassed: false };
  return { showEmailField: false, showUnder13Help: false, ageGatePassed: false };
}

export type ConsentFlags = { send_only: boolean; updates: boolean };

/**
 * Consent flags are derived only from an explicit, user-ticked checkbox.
 * There is no default-true path. Without a passed age gate there are no flags.
 */
export function buildConsentFlags(input: { updatesChecked: unknown; ageGatePassed: unknown }): ConsentFlags | null {
  if (input.ageGatePassed !== true) return null;
  const updates = input.updatesChecked === true;
  return { send_only: !updates, updates };
}

export type StorageDecision = "none" | "store_pending_confirmation";

export function decideStorage(flags: ConsentFlags | null): StorageDecision {
  return flags?.updates ? "store_pending_confirmation" : "none";
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length < 6 || email.length > 254) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain || local.length > 64) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!EMAIL_RE.test(email)) return false;
  const tld = domain.split(".").pop() || "";
  return /^[a-z]{2,24}$/i.test(tld);
}

export type ResultEmailSummary = {
  identity: string;
  mbtiType: string;
  discLabel: string;
  topTraits: string;
  clarityHeading: string;
  roleTitle: string;
  snapshot: string;
};

const SUMMARY_LIMITS: Record<keyof ResultEmailSummary, number> = {
  identity: 60,
  mbtiType: 8,
  discLabel: 40,
  topTraits: 80,
  clarityHeading: 80,
  roleTitle: 120,
  snapshot: 320,
};

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // strip control chars and angle brackets; templates still HTML-escape.
  return value.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function sanitizeSummary(input: unknown): ResultEmailSummary | null {
  if (!input || typeof input !== "object") return null;
  const src = input as Record<string, unknown>;
  const out = {} as ResultEmailSummary;
  for (const key of Object.keys(SUMMARY_LIMITS) as (keyof ResultEmailSummary)[]) {
    out[key] = cleanText(src[key], SUMMARY_LIMITS[key]);
  }
  if (!/^[EI][SN][TF][JP]$/.test(out.mbtiType)) return null;
  if (!out.roleTitle || !out.identity) return null;
  return out;
}

export type ParsedEmailRequest =
  | { ok: true; email: string; flags: ConsentFlags; summary: ResultEmailSummary }
  | { ok: false; reason: "honeypot" }
  | { ok: false; reason: "age_gate" | "invalid_email" | "invalid_summary" | "invalid_body"; message: string };

/** `website` is a hidden honeypot input that humans never fill in. */
export function parseEmailRequest(body: unknown): ParsedEmailRequest {
  if (!body || typeof body !== "object") return { ok: false, reason: "invalid_body", message: "Invalid request." };
  const b = body as Record<string, unknown>;
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: false, reason: "honeypot" };
  const flags = buildConsentFlags({ updatesChecked: b.updates, ageGatePassed: b.ageGatePassed });
  if (!flags) return { ok: false, reason: "age_gate", message: "Email is only available if you are 13 or older." };
  if (!isValidEmail(b.email)) return { ok: false, reason: "invalid_email", message: "Enter a valid email address." };
  const summary = sanitizeSummary(b.summary);
  if (!summary) return { ok: false, reason: "invalid_summary", message: "We couldn't read your result. Try refreshing the page." };
  return { ok: true, email: normalizeEmail(b.email as string), flags, summary };
}

export const RATE_LIMITS = {
  perIp: { max: 5, windowSeconds: 60 * 60 },
  perEmail: { max: 3, windowSeconds: 24 * 60 * 60 },
} as const;

/** Simple fixed-window counter used as an in-process first line of defence. */
export class MemoryRateLimiter {
  private hits = new Map<string, { windowStart: number; count: number }>();
  hit(key: string, max: number, windowSeconds: number, now = Date.now()): boolean {
    const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
    const entry = this.hits.get(key);
    if (!entry || entry.windowStart !== windowStart) {
      this.hits.set(key, { windowStart, count: 1 });
      if (this.hits.size > 5000) this.hits.clear();
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  }
}
