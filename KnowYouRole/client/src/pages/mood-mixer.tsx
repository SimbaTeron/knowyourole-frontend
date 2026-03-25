import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { X, ArrowRight, Sparkles, RotateCcw } from "lucide-react";

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

type BlendState = "selecting" | "previewing" | "brewing" | "brewed";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0,200,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

// ─── SWIRL BACKGROUND ───────────────────────────────────────────────────────
function SwirlBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Soft gradient blobs */}
      <div style={{
        position: "absolute", top: "5%", left: "10%",
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)",
        animation: "blobFloat1 12s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,0,255,0.12) 0%, transparent 70%)",
        animation: "blobFloat2 15s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "55%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,0,229,0.08) 0%, transparent 70%)",
        animation: "blobFloat3 10s ease-in-out infinite 3s",
      }} />
      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-50px, 30px) scale(1.05); }
          70% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -40px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ─── SPARKLE PARTICLE ───────────────────────────────────────────────────────
function Sparkle({ color, delay }: { color: string; delay: number }) {
  const variants = {
    initial: { opacity: 0, scale: 0, rotate: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      rotate: 180,
      transition: { duration: 0.8, delay, ease: "easeOut" },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      style={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
}

// ─── CENTER SWIRL ────────────────────────────────────────────────────────────
function CenterSwirl({ mood1, mood2, active }: { mood1: typeof MOODS[0]; mood2: typeof MOODS[0]; active: boolean }) {
  const rotate = useMotionValue(0);
  const rimRotate = useTransform(rotate, v => v);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    let start: number | null = null;
    const duration = 1800;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease in-out cubic
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      rotate.set(eased * 720);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [active]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.5 }}
      transition={{ duration: 0.4, ease: "backOut" }}
      style={{
        position: "relative",
        width: 160,
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer rim with dots */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `2px solid rgba(255,255,255,0.15)`,
          rotate: rimRotate,
        }}
      >
        {/* 8 dots around rim */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 76;
          const y = Math.sin(rad) * 76;
          const dotColor = i % 2 === 0 ? mood1.color : mood2.color;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(${x - 4}px, ${y - 4}px)`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dotColor,
                boxShadow: `0 0 12px ${dotColor}`,
              }}
            />
          );
        })}
      </motion.div>

      {/* Inner swirl lines */}
      <motion.div
        style={{
          position: "absolute",
          inset: 20,
          borderRadius: "50%",
          border: `1.5px dashed rgba(255,255,255,0.2)`,
          rotate: useTransform(rotate, v => -v * 1.5),
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 40,
          borderRadius: "50%",
          border: `1px solid rgba(255,255,255,0.12)`,
          rotate: useTransform(rotate, v => v * 2),
        }}
      />

      {/* Center glow */}
      <div style={{
        position: "absolute",
        inset: 50,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${mood1.color}40 0%, ${mood2.color}30 50%, transparent 100%)`,
        animation: "centerPulse 1s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes centerPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>

      {/* Center text */}
      <div style={{
        position: "relative", zIndex: 2,
        fontSize: "2rem",
        filter: `drop-shadow(0 0 12px ${mood1.color})`,
        display: "flex",
        gap: 4,
      }}>
        <motion.span
          animate={{ rotate: [0, -15, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >{mood1.emoji}</motion.span>
        <motion.span
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >{mood2.emoji}</motion.span>
      </div>
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
  isPreviewing,
  onTap,
  onPreview,
  onDismissPreview,
  previewPos,
}: {
  mood: typeof MOODS[0];
  index: number;
  total: number;
  isSelected: boolean;
  isOtherSelected: boolean;
  isPreviewing: boolean;
  onTap: () => void;
  onPreview: () => void;
  onDismissPreview: () => void;
  previewPos: { x: number; y: number };
}) {
  // Position in a circle
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // start from top
  const radius = typeof window !== "undefined" && window.innerWidth < 640 ? 130 : 170;
  const cx = typeof window !== "undefined" ? window.innerWidth / 2 : 400;
  const cy = typeof window !== "undefined" && window.innerWidth < 640 ? 320 : 300;
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);

  const isDisabled = isOtherSelected && !isSelected;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + index * 0.06, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={!isDisabled ? { scale: 1.15 } : {}}
        whileTap={!isDisabled ? { scale: 0.92 } : {}}
        onClick={onTap}
        onPointerDown={onPreview}
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: "translate(-50%, -50%)",
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: isSelected
            ? `radial-gradient(circle at 35% 35%, ${mood.color}40, ${mood.color}20)`
            : "rgba(255,255,255,0.06)",
          border: isSelected
            ? `2.5px solid ${mood.color}`
            : "2px solid rgba(255,255,255,0.12)",
          boxShadow: isSelected
            ? `0 0 30px ${mood.glow}, 0 0 60px ${mood.glow}40`
            : "0 4px 20px rgba(0,0,0,0.4)",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.3 : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          fontFamily: "'Outfit',sans-serif",
          zIndex: isSelected ? 10 : 5,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        }}
      >
        <span style={{
          fontSize: "1.6rem",
          filter: isSelected ? `drop-shadow(0 0 8px ${mood.color})` : "none",
          transition: "filter 0.3s",
          lineHeight: 1,
        }}>{mood.emoji}</span>
        <span style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          color: isSelected ? mood.color : "rgba(255,255,255,0.5)",
          letterSpacing: "0.03em",
          transition: "color 0.3s",
        }}>{mood.label}</span>
      </motion.button>

      {/* Preview card */}
      <AnimatePresence>
        {isPreviewing && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.22, ease: "backOut" }}
            style={{
              position: "fixed",
              left: Math.min(Math.max(previewPos.x, 80), (typeof window !== "undefined" ? window.innerWidth : 800) - 80),
              top: Math.min(Math.max(previewPos.y - 110, 80), (typeof window !== "undefined" ? window.innerHeight : 900) - 160),
              transform: "translateX(-50%)",
              background: `rgba(10,8,20,0.95)`,
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: `1.5px solid ${mood.color}50`,
              borderRadius: 20,
              padding: "16px 20px",
              minWidth: 200,
              zIndex: 100,
              boxShadow: `0 0 40px ${mood.glow}, 0 20px 60px rgba(0,0,0,0.6)`,
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={onTap}
            onPointerDown={e => e.stopPropagation()}
          >
            <button
              onClick={e => { e.stopPropagation(); onDismissPreview(); }}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "none", border: "none",
                color: "rgba(255,255,255,0.4)", cursor: "pointer",
                padding: 4, borderRadius: 6, fontSize: 14,
                display: "flex", alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
            <div style={{ fontSize: "2rem", marginBottom: 8, filter: `drop-shadow(0 0 10px ${mood.color})` }}>
              {mood.emoji}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: mood.color, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>
              {mood.label}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", fontFamily: "'Outfit',sans-serif" }}>
              {mood.desc}
            </div>
            <div style={{
              marginTop: 12,
              padding: "6px 14px",
              background: `linear-gradient(90deg, ${mood.color}30, ${mood.color}10)`,
              border: `1px solid ${mood.color}40`,
              borderRadius: 50,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: mood.color,
              letterSpacing: "0.08em",
              fontFamily: "'Outfit',sans-serif",
              textTransform: "uppercase",
            }}>
              Tap to select
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
      style={{
        background: "rgba(10,5,30,0.85)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1.5px solid rgba(255,255,255,0.15)",
        borderRadius: 32,
        padding: "clamp(28px, 6vw, 48px)",
        textAlign: "center",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        boxShadow: `0 0 80px ${mood1.color}30, 0 0 120px ${mood2.color}20, 0 30px 80px rgba(0,0,0,0.6)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer border effect */}
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 33,
        background: `linear-gradient(135deg, ${mood1.color}40, transparent 40%, transparent 60%, ${mood2.color}40)`,
        zIndex: -1,
      }} />

      {/* Sparkles */}
      <div style={{ position: "absolute", top: 16, right: 20 }}>
        <Sparkles size={20} color="#FBBF24" style={{ filter: "drop-shadow(0 0 6px #FBBF24)" }} />
      </div>
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <Sparkles size={14} color={mood1.color} style={{ filter: `drop-shadow(0 0 6px ${mood1.color})` }} />
      </div>

      {/* Emoji blend */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
        style={{
          fontSize: "3.5rem",
          marginBottom: 16,
          filter: `drop-shadow(0 0 16px ${mood1.color}80)`,
          display: "flex",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <motion.span
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >{mood1.emoji}</motion.span>
        <motion.span
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >{mood2.emoji}</motion.span>
      </motion.div>

      {/* Blend name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{
          fontSize: "clamp(1.4rem, 5vw, 2.2rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: "'Outfit',sans-serif",
          marginBottom: 12,
          lineHeight: 1.2,
        }}
      >
        {blendName}
      </motion.div>

      {/* Mood pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span style={{
          background: `${mood1.color}20`,
          border: `1px solid ${mood1.color}50`,
          borderRadius: 50, padding: "4px 14px",
          fontSize: 12, fontWeight: 700, color: mood1.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood1.label}</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>✦</span>
        <span style={{
          background: `${mood2.color}20`,
          border: `1px solid ${mood2.color}50`,
          borderRadius: 50, padding: "4px 14px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Outfit',sans-serif",
          maxWidth: 320,
          margin: "0 auto 24px",
          lineHeight: 1.6,
        }}
      >
        A fusion of{" "}
        <span style={{ color: mood1.color }}>{mood1.label.toLowerCase()}</span>{" "}
        energy and{" "}
        <span style={{ color: mood2.color }}>{mood2.label.toLowerCase()}</span>{" "}
        spirit. This blend shapes how your personality is revealed.
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62 }}
        style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "16px 32px",
            background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
            border: "none",
            borderRadius: 50,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 0 40px ${mood1.color}40`,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Continue with Your Blend
          <ArrowRight size={18} />
        </motion.button>

        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
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
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <RotateCcw size={14} />
          Try different moods
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MoodMixer() {
  const [selector1, setSelector1] = useState<string | null>(null);
  const [selector2, setSelector2] = useState<string | null>(null);
  const [state, setState] = useState<BlendState>("selecting");
  const [previewMood, setPreviewMood] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 200, y: 300 });
  const brewingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDismissRef = useRef<(() => void) | null>(null);

  const mood1 = MOODS.find(m => m.id === selector1);
  const mood2 = MOODS.find(m => m.id === selector2);
  const bothSelected = selector1 !== null && selector2 !== null;

  useEffect(() => {
    return () => {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
    };
  }, []);

  // Guard: redirect if no tier
  useEffect(() => {
    const tier = localStorage.getItem("kyr_quiz_tier");
    if (!tier) window.location.href = "/quiz-gateway";
  }, []);

  // Brewing sequence
  useEffect(() => {
    if (bothSelected && state === "selecting") {
      setState("previewing");
      brewingTimerRef.current = setTimeout(() => {
        setState("brewing");
        brewingTimerRef.current = setTimeout(() => {
          setState("brewed");
        }, 1800);
      }, 400);
    }
    if (!bothSelected && state !== "selecting") {
      if (brewingTimerRef.current) clearTimeout(brewingTimerRef.current);
      setState("selecting");
      setPreviewMood(null);
    }
  }, [bothSelected]);

  const handleMoodTap = (moodId: string) => {
    if (state === "brewing" || state === "brewed") return;
    if (previewDismissRef.current) previewDismissRef.current();

    if (selector1 === null) {
      setSelector1(moodId);
      setPreviewMood(null);
    } else if (selector2 === null) {
      if (selector1 === moodId) {
        setSelector1(null);
      } else {
        setSelector2(moodId);
        setPreviewMood(null);
      }
    } else {
      // Both selected — reset and start over
      setSelector1(moodId);
      setSelector2(null);
    }
  };

  const handlePreview = (moodId: string, e: React.PointerEvent) => {
    if (state === "brewing" || state === "brewed") return;
    // Don't show preview if already selected
    if (selector1 === moodId || selector2 === moodId) return;
    setPreviewPos({ x: e.clientX, y: e.clientY });
    setPreviewMood(moodId);
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

  const showOrbs = state === "selecting" || state === "previewing";
  const showBrewing = state === "brewing" && mood1 && mood2;
  const showResult = state === "brewed" && mood1 && mood2;

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
        background: "rgba(0,0,0,0.7)",
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
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #7800FF, #FF00E5)",
          }}
        />
      </div>

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: "clamp(80px, 12vw, 110px) 24px 0",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
            textTransform: "uppercase", color: "#FF00E5",
            marginBottom: 8,
          }}
        >
          Set Your Vibe
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: 10,
          }}
        >
          Mood Mixer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 380,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {showResult
            ? "Your blend is ready. Time to discover who you are."
            : "Tap two moods to brew your unique blend."}
        </motion.p>
      </motion.div>

      {/* Main content */}
      <div style={{
        position: "relative",
        zIndex: 1,
        paddingBottom: 180,
      }}>
        {/* ORBS — only show during selecting/previewing */}
        <AnimatePresence>
          {showOrbs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: "relative", height: typeof window !== "undefined" && window.innerWidth < 640 ? 500 : 500 }}
            >
              {/* Center zone hint */}
              {!bothSelected && (
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border: "2px dashed rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    fontFamily: "'Outfit',sans-serif",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                >
                  {selector1 ? "Tap second mood" : "Tap first mood"}
                </motion.div>
              )}

              {/* Selected indicators near center */}
              {mood1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "46%",
                    transform: "translate(-70%, -50%)",
                    background: `${mood1.color}25`,
                    border: `2px solid ${mood1.color}80`,
                    borderRadius: 50,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Outfit',sans-serif",
                    boxShadow: `0 0 20px ${mood1.color}40`,
                    zIndex: 15,
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{mood1.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: mood1.color }}>{mood1.label}</span>
                </motion.div>
              )}
              {mood2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "54%",
                    transform: "translate(-30%, -50%)",
                    background: `${mood2.color}25`,
                    border: `2px solid ${mood2.color}80`,
                    borderRadius: 50,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Outfit',sans-serif",
                    boxShadow: `0 0 20px ${mood2.color}40`,
                    zIndex: 15,
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{mood2.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: mood2.color }}>{mood2.label}</span>
                </motion.div>
              )}

              {/* Mood orbs */}
              {MOODS.map((mood, i) => (
                <MoodOrb
                  key={mood.id}
                  mood={mood}
                  index={i}
                  total={MOODS.length}
                  isSelected={selector1 === mood.id || selector2 === mood.id}
                  isOtherSelected={selector1 !== null && selector1 !== mood.id && selector2 === null}
                  isPreviewing={previewMood === mood.id}
                  onTap={() => handleMoodTap(mood.id)}
                  onPreview={(e) => handlePreview(mood.id, e as unknown as React.PointerEvent)}
                  onDismissPreview={handleDismissPreview}
                  previewPos={previewPos}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BREWING SWIRL */}
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
                paddingTop: 20,
              }}
            >
              <CenterSwirl mood1={mood1} mood2={mood2} active={true} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Brewing your vibe...
              </motion.p>
              {/* Burst sparkles */}
              <div style={{ position: "relative", width: 200, height: 80 }}>
                {[...Array(12)].map((_, i) => (
                  <Sparkle
                    key={i}
                    color={i % 2 === 0 ? mood1.color : mood2.color}
                    delay={0.2 + i * 0.07}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT CARD */}
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

      {/* Bottom bar — only during selecting/previewing */}
      <AnimatePresence>
        {showOrbs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px clamp(16px, 5vw, 48px) 24px",
              background: "rgba(5,5,16,0.95)",
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
                color: "rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                padding: "10px 4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              Skip this step →
            </button>

            <motion.div
              animate={{
                background: bothSelected
                  ? "linear-gradient(90deg, #00C8FF, #7800FF)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: bothSelected ? "0 0 30px rgba(0,200,255,0.4)" : "none",
              }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "13px 28px",
                borderRadius: 50,
                color: bothSelected ? "#fff" : "rgba(255,255,255,0.3)",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "'Outfit',sans-serif",
                minWidth: 140,
                textAlign: "center",
              }}
            >
              {bothSelected ? "Blend Ready" : "Select 2 moods"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AppFooter */}
      <AppFooter />
    </div>
  );
}
