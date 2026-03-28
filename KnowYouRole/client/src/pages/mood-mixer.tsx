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

// 3 unique description sentences per blend — randomly pick one on each render
const BLEND_DESCRIPTIONS: Record<string, string[]> = {
  "focused+creative": [
    "Your mind oscillates between laser-sharp precision and wild creative leaps — you build things that shouldn't exist yet, and you build them perfectly.",
    "Ideas take shape in your head before others can articulate them. You don't just think outside the box; you redesign the box entirely.",
    "You're the rare type who can both dream up visionary systems AND engineer them into reality. Abstract thinking meets flawless execution.",
  ],
  "focused+calm": [
    "Your mind is a war room — always calculating, always planning — but the room itself is eerily quiet. Others wonder how you stay so composed under pressure.",
    "You possess the patience of a master strategist. While others rush, you observe, calculate, and strike with pinpoint precision.",
    "Stillness is your superpower. You think three moves ahead while appearing completely at ease — and that's exactly how you want it.",
  ],
  "focused+energetic": [
    "You're a force multiplier wherever you go. Focused energy is already powerful; yours is a precision strike that reshapes entire landscapes.",
    "While most people choose between speed and accuracy, you invented a third option: both, delivered relentlessly, at scale.",
    "Your drive isn't noise — it's signal. Every burst of energy is channeled toward exactly the right target, every single time.",
  ],
  "focused+curious": [
    "You don't just seek information — you weaponize it. Every curiosity feeds a mental model that grows sharper and more terrifyingly accurate with time.",
    "Your questions cut deeper than most people's answers. You exist at the intersection of analytical rigor and genuine wonder.",
    "You want to understand the machine, not just use it. Knowledge isn't status for you — it's ammunition for the next breakthrough.",
  ],
  "focused+determined": [
    "Once you've locked onto a target, nothing short of an extinction event redirects you. Your focus is a physical force.",
    "You don't do half-measures. When determination meets focus in a single mind, the results aren't incremental — they're seismic.",
    "Peak performance isn't a peak for you; it's your baseline. Others burn bright and fade; you burn at exactly the right temperature forever.",
  ],
  "focused+social": [
    "You lead without fanfare. Your influence comes from seeing what others need before they ask, and delivering it with quiet precision.",
    "You make people feel like the most important person in the room — while simultaneously running the entire room. A rare and disarming combination.",
    "Your social intelligence supercharges your strategic thinking. You don't just know the plan; you know exactly how to get everyone else to believe in it.",
  ],
  "focused+reflective": [
    "Your inner world is as developed as your outer one — you think deeply before committing, then commit completely. Every move is weighted and intentional.",
    "You're the quiet authority in every room. Others speak first; you speak last, and when you do, the conversation shifts.",
    "Reflection isn't delay for you — it's fuel. The deeper you go inward, the more devastating your outward impact becomes.",
  ],
  "creative+calm": [
    "Your ideas simmer quietly until they're ready to emerge fully formed. You don't think in bursts — you think in slow, inevitable crystallizations.",
    "Calm creativity is your native habitat. You produce work that's simultaneously zen and revolutionary, often without anyone noticing how rare that is.",
    "You think like water: no sudden movements, but the Grand Canyon was carved by exactly this kind of persistent, unhurried force.",
  ],
  "creative+energetic": [
    "You don't brainstorm — you brainstorm WITH VELOCITY. Ideas don't just flow; they ignite, collide, and explode into things that actually get built.",
    "Your creative output is prolific because you don't wait for perfect conditions. You channel energy directly into making, iterating, shipping.",
    "You make creativity look like a contact sport. Others watch you generate, build, and discard ideas at a pace that makes them dizzy — and inspired.",
  ],
  "creative+curious": [
    "Curiosity doesn't kill the cat — for you it sharpened the cat's claws into precision instruments. You explore with intent and create with precision.",
    "You ask the questions nobody thought to ask, then answer them with something nobody predicted. Your mind is a dangerous, beautiful place.",
    "Knowledge and imagination fuel each other in you like a closed loop. The more you learn, the more creatively you extrapolate — and vice versa.",
  ],
  "creative+determined": [
    "Purpose drives your creativity off the page and into the world. You don't just imagine better systems — you build them and defend them.",
    "When creative vision meets relentless drive, the result is a person who doesn't accept 'good enough' and doesn't know how to quit.",
    "You turn inspiration into momentum better than anyone. An idea isn't real for you until it's been built, tested, and rebuilt again.",
  ],
  "creative+social": [
    "You build things people actually want to be part of. Your creativity isn't solo brilliance — it's social architecture that draws others in and makes them co-authors.",
    "Your ideas spread because you spread them with genuine warmth. You don't just present a vision — you make people feel ownership of it.",
    "You have the rare gift of making collaboration feel like acceleration rather than compromise. Creative work with you is always more than the sum of its parts.",
  ],
  "creative+reflective": [
    "Your creativity has depth because you give it space to breathe. You sit with ideas longer than others, and emerge with work that shows it.",
    "Introspective artists produce the most distinct work. Yours carries a signature that comes from honest, unhurried self-examination.",
    "You create from the inside out. The richer your inner world, the more unmistakable your outer work becomes.",
  ],
  "calm+energetic": [
    "You contain multitudes: the stillness of deep water and the current that reshapes coastlines. People don't know which version of you they'll get — and that's the point.",
    "Your energy is always perfectly calibrated to the room. You can be a安静 presence or a controlled explosion — and you choose intentionally.",
    "The calm+energetic paradox is your greatest tool. You observe everything, then act decisively, then return to calm. Others find it mesmerizing.",
  ],
  "calm+curious": [
    "You ask questions that make people pause — not because they're difficult, but because nobody has thought to ask them before. Your curiosity is quiet and devastating.",
    "You explore ideas the way water explores a landscape: without force, but with absolute inevitability. What you don't know today, you will know tomorrow.",
    "Curiosity without anxiety is your operating mode. You can hold a question open indefinitely without stress — and that's exactly why you always find the answer.",
  ],
  "calm+determined": [
    "You achieve things without drama. The quieter the room, the more powerful your presence — and the more unstoppable your output.",
    "Your determination is like a slow-burning fuse: invisible until the explosion. Others don't see you coming because you never rush.",
    "Steady wins more races than explosive. You know this instinctively, and your consistent, unhurried output speaks for itself.",
  ],
  "calm+social": [
    "You connect with warmth and depth, but you also know how to hold space in silence without discomfort. A rare and deeply reassuring presence.",
    "Your social energy is like a warm current — always present, never overwhelming. You make people feel held, not pushed.",
    "You're the person others want in the room when everything is on fire — because you bring calm, competence, and genuine warmth simultaneously.",
  ],
  "calm+reflective": [
    "Your inner life is a vast, well-organized library. You think deeply, process thoroughly, and speak with the confidence of someone who's already been here mentally.",
    "Stillness is your creative medium. You don't need external chaos to fuel great ideas — your reflective practice is a bottomless well.",
    "You produce insights the way certain trees grow: slowly, from deep roots, and with a longevity that faster-growing things can't match.",
  ],
  "energetic+curious": [
    "You're a human sparkler — ideas fly off you in every direction, and somehow they all connect. Your curiosity generates as much energy as it consumes.",
    "You don't learn about things — you fall down rabbit holes and emerge with treasures. Your curiosity is an adventure sport.",
    "The world is endlessly fascinating to you, and your energy makes exploring it contagious. You're the person who makes others want to learn more too.",
  ],
  "energetic+determined": [
    "You're not a force of nature — you're a force with a blueprint. All that energy has a target, and the target has already been chosen.",
    "Your determination makes your energy terrifyingly efficient. Others sprint and stop; you sprint and never intend to stop.",
    "You were built for long games. That burst of energy you have? It doesn't fade — it just finds the next hill to conquer.",
  ],
  "energetic+social": [
    "You are the person who walks into a room and the room changes. Not because you demand it — because your presence makes everyone slightly more alive.",
    "Your social energy doesn't just connect people — it catalyzes them. You're the spark in the room that makes other sparks possible.",
    "Life is a party and you're both the host AND the reason people showed up. Your energy makes gatherings feel like movements.",
  ],
  "energetic+reflective": [
    "You observe everything and miss nothing. Your reflectiveness makes your energy smarter, and your energy makes your reflections more urgent.",
    "You process the world intensely, then act decisively. The combination makes you seem like you're thinking and doing at twice normal speed.",
    "Your reflective nature doesn't slow your energy — it aims it. You know what matters, and your energy goes exactly there.",
  ],
  "curious+determined": [
    "You investigate like a detective, but you also close the case. Curiosity drives you to seek, and determination ensures you actually find.",
    "The combination of curiosity and drive means you don't just discover things — you master them. Surface knowledge has never interested you.",
    "You want to know why, and you want to know NOW, and you won't stop until the answer becomes part of who you are.",
  ],
  "curious+social": [
    "You turn exploration into a team sport. Your curiosity is generous — you share what you find and make others hungry to discover alongside you.",
    "Your social curiosity isn't small talk — it's genuine interest in what makes people tick. You ask questions that open people up.",
    "You collect perspectives like some collect art. Every conversation adds a lens you didn't have before, and you use them all.",
  ],
  "curious+reflective": [
    "Your curiosity has gravity. When you fall into a question, you fall all the way — and you always come back with something worth sharing.",
    "You think so others can think alongside you. Your reflective curiosity is a gift to everyone who gets to witness it.",
    "You hold questions with reverence and interrogate them with rigor. The result is understanding that goes so deep it changes how you see everything.",
  ],
  "determined+social": [
    "You achieve things WITH people, not despite them. Your drive doesn't isolate — it magnetizes. Others want to be part of what you're building.",
    "You're the person who makes ambitious goals feel achievable. Your combination of determination and warmth turns skeptics into believers.",
    "You lead with energy and follow-through. People don't just root for you — they want to run beside you.",
  ],
  "determined+reflective": [
    "You commit after deep thought, and then you commit completely. Others know that when you speak, the words have been weighed.",
    "Your reflectiveness makes your determination more powerful, not less. You don't act on impulse — you act on conviction.",
    "You have the quiet authority of someone who has already thought this through. When you move, the thought is already done.",
  ],
  "social+reflective": [
    "You read rooms the way scholars read texts — with care, depth, and genuine interest in what isn't immediately visible.",
    "Your social insight comes from the inside out. You understand people because you first took the time to understand yourself.",
    "You connect with uncommon depth. Every conversation is an opportunity to learn something true, and you treat it that way.",
  ],
};

function getBlendDescription(mood1: string, mood2: string): string {
  const key = [mood1, mood2].sort().join("+");
  const options = BLEND_DESCRIPTIONS[key];
  if (!options) return `A unique blend of ${mood1} and ${mood2} energy that shapes your personality in distinct ways.`;
  return options[Math.floor(Math.random() * options.length)];
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
// ─── ANIMATED HAND + SELECT 2 MOODS HINT ───────────────────────────────────
// Shown only when no mood has been selected yet (selector1 === null)
// Disappears permanently after first selection
function SelectHintOverlay({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      {/* CSS animation injected once */}
      <style>{`
        @keyframes hand-tap-loop {
          0%   { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          8%   { opacity: 1; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          18%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, -132px) scale(1); }
          21%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, -132px) scale(0.82); }
          25%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, -132px) scale(1); }
          38%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, -132px) scale(1); }
          45%  { opacity: 0; transform: translate(-50%, -50%) translate(0px, -132px) scale(1); }
          55%  { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          62%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          72%  { opacity: 1; transform: translate(-50%, -50%) translate(132px, 0px) scale(1); }
          75%  { opacity: 1; transform: translate(-50%, -50%) translate(132px, 0px) scale(0.82); }
          79%  { opacity: 1; transform: translate(-50%, -50%) translate(132px, 0px) scale(1); }
          90%  { opacity: 1; transform: translate(-50%, -50%) translate(132px, 0px) scale(1); }
          96%  { opacity: 0; transform: translate(-50%, -50%) translate(132px, 0px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
        }
        @keyframes pill-breathe {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(120,0,255,0.15); }
          50%       { box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 35px rgba(120,0,255,0.3); }
        }
      `}</style>

      {/* Animated hand — positioned center, floats up/down, moves left/right to tap orbs */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%, -50%)",
          width: 32,
          height: 32,
          zIndex: 20,
          pointerEvents: "none",
          animation: "hand-tap-loop 5s ease-in-out infinite",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
        }}
      >
        {/* Tiny pointing hand SVG */}
        <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          {/* sleeve */}
          <rect x="10" y="28" width="12" height="10" rx="3" fill="#4a7fca" />
          {/* hand */}
          <path d="M16 28 C9 28 5 22 5 16 C5 11 8.5 9 12 10.5 C13.5 11 14 13 14 14.5 L14 9 C14 6.5 15.2 5 16.5 5 C17.8 5 19 6.5 19 9 L19 14.5 C20 13.5 21 12.5 22 12.5 C24.5 12.5 26.5 15 25.5 19.5 C24.5 24 20 27 16 28Z" fill="#f5d0b0" stroke="#c09070" strokeWidth="0.8" />
          {/* fingernail */}
          <ellipse cx="16" cy="6.5" rx="2" ry="1.5" fill="#f0c0a0" opacity="0.6" />
        </svg>
      </div>

      {/* "Select 2 moods" pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(50% + 110px)",
          transform: "translateX(-50%)",
          zIndex: 20,
          pointerEvents: "none",
          background: "linear-gradient(90deg, rgba(120,0,255,0.9), rgba(255,0,229,0.9))",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 50,
          padding: "9px 22px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color: "#fff",
          whiteSpace: "nowrap" as const,
          fontFamily: "'Outfit',sans-serif",
          animation: "pill-breathe 3s ease-in-out infinite",
          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        ✦ Select 2 moods ✦
      </motion.div>
    </>
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
  // When selected: render a plain non-interactive div (no onClick, no touch events)
  if (isSelected) {
    return (
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          width: 104,
          height: 104,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${mood.color}55, ${mood.color}28)`,
          border: `2.5px solid ${mood.color}`,
          boxShadow: `0 0 38px ${mood.glow}, 0 0 72px ${mood.color}30`,
          cursor: "not-allowed",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontFamily: "'Outfit',sans-serif",
          zIndex: 10,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span style={{
          fontSize: "2.5rem",
          filter: `drop-shadow(0 0 11px ${mood.color})`,
          lineHeight: 1,
        }}>{mood.emoji}</span>
        <span style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: mood.color,
          letterSpacing: "0.05em",
        }}>{mood.label}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onTap}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.transform = "translate(-50%, -50%) scale(1.12)";
        el.style.border = "2px solid rgba(255,255,255,0.35)";
        el.style.boxShadow = "0 0 20px rgba(0,200,255,0.15)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.transform = "translate(-50%, -50%) scale(1)";
        el.style.border = "2px solid rgba(255,255,255,0.12)";
        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.5)";
      }}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        width: 104,
        height: 104,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        border: "2px solid rgba(255,255,255,0.12)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        fontFamily: "'Outfit',sans-serif",
        zIndex: 5,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        transition: "transform 0.18s ease, border 0.18s ease, box-shadow 0.18s ease",
        touchAction: "manipulation",
      }}
    >
      <span style={{
        fontSize: "2.5rem",
        lineHeight: 1,
      }}>{mood.emoji}</span>
      <span style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "rgba(255,255,255,0.52)",
        letterSpacing: "0.05em",
      }}>{mood.label}</span>
    </div>
  );
}

// ─── MOOD SHIFT ALGORITHM ────────────────────────────────────────────────────
type TraitKey = "focus" | "emotion" | "creative" | "social" | "resilience";

interface TraitShift {
  key: TraitKey;
  label: string;
  emoji: string;
  delta: number;
  direction: "boost" | "nudge" | "dampen";
}

interface MoodVector {
  focus: number; emotion: number; creative: number; social: number; resilience: number;
}

const MOOD_VECTORS: Record<string, MoodVector> = {
  focused:    { focus: 9,  emotion: 2,  creative: 5,  social: -2, resilience: 7 },
  creative:   { focus: 4,  emotion: 1,  creative: 9,  social: 6,  resilience: 3 },
  calm:       { focus: 2,  emotion: 9,  creative: 4,  social: -2, resilience: 5 },
  energetic:  { focus: 3,  emotion: -3, creative: 5,  social: 9,  resilience: 7 },
  curious:    { focus: 6,  emotion: 5,  creative: 8,  social: 4,  resilience: 3 },
  determined: { focus: 8,  emotion: 3,  creative: 3,  social: 2,  resilience: 9 },
  social:     { focus: 2,  emotion: 7,  creative: 4,  social: 9,  resilience: 4 },
  reflective: { focus: 3,  emotion: 8,  creative: 7,  social: 1,  resilience: 5 },
};

const TRAIT_LABELS: Record<TraitKey, { label: string; emoji: string }> = {
  focus:     { label: "Focus Depth",        emoji: "\uD83C\uDFAF" },
  emotion:   { label: "Emotional Balance",  emoji: "\uD83D\uDC8E" },
  creative:  { label: "Creative Vision",    emoji: "\uD83C\uDFA8" },
  social:    { label: "Social Magnetism",   emoji: "\uD83E\uDD1D" },
  resilience:{ label: "Resilience",          emoji: "\u26A1" },
};

function getMoodShiftData(mood1Id: string, mood2Id: string): TraitShift[] {
  const v1 = MOOD_VECTORS[mood1Id] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  const v2 = MOOD_VECTORS[mood2Id] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  const traits: TraitKey[] = ["focus", "emotion", "creative", "social", "resilience"];
  const combined = traits.map(t => ({ key: t, delta: Math.round((v1[t] + v2[t]) / 2) }));
  const top3 = [...combined].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3);
  return top3.map(({ key, delta }) => {
    const abs = Math.abs(delta);
    const direction: TraitShift["direction"] = abs <= 2 ? "nudge" : delta > 0 ? "boost" : "dampen";
    return { key, label: TRAIT_LABELS[key].label, emoji: TRAIT_LABELS[key].emoji, delta, direction };
  });
}

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({ mood1, mood2, onContinue, onReset }: {
  mood1: typeof MOODS[0];
  mood2: typeof MOODS[0];
  onContinue: () => void;
  onReset: () => void;
}) {
  const blendName = getBlendName(mood1.id, mood2.id);
  const shifts = getMoodShiftData(mood1.id, mood2.id);

  const tagStyle = (dir: TraitShift["direction"]): React.CSSProperties => {
    if (dir === "boost") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)" };
    if (dir === "nudge") return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" };
    return { padding: "4px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" };
  };

  const tagLabel = (dir: TraitShift["direction"]) => {
    if (dir === "boost") return "\u21b7 Strong Boost";
    if (dir === "nudge") return "\u21b7 Light Nudge";
    return "\u21b9 Dampens";
  };

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
      <div style={{
        position: "absolute", inset: -1,
        borderRadius: 33,
        background: `linear-gradient(135deg, ${mood1.color}32, transparent 40%, transparent 60%, ${mood2.color}32)`,
        zIndex: -1,
      }} />

      <div style={{ position: "absolute", top: 16, right: 20 }}>
        <Sparkles size={20} color="#FBBF24" style={{ filter: "drop-shadow(0 0 6px #FBBF24)" }} />
      </div>
      <div style={{ position: "absolute", top: 22, left: 22 }}>
        <Sparkles size={14} color={mood1.color} style={{ filter: `drop-shadow(0 0 6px ${mood1.color})` }} />
      </div>

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
        <span style={{
          background: `${mood1.color}16`,
          border: `1px solid ${mood1.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood1.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood1.label}</span>
        <span style={{ color: "rgba(255,255,255,0.26)", fontSize: 14 }}>*</span>
        <span style={{
          background: `${mood2.color}16`,
          border: `1px solid ${mood2.color}42`,
          borderRadius: 50, padding: "5px 16px",
          fontSize: 12, fontWeight: 700, color: mood2.color,
          fontFamily: "'Outfit',sans-serif",
        }}>{mood2.label}</span>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          marginBottom: 12,
        }}>
          How your moods shape your result
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shifts.map(shift => (
            <div key={shift.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 130, flexShrink: 0 }}>
                <span style={{ fontSize: "1rem" }}>{shift.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{shift.label}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={tagStyle(shift.direction)}>{tagLabel(shift.direction)}</div>
              </div>
              <div style={{
                width: 44,
                textAlign: "right",
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
                color: shift.delta > 0 ? "#4ade80" : shift.delta < 0 ? "#f87171" : "rgba(255,255,255,0.3)",
              }}>
                {shift.delta > 0 ? "+" : ""}{shift.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.47)",
        fontFamily: "'Outfit',sans-serif",
        maxWidth: 330,
        margin: "0 auto 26px",
        lineHeight: 1.65,
      }}>
        {getBlendDescription(mood1.id, mood2.id)}
      </p>

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
    const tier = sessionStorage.getItem("knowrole-tier");
    if (!tier) window.location.href = "/quiz/gateway";
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
    if (previewMood) return; // preview modal is open - wait for confirm/dismiss
    // Prevent selecting the same mood twice
    if (selector1 === moodId || selector2 === moodId) return;
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
    // Also save as simple string for Results component
    sessionStorage.setItem("knowrole-mood-blend", blendName);
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

  // Layout - ring centered in container — orbs edge-to-edge touching
  // 8 orbs × 104px diameter = 832px circumference → r = 832/(2π) ≈ 132.5
  const cx = containerW / 2;
  const cy = 200;
  const r = 132;
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
                height: cy + r + 100,
              }}
            >
              {/* Animated hand + Select 2 moods hint — shown only before first selection */}
              <AnimatePresence>
                {!hasOne && !bothSelected && (
                  <SelectHintOverlay key="select-hint" cx={cx} cy={cy} />
                )}
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

      {/* Preview modal - centered, no auto-dismiss */}
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
