'use client';

import { useEffect, useMemo, useState } from "react";
import { trackKyrEvent } from "@/lib/analytics";

type DirectionFeedbackCardProps = {
  resultId?: string;
  sessionId?: string;
  directionTitle: string;
  recommendations: string[];
};

type SubmitStatus = "idle" | "submitting" | "submitted" | "error";

const RATINGS = [
  { value: 1, label: "Not at all", detail: "Missed the mark" },
  { value: 2, label: "A little", detail: "Some connection" },
  { value: 3, label: "Mostly", detail: "Useful, with gaps" },
  { value: 4, label: "Very", detail: "Strong fit" },
  { value: 5, label: "Exactly", detail: "Feels right" },
] as const;

function capabilityStorageKey(sessionId: string) {
  return `kyr_anonymous_result_capability:${sessionId}`;
}

export function DirectionFeedbackCard({ resultId, sessionId, directionTitle, recommendations }: DirectionFeedbackCardProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [mostUseful, setMostUseful] = useState("");
  const [leastUseful, setLeastUseful] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const options = useMemo(
    () => Array.from(new Set([directionTitle, ...recommendations].filter(Boolean))).slice(0, 8),
    [directionTitle, recommendations],
  );
  const canCollectFeedback = Boolean(resultId && sessionId && options.length > 0);

  useEffect(() => {
    if (!canCollectFeedback || !resultId) return;
    if (sessionStorage.getItem(`kyr_pilot_feedback_submitted:${resultId}`) === "true") {
      setStatus("submitted");
      return;
    }
    trackKyrEvent("direction_relevance_prompted", { pilot_feedback: true });
  }, [canCollectFeedback, resultId]);

  if (!canCollectFeedback) return null;

  const chooseRating = (value: number) => {
    if (rating === null) trackKyrEvent("direction_relevance_started", { pilot_feedback: true });
    setRating(value);
    setErrorMessage("");
  };

  const submit = async () => {
    if (!rating || !resultId || !sessionId || status === "submitting") return;
    if (mostUseful && leastUseful && mostUseful === leastUseful) {
      setErrorMessage("Choose different recommendations for most and least useful.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    try {
      const capability = sessionStorage.getItem(capabilityStorageKey(sessionId));
      const response = await fetch("/api/results/pilot-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(capability ? { "x-kyr-anonymous-capability": capability } : {}),
        },
        body: JSON.stringify({
          resultId,
          accuracyRating: rating,
          mostUsefulRecommendation: mostUseful || null,
          leastUsefulRecommendation: leastUseful || null,
          improvementNote: note.trim() || null,
        }),
      });
      const body = await response.json().catch(() => null) as { success?: boolean; error?: string; alreadySubmitted?: boolean } | null;
      if (!response.ok || !body?.success) throw new Error(body?.error || "Could not save feedback.");

      sessionStorage.setItem(`kyr_pilot_feedback_submitted:${resultId}`, "true");
      trackKyrEvent("direction_relevance_submitted", {
        pilot_feedback: true,
        accuracy_rating: rating,
        has_most_useful: Boolean(mostUseful),
        has_least_useful: Boolean(leastUseful),
        has_note: Boolean(note.trim()),
        already_submitted: body.alreadySubmitted === true,
      });
      setStatus("submitted");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Could not save feedback. Please try again.");
    }
  };

  if (status === "submitted") {
    return (
      <section aria-live="polite" style={cardStyle}>
        <div style={eyebrowStyle}>Pilot feedback saved</div>
        <h3 style={headingStyle}>Thank you for making this better.</h3>
        <p style={copyStyle}>Your response is linked to this result, not to your raw quiz answers.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="direction-feedback-title" style={cardStyle}>
      <div style={eyebrowStyle}>Early pilot · 60 seconds</div>
      <h3 id="direction-feedback-title" style={headingStyle}>Does this work direction feel accurate?</h3>
      <p style={copyStyle}>Your result is visible above. One rating is enough; the optional details help us improve the recommendations.</p>

      <div role="radiogroup" aria-label="Direction accuracy" style={ratingGridStyle}>
        {RATINGS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={rating === option.value}
            onClick={() => chooseRating(option.value)}
            style={{ ...ratingButtonStyle, ...(rating === option.value ? selectedRatingButtonStyle : {}) }}
          >
            <strong style={ratingValueStyle}>{option.value}</strong>
            <span style={ratingLabelStyle}>{option.label}</span>
            <small style={ratingDetailStyle}>{option.detail}</small>
          </button>
        ))}
      </div>

      {rating !== null && (
        <div style={followUpStyle}>
          <div style={selectGridStyle}>
            <label style={fieldLabelStyle}>
              Most useful recommendation <span style={optionalStyle}>(optional)</span>
              <select value={mostUseful} onChange={(event) => { setMostUseful(event.target.value); setErrorMessage(""); }} style={selectStyle}>
                <option value="">Choose one</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label style={fieldLabelStyle}>
              Least useful recommendation <span style={optionalStyle}>(optional)</span>
              <select value={leastUseful} onChange={(event) => { setLeastUseful(event.target.value); setErrorMessage(""); }} style={selectStyle}>
                <option value="">Choose one</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <label style={fieldLabelStyle}>
            What would you change, add, or clarify? <span style={optionalStyle}>(optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="A short note helps us improve the direction and examples."
              style={textareaStyle}
            />
            <span style={characterCountStyle}>{note.length}/500</span>
          </label>
          <button type="button" onClick={submit} disabled={status === "submitting"} style={{ ...submitStyle, ...(status === "submitting" ? disabledSubmitStyle : {}) }}>
            {status === "submitting" ? "Saving feedback…" : "Send feedback"}
          </button>
        </div>
      )}

      {errorMessage && <p role="alert" style={errorStyle}>{errorMessage}</p>}
    </section>
  );
}

const cardStyle = { marginTop: 14, border: "1px solid rgba(18,38,58,.22)", borderRadius: 4, padding: "18px clamp(14px, 4vw, 22px)", background: "linear-gradient(135deg,#eaf5f6,#fff8e7)", boxShadow: "5px 5px 0 rgba(18,38,58,.11)" } as const;
const eyebrowStyle = { color: "#315f74", fontSize: 10, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" as const } as const;
const headingStyle = { margin: "8px 0 6px", color: "#12263a", fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(21px,4vw,27px)", lineHeight: 1.02, letterSpacing: "-.04em" } as const;
const copyStyle = { margin: 0, color: "#405f72", fontSize: 13, lineHeight: 1.5, maxWidth: 580 } as const;
const ratingGridStyle = { display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 7, marginTop: 15 } as const;
const ratingButtonStyle = { minHeight: 86, padding: "8px 5px", border: "1px solid rgba(18,38,58,.22)", borderRadius: 3, color: "#12263a", background: "#fffdf8", cursor: "pointer", textAlign: "center" as const, font: "inherit" } as const;
const selectedRatingButtonStyle = { borderColor: "#12263a", color: "#fffdf8", background: "#315f74", boxShadow: "3px 3px 0 #c95f46", transform: "translate(-1px,-1px)" } as const;
const ratingValueStyle = { display: "block", fontSize: 21, lineHeight: 1, fontWeight: 950 } as const;
const ratingLabelStyle = { display: "block", marginTop: 5, fontSize: 11, lineHeight: 1.1, fontWeight: 900 } as const;
const ratingDetailStyle = { display: "block", marginTop: 4, opacity: .76, fontSize: 9, lineHeight: 1.15 } as const;
const followUpStyle = { marginTop: 16, display: "grid", gap: 13 } as const;
const selectGridStyle = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 } as const;
const fieldLabelStyle = { display: "grid", gap: 6, color: "#29495c", fontSize: 12, lineHeight: 1.3, fontWeight: 800 } as const;
const optionalStyle = { color: "#637b8a", fontWeight: 600 } as const;
const selectStyle = { width: "100%", minWidth: 0, border: "1px solid rgba(18,38,58,.24)", borderRadius: 3, padding: "10px", color: "#12263a", background: "#fffdf8", font: "inherit", fontSize: 13 } as const;
const textareaStyle = { display: "block", width: "100%", boxSizing: "border-box" as const, resize: "vertical" as const, border: "1px solid rgba(18,38,58,.24)", borderRadius: 3, padding: 10, color: "#12263a", background: "#fffdf8", font: "inherit", fontSize: 13, lineHeight: 1.45 } as const;
const characterCountStyle = { justifySelf: "end", color: "#637b8a", fontSize: 10, fontWeight: 700 } as const;
const submitStyle = { justifySelf: "start", border: "1px solid #9d3e2b", borderRadius: 3, padding: "10px 14px", color: "#fffdf8", background: "#c95f46", boxShadow: "3px 3px 0 rgba(18,38,58,.16)", cursor: "pointer", fontSize: 13, fontWeight: 900 } as const;
const disabledSubmitStyle = { opacity: .72, cursor: "wait" } as const;
const errorStyle = { margin: "12px 0 0", color: "#9d3e2b", fontSize: 12.5, fontWeight: 750, lineHeight: 1.4 } as const;
