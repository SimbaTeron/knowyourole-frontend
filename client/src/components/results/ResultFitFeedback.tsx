"use client";

import { useEffect, useRef, useState } from "react";
import { trackKyrEvent } from "@/lib/analytics";
import {
  RESULT_FIT_CHOICES,
  RESULT_FIT_COPY,
  parseResultFitFeedbackRequest,
  resultFitChoiceLabel,
  resultFitSubmittedKey,
  resultFitTapEvent,
  type ResultFit,
} from "@/lib/feedback/resultFitFeedback";
import type { SavedResultId } from "@/lib/results/savedResultId";

type ResultFitFeedbackProps = {
  savedResultId?: SavedResultId | null;
  sessionId?: string;
};

type Phase = "choose" | "saving" | "thanks";

function capabilityStorageKey(sessionId: string) {
  return `kyr_anonymous_result_capability:${sessionId}`;
}

function readSubmitted(resultId: string) {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(resultFitSubmittedKey(resultId)) === "yes";
  } catch {
    return false;
  }
}

function markSubmitted(resultId: string) {
  try {
    sessionStorage.setItem(resultFitSubmittedKey(resultId), "yes");
  } catch {
    /* private mode can reject storage; the saved row still stands */
  }
}

export function ResultFitFeedback({ savedResultId, sessionId }: ResultFitFeedbackProps) {
  if (!savedResultId || !sessionId) return null;
  return <ResultFitFeedbackForm resultId={savedResultId} sessionId={sessionId} />;
}

function ResultFitFeedbackForm({ resultId, sessionId }: { resultId: string; sessionId: string }) {
  const [phase, setPhase] = useState<Phase>(() => (readSubmitted(resultId) ? "thanks" : "choose"));
  const [fit, setFit] = useState<ResultFit | null>(null);
  const [error, setError] = useState("");
  const [errorTick, setErrorTick] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const mountedPhase = useRef(phase);
  const alive = useRef(true);
  const sending = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== "thanks") return;
    if (mountedPhase.current === phase) return;
    mountedPhase.current = phase;
    headingRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus({ preventScroll: true });
  }, [error, errorTick]);

  const reportError = (message: string) => {
    setError(message);
    setErrorTick((tick) => tick + 1);
  };

  const choose = async (nextFit: ResultFit) => {
    if (sending.current || phase === "saving" || phase === "thanks") return;
    const payload = parseResultFitFeedbackRequest({ resultId, fit: nextFit });
    if (!payload.ok) {
      reportError(RESULT_FIT_COPY.error);
      return;
    }
    sending.current = true;
    setFit(nextFit);
    setPhase("saving");
    setError("");
    try {
      let capability: string | null = null;
      try {
        capability = sessionStorage.getItem(capabilityStorageKey(sessionId));
      } catch {
        capability = null;
      }
      const response = await fetch("/api/results/fit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(capability ? { "x-kyr-anonymous-capability": capability } : {}),
        },
        body: JSON.stringify(payload.value),
      });
      if (!alive.current) return;
      if (response.status === 429) {
        reportError(RESULT_FIT_COPY.wait);
        setPhase("choose");
        return;
      }
      const body = await response.json().catch(() => null) as { success?: boolean } | null;
      if (!response.ok || body?.success !== true) {
        reportError(RESULT_FIT_COPY.error);
        setPhase("choose");
        return;
      }
      const event = resultFitTapEvent(nextFit);
      trackKyrEvent(event.name, event.params);
      markSubmitted(resultId);
      setPhase("thanks");
    } catch {
      if (!alive.current) return;
      reportError(RESULT_FIT_COPY.error);
      setPhase("choose");
    } finally {
      sending.current = false;
    }
  };

  const title = phase === "thanks" ? RESULT_FIT_COPY.thanksTitle : RESULT_FIT_COPY.title;
  const statusMessage = phase === "thanks" ? RESULT_FIT_COPY.thanksDetail : "";

  return (
    <section
      className="result-fit"
      data-testid="result-fit-feedback"
      aria-labelledby="result-fit-title"
      aria-busy={phase === "saving"}
    >
      <style>{RESULT_FIT_CSS}</style>
      <h2 id="result-fit-title" ref={headingRef} tabIndex={-1} className="result-fit-title">{title}</h2>
      <p className="result-fit-sr" aria-live="polite">{statusMessage}</p>
      {phase === "thanks" ? (
        <p className="result-fit-copy">{RESULT_FIT_COPY.thanksDetail}</p>
      ) : (
        <>
          <p className="result-fit-copy">{RESULT_FIT_COPY.hint}</p>
          <div role="group" aria-labelledby="result-fit-title" className="result-fit-choices">
            {RESULT_FIT_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                className="result-fit-choice"
                data-testid={`result-fit-${choice}`}
                aria-pressed={fit === choice}
                aria-disabled={phase === "saving" ? true : undefined}
                onClick={() => { void choose(choice); }}
              >
                {phase === "saving" && fit === choice ? RESULT_FIT_COPY.saving : resultFitChoiceLabel(choice)}
              </button>
            ))}
          </div>
          {error ? <p ref={errorRef} role="alert" tabIndex={-1} className="result-fit-error">{error}</p> : null}
        </>
      )}
    </section>
  );
}

const RESULT_FIT_CSS = `
.result-fit { position: relative; box-sizing: border-box; margin-top: 14px; border: 1px solid rgba(18,38,58,.22); border-radius: 4px; padding: 18px clamp(14px, 4vw, 22px); background: linear-gradient(135deg,#eaf5f6,#fff8e7); box-shadow: 5px 5px 0 rgba(18,38,58,.11); color: #12263a; font-family: Manrope, Inter, system-ui, sans-serif; }
.result-fit-title { margin: 0; color: #12263a; font-family: Fraunces, Georgia, serif; font-size: clamp(22px, 4vw, 28px); line-height: 1.1; letter-spacing: -.03em; font-weight: 650; }
.result-fit-title:focus { outline: none; }
.result-fit-title:focus-visible { outline: 3px solid #12263a; outline-offset: 3px; }
.result-fit-copy { margin: 8px 0 0; color: #29495c; font-size: 16px; line-height: 1.4; font-weight: 650; max-width: 40rem; }
.result-fit-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.result-fit-choice { min-height: 52px; padding: 12px 8px; border: 1px solid rgba(18,38,58,.28); border-radius: 4px; background: #fffdf8; color: #12263a; font: inherit; font-size: 16px; font-weight: 800; line-height: 1.15; cursor: pointer; touch-action: manipulation; }
.result-fit-choice[aria-pressed="true"] { background: #315f74; color: #fffdf8; border-color: #12263a; }
.result-fit-choice:focus-visible { outline: 3px solid #12263a; outline-offset: 2px; }
.result-fit-choice[aria-disabled="true"] { cursor: wait; opacity: .8; }
.result-fit-error { margin: 12px 0 0; color: #9d3e2b; font-size: 15px; font-weight: 750; line-height: 1.4; }
.result-fit-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
`;
