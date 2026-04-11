'use client';

import { useState, useEffect } from "react";
import { isTestMode } from "@/utils/devTest";

const TIERS = [
  { id: "25+", emoji: "💼", title: "Adults (25+)", sub: "Full experience with premium features" },
  { id: "19-25", emoji: "🎓", title: "Young Adults (18-25)", sub: "College & early career matching" },
  { id: "13-18", emoji: "🎒", title: "Youth (12-17)", sub: "High school quiz with career insights" },
  { id: "7-12", emoji: "👶", title: "Kids (12 & under)", sub: "Fun strengths discovery for kids" },
];

export default function QuizGateway() {
  const [selected, setSelected] = useState<string | null>(null);

  // Dev test mode: if ?test=true in URL, auto-select tier and go to mood mixer (normal flow)
  // Note: home page handles full test bypass; this just ensures tier is set if accessed directly
  useEffect(() => {
    if (!isTestMode()) return;
    const urlParams = new URLSearchParams(window.location.search);
    let tier = urlParams.get("tier");
    if (!tier) tier = "25+";
    const normalizedTier = tier.trim();
    const matchedTier = TIERS.find(t => t.id === normalizedTier || t.id.startsWith(normalizedTier));
    if (matchedTier) {
      sessionStorage.setItem("kyr_quiz_tier", matchedTier.id);
    }
  }, []);

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem("kyr_quiz_tier", selected);
      window.location.href = "/mood-mixer";
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 20 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#00C8FF", letterSpacing: "0.1em" }}>STEP 1 OF 3</span>
        <div style={{ width: 20 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{ width: "33%", height: "100%", background: "linear-gradient(90deg, #00C8FF, #7800FF)" }} />
      </div>

      {/* Content */}
      <div style={{ paddingTop: 80, padding: "clamp(80px, 12vw, 100px) clamp(16px, 4vw, 48px)", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#7800FF", textAlign: "center", marginBottom: 10 }}>Before We Start</p>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 10 }}>Who are you?</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 36 }}>Choose the option that fits you best.</p>

          {/* Cards */}
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
                    border: isSelected ? "2.5px solid #00C8FF" : "2px solid rgba(0,200,255,0.25)",
                    borderRadius: 20,
                    padding: "18px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 0 28px rgba(0,200,255,0.35)" : "none",
                    fontFamily: "'Outfit',sans-serif",
                    outline: "none",
                    minHeight: 110,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{tier.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: isSelected ? "#fff" : "rgba(255,255,255,0.85)" }}>{tier.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{tier.sub}</div>
                  {isSelected && <div style={{ color: "#00C8FF", fontSize: 14, fontWeight: 700, marginTop: 6 }}>✓ Selected</div>}
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

          {/* BUTTON - SOLID BRIGHT CYAN - NO GRADIENT */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              width: "100%",
              padding: "22px 24px",
              background: selected ? "#00C8FF" : "rgba(0,200,255,0.1)",
              border: selected ? "3px solid #00C8FF" : "2px solid rgba(0,200,255,0.25)",
              borderRadius: 16,
              color: selected ? "#000000" : "rgba(0,200,255,0.4)",
              fontWeight: 900,
              fontSize: 19,
              fontFamily: "'Outfit',sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: selected ? "pointer" : "not-allowed",
              boxShadow: selected ? "0 0 35px rgba(0,200,255,0.9), 0 0 70px rgba(0,200,255,0.4)" : "none",
              transition: "all 0.25s ease",
              display: "block",
              boxSizing: "border-box",
              minHeight: 64,
            }}
          >
            {selected ? "START QUIZ →" : "SELECT YOUR AGE TO CONTINUE"}
          </button>

          {/* Trust */}
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Takes less than 5 minutes • 100% private
          </p>
        </div>
      </div>
    </div>
  );
}
