"use client";

import { useEffect, useRef, useState } from "react";
import { trackKyrEvent } from "@/lib/analytics";
import { RatingRadios } from "@/components/results/RatingRadios";
import {
  RESULT_FIT_CHOICES,
  RESULT_FIT_COMMENT_MAX,
  RESULT_FIT_COPY,
  RESULT_FIT_RATINGS,
  parseResultFitFeedbackRequest,
  resultFitAnsweredLabel,
  resultFitChoiceLabel,
  resultFitRatingLabel,
  resultFitSubmittedKey,
  resultFitTapEvent,
  type ResultFit,
  type ResultFitRating,
} from "@/lib/feedback/resultFitFeedback";
import type { SavedResultId } from "@/lib/results/savedResultId";

type ResultFitFeedbackProps = {
  savedResultId?: SavedResultId | null;
  sessionId?: string;
};

type Phase = "choose" | "saving" | "extra" | "thanks";

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
  const [rating, setRating] = useState<ResultFitRating | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
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
    if (phase !== "extra" && phase !== "thanks") return;
    if (mountedPhase.current === phase) return;
    mountedPhase.current = phase;
    headingRef.current?.focus();
  }, [phase]);

  const postFit = async (nextFit: ResultFit, extra?: { rating: ResultFitRating | null; comment: string | null }) => {
    const payload = parseResultFitFeedbackRequest({
      resultId,
      fit: nextFit,
      rating: extra?.rating ?? null,
      comment: extra?.comment ?? null,
    });
    if (!payload.ok) {
      setError(RESULT_FIT_COPY.error);
      return false;
    }
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
    if (response.status === 429) {
      setError(RESULT_FIT_COPY.wait);
      return false;
    }
    const body = await response.json().catch(() => null) as { success?: boolean } | null;
    if (!response.ok || body?.success !== true) {
      setError(RESULT_FIT_COPY.error);
      return false;
    }
    setError("");
    return true;
  };

  const choose = async (nextFit: ResultFit) => {
    if (sending.current || phase === "saving" || phase === "thanks") return;
    sending.current = true;
    setFit(nextFit);
    setPhase("saving");
    setError("");
    try {
      const saved = await postFit(nextFit);
      if (!alive.current) return;
      if (!saved) {
        setPhase("choose");
        return;
      }
      const event = resultFitTapEvent(nextFit);
      trackKyrEvent(event.name, event.params);
      setPhase("extra");
    } catch {
      if (!alive.current) return;
      setError(RESULT_FIT_COPY.error);
      setPhase("choose");
    } finally {
      sending.current = false;
    }
  };

  const finish = (saved: boolean) => {
    if (!saved) return;
    markSubmitted(resultId);
    setPhase("thanks");
  };

  const skip = () => {
    finish(true);
  };

  const sendExtra = async () => {
    if (!fit || sending.current) return;
    const trimmed = comment.trim();
    if (rating == null && trimmed.length === 0) return;
    sending.current = true;
    setError("");
    try {
      const saved = await postFit(fit, { rating, comment: trimmed || null });
      if (!alive.current) return;
      finish(saved);
    } catch {
      if (!alive.current) return;
      setError(RESULT_FIT_COPY.error);
    } finally {
      sending.current = false;
    }
  };

  const canSendExtra = rating != null || comment.trim().length > 0;
  const title = phase === "thanks" ? RESULT_FIT_COPY.thanksTitle : RESULT_FIT_COPY.title;
  const statusMessage = phase === "thanks"
    ? `${RESULT_FIT_COPY.thanksTitle} ${RESULT_FIT_COPY.thanksDetail}`
    : phase === "extra" && fit
      ? `${resultFitAnsweredLabel(fit)} ${RESULT_FIT_COPY.extraLead}`
      : "";

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
          {phase === "choose" || phase === "saving" ? (
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
          ) : null}
          {phase === "extra" && fit ? (
            <div className="result-fit-extra">
              <p className="result-fit-copy">{resultFitAnsweredLabel(fit)} {RESULT_FIT_COPY.extraLead}</p>
              <div className="result-fit-rating-set">
                <p id="result-fit-rating-legend" className="result-fit-label">{RESULT_FIT_COPY.ratingLegend}</p>
                <p className="result-fit-scale" id="result-fit-scale">{RESULT_FIT_COPY.ratingScale}</p>
                <RatingRadios
                  labelledBy="result-fit-rating-legend"
                  describedBy="result-fit-scale"
                  className="result-fit-ratings"
                  selected={rating}
                  onSelect={(value) => {
                    if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) setRating(value);
                  }}
                  options={RESULT_FIT_RATINGS.map((value) => ({
                    value,
                    ariaLabel: resultFitRatingLabel(value),
                    className: "result-fit-rating",
                    testId: `result-fit-rating-${value}`,
                    children: value,
                  }))}
                />
              </div>
              <label className="result-fit-label" htmlFor="result-fit-comment">
                {RESULT_FIT_COPY.commentLabel}
                <textarea
                  id="result-fit-comment"
                  data-testid="result-fit-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={RESULT_FIT_COMMENT_MAX}
                  rows={3}
                  placeholder={RESULT_FIT_COPY.commentPlaceholder}
                  aria-describedby="result-fit-comment-hint"
                  autoComplete="off"
                />
              </label>
              <p id="result-fit-comment-hint" className="result-fit-hint">{RESULT_FIT_COPY.commentHint}</p>
              <p className="result-fit-count" aria-hidden="true">{comment.length}/{RESULT_FIT_COMMENT_MAX}</p>
              <div className="result-fit-actions">
                <button type="button" className="result-fit-action" data-testid="result-fit-skip" onClick={skip}>
                  {RESULT_FIT_COPY.skip}
                </button>
                <button
                  type="button"
                  className="result-fit-action result-fit-action-primary"
                  data-testid="result-fit-send"
                  aria-disabled={!canSendExtra ? true : undefined}
                  onClick={() => { void sendExtra(); }}
                >
                  {RESULT_FIT_COPY.send}
                </button>
              </div>
            </div>
          ) : null}
          {error ? <p role="alert" className="result-fit-error">{error}</p> : null}
        </>
      )}
    </section>
  );
}

const RESULT_FIT_CSS = `
.result-fit { position: relative; box-sizing: border-box; min-height: 180px; margin-top: 14px; border: 1px solid rgba(18,38,58,.22); border-radius: 4px; padding: 18px clamp(14px, 4vw, 22px); background: linear-gradient(135deg,#eaf5f6,#fff8e7); box-shadow: 5px 5px 0 rgba(18,38,58,.11); color: #12263a; font-family: Manrope, Inter, system-ui, sans-serif; }
.result-fit-title { margin: 0; color: #12263a; font-family: Fraunces, Georgia, serif; font-size: clamp(22px, 4vw, 28px); line-height: 1.1; letter-spacing: -.03em; font-weight: 650; }
.result-fit-title:focus { outline: none; }
.result-fit-title:focus-visible { outline: 3px solid #12263a; outline-offset: 3px; }
.result-fit-copy { margin: 8px 0 0; color: #29495c; font-size: 16px; line-height: 1.4; font-weight: 650; max-width: 40rem; }
.result-fit-choices, .result-fit-ratings { display: grid; gap: 8px; margin-top: 14px; }
.result-fit-choices { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.result-fit-ratings { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.result-fit-choice, .result-fit-rating, .result-fit-action { min-height: 52px; border: 1px solid rgba(18,38,58,.28); border-radius: 4px; background: #fffdf8; color: #12263a; font: inherit; font-size: 16px; font-weight: 800; line-height: 1.15; cursor: pointer; touch-action: manipulation; }
.result-fit-choice { padding: 12px 8px; }
.result-fit-rating { padding: 12px 0; }
.result-fit-choice[aria-pressed="true"], .result-fit-rating[aria-checked="true"] { background: #315f74; color: #fffdf8; border-color: #12263a; }
.result-fit-choice:focus-visible, .result-fit-rating:focus-visible, .result-fit-action:focus-visible, .result-fit textarea:focus-visible { outline: 3px solid #12263a; outline-offset: 2px; }
.result-fit-choice[aria-disabled="true"] { cursor: wait; opacity: .8; }
.result-fit-extra { display: grid; gap: 8px; margin-top: 14px; }
.result-fit-rating-set { margin: 0; padding: 0; border: 0; min-width: 0; }
.result-fit-label { display: grid; gap: 6px; margin: 0; color: #12263a; font-size: 16px; line-height: 1.3; font-weight: 800; }
.result-fit-scale, .result-fit-hint, .result-fit-count { margin: 0; color: #29495c; font-size: 14px; line-height: 1.4; font-weight: 650; }
.result-fit-count { font-variant-numeric: tabular-nums; }
.result-fit textarea { box-sizing: border-box; width: 100%; min-height: 88px; resize: vertical; border: 1px solid rgba(18,38,58,.28); border-radius: 4px; padding: 12px; color: #12263a; background: #fffdf8; font: inherit; font-size: 16px; font-weight: 600; line-height: 1.4; }
.result-fit-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
.result-fit-action { padding: 12px 10px; }
.result-fit-action-primary { background: #c95f46; color: #fffdf8; border-color: #9d3e2b; }
.result-fit-action[aria-disabled="true"] { cursor: not-allowed; opacity: .55; }
.result-fit-error { margin: 12px 0 0; color: #9d3e2b; font-size: 15px; font-weight: 750; line-height: 1.4; }
.result-fit-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 380px) { .result-fit-actions { grid-template-columns: 1fr; } }
`;
