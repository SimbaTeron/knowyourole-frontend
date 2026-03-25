import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";

const MOODS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#00C8FF", glow: "rgba(0,200,255,0.6)", desc: "Sharp and analytical" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glow: "rgba(167,139,250,0.6)", desc: "Imaginative and free" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glow: "rgba(96,165,250,0.6)", desc: "Peaceful and centered" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glow: "rgba(251,191,36,0.6)", desc: "Full of vibrant energy" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glow: "rgba(244,114,182,0.6)", desc: "Always exploring" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glow: "rgba(248,113,113,0.6)", desc: "Driven and relentless" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glow: "rgba(52,211,153,0.6)", desc: "Connected and warm" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#818CF8", glow: "rgba(129,140,248,0.6)", desc: "Thoughtful and inward" },
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

function getOrbPosition(index: number, total: number, centerX: number, centerY: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
function SwirlBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "5%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)",
        animation: "blob1 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "5%",
        width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,0,255,0.13) 0%, transparent 70%)",
        animation: "blob2 18s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "55%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,0,229,0.08) 0%, transparent 70%)",
        animation: "blob3 12s ease-in-out infinite 3s",
      }} />
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(50px,-35px) scale(1.08)} 70%{transform:translate(-35px,25px) scale(0.97)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-55px,35px) scale(1.06)} 70%{transform:translate(40px,-25px) scale(1.1)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-45px,-45px) scale(1.12)} }
      `}</style>
    </div>
  );
}

// ─── CENTER HINT ─────────────────────────────────────────────────────────────
function CenterHint({ hasOne }: { hasOne: boolean }) {
  return (
    <motion.div
      key={hasOne ? "one" : "zero"}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0.35, 0.65, 0.35], scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 100,
        height: 100,
        borderRadius: "50%",
        border: "2px dashed rgba(255,255,255,0.13)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        color: "rgba(255,255,255,0.28)",
        textAlign: "center",
        lineHeight: 1.3,
        fontFamily: "'Outfit',sans-serif",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {hasOne ? "Tap second mood" : "Tap first mood"}
    </motion.div>
  );
}

// ─── SELECTED PILL ───────────────────────────────────────────────────────────
function SelectedPill({ mood, offset }: { mood: typeof MOODS[0]; offset: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: offset }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0, x: offset }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        position: "absolute",
        left: "50%",
        top: offset === 0 ? "43%" : "57%",
        transform: "translate(-50%, -50%)",
        background: `${mood.color}22`,
        border: `2px solid ${mood.color}90`,
        borderRadius: 50,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Outfit',sans-serif",
        boxShadow: `0 0 24px ${mood.color}45`,
        zIndex: 15,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "1.4rem", filter: `drop-shadow(0 0 6px ${mood.color})` }}>{mood.emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: mood.color }}>{mood.label}</span>
    </motion.div>
  );
}

// ─── BREWING SWIRL ───────────────────────────────────────────────────────────
function CenterSwirl({ mood1, mood2 }: { mood1: typeof MOODS[0]; mood2: typeof MOODS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.4, ease: "backOut" }}
      style={{
        position: "relative",
        width: 180,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {/* Outer spinning ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1], repeat: 0 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `2px solid rgba(255,255,255,0.12)`,
        }}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 86;
          const y = Math.sin(rad) * 86;
          const dotColor = i % 2 === 0 ? mood1.color : mood2.color;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(${x - 5}px, ${y - 5}px)`,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: dotColor,
                boxShadow: `0 0 14px ${dotColor}`,
              }}
            />
          );
        })}
      </motion.div>

      {/* Counter-rotating dashed ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.2, ease: "linear", repeat: 0 }}
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: "50%",
          border: `1.5px dashed rgba(255,255,255,0.18)`,
        }}
      />

      {/* Inner glow ring */}
      <div style={{
        position: "absolute",
        inset: 48,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${mood1.color}35 0%, ${mood2.color}25 50%, transparent 100%)`,
        animation: "cpulse 1s ease-in-out infinite",
      }} />

      {/* Emojis */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex",
        gap: 6,
        filter: `drop-shadow(0 0 14px ${mood1.color}80)`,
      }}>
        <motion.span animate={{ rotate: [0, -20, 0] }} transition={{ duration: 0.5, delay: 0.3 }} style={{ fontSize: "2.2rem" }}>{mood1.emoji}</motion.span>
        <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ duration: 0.5, delay: 0.3 }} style={{ fontSize: "2.2rem" }}>{mood2.emoji}</motion.span>
      </div>

      <style>{`@keyframes cpulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.2);opacity:1} }`}</style>
    </motion.div>
  );
}

// ─── MOOD ORB ────────────────────────────────────────────────────────────────
function MoodOrb({
  mood,
  index,
  total,
  isSelected,
  isOtherSelected,
  onTap,
  onPreview,
  orbRef,
}: {
  mood: typeof MOODS[0];
  index: number;
  total: number;
  isSelected: boolean;
  isOtherSelected: boolean;
  onTap: () => void;
  onPreview: () => void;
  orbRef: React.RefCallback<HTMLButtonElement>;
}) {
  return (
    <motion.button
      ref={orbRef}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.07, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={!isOtherSelected ? { scale: 1.18 } : {}}
      whileTap={!isOtherSelected ? { scale: 0.9 } : {}}
      onClick={onTap}
      onPointerDown={onPreview}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: isSelected
          ? `radial-gradient(circle at 35% 35%, ${mood.color}50, ${mood.color}25)`
          : "rgba(255,255,255,0.07)",
        border: isSelected
          ? `2.5px solid ${mood.color}`
          : "2px solid rgba(255,255,255,0.13)",
        boxShadow: isSelected
          ? `0 0 35px ${mood.glow}, 0 0 70px ${mood.glow}40`
          : "0 6px 24px rgba(0,0,0,0.5)",
        cursor: isOtherSelected ? "not-allowed" : "pointer",
        opacity: isOtherSelected ? 0.28 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        fontFamily: "'Outfit',sans-serif",
        zIndex: isSelected ? 10 : 5,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        touchAction: "manipulation",
      }}
    >
      <span style={{
        fontSize: "2.4rem",
        filter: isSelected ? `drop-shadow(0 0 10px ${mood.color})` : "none",
        transition: "filter 0.3s",
        lineHeight: 1,
      }}>{mood.emoji}</span>
      <span style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        color: isSelected ? mood.color : "rgba(255,255,255,0.55)",
        letterSpacing: "0.04em",
        transition: "color 0.3s",
      }}>{mood.label}</span>
    </motion.button>
  );
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
function ResultCard({ mood1, mood2, onContinue, onReset }: {
  mood1: typeof MOODS[0];
  mood2: typeof MOODS[0];
  onContinue: () => void;
  onReset: () => void;
}) {
  const blendName = getBlendName(mood1.id, mood2.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 22, delay: 0.08 }}
      style={{
        background: "rgba(8,5,24,0.9)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1.5px solid rgba(255,255,255,0.14)",
        borderRadius: 32,
        padding: "clamp(28px, 6vw, 48px)",
        textAlign: "center",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        boxShadow: `0 0 80px ${mood1.color}28, 0 0 120px ${mood2.color}18, 0 30px 80px rgba(0,0,0,0.65)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer rim */}
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 33,
        background: `linear-gradient(135deg, ${mood1.color}35, transparent 40%, transparent 60%, ${mood2.color}35)`,
        zIndex: -1,
      }} />

      {/* Sparkles */}
      <div style={{ position: "absolute", top: 16, right: 20 }}>
        <Sparkles size={20} color="#FBBF24" style={{ filter: "drop-shadow(0 0 6px #FBBF24)" }} />
      </div>
      <div style={{ position: "absolute", top: 22, left: 22 }}>
        <Sparkles size={14} color={mood1.color} style={{ filter: `drop-shadow(0 0 6px ${mood1.color})` }} />
      </div>

      {/* Emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.22 }}
        style={{
          fontSize: "4rem",
          marginBottom: 16,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          filter: `drop-shadow(0 0 18px ${mood1.color}70)`,
        }}
      >
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}>{mood1.emoji}</motion.span>
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.25 }}>{mood2.emoji}</motion.span>
      </motion.div>

      {/* Blend name */}
      <div style={{
        fontSize: "clamp(1.5rem, 6vw, 2.4rem)",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "'Outfit',sans-serif",
        marginBottom: 14,
        lineHeight: 1.2,
      }}>
        {blendName}
      </div>

      {/* Mood pills */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
        <span style={{
          background: `${mood1.color}18`,
          border: `1px solid ${mood1.color}45`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood1.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood1.label}</span>
        <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 14 }}>✦</span>
        <span style={{
          background: `${mood2.color}18`,
          border: `1px solid ${mood2.color}45`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.48)",
        fontFamily: "'Outfit',sans-serif",
        maxWidth: 330,
        margin: "0 auto 26px",
        lineHeight: 1.65,
      }}>
        A fusion of{" "}
        <span style={{ color: mood1.color }}>{mood1.label.toLowerCase()}</span>{" "}
        energy and{" "}
        <span style={{ color: mood2.color }}>{mood2.label.toLowerCase()}</span>{" "}
        spirit. This blend shapes how your personality is revealed.
      </p>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "17px 32px",
            background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
            border: "none",
            borderRadius: 50,
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 0 45px ${mood1.color}38`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "0.01em",
          }}
        >
          Continue with Your Blend
          <ArrowRight size={19} />
        </motion.button>

        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.32)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.32)")}
        >
          <RotateCcw size={14} />
          Try different moods
        </button>
      </div>
    </motion.div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function MoodMixer() {
  const [selector1, setSelector1] = useState<string | null>(null);
  const [selector2, setSelector2] = useState<string | null>(null);
  const [state, setState] = useState<BlendState>("selecting");
  const [previewMood, setPreviewMood] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const brewingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbRefs = useRef<any[]>([]);

  const mood1 = MOODS.find(m => m.id === selector1);
  const mood2 = MOODS.find(m => m.id === selector2);
  const bothSelected = selector1 !== null && selector2 !== null;
  const hasOne = selector1 !== null && selector2 === null;

  useEffect(() => {
    return () => {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const tier = localStorage.getItem("kyr_quiz_tier");
    if (!tier) window.location.href = "/quiz-gateway";
  }, []);

  // Brewing sequence
  useEffect(() => {
    if (bothSelected && state === "selecting") {
      setState("brewing");
      brewingTimerRef.current = setTimeout(() => {
        setState("brewed");
      }, 1900);
    }
    if (!bothSelected && state !== "selecting") {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
      setState("selecting");
      setPreviewMood(null);
    }
  }, [bothSelected]);

  const showOrbs = state === "selecting";
  const showBrewing = state === "brewing" && mood1 && mood2;
  const showResult = state === "brewed" && mood1 && mood2;

  // ─── TAP HANDLERS ──────────────────────────────────────────────────────────
  const handleMoodTap = (moodId: string) => {
    if (state === "brewing" || state === "brewed") return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPreviewMood(null);

    if (selector1 === null) {
      setSelector1(moodId);
    } else if (selector2 === null) {
      if (selector1 !== moodId) {
        setSelector2(moodId);
      }
    } else {
      // Both already selected — reset and select new
      setSelector1(moodId);
      setSelector2(null);
    }
  };

  const handlePreview = (moodId: string, index: number) => {
    if (state === "brewing" || state === "brewed") return;
    if (selector1 === moodId || selector2 === moodId) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    const orbEl = orbRefs.current[index];
    if (orbEl) {
      const rect = orbEl.getBoundingClientRect();
      setPreviewPos({ x: rect.left + rect.width / 2, y: rect.top });
    }

    setPreviewMood(moodId);
    previewTimerRef.current = setTimeout(() => {
      setPreviewMood(null);
    }, 1600);
  };

  const handleDismissPreview = () => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPreviewMood(null);
  };

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

  const handleReset = () => {
    if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
    setSelector1(null);
    setSelector2(null);
    setState("selecting");
    setPreviewMood(null);
  };

  // Layout math
  const getLayout = () => {
    if (typeof window === "undefined") return { cx: 400, cy: 300, r: 160 };
    const isMobile = window.innerWidth < 640;
    const cx = window.innerWidth / 2;
    const cy = isMobile ? 300 : 310;
    const r = isMobile ? 130 : 170;
    return { cx, cy, r };
  };
  const { cx, cy, r } = getLayout();

  const previewMoodData = MOODS.find(m => m.id === previewMood);

  return (
    <div style={{
      background: "#050510",
      minHeight: "100vh",
      fontFamily: "'Outfit',sans-serif",
      color: "#fff",
      overflowX: "hidden",
      position: "relative",
    }}>
      <SwirlBg />

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button
          onClick={() => history.back()}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer", fontSize: 20,
            padding: 8, borderRadius: 8,
            fontFamily: "'Outfit',sans-serif",
            display: "flex", alignItems: "center",
          }}
        >←</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#7800FF", letterSpacing: "0.12em" }}>STEP 2 OF 3</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 57, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 50 }}>
        <motion.div
          animate={{
            width: showResult ? "100%" : showBrewing ? "75%" : "50%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ height: "100%", background: "linear-gradient(90deg, #7800FF, #FF00E5)" }}
        />
      </div>

      {/* Page title */}
      <div style={{ padding: "clamp(80px, 12vw, 110px) 24px 0", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
          textTransform: "uppercase", color: "#FF00E5",
          marginBottom: 8,
        }}>
          Set Your Vibe
        </p>
        <h1 style={{
          fontSize: "clamp(1.9rem, 7vw, 3rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          marginBottom: 10,
        }}>
          Mood Mixer
        </h1>
        <p style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.42)",
          maxWidth: 380,
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          {showResult
            ? "Your blend is ready. Time to discover who you are."
            : "Tap two moods to brew your unique blend."}
        </p>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 180 }}>
        {/* ORBS */}
        <AnimatePresence>
          {showOrbs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "relative",
                height: typeof window !== "undefined" && window.innerWidth < 640 ? 460 : 480,
              }}
            >
              {/* Center hint */}
              <AnimatePresence>
                {!bothSelected && <CenterHint hasOne={hasOne} />}
              </AnimatePresence>

              {/* Selected mood pills */}
              <AnimatePresence>
                {mood1 && <SelectedPill mood={mood1} offset={0} />}
                {mood2 && <SelectedPill mood={mood2} offset={1} />}
              </AnimatePresence>

              {/* Preview popup — anchored near orb */}
              <AnimatePresence>
                {previewMood && previewMoodData && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "backOut" }}
                    style={{
                      position: "fixed",
                      left: Math.min(Math.max(previewPos.x, 90), (typeof window !== "undefined" ? window.innerWidth : 800) - 90),
                      top: Math.max(previewPos.y - 10, 70),
                      transform: "translate(-50%, -100%)",
                      background: "rgba(8,5,22,0.96)",
                      backdropFilter: "blur(28px)",
                      WebkitBackdropFilter: "blur(28px)",
                      border: `1.5px solid ${previewMoodData.color}50`,
                      borderRadius: 20,
                      padding: "14px 18px",
                      minWidth: 190,
                      zIndex: 200,
                      boxShadow: `0 0 40px ${previewMoodData.glow}, 0 16px 50px rgba(0,0,0,0.7)`,
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    {/* Arrow */}
                    <div style={{
                      position: "absolute",
                      bottom: -7,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 14,
                      height: 14,
                      background: "rgba(8,5,22,0.96)",
                      borderRight: `1.5px solid ${previewMoodData.color}50`,
                      borderBottom: `1.5px solid ${previewMoodData.color}50`,
                      borderRadius: "0 0 4px 0",
                      rotate: "45deg",
                    }} />
                    <div style={{ fontSize: "2.2rem", marginBottom: 8, filter: `drop-shadow(0 0 10px ${previewMoodData.color})` }}>
                      {previewMoodData.emoji}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: previewMoodData.color, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>
                      {previewMoodData.label}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit',sans-serif" }}>
                      {previewMoodData.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mood orbs */}
              {MOODS.map((mood, i) => {
                const pos = getOrbPosition(i, MOODS.length, cx, cy, r);
                return (
                  <div
                    key={mood.id}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <MoodOrb
                      mood={mood}
                      index={i}
                      total={MOODS.length}
                      isSelected={selector1 === mood.id || selector2 === mood.id}
                      isOtherSelected={selector1 !== null && selector1 !== mood.id && selector2 === null}
                      onTap={() => handleMoodTap(mood.id)}
                      onPreview={() => handlePreview(mood.id, i)}
                      orbRef={el => { orbRefs.current[i] = el; }}
                    />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BREWING */}
        <AnimatePresence>
          {showBrewing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                paddingTop: 10,
              }}
            >
              <CenterSwirl mood1={mood1} mood2={mood2} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Brewing your vibe...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT */}
        <div style={{ padding: "0 clamp(16px, 5vw, 48px)", marginTop: 32 }}>
          <AnimatePresence>
            {showResult && (
              <ResultCard
                mood1={mood1!}
                mood2={mood2!}
                onContinue={handleContinue}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar */}
      <AnimatePresence>
        {showOrbs && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px clamp(16px, 5vw, 48px) 28px",
              background: "rgba(5,5,16,0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              zIndex: 50,
            }}
          >
            <button
              onClick={handleSkip}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.28)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                padding: "10px 4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
            >
              Skip this step →
            </button>

            <motion.div
              animate={{
                background: bothSelected
                  ? "linear-gradient(90deg, #00C8FF, #7800FF)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: bothSelected ? "0 0 32px rgba(0,200,255,0.42)" : "none",
              }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "14px 30px",
                borderRadius: 50,
                color: bothSelected ? "#fff" : "rgba(255,255,255,0.3)",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "'Outfit',sans-serif",
                minWidth: 160,
                textAlign: "center",
              }}
            >
              {!selector1 ? "Select 2 moods" : !selector2 ? "Select 1 more mood" : "Blend Ready"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppFooter />
    </div>
  );
}
