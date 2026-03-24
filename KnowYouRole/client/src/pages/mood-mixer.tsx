import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const MOOD_OPTIONS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#00C8FF", glow: "rgba(0,200,255,0.4)", desc: "Sharp and analytical" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glow: "rgba(167,139,250,0.4)", desc: "Imaginative and free" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glow: "rgba(96,165,250,0.4)", desc: "Peaceful and centered" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glow: "rgba(251,191,36,0.4)", desc: "Full of vibrant energy" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glow: "rgba(244,114,182,0.4)", desc: "Always exploring" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glow: "rgba(248,113,113,0.4)", desc: "Driven and relentless" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glow: "rgba(52,211,153,0.4)", desc: "Connected and warm" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#818CF8", glow: "rgba(129,140,248,0.4)", desc: "Thoughtful and inward" },
];

export default function MoodMixer() {
  const [selector1, setSelector1] = useState<string | null>(null);
  const [selector2, setSelector2] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Read tier from localStorage (set by quiz-gateway)
    const tier = localStorage.getItem("kyr_quiz_tier");
    if (!tier) {
      // If no tier, redirect back to gateway
      window.location.href = "/quiz-gateway";
    }
  }, []);

  const mood1 = MOOD_OPTIONS.find(m => m.id === selector1);
  const mood2 = MOOD_OPTIONS.find(m => m.id === selector2);
  const hasBlend = selector1 !== null || selector2 !== null;

  const getBlendName = () => {
    if (selector1 && selector2) return `${mood1?.label} + ${mood2?.label}`;
    if (selector1) return mood1?.label || "";
    if (selector2) return mood2?.label || "";
    return "";
  };

  const getBlendEmoji = () => {
    if (selector1 && selector2) return `${mood1?.emoji} ${mood2?.emoji}`;
    if (selector1) return mood1?.emoji || "";
    if (selector2) return mood2?.emoji || "";
    return "✨";
  };

  const handleSaveBlend = () => {
    const blend = {
      mood1: selector1,
      mood2: selector2,
      label: getBlendName(),
      emoji: getBlendEmoji(),
    };
    localStorage.setItem("kyr_mood_blend", JSON.stringify(blend));
    setAnimating(true);
    setTimeout(() => {
      window.location.href = "/quiz/questions";
    }, 400);
  };

  const handleSkip = () => {
    localStorage.removeItem("kyr_mood_blend");
    window.location.href = "/quiz/questions";
  };

  return (
    <div style={{ background: "#050510", minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,200,255,0.2), 0 0 60px rgba(120,0,255,0.1); }
          50% { box-shadow: 0 0 40px rgba(0,200,255,0.4), 0 0 80px rgba(120,0,255,0.25); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blendPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
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
        <div style={{ width: "50%", height: "100%", background: "linear-gradient(90deg, #7800FF, #FF00E5)" }} />
      </div>

      {/* Main content */}
      <div style={{
        padding: "clamp(90px, 15vw, 120px) clamp(16px, 4vw, 48px) 160px",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "100vh", position: "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 760, width: "100%" }}>

          {/* Page title */}
          <div style={{ textAlign: "center", marginBottom: 40, animation: "slideUp 0.6s ease forwards" }}>
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
              Select two moods to blend. Your combination shapes how your personality is revealed.
            </p>
          </div>

          {/* Blend preview card */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 28,
            padding: "clamp(20px, 4vw, 32px)",
            marginBottom: 32,
            textAlign: "center",
            animation: "pulseGlow 4s ease-in-out infinite",
            transition: "all 0.4s ease",
            ...(hasBlend ? {
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(0,200,255,0.3)",
            } : {}),
          }}>
            {/* Blend emoji */}
            <div style={{
              fontSize: "clamp(3rem, 8vw, 5rem)",
              marginBottom: 12,
              transition: "all 0.4s ease",
              animation: hasBlend ? "float 3s ease-in-out infinite" : "none",
              filter: hasBlend ? "drop-shadow(0 0 20px rgba(0,200,255,0.5))" : "none",
            }}>
              {getBlendEmoji()}
            </div>

            {/* Blend label */}
            <div style={{
              fontSize: "clamp(1.2rem, 4vw, 2rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: hasBlend
                ? "linear-gradient(90deg, #00C8FF, #7800FF, #FF00E5)"
                : "rgba(255,255,255,0.15)",
              WebkitBackgroundClip: hasBlend ? "text" : undefined,
              WebkitTextFillColor: hasBlend ? "transparent" : "rgba(255,255,255,0.3)",
              fontFamily: "'Outfit',sans-serif",
              backgroundSize: hasBlend ? "200% auto" : undefined,
              animation: hasBlend ? "gradientFlow 3s ease infinite" : "none",
            }}>
              {getBlendName() || "Your Mood Blend"}
            </div>

            {hasBlend && (
              <p style={{
                fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8,
                animation: "blendPulse 2s ease-in-out infinite",
              }}>
                {selector1 && selector2
                  ? `A dynamic fusion of ${mood1?.label.toLowerCase()} energy and ${mood2?.label.toLowerCase()} spirit`
                  : `One mood selected — add another for a unique blend`}
              </p>
            )}

            {!hasBlend && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                Select your moods below to create your blend
              </p>
            )}
          </div>

          {/* Mood Selectors */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}>
            {/* Selector 1 */}
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#00C8FF",
                marginBottom: 12, fontFamily: "'Outfit',sans-serif",
              }}>
                {selector1 ? "Mood 1 ✓" : "Mood 1"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOOD_OPTIONS.map(mood => {
                  const isActive = selector1 === mood.id;
                  const isUsed = selector2 === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => {
                        if (isUsed) return;
                        setSelector1(isActive ? null : mood.id);
                      }}
                      disabled={isUsed && !isActive}
                      style={{
                        background: isActive
                          ? `rgba(${hexToRgb(mood.color)}, 0.15)`
                          : "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: isActive
                          ? `2px solid ${mood.color}`
                          : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: "14px 16px",
                        cursor: isUsed && !isActive ? "not-allowed" : "pointer",
                        textAlign: "left",
                        transition: "all 0.25s ease",
                        opacity: isUsed && !isActive ? 0.35 : 1,
                        boxShadow: isActive ? `0 0 20px ${mood.glow}` : "none",
                        fontFamily: "'Outfit',sans-serif",
                        minHeight: 44,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.4rem", filter: isActive ? `drop-shadow(0 0 6px ${mood.color})` : "none", transition: "all 0.3s" }}>{mood.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? mood.color : "#fff", fontFamily: "'Outfit',sans-serif" }}>{mood.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit',sans-serif" }}>{mood.desc}</div>
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
                {selector2 ? "Mood 2 ✓" : "Mood 2"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOOD_OPTIONS.map(mood => {
                  const isActive = selector2 === mood.id;
                  const isUsed = selector1 === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => {
                        if (isUsed) return;
                        setSelector2(isActive ? null : mood.id);
                      }}
                      disabled={isUsed && !isActive}
                      style={{
                        background: isActive
                          ? `rgba(${hexToRgb(mood.color)}, 0.15)`
                          : "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: isActive
                          ? `2px solid ${mood.color}`
                          : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: "14px 16px",
                        cursor: isUsed && !isActive ? "not-allowed" : "pointer",
                        textAlign: "left",
                        transition: "all 0.25s ease",
                        opacity: isUsed && !isActive ? 0.35 : 1,
                        boxShadow: isActive ? `0 0 20px ${mood.glow}` : "none",
                        fontFamily: "'Outfit',sans-serif",
                        minHeight: 44,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.4rem", filter: isActive ? `drop-shadow(0 0 6px ${mood.color})` : "none", transition: "all 0.3s" }}>{mood.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? mood.color : "#fff", fontFamily: "'Outfit',sans-serif" }}>{mood.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit',sans-serif" }}>{mood.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom action bar */}
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

        <button
          onClick={handleSaveBlend}
          style={{
            padding: "14px 32px",
            background: hasBlend
              ? "linear-gradient(90deg, #00C8FF, #7800FF)"
              : "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 50,
            color: hasBlend ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: 700, fontSize: 14,
            cursor: hasBlend ? "pointer" : "not-allowed",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: hasBlend ? "0 0 30px rgba(0,200,255,0.35)" : "none",
            transition: "all 0.25s ease",
            minHeight: 44,
            opacity: animating ? 0.7 : 1,
            transform: animating ? "scale(0.97)" : "scale(1)",
          }}
        >
          {hasBlend ? `Save ${getBlendEmoji()} →` : "Select moods to continue"}
        </button>
      </div>

      <AppFooter />
    </div>
  );
}

// Helper: convert hex color to rgb string for rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0,200,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
