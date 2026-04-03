"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Crown, Shield, Gift, BookOpen, Puzzle, Compass, Star, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ResultsState } from "./ResultsTypes";

const CARDS = {
  deepdive: {
    color: "cyan",
    icon: "📖",
    title: "Deep Dive",
    subtitle: "Tap each section to explore",
    counter: "1/7",
    gradient: "linear-gradient(90deg, var(--cyan), var(--purple))",
    iconBg: "rgba(34,211,238,0.1)",
    iconBorder: "rgba(34,211,238,0.3)",
    render: () => (
      <div className="flex flex-col gap-2">
        {[
          { emoji: "🎯", title: "Why Systems Architect?", sub: "Your intuitive thinking + strategic foresight" },
          { emoji: "📊", title: "Your Big Five Profile", sub: "Openness at 82% — your superpower" },
          { emoji: "🏢", title: "Ideal Work Environment", sub: "Autonomy + deep focus + technical challenges" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.12)",
            }}>
            <span style={{ fontSize: "18px" }}>{item.emoji}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{item.title}</div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>{item.sub}</div>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: "18px" }}>›</span>
          </div>
        ))}
      </div>
    ),
  },
  roles: {
    color: "amber",
    icon: "🎁",
    title: "Role Matches",
    subtitle: "Why these roles fit you",
    counter: "2/7",
    gradient: "linear-gradient(90deg, var(--gold), var(--gold-light))",
    iconBg: "rgba(245,158,11,0.1)",
    iconBorder: "rgba(245,158,11,0.3)",
    render: () => (
      <div className="flex flex-col gap-2">
        {[
          { rank: "#1", title: "Systems Architect", salary: "$120K – $180K", pct: 98, primary: true },
          { rank: "#2", title: "Innovation Strategist", salary: "$95K – $145K", pct: 91, primary: false },
          { rank: "#3", title: "Tech Lead", salary: "$110K – $165K", pct: 87, primary: false },
        ].map((role) => (
          <div key={role.rank} className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: role.primary ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
              border: role.primary ? "1px solid rgba(245,158,11,0.25)" : "1px solid var(--glass-border)",
            }}>
            <div className="text-sm font-extrabold opacity-50 w-6 text-center" style={{ color: "var(--gold)" }}>
              {role.rank}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{role.title}</div>
              <div className="text-xs" style={{ color: "var(--cyan-dim)" }}>{role.salary}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-extrabold" style={{ color: role.primary ? "var(--gold)" : "var(--text-muted)" }}>
                {role.pct}%
              </div>
              <div className="w-10 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${role.pct}%`, background: role.primary ? "var(--gold)" : "var(--purple)" }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  blindspots: {
    color: "pink",
    icon: "🛡",
    title: "Your Blindspots",
    subtitle: "Tap each card to reveal the fix",
    counter: "3/7",
    gradient: "linear-gradient(90deg, var(--pink), var(--purple))",
    iconBg: "rgba(244,114,182,0.1)",
    iconBorder: "rgba(244,114,182,0.3)",
    render: () => (
      <div className="grid grid-cols-2 gap-2">
        {[
          { severity: "moderate", title: "Decision Paralysis", issue: "Overanalyzing every decision until you freeze.", fix: "Set a 48hr decision deadline. Embrace 'directionally correct.'" },
          { severity: "high", title: "Social Recharge Gap", issue: "Withdrawing from social energy to protect momentum.", fix: "Schedule 15min social blocks as non-negotiable items." },
        ].map((bs) => (
          <div key={bs.title} className="rounded-xl overflow-hidden"
            style={{ perspective: "800px" }}>
            <div className="p-3 rounded-xl h-full"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                minHeight: "100px",
              }}>
              <div className="text-xs font-bold mb-1 uppercase tracking-wider"
                style={{ color: bs.severity === "high" ? "#fca5a5" : "#fcd34d" }}>
                ⚠ {bs.severity}
              </div>
              <div className="text-sm font-bold text-white mb-1">{bs.title}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>{bs.issue}</div>
              <div className="text-xs mt-1.5" style={{ color: "var(--cyan)" }}>→ {bs.fix}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  hustles: {
    color: "amber",
    icon: "💵",
    title: "Side Hustles",
    subtitle: "Matched to your traits",
    counter: "4/7",
    gradient: "linear-gradient(90deg, var(--gold), var(--gold-light))",
    iconBg: "rgba(245,158,11,0.1)",
    iconBorder: "rgba(245,158,11,0.3)",
    render: () => (
      <div>
        <div className="rounded-xl p-4 mb-3"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}>
          <div className="flex justify-between items-start mb-2">
            <div className="text-base font-bold text-white">AI Consulting</div>
            <div className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
              $2K–8K/mo
            </div>
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            Offer 1hr strategy sessions to startups needing technical direction. Your INTJ pattern recognition commands premium rates.
          </div>
          <div className="flex gap-4">
            {["💰 $500 startup", "⏱ 5–10 hrs/wk", "📈 98% fit"].map((m) => (
              <div key={m} className="text-xs" style={{ color: "var(--text-dim)" }}>{m}</div>
            ))}
          </div>
        </div>
        {/* Carousel dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1.5 rounded-full transition-all"
              style={{
                width: i === 0 ? "20px" : "6px",
                background: i === 0 ? "var(--cyan)" : "rgba(255,255,255,0.15)",
              }}/>
          ))}
        </div>
      </div>
    ),
  },
  learning: {
    color: "teal",
    icon: "📚",
    title: "How You Learn",
    subtitle: "Tap each tip to expand",
    counter: "5/7",
    gradient: "linear-gradient(90deg, #14b8a6, #2dd4bf)",
    iconBg: "rgba(20,184,166,0.1)",
    iconBorder: "rgba(20,184,166,0.3)",
    render: () => (
      <div>
        <div className="rounded-xl p-3 mb-3"
          style={{
            background: "rgba(20,184,166,0.06)",
            border: "1px solid rgba(20,184,166,0.15)",
          }}>
          <div className="text-base font-bold text-white mb-1">📖 Reading-Writing Learner</div>
          <div className="text-xs mb-3" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            You absorb ideas best through written documentation, research papers, and structured note-taking systems.
          </div>
          {[
            { emoji: "📚", text: "Keep a research journal for new concepts" },
            { emoji: "✏️", text: "Summarize articles in your own words daily" },
            { emoji: "📝", text: "Build a personal wiki of career insights" },
          ].map((tip) => (
            <div key={tip.text} className="flex items-center gap-2.5 py-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}>
              <span style={{ fontSize: "14px" }}>{tip.emoji}</span>
              {tip.text}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  thinking: {
    color: "indigo",
    icon: "🧩",
    title: "Sharpen Thinking",
    subtitle: "Critical thinking mini training",
    counter: "6/7",
    gradient: "linear-gradient(90deg, #6366f1, #818cf8)",
    iconBg: "rgba(99,102,241,0.1)",
    iconBorder: "rgba(99,102,241,0.3)",
    render: () => (
      <div className="rounded-xl p-4 text-center"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧩</div>
        <div className="text-base font-bold text-white mb-2">First Principles Challenge</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
          "What would this look like if we started from zero?" — Break down complex problems into their fundamental truths.
        </div>
        <button className="text-xs font-semibold px-5 py-2 rounded-xl transition-all"
          style={{
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "#a5b4fc",
          }}>
          ▶ Try the Exercise
        </button>
      </div>
    ),
  },
  crossroads: {
    color: "purple",
    icon: "🧭",
    title: "Crossroads Adventure",
    subtitle: "Interactive career simulation",
    counter: "7/7",
    gradient: "linear-gradient(90deg, var(--purple), var(--cyan))",
    iconBg: "rgba(168,85,247,0.1)",
    iconBorder: "rgba(168,85,247,0.3)",
    render: () => (
      <div className="rounded-xl p-4 text-center"
        style={{
          background: "rgba(168,85,247,0.08)",
          border: "1px solid rgba(168,85,247,0.15)",
        }}>
        <div className="text-base font-bold text-white mb-1">Choose Your Next Career Move</div>
        <div className="text-xs mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
          Navigate branching scenarios where your personality traits shape outcomes. Like an RPG — but for your real career.
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {["7 Scenarios", "Your Choices Matter", "Trait Reveals"].map((tag) => (
            <div key={tag} className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-dim)",
              }}>
              {tag}
            </div>
          ))}
        </div>
        <button className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
          style={{
            background: "linear-gradient(135deg, var(--cyan), var(--purple))",
            border: "none",
            color: "#030108",
            boxShadow: "0 4px 20px rgba(34,211,238,0.2)",
          }}>
          ▶ Start Adventure
        </button>
      </div>
    ),
  },
} as const;

type CardId = keyof typeof CARDS;

const CONSTELLATIONS: { id: CardId; icon: string; name: string }[] = [
  { id: "deepdive", icon: "📖", name: "Deep Dive" },
  { id: "roles", icon: "🎁", name: "Role Match" },
  { id: "blindspots", icon: "🛡", name: "Blindspots" },
  { id: "hustles", icon: "💵", name: "Side Hustle" },
  { id: "learning", icon: "📚", name: "How You Learn" },
  { id: "thinking", icon: "🧩", name: "Sharpen Thinking" },
  { id: "crossroads", icon: "🧭", name: "Crossroads" },
];

export function ResultsPage3({ s }: { s: ResultsState }) {
  const {
    result, shouldReduceMotion, isFull, isPremiumUnlocked,
    currentResultsPage, setCurrentResultsPage,
  } = s;

  const [activeCard, setActiveCard] = useState<CardId>("deepdive");
  const stripRef = useRef<HTMLDivElement>(null);

  const active = CARDS[activeCard];

  return (
    <div className="space-y-4">

      {/* ── Premium Badge ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: "rgba(34, 211, 238, 0.08)",
            border: "1px solid rgba(34, 211, 238, 0.25)",
            color: "var(--cyan)",
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.1)",
          }}
        >
          ✦ Premium Unlocked
        </div>
      </motion.div>

      {/* ── Hero Title ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center"
      >
        <div className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-serif, Playfair Display, Georgia, serif)" }}>
          Your Personality Nexus
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          {result.mbtiType} · {result.mbtiLabel} · The Mastermind
        </div>
      </motion.div>

      {/* ── Profile Summary ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-[20px] p-4"
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "MBTI", value: result.mbtiType, icon: "🧠" },
            { label: "DISC", value: result.discStyle, icon: "📊" },
            { label: "Openness", value: `${result.bigFiveProfile.O}%`, icon: "🎯" },
            { label: "Salary", value: "$142K", icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: "16px", marginBottom: "2px" }}>{stat.icon}</div>
              <div className="text-sm font-extrabold text-white leading-tight">{stat.value}</div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Constellation Nav Section ── */}
      <div>
        {/* Section label */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--glass-border))" }}/>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Explore Insights</div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--glass-border), transparent)" }}/>
        </div>

        {/* Swipe hint */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>← Swipe to explore →</span>
        </div>

        {/* Horizontal scrollable constellation strip */}
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto py-2 px-1"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {CONSTELLATIONS.map((item) => {
            const isActive = activeCard === item.id;
            return (
              <div
                key={item.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
                onClick={() => {
                  setActiveCard(item.id);
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all relative"
                  style={{
                    background: isActive ? "rgba(34,211,238,0.12)" : "var(--glass-bg)",
                    border: isActive ? "1.5px solid var(--cyan)" : "1.5px solid var(--glass-border)",
                    boxShadow: isActive ? "0 0 20px rgba(34,211,238,0.25), 0 0 40px rgba(34,211,238,0.1)" : "none",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {/* Orbiting ring */}
                  <div style={{
                    position: "absolute",
                    inset: "-5px",
                    borderRadius: "50%",
                    border: "1px dashed rgba(255,255,255,0.06)",
                    animation: isActive ? "orbitSpin 12s linear infinite" : "none",
                  }}/>
                  {item.icon}
                </div>
                <div className="text-xs font-semibold text-center leading-tight"
                  style={{ color: isActive ? "var(--cyan)" : "var(--text-muted)", maxWidth: "64px" }}>
                  {item.name}
                </div>
                <div className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: isActive ? "var(--cyan)" : "var(--text-dim)",
                    boxShadow: isActive ? "0 0 6px var(--cyan)" : "none",
                  }}/>
              </div>
            );
          })}
        </div>

        {/* Feature Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-[20px] mt-3 overflow-hidden"
          >
            {/* Gradient top bar */}
            <div style={{ height: "2px", background: active.gradient }}/>

            <div className="p-5">
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: active.iconBg,
                      border: `1px solid ${active.iconBorder}`,
                    }}>
                    {active.icon}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{active.title}</div>
                    <div className="text-xs" style={{ color: "var(--text-dim)" }}>{active.subtitle}</div>
                  </div>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>
                  {active.counter}
                </div>
              </div>

              {/* Card content */}
              {active.render()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dream Role Advisor ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{ height: "2px", background: "linear-gradient(90deg, var(--cyan), var(--purple))", margin: "-5px -5px 0", width: "calc(100% + 10px)", borderRadius: "20px 20px 0 0" }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(34,211,238,0.2)" }}>
            ✨
          </div>
          <div>
            <div className="text-base font-bold text-white">Dream Role Advisor</div>
            <div className="text-xs" style={{ color: "var(--cyan-dim)" }}>AI-powered career path finder</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Start typing a role..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(34,211,238,0.15)",
              color: "white",
              fontFamily: "var(--font-body, Inter, sans-serif)",
            }}
          />
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "linear-gradient(135deg, var(--cyan), var(--purple))",
              border: "none",
              boxShadow: "0 4px 15px rgba(34,211,238,0.2)",
              color: "#030108",
              fontSize: "18px",
            }}>
            ⌕
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["Registered Nurse", "Software Developer", "Financial Analyst", "Product Manager"].map((tag) => (
            <div key={tag} className="text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(34,211,238,0.15)",
                color: "var(--cyan-dim)",
              }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Path */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
            📍 Your Path to Tech Lead
          </div>
          <div className="flex flex-col gap-3">
            {[
              { step: "1", text: <><strong>Master system design</strong> — study distributed systems 4hrs/wk</> },
              { step: "2", text: <><strong>Lead cross-functional projects</strong> — volunteer for cross-team initiatives</> },
              { step: "3", text: <><strong>Build executive presence</strong> — present to leadership quarterly</> },
              { step: "4", text: <><strong>Mentor junior engineers</strong> — 2hrs/week teaching builds leadership</> },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.3)",
                    color: "var(--cyan)",
                  }}>
                  {item.step}
                </div>
                <div className="text-sm flex-1 pt-0.5" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Evolution Timeline ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass rounded-[20px] p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div style={{ fontSize: "20px" }}>📈</div>
          <div className="text-base font-bold text-white">Personality Evolution</div>
        </div>

        <div className="relative pl-4" style={{ borderLeft: "1px solid rgba(34,211,238,0.2)" }}>
          {[
            { year: "NOW — AGE 28", text: <>Peak analytical power. <strong>Strategic vision sharpest ever.</strong></> },
            { year: "AGE 30 — 35", text: <>Conscientiousness grows. <strong>Leadership presence emerges.</strong></> },
            { year: "AGE 38 — 45", text: <>Expert mastery + wisdom. <strong>CTO, VP Eng, Board advisory.</strong></> },
          ].map((event) => (
            <div key={event.year} className="relative mb-4">
              <div
                className="absolute w-2 h-2 rounded-full -left-[21px] top-1.5"
                style={{ background: "var(--cyan)", boxShadow: "0 0 8px rgba(34,211,238,0.5)" }}
              />
              <div className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--cyan)" }}>
                {event.year}
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                {event.text}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-8" />
    </div>
  );
}
