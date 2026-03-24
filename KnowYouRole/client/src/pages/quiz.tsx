import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppFooter } from "@/components/layout/AppFooter";

const QUESTIONS = [
  { q: "You're at a party. What do you naturally do?", a: ["Work the room, meeting everyone", "Find one deep conversation", "Observe from the corner", "Make sure everyone's having fun", "Relax and enjoy your own company"] },
  { q: "How do you prefer to make decisions?", a: ["Based on logic and data", "Based on how it affects people", "Following my gut feeling", "Weighing pros and cons carefully", "Quickly, based on instinct"] },
  { q: "Your ideal weekend involves:", a: ["Spontaneous adventures with friends", "Deep work on a personal project", "Planning my next big goal", "Quiet time with a good book", "Learning something entirely new"] },
  { q: "In a group project, you naturally:", a: ["Lead and delegate tasks", "Bring creative ideas", "Keep everyone on schedule", "Mediate conflicts", "Do your part independently"] },
  { q: "What motivates you most?", a: ["Recognition and achievement", "Helping others succeed", "Mastery and expertise", "Freedom and autonomy", "Impact and purpose"] },
];

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
};

export default function QuizPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const stepParam = params.get("step"); // "questions" = show quiz questions

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  // If step=questions is set, skip to quiz questions immediately
  useEffect(() => {
    if (stepParam === "questions") {
      // Read any previously saved answers to resume where they left off
      const saved = localStorage.getItem("kyr_quiz_answers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAnswers(parsed);
            setStep(parsed.length);
          }
        } catch {}
      }
    } else {
      // Guard: if user has already completed quiz, redirect to results
      const saved = localStorage.getItem("kyr_quiz_answers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length >= QUESTIONS.length) {
            window.location.href = "/results";
            return;
          }
        } catch {}
      }
    }
  }, [stepParam]);

  // If showing questions but no step param, redirect
  if (stepParam !== "questions" && step > 0) {
    // User is at quiz page without step param but has progress — redirect to questions
    window.location.href = "/quiz?step=questions";
    return null;
  }

  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;
  const tier = localStorage.getItem("kyr_quiz_tier") || "18-24";

  const handleNext = () => {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    setSelected(null);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem("kyr_quiz_answers", JSON.stringify(next));
      const moodBlendStr = localStorage.getItem("kyr_mood_blend");
      const moodBlend = moodBlendStr ? JSON.parse(moodBlendStr) : null;
      localStorage.setItem("kyr_results", JSON.stringify({ answers: next, moodBlend, tier }));
      window.location.href = "/results";
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{``}</style>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => window.location.href = "/quiz"} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, padding: "4px 8px", borderRadius: 8, fontFamily: "'Outfit',sans-serif" }}>←</button>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#00C8FF", letterSpacing: "0.1em" }}>STEP 2 OF 3</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)", transition: "width 0.4s ease" }} />
      </div>

      {/* Question */}
      <div style={{ paddingTop: 80, paddingBottom: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "clamp(80px, 12vw, 100px) clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 620, width: "100%" }}>
          {/* Question number */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#7800FF", textTransform: "uppercase", marginBottom: 12, textAlign: "center", fontFamily: "'Outfit',sans-serif" }}>
            Question {step + 1} of {QUESTIONS.length}
          </p>

          {/* Question text */}
          <h2 style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 800, textAlign: "center", marginBottom: 36, lineHeight: 1.3, fontFamily: "'Outfit',sans-serif" }}>
            {q.q}
          </h2>

          {/* Answer options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.a.map((answer, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    ...glassCard,
                    padding: "16px 20px",
                    textAlign: "left",
                    cursor: "pointer",
                    background: isSelected ? "rgba(0,200,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: isSelected ? "2px solid #00C8FF" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
                    fontSize: 15,
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: isSelected ? 600 : 400,
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 0 20px rgba(0,200,255,0.2)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    minHeight: 56,
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: isSelected ? "#00C8FF" : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    color: isSelected ? "#000" : "rgba(255,255,255,0.4)",
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {answer}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={selected === null}
            style={{
              marginTop: 32,
              width: "100%",
              padding: "17px",
              background: selected !== null ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 16,
              color: selected !== null ? "#fff" : "rgba(255,255,255,0.3)",
              fontWeight: 800,
              fontSize: 16,
              cursor: selected !== null ? "pointer" : "not-allowed",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: selected !== null ? "0 4px 30px rgba(0,200,255,0.35)" : "none",
              transition: "all 0.25s ease",
              letterSpacing: "0.02em",
            }}
          >
            {step < QUESTIONS.length - 1 ? "Next Question →" : "See My Results →"}
          </button>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i < step ? "#00C8FF" : i === step ? "#7800FF" : "rgba(255,255,255,0.2)",
                transition: "background 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
