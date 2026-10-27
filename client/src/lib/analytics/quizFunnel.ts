"use client";

import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/components/CookieConsentBanner";
import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";
import { trackKyrEvent } from "@/lib/analytics";
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

export function recordQuizFunnelEvent(name: QuizFunnelEventName, params: QuizFunnelParams, resume = false) {
  if (typeof window === "undefined") return;
  try {
    const decision = noteQuizFunnelEvent(window.sessionStorage, {
      name,
      params,
      consent: hasAnalyticsConsent(),
      resume,
      createId: () => newQuizAttemptId(),
      now: Date.now(),
    });
    emitFunnel(decision.emit);
  } catch {
    /* sessionStorage unavailable: the quiz still runs, analytics stays quiet */
  }
}

export function flushPendingQuizFunnel() {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
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
