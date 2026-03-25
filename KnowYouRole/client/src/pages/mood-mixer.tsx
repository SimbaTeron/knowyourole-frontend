import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";

const MOODS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#00C8FF", glow: "rgba(0,200,255,0.7)", desc: "Sharp and analytical" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glow: "rgba(167,139,250,0.7)", desc: "Imaginative and free" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glow: "rgba(96,165,250,0.7)", desc: "Peaceful and centered" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glow: "rgba(251,191,36,0.7)", desc: "Full of vibrant energy" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glow: "rgba(244,114,182,0.7)", desc: "Always exploring" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glow: "rgba(248,113,113,0.7)", desc: "Driven and relentless" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glow: "rgba(52,211,153,0.7)", desc: "Connected and warm" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#818CF8", glow: "rgba(129,140,248,0.7)", desc: "Thoughtful and inward" },
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

function getOrbPixelPositions(cx: number, ringTop: number, r: number) {
  return MOODS.map((_, i) => {
    const angle = (i / MOODS.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: ringTop + r * Math.sin(angle),
    };
  });
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
function SwirlBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "5%", left: "8%",
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)",
        animation: "b1 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,0,255,0.12) 0%, transparent 70%)",
        animation: "b2 18s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "35%", left: "55%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,0,229,0.08) 0%, transparent 70%)",
        animation: "b3 12s ease-in-out infinite 3s",
      }} />
      <style>{`
        @keyframes b1 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(48px,-34px) scale(1.07)} 70%{transform:translate(-34px,24px) scale(0.97)} }
        @keyframes b2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-52px,34px) scale(1.06)} 70%{transform:translate(38px,-24px) scale(1.1)} }
        @keyframes b3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-44px,-44px) scale(1.13)} }
      `}</style>
    </div>
  );
}

// ─── CENTER DASHED HINT ──────────────────────────────────────────────────────
function CenterHint({ hasOne }: { hasOne: boolean }) {
  return (
    <motion.div
      key={hasOne ? "one" : "zero"}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: [0.6, 0.9, 0.6], scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 140,
        height: 140,
        borderRadius: "50%",
        border: "2px dashed rgba(255,255,255,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: "rgba(255,255,255,0.65)",
        textAlign: "center",
        lineHeight: 1.3,
        fontFamily: "'Outfit',sans-serif",
        zIndex: 1,
        pointerEvents: "none",
        letterSpacing: "0.04em",
      }}
    >
      {hasOne ? "Tap second mood" : "Tap first mood"}
    </motion.div>
  );
}

// ─── CENTERED PREVIEW MODAL ─────────────────────────────────────────────────
function PreviewModal({ mood, onConfirm, onDismiss }: {
  mood: typeof MOODS[0];
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(8,5,24,0.97)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1.5px solid ${mood.color}55`,
          borderRadius: 28,
          padding: "36px 32px",
          textAlign: "center",
          width: "100%",
          maxWidth: 300,
          boxShadow: `0 0 60px ${mood.glow}, 0 30px 80px rgba(0,0,0,0.7)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Emoji */}
        <div style={{
          fontSize: "4rem",
          marginBottom: 16,
          filter: `drop-shadow(0 0 20px ${mood.color})`,
        }}>
          {mood.emoji}
        </div>

        {/* Name */}
        <div style={{
          fontSize: "1.7rem",
          fontWeight: 900,
          color: mood.color,
          marginBottom: 8,
          fontFamily: "'Outfit',sans-serif",
          letterSpacing: "-0.02em",
        }}>
          {mood.label}
        </div>

        {/* Description */}
        <div style={{
          fontSize: "0.88rem",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Outfit',sans-serif",
          marginBottom: 28,
          lineHeight: 1.55,
        }}>
          {mood.desc}
        </div>

        {/* Select button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: `${mood.color}22`,
            border: `2px solid ${mood.color}80`,
            borderRadius: 50,
            color: mood.color,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 0 24px ${mood.color}30`,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Tap to Select
        </motion.button>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          style={{
            marginTop: 14,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            padding: "4px 8px",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          tap elsewhere to cancel
        </button>
      </motion.div>
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
        width: 270,
        height: 270,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `2px solid rgba(255,255,255,0.1)`,
        }}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 130;
          const y = Math.sin(rad) * 130;
          const dotColor = i % 2 === 0 ? mood1.color : mood2.color;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(${x - 7}px, ${y - 7}px)`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: dotColor,
                boxShadow: `0 0 18px ${dotColor}`,
              }}
            />
          );
        })}
      </motion.div>

      {/* Counter ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.2, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 33,
          borderRadius: "50%",
          border: `1.5px dashed rgba(255,255,255,0.16)`,
        }}
      />

      {/* Center glow */}
      <div style={{
        position: "absolute",
        inset: 70,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${mood1.color}30 0%, ${mood2.color}22 50%, transparent 100%)`,
        animation: "cp 1.1s ease-in-out infinite",
      }} />

      {/* Emojis */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 6, filter: `drop-shadow(0 0 18px ${mood1.color}80)` }}>
        <motion.span animate={{ rotate: [0, -22, 0] }} transition={{ duration: 0.5, delay: 0.3 }} style={{ fontSize: "3.3rem" }}>{mood1.emoji}</motion.span>
        <motion.span animate={{ rotate: [0, 22, 0] }} transition={{ duration: 0.5, delay: 0.3 }} style={{ fontSize: "3.3rem" }}>{mood2.emoji}</motion.span>
      </div>

      <style>{`@keyframes cp { 0%,100%{transform:scale(1);opacity:0.75} 50%{transform:scale(1.18);opacity:1} }`}</style>
    </motion.div>
  );
}

// ─── MOOD ORB ────────────────────────────────────────────────────────────────
function MoodOrb({
  mood,
  pos,
  isSelected,
  isOtherSelected,
  onTap,
}: {
  mood: typeof MOODS[0];
  pos: { x: number; y: number };
  isSelected: boolean;
  isOtherSelected: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + MOODS.indexOf(mood) * 0.07, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={!isOtherSelected ? { scale: 1.16 } : {}}
      whileTap={!isOtherSelected ? { scale: 0.9 } : {}}
      onClick={onTap}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        width: 104,
        height: 104,
        borderRadius: "50%",
        background: isSelected
          ? `radial-gradient(circle at 35% 35%, ${mood.color}55, ${mood.color}28)`
          : "rgba(255,255,255,0.07)",
        border: isSelected
          ? `2.5px solid ${mood.color}`
          : "2px solid rgba(255,255,255,0.12)",
        boxShadow: isSelected
          ? `0 0 38px ${mood.glow}, 0 0 72px ${mood.color}30`
          : "0 6px 24px rgba(0,0,0,0.5)",
        cursor: isOtherSelected ? "not-allowed" : "pointer",
        opacity: isOtherSelected ? 0.28 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        fontFamily: "'Outfit',sans-serif",
        zIndex: isSelected ? 10 : 5,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        touchAction: "manipulation",
      }}
    >
      <span style={{
        fontSize: "2.5rem",
        filter: isSelected ? `drop-shadow(0 0 11px ${mood.color})` : "none",
        transition: "filter 0.3s",
        lineHeight: 1,
      }}>{mood.emoji}</span>
      <span style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: isSelected ? mood.color : "rgba(255,255,255,0.52)",
        letterSpacing: "0.05em",
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
        background: "rgba(8,5,24,0.92)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1.5px solid rgba(255,255,255,0.13)",
        borderRadius: 32,
        padding: "clamp(28px, 6vw, 48px)",
        textAlign: "center",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        boxShadow: `0 0 80px ${mood1.color}25, 0 0 120px ${mood2.color}16, 0 30px 80px rgba(0,0,0,0.65)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer rim */}
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 33,
        background: `linear-gradient(135deg, ${mood1.color}32, transparent 40%, transparent 60%, ${mood2.color}32)`,
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
          filter: `drop-shadow(0 0 18px ${mood1.color}68)`,
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
          background: `${mood1.color}16`,
          border: `1px solid ${mood1.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood1.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood1.label}</span>
        <span style={{ color: "rgba(255,255,255,0.26)", fontSize: 14 }}>✦</span>
        <span style={{
          background: `${mood2.color}16`,
          border: `1px solid ${mood2.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.47)",
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
            boxShadow: `0 0 45px ${mood1.color}35`,
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
            color: "rgba(255,255,255,0.3)",
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
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
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
  const brewingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(432);
  const [containerH, setContainerH] = useState(320);

  // Measure actual container dimensions from DOM
  const measureContainer = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerW(rect.width);
      setContainerH(rect.height);
    }
  }, []);

  useEffect(() => {
    measureContainer();
    const ro = new ResizeObserver(measureContainer);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measureContainer);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureContainer);
    };
  }, [measureContainer]);

  const mood1 = MOODS.find(m => m.id === selector1);
  const mood2 = MOODS.find(m => m.id === selector2);
  const bothSelected = selector1 !== null && selector2 !== null;
  const hasOne = selector1 !== null && selector2 === null;
  const previewMoodData = MOODS.find(m => m.id === previewMood);

  // Guard
  useEffect(() => {
    const tier = localStorage.getItem("kyr_quiz_tier");
    if (!tier) window.location.href = "/quiz-gateway";
  }, []);

  useEffect(() => {
    return () => {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
    };
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
  }, [bothSelected, state]);

  const showOrbs = state === "selecting";
  const showBrewing = state === "brewing" && mood1 && mood2;
  const showResult = state === "brewed" && mood1 && mood2;

  // ─── HANDLERS ───────────────────────────────────────────────────────────────
  const handleMoodTap = (moodId: string) => {
    if (state === "brewing" || state === "brewed") return;
    if (previewMood) return; // preview modal is open — wait for confirm/dismiss
    setPreviewMood(moodId);
  };

  const handleConfirm = () => {
    if (!previewMood) return;
    if (selector1 === null) {
      setSelector1(previewMood);
    } else if (selector2 === null) {
      setSelector2(previewMood);
    }
    setPreviewMood(null);
  };

  const handleDismissPreview = () => {
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

  // Layout — anchored to Simba's exact measurements:
  // cx = containerW/2 - 20 (shifted left ~20px from original center)
  // cy and r are fixed regardless of viewport
  const cx = containerW / 2 - 20;
  const cy = 246;
  const r = 174;
  const orbPositions = getOrbPixelPositions(cx, cy, r);

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
          animate={{ width: showResult ? "100%" : showBrewing ? "75%" : "50%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ height: "100%", background: "linear-gradient(90deg, #7800FF, #FF00E5)" }}
        />
      </div>

      {/* Title */}
      <div style={{ padding: "clamp(74px, 11vw, 100px) 24px 0", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
          textTransform: "uppercase", color: "#FF00E5",
          marginBottom: 6,
        }}>
          Set Your Vibe
        </p>
        <h1 style={{
          fontSize: "clamp(1.9rem, 7vw, 3rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          marginBottom: 8,
        }}>
          Mood Mixer
        </h1>
        <p style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
          maxWidth: 360,
          margin: "0 auto",
          lineHeight: 1.55,
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
              ref={containerRef}
              style={{
                position: "relative",
                width: "100%",
                height: Math.max(320, cy + r + 80),
              }}
            >
              {/* Center hint — only when no selection yet */}
              <AnimatePresence>
                {!hasOne && !bothSelected && <CenterHint hasOne={false} />}
                {hasOne && <CenterHint hasOne={true} />}
              </AnimatePresence>

              {/* Mood orbs */}
              {MOODS.map((mood, i) => (
                <MoodOrb
                  key={mood.id}
                  mood={mood}
                  pos={orbPositions[i]}
                  isSelected={selector1 === mood.id || selector2 === mood.id}
                  isOtherSelected={selector1 !== null && selector1 !== mood.id && selector2 === null}
                  onTap={() => handleMoodTap(mood.id)}
                />
              ))}
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
                gap: 18,
                paddingTop: 4,
              }}
            >
              <CenterSwirl mood1={mood1!} mood2={mood2!} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.36)",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Brewing your vibe...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT */}
        <div style={{ padding: "0 clamp(16px, 5vw, 48px)", marginTop: 28 }}>
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
              background: "rgba(5,5,16,0.97)",
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
                minWidth: 162,
                textAlign: "center",
              }}
            >
              {!selector1 ? "Select 2 moods" : !selector2 ? "Select 1 more mood" : "Blend Ready"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal — centered, no auto-dismiss */}
      <AnimatePresence>
        {previewMood && previewMoodData && (
          <PreviewModal
            mood={previewMoodData}
            onConfirm={handleConfirm}
            onDismiss={handleDismissPreview}
          />
        )}
      </AnimatePresence>

      <AppFooter />
    </div>
  );
}
