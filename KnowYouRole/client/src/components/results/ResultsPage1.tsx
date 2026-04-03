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

        {/* 4-dimension grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Mind",     A: s.scores.mbti.E, B: s.scores.mbti.I },
            { label: "Energy",   A: s.scores.mbti.N, B: s.scores.mbti.S },
            { label: "Nature",   A: s.scores.mbti.T, B: s.scores.mbti.F },
            { label: "Tactics",  A: s.scores.mbti.J, B: s.scores.mbti.P },
          ].map((dim) => {
            const total = dim.A + dim.B || 1;
            const value = Math.round((dim.A / total) * 100);
            return (
              <div key={dim.label} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-dim)" }}>{dim.label}</div>
                <div className="text-sm font-bold text-white mb-1.5">{value}%</div>
                <div className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      background: "linear-gradient(90deg, var(--cyan), var(--purple))",
                    }}/>
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
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6)",
          margin: "-5px -5px 0",
          width: "calc(100% + 10px)",
          borderRadius: "20px 20px 0 0",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <BarChart2 className="w-5 h-5" style={{ color: "#ef4444" }} />
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

        {/* DISC bars */}
        <div className="space-y-3">
          {(["D", "I", "S", "C"] as const).map((letter) => {
            const score = discScoreMap[letter];
            const color = discColorMap[letter];
            return (
              <div key={letter} className="flex items-center gap-3">
                <div className="text-sm font-extrabold w-4 text-center"
                  style={{ color }}>{letter}</div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }}/>
                </div>
                <div className="text-sm font-bold w-8 text-right" style={{ color: "var(--text-dim)" }}>
                  {score}%
                </div>
              </div>
            );
          })}
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
