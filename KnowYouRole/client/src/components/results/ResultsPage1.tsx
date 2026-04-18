import { motion } from "framer-motion";
import { Trophy, Brain, BarChart2, Dices, Sparkles, Lock, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TRAIT_LABELS, calculatePercentile } from "./resultsData";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage1({ s }: { s: ResultsState }) {
  const {
    result,
    shouldReduceMotion,
    topJobMatch,
    jobMatchLoading,
    sortedBigFive,
    setCurrentResultsPage,
    handleUpgrade,
    isAuthenticated,
    currentResultsPage,
  } = s;

  const percentileMap: Record<string, number> = {
    O: calculatePercentile(result.bigFiveProfile.O, "O"),
    C: calculatePercentile(result.bigFiveProfile.C, "C"),
    E: calculatePercentile(result.bigFiveProfile.E, "E"),
    A: calculatePercentile(result.bigFiveProfile.A, "A"),
    N: calculatePercentile(result.bigFiveProfile.N, "N"),
  };

  const traitColorMap: Record<string, string> = {
    O: "var(--cyan)",
    C: "var(--purple)",
    E: "var(--pink)",
    A: "var(--gold)",
    N: "#64748b",
  };

  const discColorMap: Record<string, string> = {
    D: "#ef4444",
    I: "#f59e0b",
    S: "#22c55e",
    C: "#3b82f6",
  };

  const discScoreMap: Record<string, number> = {
    D: s.scores.disc.D || 0,
    I: s.scores.disc.I || 0,
    S: s.scores.disc.S || 0,
    C: s.scores.disc.C || 0,
  };
  const topDisc = Object.entries(discScoreMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      {/* ── Hero Badge ── */}
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
          <Trophy className="w-4 h-4" />
          Your Quick Glimpse
        </div>
      </motion.div>

      {/* ── 💼 Career Match Card ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[20px] p-5"
        style={{
          background: "rgba(245, 158, 11, 0.07)",
          border: "1px solid rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Gradient top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--gold), var(--gold-light))",
          borderRadius: "20px 20px 0 0",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
            💼
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">#1 Career Match</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>
              {topJobMatch?.roleName || result.primaryRole?.title || "Systems Architect"}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold" style={{ color: "var(--gold-light)" }}>
              {topJobMatch?.salary || "$120K – $180K"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["🧠 Strategy", "💻 Tech", "📐 Architecture", "📈 18% growth"].map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-dim)",
              }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── 🧠 MBTI Card ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--purple), var(--pink))",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
          borderRadius: "20px 20px 0 0",
        }}/>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)" }}>
              <Brain className="w-5 h-5" style={{ color: "var(--purple)" }} />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                {result.mbtiType} — {result.mbtiLabel}
              </div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                16 Personalities · Strategist
              </div>
            </div>
          </div>
          <div className="text-xs font-bold px-2 py-1 rounded-md"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "var(--purple)" }}>
            Rare Type
          </div>
        </div>

        {/* MBTI bipolar bars — redesigned */}
        <div className="space-y-5">
          {[
            {
              label: "Mind",
              A: s.scores.mbti.E, B: s.scores.mbti.I,
              letterA: "E", nameA: "Extrovert",
              letterB: "I", nameB: "Introvert",
              descA: "Recharge socially",
              descB: "Recharge alone",
            },
            {
              label: "Energy",
              A: s.scores.mbti.N, B: s.scores.mbti.S,
              letterA: "N", nameA: "Intuitive",
              letterB: "S", nameB: "Observant",
              descA: "See patterns & futures",
              descB: "Focus on real & practical",
            },
            {
              label: "Nature",
              A: s.scores.mbti.T, B: s.scores.mbti.F,
              letterA: "T", nameA: "Thinking",
              letterB: "F", nameB: "Feeling",
              descA: "Lead with logic",
              descB: "Lead with values",
            },
            {
              label: "Tactics",
              A: s.scores.mbti.J, B: s.scores.mbti.P,
              letterA: "J", nameA: "Judging",
              letterB: "P", nameB: "Prospecting",
              descA: "Prefer structure",
              descB: "Stay flexible",
            },
          ].map((dim) => {
            const total = dim.A + dim.B || 1;
            const pct = Math.round((dim.A / total) * 100);
            const isADominant = dim.A >= dim.B;
            // Gradient fills the dominant half proportionally
            const dominantFill = (dim.A / total) * 50;
            const mutedFill = 50 - dominantFill;

            return (
              <div key={dim.label} className="flex items-start gap-4">
                {/* Left: label + % */}
                <div className="flex flex-col items-center justify-start pt-0.5" style={{ minWidth: "52px" }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest leading-none"
                    style={{ color: "var(--text-dim)" }}>{dim.label}</div>
                  <div className="text-xl font-black leading-none mt-1"
                    style={{ color: isADominant ? "var(--purple)" : "var(--cyan)" }}>
                    {pct}%
                  </div>
                </div>

                {/* Center: 3-section bar */}
                <div className="flex-1 relative" style={{ height: "28px" }}>
                  {/* Bar track */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {/* Center divider */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px z-10"
                      style={{ background: "rgba(255,255,255,0.2)" }}/>

                    {/* E side (left half) */}
                    <div className="absolute top-0 bottom-0 left-0 overflow-hidden"
                      style={{ width: "50%" }}>
                      <div className="absolute top-0 right-0 bottom-0 rounded-l-full overflow-hidden"
                        style={{
                          width: `${(dim.A / total) * 100}%`,
                          background: "linear-gradient(90deg, var(--cyan), var(--purple))",
                        }}/>
                    </div>

                    {/* I side (right half) */}
                    <div className="absolute top-0 bottom-0 right-0 overflow-hidden"
                      style={{ width: "50%" }}>
                      <div className="absolute top-0 left-0 bottom-0 rounded-r-full overflow-hidden"
                        style={{
                          width: `${(dim.B / total) * 100}%`,
                          background: "rgba(255,255,255,0.08)",
                        }}/>
                    </div>
                  </div>

                  {/* E / I letter badges — above the bar, right-aligned to their halves */}
                  <div className="absolute inset-x-0 top-0 flex" style={{ height: "22px" }}>
                    {/* E badge — above left half */}
                    <div className="flex items-center justify-center"
                      style={{ width: "50%", paddingRight: "2px" }}>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black"
                          style={{ color: dim.A >= dim.B ? "var(--purple)" : "var(--text-dim)" }}>
                          {dim.letterA}
                        </span>
                        <span className="text-[10px] font-medium leading-none"
                          style={{ color: "var(--text-dim)" }}>
                          {dim.nameA}
                        </span>
                      </div>
                    </div>
                    {/* I badge — above right half */}
                    <div className="flex items-center justify-center"
                      style={{ width: "50%", paddingLeft: "2px" }}>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black"
                          style={{ color: dim.B > dim.A ? "var(--cyan)" : "var(--text-dim)" }}>
                          {dim.letterB}
                        </span>
                        <span className="text-[10px] font-medium leading-none"
                          style={{ color: "var(--text-dim)" }}>
                          {dim.nameB}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions — below the bar, flanking the center line */}
                  <div className="absolute inset-x-0 bottom-0 flex" style={{ height: "18px" }}>
                    <div className="flex justify-end items-start pr-1" style={{ width: "50%" }}>
                      <span className="text-[10px] leading-tight text-right"
                        style={{ color: "var(--text-muted)" }}>{dim.descA}</span>
                    </div>
                    <div className="flex justify-start items-start pl-1" style={{ width: "50%" }}>
                      <span className="text-[10px] leading-tight text-left"
                        style={{ color: "var(--text-muted)" }}>{dim.descB}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 📊 DISC Card ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-[20px] p-5"
      >
        {/* Top accent bar — uses primary DISC color */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: discColorMap[result.discStyle] || "#ef4444",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
          borderRadius: "20px 20px 0 0",
        }}/>

        {/* Primary DISC — letter, label, 3-sentence description */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: `${discColorMap[result.discStyle]}18`,
              border: `1px solid ${discColorMap[result.discStyle]}50`,
            }}>
            <BarChart2 className="w-5 h-5" style={{ color: discColorMap[result.discStyle] }} />
          </div>
          <div>
            <div className="text-base font-bold text-white">
              {result.discStyle} — {result.discLabel}
            </div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>
              DISC Profile · Primary Style
            </div>
          </div>
        </div>

        {/* 3-sentence description of primary DISC */}
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {result.discDesc}
        </p>

        {/* Secondary DISC — letter + label only, muted */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-sm font-extrabold w-5 text-center"
            style={{ color: discColorMap[result.secondaryDisc] || "#f59e0b" }}>
            {result.secondaryDisc}
          </div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
            {result.secondaryDiscLabel}
          </div>
          <div className="ml-auto text-xs" style={{ color: "var(--text-dim)" }}>Secondary</div>
        </div>
      </motion.div>

      {/* ── 🧬 Big Five Card ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--cyan), var(--purple))",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
          borderRadius: "20px 20px 0 0",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}>
            🧬
          </div>
          <div>
            <div className="text-base font-bold text-white">Big Five · Openness Dominant</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>
              {percentileMap["O"]}th percentile · US adults
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedBigFive.map(([trait, value]: [string, number]) => {
            const color = traitColorMap[trait] || "var(--cyan)";
            const percentile = percentileMap[trait] || 50;
            return (
              <div key={trait} className="flex items-center gap-3">
                <div className="text-sm font-semibold w-[90px] flex-shrink-0" style={{ color }}>
                  {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait}
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${value}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    }}/>
                </div>
                <div className="text-sm font-extrabold w-10 text-right flex-shrink-0">
                  <span style={{ color }}>{value}</span>
                  <span className="text-xs ml-0.5" style={{ color: "var(--text-dim)" }}>
                    {percentile}th%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 🔓 Dual CTA ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-[20px] p-5"
        style={{
          background: "rgba(168, 85, 247, 0.1)",
          border: "1px solid rgba(168, 85, 247, 0.18)",
        }}
      >
        {/* Gradient top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--cyan), var(--purple))",
          borderRadius: "20px 20px 0 0",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
        }}/>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🔓</div>
          <div className="text-base font-bold text-white mb-1">Want More?</div>
          <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            Login free or unlock premium to see full trait breakdowns, city matches, and personality insights.
          </div>
        </div>

        {/* Option 1: Free Login */}
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold mb-3 transition-all"
          style={{
            background: "transparent",
            border: "1px solid var(--glass-border-bright)",
            color: "var(--text-muted)",
          }}
          onClick={() => {
            if (!isAuthenticated) {
              const returnTo = window.location.pathname + "?page=2" + window.location.hash;
              sessionStorage.setItem("knowrole-auth-returnTo", returnTo);
              window.location.href = "/auth?returnTo=" + encodeURIComponent(returnTo);
            } else {
              setCurrentResultsPage(2);
            }
          }}
        >
          🔑 Login free for more details
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        {/* Option 2: Premium */}
        <button
          className="w-full py-4 rounded-xl text-base font-extrabold mb-4 transition-all flex flex-col items-center gap-1"
          style={{
            background: "linear-gradient(135deg, var(--teal), #0891b2)",
            border: "none",
            color: "#022c22",
            boxShadow: "0 4px 24px rgba(6, 182, 212, 0.35)",
          }}
          onClick={() => {
            if (s.isPremiumUnlocked) {
              setCurrentResultsPage(3);
            } else {
              setCurrentResultsPage(3); // TODO: show upgrade flow
            }
          }}
        >
          🔓 Premium Results
          <span className="text-xs font-medium opacity-70">
            Blindspots · 3 Role Matches · Dream Advisor · Career Simulator
          </span>
        </button>

        {/* Premium features */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: "🛡", label: "Blindspot Discovery" },
            { icon: "🎯", label: "3 Role Matches" },
            { icon: "💭", label: "Dream Role Advisor" },
            { icon: "🎮", label: "Career Simulator" },
          ].map((f) => (
            <div key={f.label} className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                color: "var(--teal)",
              }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Spacer for footer */}
      <div className="h-8" />
    </div>
  );
}
