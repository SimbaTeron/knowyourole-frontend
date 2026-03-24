import { useState } from "react";
import { useLocation } from "wouter";
import { GlassCard } from "@/components/glass/GlassCard";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "20px",
  cursor: "pointer",
  transition: "all 0.25s ease",
};

const TIERS = [
  { id: "13-15", emoji: "🎉", title: "Young Teens (13-15)", sub: "Quick, fun quiz made just for you" },
  { id: "16-17", emoji: "👦", title: "Teens (16-17)", sub: "Full quiz with career insights" },
  { id: "18-24", emoji: "🧑", title: "Young Adults (18-24)", sub: "Complete personality + career matching" },
  { id: "25+", emoji: "👴", title: "Adults (25+)", sub: "Full experience with premium features" },
];

export default function QuizGateway() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => history.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, padding: 8 }}>←</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#00C8FF" }}>Step 1 of 2</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", zIndex: 50 }}>
        <div style={{ width: "50%", height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)" }} />
      </div>

      {/* Content */}
      <div style={{ paddingTop: 120, paddingBottom: 80, padding: "clamp(80px, 15vw, 120px) clamp(16px, 4vw, 48px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: 500, width: "100%" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#00C8FF", textAlign: "center", marginBottom: 12 }}>Before We Start</p>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>Who are you?</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 40 }}>Choose the option that fits you best.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelected(tier.id)}
                style={{
                  ...glassCard,
                  border: selected === tier.id
                    ? "2px solid #00C8FF"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: selected === tier.id ? "0 0 20px rgba(0,200,255,0.3)" : "none",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{tier.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{tier.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, fontFamily: "'Outfit',sans-serif" }}>{tier.sub}</div>
                <div style={{ textAlign: "right", color: selected === tier.id ? "#00C8FF" : "rgba(255,255,255,0.3)", fontSize: 18 }}>→</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => selected && setLocation(`/quiz?tier=${selected}`)}
            disabled={!selected}
            style={{
              marginTop: 32,
              width: "100%",
              padding: "16px",
              background: selected ? "linear-gradient(90deg, #00C8FF, #7800FF)" : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 16,
              color: selected ? "#fff" : "rgba(255,255,255,0.3)",
              fontWeight: 700,
              fontSize: 16,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'Outfit',sans-serif",
              boxShadow: selected ? "0 0 30px rgba(0,200,255,0.4)" : "none",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
