"use client";

import { hasAnalyticsConsent } from "@/components/CookieConsentBanner";
import { analyticsCollectionAllowed } from "@/lib/analytics/collectionGate";
import { scrubCampaignParams } from "@/lib/analytics/internalLink";

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

type AnalyticsEventRecord = {
  name: string;
  params: Record<string, string | number | boolean>;
  timestamp: string;
};

const EVENT_PREFIX = "kyr_";

const EVENT_CATEGORY_BY_NAME: Array<[RegExp, string]> = [
  [/^quiz_/, "knowyourole_quiz"],
  [/^result_|^accordion_/, "knowyourole_results"],
  [/^share_/, "knowyourole_share"],
  [/^email_/, "knowyourole_email_capture"],
  [/^conversion_/, "knowyourole_conversion"],
  [/^for_schools_/, "knowyourole_schools"],
];

/**
 * Consent-gated events. Google Analytics receives `kyr_` plus the name.
 * Counts and page labels only: no names, emails, answers, or result text.
 *
 * - quiz_started (once per attempt; queued until analytics consent)
 * - quiz_landing_viewed (once per attempt, on the quiz route)
 * - quiz_progress_milestone (every 5 answers, for drop-off)
 * - quiz_completed
 * - result_viewed
 * - result_fit_tapped (yes, somewhat, or no only; never a comment)
 * - for_schools_cta_clicked
 * - for_schools_contact_clicked
 */

/** Milestone when `completed` is a positive multiple of `step` (5, 10, 15…). */
export function quizProgressMilestone(completed: number, step = 5): number | null {
  if (!Number.isInteger(completed) || !Number.isInteger(step) || step < 1) return null;
  if (completed < step || completed % step !== 0) return null;
  return completed;
}

/** Every step-sized milestone at or below `completed` that has not been sent yet. */
export function crossedQuizMilestones(completed: number, already: ReadonlySet<number>, step = 5): number[] {
  const hit: number[] = [];
  if (!Number.isInteger(completed) || !Number.isInteger(step) || step < 1 || completed < step) return hit;
  for (let milestone = step; milestone <= completed; milestone += step) {
    if (!already.has(milestone)) hit.push(milestone);
  }
  return hit;
}

export type ForSchoolsClickEvent = {
  event: "for_schools_cta_clicked" | "for_schools_contact_clicked";
  cta: "quiz" | "email" | "contact_page";
};

/** Classify a For Schools link. Never returns the address on a mailto link. */
export function forSchoolsClickEvent(href: string, pageOrigin: string): ForSchoolsClickEvent | null {
  if (!href || href.startsWith("#")) return null;
  let url: URL;
  try {
    url = new URL(href, pageOrigin);
  } catch {
    return null;
  }
  if (url.protocol === "mailto:") return { event: "for_schools_contact_clicked", cta: "email" };
  if (url.origin !== pageOrigin) return null;
  if (url.pathname === "/contact") return { event: "for_schools_contact_clicked", cta: "contact_page" };
  if (url.pathname === "/quiz" || url.pathname.startsWith("/quiz/")) {
    return { event: "for_schools_cta_clicked", cta: "quiz" };
  }
  return null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __kyrAnalyticsEvents?: AnalyticsEventRecord[];
  }
}

const SENSITIVE_ANALYTICS_KEYS = new Set([
  "answer_id",
  "question_id",
  "mbti_type",
  "primary_disc",
  "disc_style",
  "direction_title",
  "role_title",
  "archetype",
  "email",
  "session_id",
  "result_id",
  "comment",
  "note",
  "improvement_note",
]);

function sanitizeAnalyticsParams(params: AnalyticsParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && !SENSITIVE_ANALYTICS_KEYS.has(key)),
  ) as Record<string, string | number | boolean>;
}

function eventCategoryFor(eventName: string) {
  return EVENT_CATEGORY_BY_NAME.find(([pattern]) => pattern.test(eventName))?.[1] ?? "knowyourole_engagement";
}

function browserWindow(): Window | undefined {
  if (typeof globalThis.window === "undefined") return undefined;
  return globalThis.window;
}

function analyticsRuntime(browser: Window) {
  return {
    hostname: browser.location?.hostname ?? "",
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "",
  };
}

export function trackKyrEvent(eventName: string, params: AnalyticsParams = {}) {
  const browser = browserWindow();
  if (!browser || !hasAnalyticsConsent()) return;

  const sanitizedParams = {
    ...scrubCampaignParams(sanitizeAnalyticsParams(params)),
    event_category: eventCategoryFor(eventName),
    non_interaction: false,
  };
  const prefixedName = `${EVENT_PREFIX}${eventName}`;

  // Consent-gated local verification sink. It never persists or transmits data;
  // it lets browser tests verify the same aggregate events that GA would receive.
  // Local and non-production sessions still record here, and do not call gtag.
  browser.__kyrAnalyticsEvents = browser.__kyrAnalyticsEvents || [];
  browser.__kyrAnalyticsEvents.push({
    name: prefixedName,
    params: sanitizedParams,
    timestamp: new Date().toISOString(),
  });

  if (!analyticsCollectionAllowed(analyticsRuntime(browser))) return;
  if (typeof browser.gtag !== "function") return;
  browser.gtag("event", prefixedName, sanitizedParams);
}
