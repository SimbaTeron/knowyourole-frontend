"use client";

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

function sanitizeAnalyticsParams(params: AnalyticsParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
  ) as Record<string, string | number | boolean>;
}

function eventCategoryFor(eventName: string) {
  return EVENT_CATEGORY_BY_NAME.find(([pattern]) => pattern.test(eventName))?.[1] ?? "knowyourole_engagement";
}

export function trackKyrEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;

  const sanitizedParams = {
    ...sanitizeAnalyticsParams(params),
    event_category: eventCategoryFor(eventName),
    non_interaction: false,
  };
  const prefixedName = `${EVENT_PREFIX}${eventName}`;

  // Local verification sink. This keeps Phase 5D testable even when GA is disabled by
  // consent, blockers, or a clean local profile. It does not persist or transmit data.
  window.__kyrAnalyticsEvents = window.__kyrAnalyticsEvents || [];
  window.__kyrAnalyticsEvents.push({
    name: prefixedName,
    params: sanitizedParams,
    timestamp: new Date().toISOString(),
  });

  if (typeof window.gtag !== "function") return;
  window.gtag("event", prefixedName, sanitizedParams);
}
