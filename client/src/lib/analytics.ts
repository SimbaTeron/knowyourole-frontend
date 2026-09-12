"use client";

import { hasAnalyticsConsent } from "@/components/CookieConsentBanner";

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
];

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
]);

function sanitizeAnalyticsParams(params: AnalyticsParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && !SENSITIVE_ANALYTICS_KEYS.has(key)),
  ) as Record<string, string | number | boolean>;
}

function eventCategoryFor(eventName: string) {
  return EVENT_CATEGORY_BY_NAME.find(([pattern]) => pattern.test(eventName))?.[1] ?? "knowyourole_engagement";
}

export function trackKyrEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  const sanitizedParams = {
    ...sanitizeAnalyticsParams(params),
    event_category: eventCategoryFor(eventName),
    non_interaction: false,
  };
  const prefixedName = `${EVENT_PREFIX}${eventName}`;

  // Consent-gated local verification sink. It never persists or transmits data;
  // it lets browser tests verify the same aggregate events that GA would receive.
  window.__kyrAnalyticsEvents = window.__kyrAnalyticsEvents || [];
  window.__kyrAnalyticsEvents.push({
    name: prefixedName,
    params: sanitizedParams,
    timestamp: new Date().toISOString(),
  });

  if (typeof window.gtag !== "function") return;
  window.gtag("event", prefixedName, sanitizedParams);
}
