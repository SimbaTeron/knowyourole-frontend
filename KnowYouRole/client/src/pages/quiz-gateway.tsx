import { useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";

const TIERS = [
  { id: "13-15", emoji: "🎉", title: "Young Teens (13-15)", sub: "Quick, fun quiz made just for you" },
  { id: "16-17", emoji: "👦", title: "Teens (16-17)", sub: "Full quiz with career insights" },
  { id: "18-24", emoji: "🧑", title: "Young Adults (18-24)", sub: "Complete personality + career matching" },
  { id: "25+", emoji: "👴", title: "Adults (25+)", sub: "Full experience with premium features" },
];

export default function QuizGateway() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem("kyr_quiz_tier", selected);
      window.location.href = `/mood-mixer?tier=${encodeURIComponent(selected)}`;
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={handleBack} style={{
          background: "none", border: "none", color: "#ffffff",
          cursor: "pointer", fontSize: 22, padding: "4px 10px", borderRadius: 8,
          fontFamily: "'Outfit',sans-serif",
          textShadow: "0 0 12px rgba(0,200,255,0.5)",
        }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#00C8FF", letterSpacing: "0.1em" }}>STEP 1 OF 3</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ width: "33%", height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)" }} />
      </div>

      {/* Main content */}
      <div style={{
        paddingTop: 80, paddingBottom: 80,
        padding: "clamp(80px, 12vw, 110px) clamp(16px, 4vw, 48px)",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
            textTransform: "uppercase", color: "#7800FF", textAlign: "center", marginBottom: 10,
          }}>Before We Start</p>

          <h1 style={{
            fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 900,
            letterSpacing: "-0.03em", textAlign: "center", marginBottom: 10,
            fontFamily: "'Outfit',sans-serif",
          }}>Who are you?</h1>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 36,
          }}>Choose the option that fits you best.</p>

          {/* Age tier cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
          }}>
            {TIERS.map((tier) => {
              const isSelected = selected === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  style={{
                    background: isSelected
                      ? "rgba(0, 200, 255, 0.12)"
                      : "rgba(0,200,255,0.06)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: isSelected
                      ? "2px solid #00C8FF"
                      : "2px solid rgba(0,200,255,0.3)",
                    borderRadius: 20,
                    padding: "18px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected
                      ? "0 0 30px rgba(0,200,255,0.4), 0 0 60px rgba(0,200,255,0.2), inset 0 0 12px rgba(0,200,255,0.05)"
                      : "0 0 0px rgba(0,200,255,0.1)",
                    fontFamily: "'Outfit',sans-serif",
                    outline: "none",
                    minHeight: 100,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{tier.emoji}</div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, marginBottom: 4,
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.85)",
                    fontFamily: "'Outfit',sans-serif",
                  }}>{tier.title}</div>
                  <div style={{
                    fontSize: 11, color: "rgba(255,255,255,0.6)",
                    marginBottom: 8, fontFamily: "'Outfit',sans-serif",
                    lineHeight: 1.4,
                  }}>{tier.sub}</div>
                  {isSelected && (
                    <div style={{ color: "#00C8FF", fontSize: 18, fontWeight: 700, marginTop: 4, textShadow: "0 0 10px rgba(0,200,255,0.8)" }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selection feedback */}
          {selected && (
            <p style={{
              textAlign: "center", marginTop: 16, fontSize: 13,
              color: "#00C8FF", fontWeight: 600,
            }}>
              You selected: {TIERS.find(t => t.id === selected)?.title}
            </p>
          )}

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "17px",
              background: selected
                ? "linear-gradient(90deg, #00C8FF, #7800FF)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 16,
              color: selected ? "#ffffff" : "rgba(255,255,255,0.3)",
              fontWeight: 800,
              fontSize: 16,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: selected ? "0 4px 30px rgba(0,200,255,0.35)" : "none",
              transition: "all 0.25s ease",
              letterSpacing: "0.02em",
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            {selected ? `Start Quiz →` : "Select your age to continue"}
          </button>

          {/* Trust signal */}
          <p style={{
            textAlign: "center", marginTop: 16, fontSize: 12,
            color: "rgba(255,255,255,0.5)",
          }}>
            🔒 Your answers are private. Always.
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
