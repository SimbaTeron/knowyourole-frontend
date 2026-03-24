import { useState, useEffect, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const MOODS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#00C8FF", glow: "rgba(0,200,255,0.5)", desc: "Sharp and analytical" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glow: "rgba(167,139,250,0.5)", desc: "Imaginative and free" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glow: "rgba(96,165,250,0.5)", desc: "Peaceful and centered" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glow: "rgba(251,191,36,0.5)", desc: "Full of vibrant energy" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glow: "rgba(244,114,182,0.5)", desc: "Always exploring" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glow: "rgba(248,113,113,0.5)", desc: "Driven and relentless" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glow: "rgba(52,211,153,0.5)", desc: "Connected and warm" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#818CF8", glow: "rgba(129,140,248,0.5)", desc: "Thoughtful and inward" },
];

function getBlendName(mood1: string, mood2: string): string {
  const names: Record<string, string> = {
    "focused+creative": "The Visionary Architect",
    "focused+calm": "The Strategic Mind",
    "focused+energetic": "The Dynamic Executor",
    "focused+curious": "The Insight Hunter",
    "focused+determined": "The Relentless Builder",
    "focused+social": "The Inspiring Leader",
    "focused+reflective": "The Deep Thinker",
    "creative+calm": "The Imaginative Sage",
    "creative+energetic": "The Bold Innovator",
    "creative+curious": "The Boundary Pusher",
    "creative+determined": "The Purposeful Creator",
    "creative+social": "The Collaborative Visionary",
    "creative+reflective": "The Introspective Artist",
    "calm+energetic": "The Balanced Dynamo",
    "calm+curious": "The Thoughtful Explorer",
    "calm+determined": "The Steady Achiever",
    "calm+social": "The Warm Connector",
    "calm+reflective": "The Serene Philosopher",
    "energetic+curious": "The Adventurous Learner",
    "energetic+determined": "The Force of Nature",
    "energetic+social": "The Life of the Party",
    "energetic+reflective": "The Passionate Observer",
    "curious+determined": "The Driven Investigator",
    "curious+social": "The Curious Networker",
    "curious+reflective": "The Wisdom Seeker",
    "determined+social": "The Charismatic Achiever",
    "determined+reflective": "The Quietly Powerful",
    "social+reflective": "The Thoughtful Connector",
  };
  const key = [mood1, mood2].sort().join("+");
  return names[key] || `${mood1.charAt(0).toUpperCase() + mood1.slice(1)} ${mood2.charAt(0).toUpperCase() + mood2.slice(1)} Blend`;
}

type BlendState = "selecting" | "brewing" | "brewed";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0,200,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export default function MoodMixer() {
  const [selector1, setSelector1] = useState<string | null>(null);
  const [selector2, setSelector2] = useState<string | null>(null);
  const [state, setState] = useState<BlendState>("selecting");
  const [animKey, setAnimKey] = useState(0);
  const brewingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mood1 = MOODS.find(m => m.id === selector1);
  const mood2 = MOODS.find(m => m.id === selector2);
  const bothSelected = selector1 !== null && selector2 !== null;

  useEffect(() => {
    return () => {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
    };
  }, []);

  // When both moods selected → brewing state
  useEffect(() => {
    if (bothSelected && state === "selecting") {
      brewingTimerRef.current = setTimeout(() => {
        setState("brewing");
        setAnimKey(k => k + 1);
        brewingTimerRef.current = setTimeout(() => {
          setState("brewed");
        }, 1600);
      }, 350);
    }
    if (!bothSelected && state !== "selecting") {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
      setState("selecting");
    }
  }, [bothSelected]);

  useEffect(() => {
    const tier = localStorage.getItem("kyr_quiz_tier");
    if (!tier) {
      window.location.href = "/quiz-gateway";
    }
  }, []);

  const handleContinue = () => {
    if (!selector1 || !selector2) return;
    const blendName = getBlendName(selector1, selector2);
    localStorage.setItem("kyr_mood_blend", JSON.stringify({
      mood1: selector1,
      mood2: selector2,
      label: blendName,
    }));
    window.location.href = "/quiz/questions";
  };

  const handleSkip = () => {
    localStorage.removeItem("kyr_mood_blend");
    window.location.href = "/quiz/questions";
  };

  const handleMoodSelect = (moodId: string, side: 1 | 2) => {
    if (state === "brewed" || state === "brewing") return;
    if (side === 1) {
      setSelector1(prev => prev === moodId ? null : moodId);
    } else {
      setSelector2(prev => prev === moodId ? null : moodId);
    }
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes blendMeldLeft {
          0% { transform: translateX(-70px) scale(1); opacity: 1; }
          50% { transform: translateX(0px) scale(1.2); opacity: 1; }
          100% { transform: translateX(0px) scale(1.15); opacity: 1; }
        }
        @keyframes blendMeldRight {
          0% { transform: translateX(70px) scale(1); opacity: 1; }
          50% { transform: translateX(0px) scale(1.2); opacity: 1; }
          100% { transform: translateX(0px) scale(1.15); opacity: 1; }
        }
        @keyframes plusAppear {
          0% { opacity: 0; transform: scale(0) rotate(-90deg); }
          60% { opacity: 1; transform: scale(1.4) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes sparkleBurst {
          0% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          40% { opacity: 1; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(2) rotate(360deg); }
        }
        @keyframes resultReveal {
          0% { opacity: 0; transform: translateY(50px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes continueFade {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,200,255,0.3), 0 0 80px rgba(120,0,255,0.2); }
          50% { box-shadow: 0 0 50px rgba(0,200,255,0.5), 0 0 100px rgba(120,0,255,0.35); }
        }
        @keyframes emojiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>

      <AppHeader />

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "10%", left: "15%", width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,255,0.12) 0%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(120,0,255,0.15) 0%, transparent 70%)",
          animation: "orbFloat 10s ease-in-out infinite reverse",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "60%", width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(255,0,229,0.1) 0%, transparent 70%)",
          animation: "orbFloat 7s ease-in-out infinite 2s",
        }} />
      </div>

      {/* Header breadcrumb */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => history.back()} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.6)",
          cursor: "pointer", fontSize: 20, padding: 8, borderRadius: 8,
          fontFamily: "'Outfit',sans-serif",
        }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#7800FF", letterSpacing: "0.1em" }}>STEP 2 OF 3</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.08)", zIndex: 50 }}>
        <div style={{
          width: state === "brewed" ? "100%" : state === "brewing" ? "75%" : "50%",
          height: "100%",
          background: "linear-gradient(90deg, #7800FF, #FF00E5)",
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Main content */}
      <div style={{
        padding: "clamp(90px, 15vw, 120px) clamp(16px, 4vw, 48px) 160px",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 760, width: "100%" }}>

          {/* Page title */}
          <div style={{ textAlign: "center", marginBottom: 32, animation: "slideUp 0.6s ease forwards" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
              textTransform: "uppercase", color: "#FF00E5", textAlign: "center", marginBottom: 10,
            }}>Set Your Vibe</p>
            <h1 style={{
              fontSize: "clamp(1.8rem, 6vw, 3rem)", fontWeight: 900,
              letterSpacing: "-0.03em", textAlign: "center", marginBottom: 12,
              fontFamily: "'Outfit',sans-serif",
            }}>
              Mood Mixer
            </h1>
            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center",
              maxWidth: 460, margin: "0 auto",
            }}>
              {state === "brewed"
                ? "Your blend is ready. Time to discover who you are."
                : "Select two moods to blend. Your combination shapes how your personality is revealed."}
            </p>
          </div>

          {/* ─── BREWING ANIMATION ─── */}
          {state === "brewing" && mood1 && mood2 && (
            <div key={animKey} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              marginBottom: 32,
            }}>
              {/* Center blend area */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 0, position: "relative", marginBottom: 28,
                minHeight: 90,
              }}>
                {/* Mood 1 pill - moves right */}
                <div style={{
                  background: `rgba(${hexToRgb(mood1.color)}, 0.18)`,
                  border: `2px solid ${mood1.color}`,
                  borderRadius: 50,
                  padding: "14px 26px",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: `0 0 25px ${mood1.glow}`,
                  animation: "blendMeldLeft 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                  fontFamily: "'Outfit',sans-serif",
                }}>
                  <span style={{ fontSize: "1.6rem", filter: `drop-shadow(0 0 8px ${mood1.color})` }}>{mood1.emoji}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: mood1.color }}>{mood1.label}</span>
                </div>

                {/* Plus sign */}
                <div style={{
                  width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem", fontWeight: 900, color: "#fff",
                  animation: "plusAppear 0.35s ease 0.4s both",
                  position: "relative", zIndex: 2,
                }}>
                  +
                </div>

                {/* Mood 2 pill - moves left */}
                <div style={{
                  background: `rgba(${hexToRgb(mood2.color)}, 0.18)`,
                  border: `2px solid ${mood2.color}`,
                  borderRadius: 50,
                  padding: "14px 26px",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: `0 0 25px ${mood2.glow}`,
                  animation: "blendMeldRight 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                  fontFamily: "'Outfit',sans-serif",
                }}>
                  <span style={{ fontSize: "1.6rem", filter: `drop-shadow(0 0 8px ${mood2.color})` }}>{mood2.emoji}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: mood2.color }}>{mood2.label}</span>
                </div>

                {/* Sparkle particles */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 0, height: 0 }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: i % 2 === 0 ? 5 : 3,
                      height: i % 2 === 0 ? 5 : 3,
                      borderRadius: "50%",
                      background: i % 2 === 0 ? mood1.color : mood2.color,
                      animation: `sparkleBurst 0.9s ease ${0.45 + i * 0.06}s both`,
                      boxShadow: `0 0 6px ${i % 2 === 0 ? mood1.color : mood2.color}`,
                      transform: `rotate(${i * 36}deg) translateX(50px)`,
                    }} />
                  ))}
                </div>
              </div>

              {/* "Blending..." text */}
              <p style={{
                fontSize: 14, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
                fontFamily: "'Outfit',sans-serif",
                animation: "fadeInScale 0.4s ease 0.5s both",
              }}>
                Blending your vibes...
              </p>
            </div>
          )}

          {/* ─── BREWED RESULT CARD ─── */}
          {state === "brewed" && mood1 && mood2 && (
            <div style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 32,
              padding: "clamp(24px, 5vw, 40px)",
              marginBottom: 32,
              textAlign: "center",
              animation: "resultReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              boxShadow: "0 0 60px rgba(0,200,255,0.2), 0 0 120px rgba(120,0,255,0.15)",
            }}>
              {/* Blend emoji pair */}
              <div style={{
                fontSize: "3.5rem", marginBottom: 16,
                animation: "fadeInScale 0.4s ease 0.1s both",
                filter: "drop-shadow(0 0 15px rgba(0,200,255,0.5))",
              }}>
                {mood1.emoji} + {mood2.emoji}
              </div>

              {/* Blend name */}
              <div style={{
                fontSize: "clamp(1.4rem, 5vw, 2.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                background: "linear-gradient(90deg, #00C8FF, #7800FF, #FF00E5, #00C8FF)",
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Outfit',sans-serif",
                animation: "shimmer 3s linear infinite, fadeInScale 0.4s ease 0.2s both",
                marginBottom: 8,
              }}>
                {getBlendName(mood1.id, mood2.id)}
              </div>

              {/* Mood labels */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, marginBottom: 20, animation: "fadeInScale 0.4s ease 0.3s both",
              }}>
                <span style={{
                  background: `rgba(${hexToRgb(mood1.color)}, 0.15)`,
                  border: `1px solid ${mood1.color}40`,
                  borderRadius: 50, padding: "4px 14px",
                  fontSize: 12, fontWeight: 700, color: mood1.color,
                  fontFamily: "'Outfit',sans-serif",
                }}>{mood1.label}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>✦</span>
                <span style={{
                  background: `rgba(${hexToRgb(mood2.color)}, 0.15)`,
                  border: `1px solid ${mood2.color}40`,
                  borderRadius: 50, padding: "4px 14px",
                  fontSize: 12, fontWeight: 700, color: mood2.color,
                  fontFamily: "'Outfit',sans-serif",
                }}>{mood2.label}</span>
              </div>

              {/* Trait preview */}
              <p style={{
                fontSize: 14, color: "rgba(255,255,255,0.5)",
                fontFamily: "'Outfit',sans-serif",
                animation: "fadeInScale 0.4s ease 0.4s both",
                maxWidth: 360, margin: "0 auto",
              }}>
                A fusion of <span style={{ color: mood1.color }}>{mood1.label.toLowerCase()}</span> energy and{" "}
                <span style={{ color: mood2.color }}>{mood2.label.toLowerCase()}</span> spirit.
                This blend will shape how your personality is revealed.
              </p>

              {/* Continue button */}
              <button
                onClick={handleContinue}
                style={{
                  marginTop: 24,
                  padding: "16px 40px",
                  background: "linear-gradient(90deg, #00C8FF, #7800FF)",
                  border: "none",
                  borderRadius: 50,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  boxShadow: "0 0 40px rgba(0,200,255,0.4), 0 4px 20px rgba(0,0,0,0.3)",
                  transition: "all 0.25s ease",
                  animation: "continueFade 0.5s ease 0.6s both",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 60px rgba(0,200,255,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(0,200,255,0.4), 0 4px 20px rgba(0,0,0,0.3)";
                }}
              >
                Continue with Your Blend →
              </button>
            </div>
          )}

          {/* ─── MOOD SELECTORS (hidden when brewed) ─── */}
          {state !== "brewed" && (
            <>
              {/* Blend preview pill (selecting/brewing) */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: bothSelected
                  ? "1px solid rgba(0,200,255,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 28,
                padding: "clamp(20px, 4vw, 32px)",
                marginBottom: 32,
                textAlign: "center",
                transition: "all 0.4s ease",
                animation: bothSelected && state !== "brewing" ? "glowPulse 2.5s ease-in-out infinite" : "none",
                ...(state === "brewing" ? { opacity: 0, transform: "scale(0.95)" } : { opacity: 1 }),
                pointerEvents: state === "brewing" ? "none" : "auto",
              }}>
                <div style={{
                  fontSize: "clamp(2.5rem, 7vw, 4rem)",
                  marginBottom: 10,
                  transition: "all 0.4s ease",
                  filter: bothSelected ? "drop-shadow(0 0 20px rgba(0,200,255,0.5))" : "none",
                  animation: bothSelected && state !== "brewing" ? "emojiPulse 2s ease-in-out infinite" : "none",
                }}>
                  {mood1 && mood2
                    ? `${mood1.emoji} + ${mood2.emoji}`
                    : mood1
                    ? `${mood1.emoji} + ?`
                    : "? + ?"}
                </div>
                <div style={{
                  fontSize: "clamp(1rem, 3vw, 1.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: bothSelected ? "#fff" : "rgba(255,255,255,0.25)",
                  fontFamily: "'Outfit',sans-serif",
                  transition: "color 0.3s",
                }}>
                  {mood1 && mood2
                    ? `${mood1.label} + ${mood2.label}`
                    : mood1
                    ? `${mood1.label} + Select one more`
                    : "Select two moods below"}
                </div>
                {bothSelected && state !== "brewing" && (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                    Your blend is brewing — just a moment!
                  </p>
                )}
                {!bothSelected && (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                    Pick one mood from each column
                  </p>
                )}
              </div>

              {/* Mood Selectors */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 20,
                marginBottom: 32,
                ...(state === "brewing" ? { opacity: 0.3, pointerEvents: "none" } : {}),
                transition: "opacity 0.4s ease",
              }}>
                {/* Selector 1 */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: "#00C8FF",
                    marginBottom: 12, fontFamily: "'Outfit',sans-serif",
                  }}>
                    {mood1 ? `${mood1.label} ✓` : "Mood 1"}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MOODS.map(mood => {
                      const isActive = selector1 === mood.id;
                      const isUsed = selector2 === mood.id;
                      return (
                        <button
                          key={`s1-${mood.id}`}
                          onClick={() => handleMoodSelect(mood.id, 1)}
                          style={{
                            background: isActive
                              ? `rgba(${hexToRgb(mood.color)}, 0.18)`
                              : "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: isActive
                              ? `2px solid ${mood.color}`
                              : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            padding: "14px 16px",
                            cursor: isUsed ? "not-allowed" : "pointer",
                            textAlign: "left",
                            transition: "all 0.25s ease",
                            opacity: isUsed ? 0.3 : 1,
                            boxShadow: isActive ? `0 0 25px ${mood.glow}` : "none",
                            fontFamily: "'Outfit',sans-serif",
                            minHeight: 48,
                          }}
                          onMouseEnter={e => {
                            if (!isUsed && !isActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isUsed && !isActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: "1.4rem",
                              filter: isActive ? `drop-shadow(0 0 8px ${mood.color})` : "none",
                              transition: "all 0.3s"
                            }}>{mood.emoji}</span>
                            <div>
                              <div style={{
                                fontSize: 13, fontWeight: 700,
                                color: isActive ? mood.color : "#fff",
                                fontFamily: "'Outfit',sans-serif"
                              }}>{mood.label}</div>
                              <div style={{
                                fontSize: 10, color: "rgba(255,255,255,0.35)",
                                fontFamily: "'Outfit',sans-serif"
                              }}>{mood.desc}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selector 2 */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: "#FF00E5",
                    marginBottom: 12, fontFamily: "'Outfit',sans-serif",
                  }}>
                    {mood2 ? `${mood2.label} ✓` : "Mood 2"}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MOODS.map(mood => {
                      const isActive = selector2 === mood.id;
                      const isUsed = selector1 === mood.id;
                      return (
                        <button
                          key={`s2-${mood.id}`}
                          onClick={() => handleMoodSelect(mood.id, 2)}
                          style={{
                            background: isActive
                              ? `rgba(${hexToRgb(mood.color)}, 0.18)`
                              : "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: isActive
                              ? `2px solid ${mood.color}`
                              : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            padding: "14px 16px",
                            cursor: isUsed ? "not-allowed" : "pointer",
                            textAlign: "left",
                            transition: "all 0.25s ease",
                            opacity: isUsed ? 0.3 : 1,
                            boxShadow: isActive ? `0 0 25px ${mood.glow}` : "none",
                            fontFamily: "'Outfit',sans-serif",
                            minHeight: 48,
                          }}
                          onMouseEnter={e => {
                            if (!isUsed && !isActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isUsed && !isActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: "1.4rem",
                              filter: isActive ? `drop-shadow(0 0 8px ${mood.color})` : "none",
                              transition: "all 0.3s"
                            }}>{mood.emoji}</span>
                            <div>
                              <div style={{
                                fontSize: 13, fontWeight: 700,
                                color: isActive ? mood.color : "#fff",
                                fontFamily: "'Outfit',sans-serif"
                              }}>{mood.label}</div>
                              <div style={{
                                fontSize: 10, color: "rgba(255,255,255,0.35)",
                                fontFamily: "'Outfit',sans-serif"
                              }}>{mood.desc}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Bottom action bar — only in selecting/brewing states */}
      {state !== "brewed" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px clamp(16px, 4vw, 48px)",
          background: "rgba(5,5,16,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, zIndex: 50,
        }}>
          <button
            onClick={handleSkip}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "'Outfit',sans-serif",
              padding: "10px 4px",
              transition: "color 0.2s",
              minHeight: 44,
            }}
          >
            Skip this step →
          </button>

          <div style={{
            padding: "14px 32px",
            background: bothSelected
              ? "linear-gradient(90deg, #00C8FF, #7800FF)"
              : "rgba(255,255,255,0.1)",
            borderRadius: 50,
            color: bothSelected ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: 700, fontSize: 14,
            fontFamily: "'Outfit',sans-serif",
            boxShadow: bothSelected ? "0 0 30px rgba(0,200,255,0.35)" : "none",
            transition: "all 0.25s ease",
            minHeight: 44,
          }}>
            {state === "brewing" ? "Brewing..." : bothSelected ? "Save Blend" : "Select two moods"}
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}