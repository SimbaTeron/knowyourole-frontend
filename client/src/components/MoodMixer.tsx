"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { id: "focused", emoji: "🎯", label: "Focused", color: "#00C8FF", glow: "rgba(0,200,255,0.7)", desc: "Sharp and analytical" },
  { id: "creative", emoji: "🎨", label: "Creative", color: "#A78BFA", glow: "rgba(167,139,250,0.7)", desc: "Imaginative and free" },
  { id: "calm", emoji: "🌊", label: "Calm", color: "#60A5FA", glow: "rgba(96,165,250,0.7)", desc: "Peaceful and centered" },
  { id: "energetic", emoji: "⚡", label: "Energetic", color: "#FBBF24", glow: "rgba(251,191,36,0.7)", desc: "Full of vibrant energy" },
  { id: "curious", emoji: "🔮", label: "Curious", color: "#F472B6", glow: "rgba(244,114,182,0.7)", desc: "Always exploring" },
  { id: "determined", emoji: "💪", label: "Determined", color: "#F87171", glow: "rgba(248,113,113,0.7)", desc: "Driven and relentless" },
  { id: "social", emoji: "🤝", label: "Social", color: "#34D399", glow: "rgba(52,211,153,0.7)", desc: "Connected and warm" },
  { id: "reflective", emoji: "🌙", label: "Reflective", color: "#818CF8", glow: "rgba(129,140,248,0.7)", desc: "Thoughtful and inward" },
];

const BLEND_LABELS: Record<string, string> = {
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

const TRAIT_DATA: Record<string, Record<string, number>> = {
  focused:    { focus: 9, emotion: 2, creative: 5, social: -2, resilience: 7 },
  creative:   { focus: 4, emotion: 1, creative: 9, social: 6, resilience: 3 },
  calm:       { focus: 2, emotion: 9, creative: 4, social: -2, resilience: 5 },
  energetic:  { focus: 3, emotion: -3, creative: 5, social: 9, resilience: 7 },
  curious:    { focus: 6, emotion: 5, creative: 8, social: 4, resilience: 3 },
  determined: { focus: 8, emotion: 3, creative: 3, social: 2, resilience: 9 },
  social:     { focus: 2, emotion: 7, creative: 4, social: 9, resilience: 4 },
  reflective: { focus: 3, emotion: 8, creative: 7, social: 1, resilience: 5 },
};

const TRAIT_LABELS: Record<string, { label: string; emoji: string }> = {
  focus:      { label: "Focus Depth",       emoji: "🎯" },
  emotion:    { label: "Emotional Balance", emoji: "💎" },
  creative:   { label: "Creative Vision",   emoji: "🎨" },
  social:     { label: "Social Magnetism",  emoji: "🤝" },
  resilience: { label: "Resilience",        emoji: "⚡" },
};

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
    "Your social intelligence supercharges your strategic thinking. You don't just read rooms; you redesign them.",
  ],
  "focused+reflective": [
    "You process the world in layers — surface data on top, deep pattern recognition underneath, strategy at the core.",
    "Your reflections aren't rumination; they're recalibration. You emerge from every quiet moment more dangerous than before.",
    "You understand that the most powerful insights come from looking inward before looking outward.",
  ],
  "creative+calm": [
    "You create from a place of profound stillness. Your calm isn't the absence of creativity — it's the canvas it paints on.",
    "While others chase novelty, you cultivate depth. Your creative work has a quiet authority that can't be faked.",
    "You don't need chaos to be creative. Your best ideas emerge in the spaces between storms.",
  ],
  "creative+energetic": [
    "You don't just think differently — you BURST differently. Your energy is creative energy, and it reshapes every room you enter.",
    "You make creativity look like a contact sport. Others watch you generate ideas at a pace that shouldn't be possible.",
    "You're the rare case where spontaneity produces brilliance, not just chaos. What you create under pressure is extraordinary.",
  ],
  "creative+curious": [
    "Your curiosity doesn't just ask 'why' — it asks 'why not?' and then builds the answer from scratch.",
    "Every question opens a door; you don't just walk through — you rebuild the doorframe with something original on the other side.",
    "You see connections between things that have no business being connected. That's not a bug; it's your creative engine.",
  ],
  "creative+determined": [
    "You don't just envision the future — you bulldoze obstacles until it exists. Your creativity is fueled by relentless will.",
    "Others call it ambition. We call it what it is: the most powerful creative force on the planet.",
    "You're building something that shouldn't exist yet. And given your combination of creative vision and sheer will — it won't exist for long.",
  ],
  "creative+social": [
    "You don't just inspire others — you DOWNLOAD ideas through them. Your social creativity is a genuine superpower.",
    "Your creative energy multiplies when it's shared. You don't just collaborate; you co-create at a frequency others can't tune into.",
    "You make creativity contagious. The people around you don't just feel inspired — they feel like they can create too.",
  ],
  "creative+reflective": [
    "Your creativity runs inward before it bursts outward. The world sees the output; you know the real work happens in the quiet.",
    "You process life through a creative lens that most people don't even know exists. What looks like daydreaming is actually deep work.",
    "Your inner world is so vivid that the outer world often disappoints you. That's fine — you can always build a better one.",
  ],
  "calm+energetic": [
    "You're the eye of the hurricane — and the hurricane. Both states coexist in you with perfect, terrifying balance.",
    "Others can't figure out how you contain so much energy in such a calm exterior. The answer is: you're not containing it. You're channeling it.",
    "Your calm isn't the absence of energy — it's the architecture that makes your energy devastating.",
  ],
  "calm+curious": [
    "You ask questions that reveal how much you've already understood. Your curiosity is deep, patient, and devastatingly accurate.",
    "You don't rush to conclusions — you sit with a question until it gives up its secrets. And it always does.",
    "Your calm curiosity makes people feel like they can trust you with their own wondering. That's a rare gift.",
  ],
  "calm+determined": [
    "You move like a glacier — slow, inevitable, and completely unstoppable. Nothing deflects you; you simply reshape around obstacles.",
    "Your determination doesn't announce itself. It simply shows up as results, year after year, without drama or fanfare.",
    "You're playing a long game that most people don't even realize has already been won.",
  ],
  "calm+social": [
    "You connect with people at a frequency that feels almost supernatural. Your warmth is quiet, genuine, and deeply felt.",
    "Others describe being around you as 'calming' — but it's more than that. You actually change the energy of spaces you enter.",
    "You make people feel like they matter. Not by performing care, but by genuinely seeing them.",
  ],
  "calm+reflective": [
    "You have an ocean of depth beneath a glassy surface. Others see the surface; only the closest people see what's underneath.",
    "Your reflections are like sonar — you send out a pulse and wait patiently for the full picture to return.",
    "You understand things about life that take others decades longer to grasp. And you grasped them while staying who you are.",
  ],
  "energetic+curious": [
    "You're a human curiosity engine — the energy never runs out because the questions never stop. You're UNSTOPPABLE.",
    "You don't just explore — you EXPLODE outward in every direction at once, and somehow land exactly where you needed to be.",
    "Your combination of energy and curiosity makes every day feel like an adventure. Even mundane situations become expeditions.",
  ],
  "energetic+determined": [
    "You don't just commit — you EXPLODE toward your goals with a ferocity that makes people step back. And then step aside.",
    "You have the kind of drive that builds empires or burns them down. Fortunately, you're pointed at the right targets.",
    "You're not just persistent — you're DYNAMIC. Your determination doesn't plod; it charges.",
  ],
  "energetic+social": [
    "You're the engine that keeps every room running. Your social energy isn't performance — it's genuine fuel that powers everyone around you.",
    "You don't just show up — you OVERSHOW UP. Others try to match your energy and fail. It's both exhausting and inspiring to witness.",
    "You make social gatherings feel like events. You don't just attend parties — you create them.",
  ],
  "energetic+reflective": [
    "You contain multitudes — and you KNOW it. Your reflective depth makes your energetic output even more powerful, not less.",
    "You process internally with the same intensity you externalize. The hurricane and the eye, perfectly contained.",
    "Your reflections fuel your fire rather than dampen it. Every inward moment makes the next outward moment more precise.",
  ],
  "curious+determined": [
    "You don't just research — you INFILTRATE. You won't stop until you've understood something from every possible angle. Dangerous.",
    "Your curiosity has teeth. Every question is followed by another, and another, until you've built a complete picture most people can't even see.",
    "You have the most powerful combination for expertise: the drive to find out combined with the refusal to quit.",
  ],
  "curious+social": [
    "You learn about people the same way you learn about ideas — with relentless, genuine curiosity. People feel DEEPLY seen by you.",
    "You turn every conversation into a research opportunity without anyone realizing it. The data you collect is remarkable.",
    "You don't just network — you INVESTIGATE. Every person you meet becomes a source of insight you couldn't have found anywhere else.",
  ],
  "curious+reflective": [
    "Your curiosity goes inward as powerfully as it goes outward. You're as interested in understanding yourself as you are in understanding the universe.",
    "You ask questions about questions. Your meta-cognition is so developed that you often know exactly why you're curious before you even know what you're curious about.",
    "You have a way of seeing the LIMITATION of most people's thinking without being condescending about it. You just quietly go deeper.",
  ],
  "determined+social": [
    "You don't just achieve — you bring people ALONG. Your determination is only rivaled by your ability to make others believe in what you're building.",
    "You're the rare leader who combines raw will with genuine relational warmth. People follow you because they want to, not because they have to.",
    "You achieve things AND make friends doing it. That combination is rarer — and more powerful — than most people realize.",
  ],
  "determined+reflective": [
    "You have a clear picture of where you're going — and a deep understanding of who you are. That's a combination that builds real power.",
    "Your reflections aren't distractions from your drive — they're reconnaissance. You think your way toward your goals as powerfully as you work toward them.",
    "You know your own mind completely. And you've aimed it at something worthy. That's a force the world isn't ready for.",
  ],
  "social+reflective": [
    "You understand people at a level that goes beyond observation — you genuinely FEEL what others feel, and you reflect it back in the most useful form.",
    "Your combination of social warmth and reflective depth makes you one of the most perceptive connectors alive.",
    "You know how to be alone AND how to connect. Most people sacrifice one for the other. You've mastered both.",
  ],
};

function getBlendLabel(mood1: string, mood2: string): string {
  const key = [mood1, mood2].sort().join("+");
  return BLEND_LABELS[key] || `${mood1.charAt(0).toUpperCase() + mood1.slice(1)} ${mood2.charAt(0).toUpperCase() + mood2.slice(1)} Blend`;
}

function getTraitDeltas(mood1: string, mood2: string) {
  const a = TRAIT_DATA[mood1] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  const b = TRAIT_DATA[mood2] ?? { focus: 0, emotion: 0, creative: 0, social: 0, resilience: 0 };
  return ["focus", "emotion", "creative", "social", "resilience"]
    .map((key) => ({
      key,
      delta: Math.round((a[key] + b[key]) / 2),
    }))
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
    .slice(0, 3)
    .map(({ key, delta }) => {
      const direction = Math.abs(delta) <= 2 ? "nudge" : delta > 0 ? "boost" : "dampen";
      return { key, label: TRAIT_LABELS[key].label, emoji: TRAIT_LABELS[key].emoji, delta, direction };
    });
}

function getBlendDescription(mood1: string, mood2: string): string {
  const key = [mood1, mood2].sort().join("+");
  const descs = BLEND_DESCRIPTIONS[key];
  if (!descs) return `A unique blend of ${mood1} and ${mood2} energy that shapes your personality in distinct ways.`;
  return descs[Math.floor(Math.random() * descs.length)];
}

function getOrbitalPositions(cx: number, cy: number, radius: number) {
  return MOOD_OPTIONS.map((_, i) => {
    const angle = (i / MOOD_OPTIONS.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MoodOrb({
  mood,
  pos,
  isSelected,
  isOtherSelected,
  onTap,
}: {
  mood: (typeof MOOD_OPTIONS)[0];
  pos: { x: number; y: number };
  isSelected: boolean;
  isOtherSelected: boolean;
  onTap: () => void;
}) {
  return isSelected ? (
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
        fontFamily: "'Outfit', sans-serif",
        zIndex: 10,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: "2.5rem", filter: `drop-shadow(0 0 11px ${mood.color})`, lineHeight: 1 }}>
        {mood.emoji}
      </span>
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: mood.color,
          letterSpacing: "0.05em",
        }}
      >
        {mood.label}
      </span>
    </div>
  ) : (
    <div
      onClick={onTap}
      onMouseEnter={(e) => {
        const s = e.currentTarget;
        s.style.transform = "translate(-50%, -50%) scale(1.12)";
        s.style.border = "2px solid rgba(255,255,255,0.35)";
        s.style.boxShadow = "0 0 20px rgba(0,200,255,0.15)";
      }}
      onMouseLeave={(e) => {
        const s = e.currentTarget;
        s.style.transform = "translate(-50%, -50%) scale(1)";
        s.style.border = "2px solid rgba(255,255,255,0.12)";
        s.style.boxShadow = "0 6px 24px rgba(0,0,0,0.5)";
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
        fontFamily: "'Outfit', sans-serif",
        zIndex: 5,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        transition: "transform 0.18s ease, border 0.18s ease, box-shadow 0.18s ease",
        touchAction: "manipulation",
      }}
    >
      <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{mood.emoji}</span>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.52)", letterSpacing: "0.05em" }}>
        {mood.label}
      </span>
    </div>
  );
}

function HandTapHint({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
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
          72%  { opacity: 1; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          82%  { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
        }
        .hand-pointer { animation: hand-tap-loop 3s ease-in-out infinite; pointer-events: none; }
      `}</style>
      <div
        className="hand-pointer"
        style={{
          position: "absolute",
          left: cx,
          top: cy + 132,
          transform: "translate(-50%, -50%)",
          fontSize: "2rem",
          zIndex: 20,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
        }}
      >
        👆
      </div>
    </>
  );
}

function OrbBackground() {
  return (
    <>
      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(44px,-44px) scale(1.13)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-55px,38px) scale(1.1)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(28px,55px) scale(1.07)} }
        .orb-bg-1 { animation: orb1 14s ease-in-out infinite; }
        .orb-bg-2 { animation: orb2 18s ease-in-out infinite reverse; }
        .orb-bg-3 { animation: orb3 12s ease-in-out infinite 3s; }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          className="orb-bg-1"
          style={{
            position: "absolute",
            top: "5%",
            left: "8%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="orb-bg-2"
          style={{
            position: "absolute",
            bottom: "15%",
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(120,0,255,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="orb-bg-3"
          style={{
            position: "absolute",
            top: "35%",
            left: "55%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,0,229,0.08) 0%, transparent 70%)",
          }}
        />
      </div>
    </>
  );
}

function MoodTooltip({
  mood,
  onConfirm,
  onDismiss,
}: {
  mood: (typeof MOOD_OPTIONS)[0];
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
        onClick={(e) => e.stopPropagation()}
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
        <div
          style={{
            fontSize: "4rem",
            marginBottom: 16,
            filter: `drop-shadow(0 0 20px ${mood.color})`,
          }}
        >
          {mood.emoji}
        </div>
        <div
          style={{
            fontSize: "1.7rem",
            fontWeight: 900,
            color: mood.color,
            marginBottom: 8,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {mood.label}
        </div>
        <div
          style={{
            fontSize: "0.88rem",
            color: "rgba(255,255,255,0.48)",
            marginBottom: 28,
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 1.6,
          }}
        >
          {mood.desc}
        </div>
        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: `linear-gradient(90deg, ${mood.color}, ${mood.color}99)`,
            border: "none",
            borderRadius: 50,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            boxShadow: `0 0 24px ${mood.color}40`,
          }}
        >
          Select {mood.label}
        </button>
      </motion.div>
    </motion.div>
  );
}

function BrewingAnimation({
  mood1,
  mood2,
}: {
  mood1: (typeof MOOD_OPTIONS)[0];
  mood2: (typeof MOOD_OPTIONS)[0];
}) {
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
      {/* Rotating outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360 * (Math.PI / 180);
          const x = Math.cos(angle) * 130 - 7;
          const y = Math.sin(angle) * 130 - 7;
          const color = i % 2 === 0 ? mood1.color : mood2.color;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(${x}px, ${y}px)`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 18px ${color}`,
              }}
            />
          );
        })}
      </motion.div>

      {/* Counter-rotating dashed ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.2, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 33,
          borderRadius: "50%",
          border: "1.5px dashed rgba(255,255,255,0.16)",
        }}
      />

      {/* Pulsing inner glow */}
      <div
        style={{
          position: "absolute",
          inset: 70,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${mood1.color}30 0%, ${mood2.color}22 50%, transparent 100%)`,
          animation: "cp 1.1s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes cp { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      `}</style>

      {/* Center emoji */}
      <div style={{ display: "flex", gap: 10, fontSize: "3rem", filter: `drop-shadow(0 0 20px ${mood1.color}68)` }}>
        <motion.span
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}
        >
          {mood1.emoji}
        </motion.span>
        <motion.span
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.25 }}
        >
          {mood2.emoji}
        </motion.span>
      </div>
    </motion.div>
  );
}

function deltaBadgeStyle(direction: string) {
  if (direction === "boost")
    return {
      padding: "4px 12px",
      borderRadius: 50,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
      background: "rgba(74,222,128,0.15)",
      color: "#4ade80",
      border: "1px solid rgba(74,222,128,0.35)",
    };
  if (direction === "nudge")
    return {
      padding: "4px 12px",
      borderRadius: 50,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
      background: "rgba(251,191,36,0.12)",
      color: "#fbbf24",
      border: "1px solid rgba(251,191,36,0.25)",
    };
  return {
    padding: "4px 12px",
    borderRadius: 50,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    background: "rgba(248,113,113,0.12)",
    color: "#f87171",
    border: "1px solid rgba(248,113,113,0.25)",
  };
}

function deltaLabel(direction: string) {
  if (direction === "boost") return "↷ Strong Boost";
  if (direction === "nudge") return "↷ Light Nudge";
  return "↹ Dampens";
}

function BlendResultCard({
  mood1,
  mood2,
  onContinue,
  onReset,
}: {
  mood1: (typeof MOOD_OPTIONS)[0];
  mood2: (typeof MOOD_OPTIONS)[0];
  onContinue: () => void;
  onReset: () => void;
}) {
  const label = getBlendLabel(mood1.id, mood2.id);
  const deltas = getTraitDeltas(mood1.id, mood2.id);
  const desc = getBlendDescription(mood1.id, mood2.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
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
      {/* Gradient border overlay */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 33,
          background: `linear-gradient(135deg, ${mood1.color}32, transparent 40%, transparent 60%, ${mood2.color}32)`,
          zIndex: -1,
        }}
      />

      {/* Premium badge */}
      <div style={{ position: "absolute", top: 16, right: 20 }}>
        <Sparkles size={20} color="#FBBF24" style={{ filter: "drop-shadow(0 0 6px #FBBF24)" }} />
      </div>
      {/* Mood1 emoji small */}
      <div style={{ position: "absolute", top: 22, left: 22 }}>
        <span style={{ fontSize: "1.2rem", filter: `drop-shadow(0 0 6px ${mood1.color})` }}>{mood1.emoji}</span>
      </div>

      {/* Floating emoji pair */}
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
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}>
          {mood1.emoji}
        </motion.span>
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.25 }}>
          {mood2.emoji}
        </motion.span>
      </motion.div>

      {/* Blend name with gradient */}
      <div
        style={{
          fontSize: "clamp(1.5rem, 6vw, 2.4rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          background: `linear-gradient(90deg, ${mood1.color}, ${mood2.color})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: 14,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>

      {/* Mood labels */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
        <span
          style={{
            background: `${mood1.color}16`,
            border: `1px solid ${mood1.color}42`,
            borderRadius: 50,
            padding: "5px 16px",
            fontSize: 12,
            fontWeight: 700,
            color: mood1.color,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {mood1.label}
        </span>
        <span style={{ color: "rgba(255,255,255,0.26)", fontSize: "0.8rem" }}>✦</span>
        <span
          style={{
            background: `${mood2.color}16`,
            border: `1px solid ${mood2.color}42`,
            borderRadius: 50,
            padding: "5px 16px",
            fontSize: 12,
            fontWeight: 700,
            color: mood2.color,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {mood2.label}
        </span>
      </div>

      {/* Blend description */}
      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.47)",
          fontFamily: "'Outfit', sans-serif",
          maxWidth: 330,
          margin: "0 auto 26px",
          lineHeight: 1.65,
        }}
      >
        {desc}
      </p>

      {/* Trait deltas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginBottom: 28 }}>
        {deltas.map(({ key, label: tLabel, emoji: tEmoji, delta, direction }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 320,
            }}
          >
            <span style={{ fontSize: "1rem" }}>{tEmoji}</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif" }}>
                {tLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (Math.abs(delta) / 10) * 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      background: direction === "boost" ? "#4ade80" : direction === "nudge" ? "#fbbf24" : "#f87171",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 44,
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                    color: direction === "boost" ? "#4ade80" : direction === "nudge" ? "#fbbf24" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
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
            fontFamily: "'Outfit', sans-serif",
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            transition: "color 0.2s",
          }}
        >
          <RotateCcw size={14} />
          Try different moods
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main MoodMixer Component ───────────────────────────────────────────────

export default function MoodMixerPage() {
  const [mood1, setMood1] = useState<string | null>(null);
  const [mood2, setMood2] = useState<string | null>(null);
  const [phase, setPhase] = useState<"selecting" | "brewing" | "brewed">("selecting");
  const [tooltipMood, setTooltipMood] = useState<string | null>(null);
  const brewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(432);
  const [containerHeight, setContainerHeight] = useState(320);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setContainerWidth(r.width);
      setContainerHeight(r.height);
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const selectedMood1 = MOOD_OPTIONS.find((m) => m.id === mood1);
  const selectedMood2 = MOOD_OPTIONS.find((m) => m.id === mood2);
  const bothSelected = mood1 !== null && mood2 !== null;
  const oneSelected = mood1 !== null && mood2 === null;
  const hoveredMood = MOOD_OPTIONS.find((m) => m.id === tooltipMood);

  const radius = 132;
  const cx = containerWidth / 2;
  const cy = radius;
  const positions = getOrbitalPositions(cx, cy, radius);

  // Auto-select tier from sessionStorage if not set
  useEffect(() => {
    if (!sessionStorage.getItem("knowrole-tier")) {
      sessionStorage.setItem("knowrole-tier", "25+");
    }
  }, []);

  // Brewing timer
  useEffect(() => {
    return () => {
      if (brewTimeout.current) clearTimeout(brewTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (bothSelected && phase === "selecting") {
      setPhase("brewing");
      brewTimeout.current = setTimeout(() => {
        setPhase("brewed");
      }, 1900);
    }
    if (!bothSelected && phase !== "selecting") {
      if (brewTimeout.current) clearTimeout(brewTimeout.current);
      setPhase("selecting");
      setTooltipMood(null);
    }
  }, [bothSelected, phase]);

  const handleOrbTap = (id: string) => {
    if (phase === "brewing" || phase === "brewed" || tooltipMood) return;
    if (mood1 === id || mood2 === id) return;
    setTooltipMood(id);
  };

  const confirmMood = () => {
    if (!tooltipMood) return;
    if (mood1 === null) {
      setMood1(tooltipMood);
    } else if (mood2 === null) {
      setMood2(tooltipMood);
    }
    setTooltipMood(null);
  };

  const dismissTooltip = () => {
    setTooltipMood(null);
  };

  const handleContinue = () => {
    if (!mood1 || !mood2) return;
    const label = getBlendLabel(mood1, mood2);
    localStorage.setItem("kyr_mood_blend", JSON.stringify({ mood1, mood2, label }));
    sessionStorage.setItem("knowrole-mood-blend", label);
    window.location.href = "/quiz";
  };

  const handleSkip = () => {
    localStorage.removeItem("kyr_mood_blend");
    window.location.href = "/quiz";
  };

  const handleReset = () => {
    if (brewTimeout.current) clearTimeout(brewTimeout.current);
    setMood1(null);
    setMood2(null);
    setPhase("selecting");
    setTooltipMood(null);
  };

  const isSelecting = phase === "selecting";
  const isBrewing = phase === "brewing" && selectedMood1 && selectedMood2;
  const isBrewed = phase === "brewed" && selectedMood1 && selectedMood2;

  const buttonLabel = !mood1 ? "Select 2 moods" : !mood2 ? "Select 1 more mood" : "Blend Ready";

  return (
    <div
      style={{
        background: "#050510",
        minHeight: "100vh",
        fontFamily: "'Outfit', sans-serif",
        color: "#fff",
        overflowX: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <OrbBackground />

      {/* Fixed header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => history.back()}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: 20,
            padding: 8,
            borderRadius: 8,
            fontFamily: "'Outfit', sans-serif",
            display: "flex",
            alignItems: "center",
          }}
        >
          ←
        </button>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#7800FF",
            letterSpacing: "0.12em",
          }}
        >
          STEP 2 OF 3
        </span>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 57,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.06)",
          zIndex: 50,
        }}
      >
        <motion.div
          animate={{
            width: isBrewed ? "100%" : isBrewing ? "75%" : "50%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #7800FF, #FF00E5)",
          }}
        />
      </div>

      {/* Page content */}
      <div style={{ padding: "clamp(364px, 11vw, 390px) 24px 0", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#FF00E5",
            marginBottom: 6,
          }}
        >
          Set Your Vibe
        </p>
        <h1
          style={{
            fontSize: "clamp(1.9rem, 7vw, 3rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Mood Mixer
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 360,
            margin: "0 auto",
            lineHeight: 1.55,
          }}
        >
          {isBrewed
            ? "Your blend is ready. Time to discover who you are."
            : "Tap two moods to brew your unique blend."}
        </p>
      </div>

      {/* Orb area */}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 180 }}>
        <AnimatePresence mode="wait">
          {isSelecting && (
            <motion.div
              key="selecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              ref={containerRef}
              style={{ position: "relative", width: "100%", height: radius + 100 }}
            >
              {/* Hand tap hint — only shows when nothing selected */}
              {!oneSelected && !bothSelected && <HandTapHint cx={cx} cy={cy} />}
              {MOOD_OPTIONS.map((mood, i) => (
                <MoodOrb
                  key={mood.id}
                  mood={mood}
                  pos={positions[i]}
                  isSelected={mood1 === mood.id || mood2 === mood.id}
                  isOtherSelected={mood1 !== null && mood1 !== mood.id && mood2 === null}
                  onTap={() => handleOrbTap(mood.id)}
                />
              ))}
            </motion.div>
          )}

          {isBrewing && (
            <motion.div
              key="brewing"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 4 }}
            >
              <BrewingAnimation mood1={selectedMood1!} mood2={selectedMood2!} />
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
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Brewing your vibe...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brewed result card */}
        <div style={{ padding: "0 clamp(16px, 5vw, 48px)", marginTop: 28 }}>
          <AnimatePresence>
            {isBrewed && (
              <BlendResultCard
                mood1={selectedMood1!}
                mood2={selectedMood2!}
                onContinue={handleContinue}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed bottom bar — shows during selecting phase */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            key="bottom-bar"
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
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.28)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                padding: "10px 4px",
                transition: "color 0.2s",
              }}
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
                fontFamily: "'Outfit', sans-serif",
                minWidth: 162,
                textAlign: "center",
              }}
            >
              {buttonLabel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood tooltip */}
      <AnimatePresence>
        {tooltipMood && hoveredMood && (
          <MoodTooltip mood={hoveredMood} onConfirm={confirmMood} onDismiss={dismissTooltip} />
        )}
      </AnimatePresence>

      {/* Footer branding */}
      <footer style={{
        borderTop: "1px solid rgba(229,231,235,0.1)",
        padding: "32px 24px 24px",
        textAlign: "center",
        marginTop: "auto",
      }}>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: "#fff",
          margin: "0 0 4px",
          letterSpacing: "-0.01em",
        }}>KnowYouRole</p>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 8px",
          maxWidth: 280,
          marginInline: "auto",
          lineHeight: 1.5,
        }}>Personality science made accessible, fun, and genuinely useful.</p>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          margin: 0,
        }}>© 2026 KnowYouRole. All rights reserved.</p>
      </footer>
    </div>
  );
}
