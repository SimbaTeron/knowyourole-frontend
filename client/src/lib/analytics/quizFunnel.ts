"use client";

import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/components/CookieConsentBanner";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";
import { trackKyrEvent } from "@/lib/analytics";
import { analyticsCollectionAllowed } from "@/lib/analytics/collectionGate";
import { KYR_GTAG_READY_EVENT } from "@/lib/analytics/gtagReady";
import {
  closeQuizAttempt,
  flushQuizFunnel,
  newQuizAttemptId,
  noteQuizFunnelEvent,
  type QuizFunnelEventName,
  type QuizFunnelParams,
} from "@/lib/analytics/quizAttempt";

export function quizPlacementParams(tier?: string): QuizFunnelParams {
  return {
    link_location: "shortform_v2",
    total_questions: QUESTION_COUNT,
    ...(tier ? { tier } : {}),
  };
}

function emitFunnel(events: Array<{ name: QuizFunnelEventName; params: QuizFunnelParams }>) {
  for (const event of events) trackKyrEvent(event.name, event.params);
}

function analyticsRuntime(browser: Window) {
  return {
    hostname: browser.location?.hostname ?? "",
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "",
  };
}

function tagReady(browser: Window): boolean {
  return typeof browser.gtag === "function";
}

/** Production host, consent can be sent, but the stub is not installed yet. */
function mustWaitForTag(browser: Window): boolean {
  return analyticsCollectionAllowed(analyticsRuntime(browser)) && !tagReady(browser);
}

const waitingForTag = new WeakSet<Window>();

function armGtagFlush(browser: Window) {
  if (waitingForTag.has(browser)) return;
  waitingForTag.add(browser);
  const onReady = () => {
    waitingForTag.delete(browser);
    browser.removeEventListener(KYR_GTAG_READY_EVENT, onReady);
    flushPendingQuizFunnel();
  };
  browser.addEventListener(KYR_GTAG_READY_EVENT, onReady);
  if (tagReady(browser)) onReady();
}

export function recordQuizFunnelEvent(name: QuizFunnelEventName, params: QuizFunnelParams, resume = false) {
  if (typeof window === "undefined") return;
  try {
    const consent = hasAnalyticsConsent();
    const holdForTag = consent && mustWaitForTag(window);
    const decision = noteQuizFunnelEvent(window.sessionStorage, {
      name,
      params,
      consent: consent && !holdForTag,
      resume,
      createId: () => newQuizAttemptId(),
      now: Date.now(),
    });
    if (holdForTag) {
      armGtagFlush(window);
      return;
    }
    emitFunnel(decision.emit);
  } catch {
    /* sessionStorage unavailable: the quiz still runs, analytics stays quiet */
  }
}

export function flushPendingQuizFunnel() {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  if (mustWaitForTag(window)) {
    armGtagFlush(window);
    return;
  }
  try {
    const flushed = flushQuizFunnel(window.sessionStorage, { consent: true });
    emitFunnel(flushed.emit);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function closeCurrentQuizAttempt() {
  if (typeof window === "undefined") return;
  try {
    closeQuizAttempt(window.sessionStorage);
  } catch {
    /* sessionStorage unavailable */
  }
}

let watchingConsent = false;

export function watchQuizFunnelConsent() {
  if (watchingConsent || typeof window === "undefined") return;
  watchingConsent = true;
  window.addEventListener(COOKIE_CONSENT_EVENT, () => {
    flushPendingQuizFunnel();
  });
}
