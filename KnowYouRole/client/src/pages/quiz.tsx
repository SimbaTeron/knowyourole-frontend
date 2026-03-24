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
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    // Guard: if user has already completed quiz, redirect to results
    const saved = localStorage.getItem("kyr_quiz_answers");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= QUESTIONS.length) {
        window.location.href = "/results";
        return;
      }
    }
  }, []);

  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    setSelected(null);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Save answers before navigating to results
      localStorage.setItem("kyr_quiz_answers", JSON.stringify(next));
      window.location.href = "/results";
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => history.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, padding: 8 }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#00C8FF", letterSpacing: "0.1em" }}>STEP 2 OF 3</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", zIndex: 50 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)", transition: "width 0.4s ease" }} />
      </div>

      {/* Question */}
      <div style={{ padding: "clamp(80px, 15vw, 120px) clamp(16px, 4vw, 48px)", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: 640, width: "100%" }}>
          <div style={{ ...glassCard, padding: "clamp(24px, 5vw, 40px)", marginBottom: 24 }}>
            <h2 style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", fontWeight: 700, lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>{q.q}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.a.map((ans, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  ...glassCard,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  border: selected === i ? "2px solid #00C8FF" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: selected === i ? "0 0 15px rgba(0,200,255,0.25)" : "none",
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selected === i ? "#00C8FF" : "rgba(255,255,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {selected === i && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00C8FF", boxShadow: "0 0 8px rgba(0,200,255,0.6)" }} />}
                </div>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit',sans-serif" }}>{ans}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next button */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px clamp(16px, 4vw, 48px)", background: "rgba(5,5,16,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={handleNext}
          disabled={selected === null}
          style={{
            width: "100%",
            padding: "16px",
            background: selected !== null ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 16,
            color: selected !== null ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: 700,
            fontSize: 16,
            cursor: selected !== null ? "pointer" : "not-allowed",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: selected !== null ? "0 0 30px rgba(0,200,255,0.3)" : "none",
          }}
        >
          {step < QUESTIONS.length - 1 ? "Next Question →" : "See Your Results →"}
        </button>
      </div>

      <AppFooter />
    </div>
  );
}
