import { useState } from "react";

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
      window.location.href = "/mood-mixer";
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,200,255,0.4), 0 0 40px rgba(120,0,255,0.3); }
          50% { box-shadow: 0 0 35px rgba(0,200,255,0.7), 0 0 70px rgba(120,0,255,0.5); }
        }
        @keyframes border-pulse {
          0%, 100% { border-color: rgba(0,200,255,0.7); }
          50% { border-color: rgba(0,200,255,1); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ width: 20 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#00C8FF", letterSpacing: "0.1em" }}>STEP 1 OF 3</span>
        <div style={{ width: 20 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ width: "33%", height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)" }} />
      </div>

      {/* Main content */}
      <div style={{
        paddingTop: 80,
        padding: "clamp(80px, 12vw, 100px) clamp(16px, 4vw, 48px)",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          {/* Header text */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "#7800FF", textAlign: "center" as const, marginBottom: 10 }}>Before We Start</p>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center" as const, marginBottom: 10 }}>Who are you?</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", textAlign: "center" as const, marginBottom: 36 }}>Choose the option that fits you best.</p>

          {/* Age tier cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 40 }}>
            {TIERS.map((tier) => {
              const isSelected = selected === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  style={{
                    background: isSelected ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: isSelected ? "2px solid #00C8FF" : "2px solid rgba(0,200,255,0.25)",
                    borderRadius: 20,
                    padding: "18px 16px",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 0 24px rgba(0,200,255,0.3), inset 0 0 12px rgba(0,200,255,0.05)" : "none",
                    fontFamily: "'Outfit',sans-serif",
                    outline: "none",
                    minHeight: 110,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{tier.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: isSelected ? "#fff" : "rgba(255,255,255,0.85)" }}>{tier.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{tier.sub}</div>
                  {isSelected && (
                    <div style={{ color: "#00C8FF", fontSize: 16, fontWeight: 700, marginTop: 4 }}>✓ Selected</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected feedback */}
          {selected && (
            <p style={{ textAlign: "center", marginBottom: 16, fontSize: 14, color: "#00C8FF", fontWeight: 700 }}>
              ✓ {TIERS.find(t => t.id === selected)?.title} selected
            </p>
          )}

          {/* Continue button — MADE EXTREMELY VISIBLE */}
          <div style={{
            width: "100%",
            borderRadius: 22,
            padding: "3px",
            background: selected
              ? "linear-gradient(90deg, #00C8FF, #7800FF, #FF00E5, #00C8FF)"
              : "rgba(255,255,255,0.1)",
            animation: selected ? "border-pulse 2s ease-in-out infinite" : "none",
            boxShadow: selected
              ? "0 0 25px rgba(0,200,255,0.4), 0 0 50px rgba(120,0,255,0.25)"
              : "none",
          }}>
            <button
              onClick={handleContinue}
              disabled={!selected}
              style={{
                width: "100%",
                padding: "20px",
                background: selected
                  ? "linear-gradient(135deg, #0a0a1a 0%, #0d1a2a 50%, #0a0a1a 100%)"
                  : "rgba(255,255,255,0.04)",
                border: "none",
                borderRadius: 20,
                color: selected ? "#00C8FF" : "rgba(255,255,255,0.2)",
                fontWeight: 800,
                fontSize: 18,
                cursor: selected ? "pointer" : "not-allowed",
                fontFamily: "'Outfit',sans-serif",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                textShadow: selected ? "0 0 20px rgba(0,200,255,0.6)" : "none",
                boxShadow: selected ? "inset 0 0 30px rgba(0,200,255,0.1)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {selected ? "START QUIZ  \u2192" : "SELECT YOUR AGE TO CONTINUE"}
            </button>
          </div>

          {/* Secondary action */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Takes less than 5 minutes
          </p>

          {/* Trust signal */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Your answers are private. Always.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
