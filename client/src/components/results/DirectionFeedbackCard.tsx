'use client';

import { useEffect, useState } from "react";
import { trackKyrEvent } from "@/lib/analytics";

type DirectionFeedbackCardProps = {
  sessionId?: string;
  directionTitle: string;
  mbtiType: string;
  primaryDisc: string;
};

const RATINGS = [
  { value: 5, label: "Very useful" },
  { value: 3, label: "Somewhat useful" },
  { value: 1, label: "Not useful" },
] as const;

export function DirectionFeedbackCard({ sessionId, directionTitle, mbtiType, primaryDisc }: DirectionFeedbackCardProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  useEffect(() => {
    trackKyrEvent("direction_relevance_prompted", { direction_title: directionTitle, mbti_type: mbtiType, primary_disc: primaryDisc });
  }, [directionTitle, mbtiType, primaryDisc]);

  const chooseRating = (value: number) => {
    if (rating === null) trackKyrEvent("direction_relevance_started", { direction_title: directionTitle, mbti_type: mbtiType, primary_disc: primaryDisc });
    setRating(value);
  };

  const submit = async () => {
    if (!rating || status === "submitting") return;
    setStatus("submitting");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId ?? null,
          career_relevance: rating,
          primary_role: directionTitle,
          mbti_type: mbtiType,
          disc_style: primaryDisc,
          suggestions: note.trim() || null,
          quiz_type: "shortform_v2_controlled_beta",
        }),
      });
      if (!response.ok) throw new Error("Feedback submission failed");
      trackKyrEvent("direction_relevance_submitted", {
        career_relevance: rating,
        direction_title: directionTitle,
        mbti_type: mbtiType,
        primary_disc: primaryDisc,
        has_note: Boolean(note.trim()),
      });
      setStatus("submitted");
    } catch {
      setStatus("error");
    }
  };

  if (status === "submitted") {
    return <section aria-live="polite" style={cardStyle}><strong>Thank you.</strong><p style={copyStyle}>Your feedback helps us test whether this direction actually lands.</p></section>;
  }

  return (
    <section aria-labelledby="direction-feedback-title" style={cardStyle}>
      <div style={{ color: "#315f74", fontSize: 10, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>Private beta check-in</div>
      <h3 id="direction-feedback-title" style={{ margin: "7px 0 5px", fontSize: 17 }}>How useful was this work direction?</h3>
      <p style={copyStyle}>One tap is enough. An optional note tells us what landed or missed.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {RATINGS.map(option => <button key={option.value} type="button" onClick={() => chooseRating(option.value)} aria-pressed={rating === option.value} style={{ ...ratingStyle, ...(rating === option.value ? selectedRatingStyle : {}) }}>{option.label}</button>)}
      </div>
      {rating !== null && <>
        <label style={{ display: "block", marginTop: 12, color: "#29495c", fontSize: 12, fontWeight: 700 }}>
          What felt missing or off? <span style={{ fontWeight: 500 }}>(optional)</span>
          <textarea value={note} onChange={event => setNote(event.target.value)} maxLength={500} rows={2} placeholder="A short note helps us improve the direction or examples." style={textareaStyle} />
        </label>
        <button type="button" onClick={submit} disabled={status === "submitting"} style={submitStyle}>{status === "submitting" ? "Saving…" : "Send feedback"}</button>
      </>}
      {status === "error" && <p role="alert" style={{ ...copyStyle, color: "#ff9abf", marginTop: 9 }}>Could not save that feedback. Please try again.</p>}
    </section>
  );
}

const cardStyle = { marginTop: 12, border: "1px solid rgba(18,38,58,.18)", borderRadius: 4, padding: 15, background: "#eaf5f6", boxShadow: "4px 4px 0 rgba(18,38,58,.08)" } as const;
const copyStyle = { margin: 0, color: "#405f72", fontSize: 12.5, lineHeight: 1.45 } as const;
const ratingStyle = { border: "1px solid rgba(18,38,58,.2)", borderRadius: 999, padding: "8px 10px", color: "#12263a", background: "#fffdf8", cursor: "pointer", fontSize: 12, fontWeight: 800 } as const;
const selectedRatingStyle = { borderColor: "#315f74", color: "#fffdf8", background: "#315f74" } as const;
const textareaStyle = { display: "block", width: "100%", marginTop: 6, resize: "vertical" as const, border: "1px solid rgba(18,38,58,.2)", borderRadius: 4, padding: 9, color: "#12263a", background: "#fffdf8", font: "inherit", fontSize: 12.5, lineHeight: 1.4 } as const;
const submitStyle = { marginTop: 9, border: 0, borderRadius: 4, padding: "9px 12px", color: "#12263a", background: "#ffca42", cursor: "pointer", fontSize: 12, fontWeight: 900 } as const;
