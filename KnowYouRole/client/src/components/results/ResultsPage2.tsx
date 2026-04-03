import { motion } from "framer-motion";
import { Sparkles, Brain, BarChart2, Globe, TrendingUp, MapPin, Crown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TRAIT_LABELS, calculatePercentile } from "./resultsData";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage2({ s }: { s: ResultsState }) {
  const {
    result, scores, shouldReduceMotion, isFull,
    topJobMatch, jobMatches, jobMatchLoading,
    cityName, stateName, localeInsight,
    sortedBigFive, traitKeys,
    currentResultsPage, setCurrentResultsPage,
    isPremiumUnlocked, isCheckingOut,
    handleUpgrade,
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
    D: scores.disc.D || 0,
    I: scores.disc.I || 0,
    S: scores.disc.S || 0,
    C: scores.disc.C || 0,
  };
  const discLabels: Record<string, string> = {
    D: "Dominant",
    I: "Influential",
    S: "Steadiness",
    C: "Conscientious",
  };

  // Top cities (mock data or localeInsight)
  const topCities = localeInsight
    ? [
        { name: cityName || "Your City", jobs: localeInsight.opportunities?.[0] || "Great openings", salary: "$130K+", rank: "#1" },
        { name: "San Francisco", jobs: "5,120 openings", salary: "$162K avg", rank: "#2" },
        { name: "Seattle", jobs: "3,900 openings", salary: "$148K avg", rank: "#3" },
        { name: "Denver", jobs: "2,210 openings", salary: "$131K avg", rank: "#4" },
      ]
    : [
        { name: "Austin, TX", jobs: "2,840 openings", salary: "$138K avg", rank: "#1" },
        { name: "San Francisco", jobs: "5,120 openings", salary: "$162K avg", rank: "#2" },
        { name: "Seattle, WA", jobs: "3,900 openings", salary: "$148K avg", rank: "#3" },
        { name: "Denver, CO", jobs: "2,210 openings", salary: "$131K avg", rank: "#4" },
      ];

  // Radar chart data (Openness, Conscientiousness, Extroversion, Agreeableness — N/A)
  // Use O, C, E, A
  const radarData = [
    { trait: "O", value: result.bigFiveProfile.O, label: "Openness", angle: 0 },
    { trait: "C", value: result.bigFiveProfile.C, label: "Conscientious", angle: 90 },
    { trait: "E", value: result.bigFiveProfile.E, label: "Extroversion", angle: 180 },
    { trait: "A", value: result.bigFiveProfile.A, label: "Agreeable", angle: 270 },
  ];
  const radarCx = 100, radarCy = 100, radarR = 75;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const getRadarPoint = (value: number, angle: number) => {
    const r = (value / 100) * radarR;
    return {
      x: radarCx + r * Math.cos(toRad(angle - 90)),
      y: radarCy + r * Math.sin(toRad(angle - 90)),
    };
  };
  const polygonPoints = radarData
    .map((d) => {
      const pt = getRadarPoint(d.value, d.angle);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  const discEntries = Object.entries(discScoreMap).sort((a, b) => b[1] - a[1]) as [string, number][];

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
          <Sparkles className="w-4 h-4" />
          Full Portrait · Logged In
        </div>
      </motion.div>

      {/* ── Profile Header Stack ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {/* Big type card */}
        <div className="glass rounded-[20px] p-5 relative overflow-hidden">
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.05))",
            pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--cyan), var(--purple), var(--pink))",
          }}/>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
            Your Type
          </div>
          <div className="text-4xl font-extrabold mb-1 leading-none"
            style={{
              background: "linear-gradient(135deg, var(--cyan), #67e8f9, var(--purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            {result.mbtiType}
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: "var(--cyan)" }}>
            {result.mbtiLabel}
          </div>
          <div className="text-xs" style={{ color: "var(--text-dim)" }}>
            Only <strong style={{ color: "var(--text-muted)" }}>2.4%</strong> of the population shares this type
          </div>
        </div>

        {/* 2×2 mini grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* DISC */}
          <div className="glass rounded-[16px] p-4">
            <div className="text-base mb-1">📊</div>
            <div className="text-lg font-extrabold text-white">{scores.disc.D}%</div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>DISC · Dominant</div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${scores.disc.D}%`, background: "#ef4444" }}/>
            </div>
          </div>
          {/* Openness */}
          <div className="glass rounded-[16px] p-4">
            <div className="text-base mb-1">🎯</div>
            <div className="text-lg font-extrabold text-white">O: {result.bigFiveProfile.O}%</div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Openness · #1</div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${result.bigFiveProfile.O}%`, background: "linear-gradient(90deg, var(--cyan), var(--purple))" }}/>
            </div>
          </div>
          {/* Salary */}
          <div className="glass rounded-[16px] p-4">
            <div className="text-base mb-1">💼</div>
            <div className="text-lg font-extrabold" style={{ color: "var(--gold-light)" }}>$142K</div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Avg Salary</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{topJobMatch?.roleName || result.primaryRole?.title}</div>
          </div>
          {/* City */}
          <div className="glass rounded-[16px] p-4">
            <div className="text-base mb-1">🌍</div>
            <div className="text-lg font-extrabold text-white">{cityName || "Austin"}</div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>#1 City Match</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{localeInsight?.opportunities?.[0] || "Great"} openings</div>
          </div>
        </div>
      </motion.div>

      {/* ── Career Radar ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--cyan), var(--purple))",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}>
            🧭
          </div>
          <div>
            <div className="text-base font-bold text-white">Your Personality Radar</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>5-factor radar across all dimensions</div>
          </div>
        </div>

        {/* SVG Radar */}
        <div className="flex justify-center mb-4">
          <svg width="220" height="220" viewBox="0 0 200 200">
            {/* Grid circles */}
            {[25, 50, 75, 100].map((r) => (
              <circle key={r} cx={radarCx} cy={radarCy} r={(r / 100) * radarR}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            ))}
            {/* Axes */}
            {[0, 90, 180, 270].map((angle) => {
              const pt = getRadarPoint(100, angle);
              return <line key={angle} x1={radarCx} y1={radarCy} x2={pt.x} y2={pt.y}
                stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
            })}
            {/* Data polygon */}
            <polygon points={polygonPoints}
              fill="rgba(34,211,238,0.1)"
              stroke="var(--cyan)"
              strokeWidth="2"
              strokeLinejoin="round"/>
            {/* Data dots */}
            {radarData.map((d) => {
              const pt = getRadarPoint(d.value, d.angle);
              return <circle key={d.trait} cx={pt.x} cy={pt.y} r="4" fill="var(--cyan)"/>;
            })}
            {/* Labels */}
            {radarData.map((d) => {
              const pt = getRadarPoint(105, d.angle);
              const textAnchor =
                d.angle === 0 ? "middle" :
                d.angle === 90 ? "start" :
                d.angle === 180 ? "middle" : "end";
              return (
                <text key={d.label} x={pt.x} y={pt.y} textAnchor={textAnchor} dominantBaseline="middle"
                  fontSize="8" fontWeight="700" fill="var(--text-muted)" letterSpacing="0.5">
                  {d.label}: {d.value}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Big Five bar list */}
        <div className="space-y-2.5">
          {sortedBigFive.map(([trait, value]) => {
            const color = traitColorMap[trait] || "var(--cyan)";
            const pct = percentileMap[trait] || 50;
            return (
              <div key={trait} className="flex items-center gap-3">
                <div className="text-xs font-semibold w-[90px] flex-shrink-0" style={{ color }}>
                  {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait}
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}/>
                </div>
                <div className="text-xs font-extrabold w-10 text-right flex-shrink-0" style={{ color }}>
                  {value}<span className="text-xs font-normal ml-0.5" style={{ color: "var(--text-dim)" }}>{pct}th%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── City Insights ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--teal, #14b8a6), var(--cyan))",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)" }}>
            <Globe className="w-5 h-5" style={{ color: "#14b8a6" }} />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-white">Best Cities for You</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>Based on your personality + career profile</div>
          </div>
          <div className="text-xs font-bold px-2 py-1 rounded-md"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>
            🇺🇸 US
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {topCities.map((city, i) => (
            <div key={city.name} className="rounded-[14px] p-3 text-center cursor-pointer transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--glass-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--glass-border-bright)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--glass-border)";
              }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-dim)" }}>
                {city.rank}
              </div>
              <div className="text-sm font-bold text-white mb-0.5">{city.name}</div>
              <div className="text-xs" style={{ color: "var(--cyan)" }}>{city.jobs} openings</div>
              <div className="text-xs" style={{ color: "var(--gold-light)" }}>{city.salary} avg</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── MBTI Deep Dive ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--purple), var(--pink))",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <Brain className="w-5 h-5" style={{ color: "var(--purple)" }} />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-white">{result.mbtiType} — {result.mbtiLabel}</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>16 Personalities · Strategist Cluster</div>
          </div>
          <div className="text-xs font-bold px-2 py-1 rounded-md"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "var(--purple)" }}>
            RARE
          </div>
        </div>

        {/* Letter badges */}
        <div className="flex gap-2 mb-4">
          {result.mbtiType.split("").map((letter) => (
            <div key={letter} className="flex-1 text-center py-2 rounded-xl text-sm font-extrabold"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--glass-border)",
                color: "var(--cyan)",
              }}>
              {letter}
            </div>
          ))}
        </div>

        {/* MBTI dual bar chart */}
        <div className="space-y-4">
          {[
            { label: "Mind",       A: scores.mbti.E, B: scores.mbti.I, desc: "Introverted — you recharge alone" },
            { label: "Energy",     A: scores.mbti.N, B: scores.mbti.S, desc: "Intuitive — you see patterns and futures" },
            { label: "Nature",     A: scores.mbti.T, B: scores.mbti.F, desc: "Thinking — you lead with logic" },
            { label: "Tactics",    A: scores.mbti.J, B: scores.mbti.P, desc: "Judging — you prefer structure" },
          ].map((dim) => {
            const total = dim.A + dim.B || 1;
            const pct = Math.round((dim.A / total) * 100);
            return (
              <div key={dim.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>{dim.label}</div>
                  <div className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{pct}%</div>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {/* Center line */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, left: "50%",
                    width: "1px", background: "rgba(255,255,255,0.15)",
                  }}/>
                  <div className="absolute top-0 bottom-0 right-0 rounded-r-full overflow-hidden"
                    style={{ width: `${dim.B / total * 100}%`, background: "rgba(168,85,247,0.5)" }}/>
                  <div className="absolute top-0 bottom-0 left-0 rounded-l-full overflow-hidden"
                    style={{ width: `${dim.A / total * 100}%`, background: "linear-gradient(90deg, var(--purple), var(--cyan))" }}/>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{dim.desc}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── DISC Full Breakdown ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6)",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <BarChart2 className="w-5 h-5" style={{ color: "#ef4444" }} />
          </div>
          <div>
            <div className="text-base font-bold text-white">Your DISC Profile</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>All 4 behavioral styles ranked</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {discEntries.map(([letter, score]) => {
            const color = discColorMap[letter];
            const discDesc: Record<string, string> = {
              D: "Bold, decisive, direct.",
              I: "Sociable, enthusiastic.",
              S: "Patient, reliable.",
              C: "Analytical, systematic.",
            };
            return (
              <div key={letter} className="rounded-[14px] p-3 text-center"
                style={{ background: `${color}08`, border: `1px solid ${color}30` }}>
                <div className="text-xl font-extrabold mb-0.5" style={{ color }}>{letter}</div>
                <div className="text-xs font-bold text-white mb-0.5">{discLabels[letter]}</div>
                <div className="text-lg font-extrabold text-white mb-1">{score}%</div>
                <div className="text-xs mb-2" style={{ color: "var(--text-dim)", lineHeight: 1.4 }}>{discDesc[letter]}</div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }}/>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Big Five All 5 ── */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-[20px] p-5"
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, var(--cyan), var(--purple), var(--pink), var(--gold))",
        }}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}>
            <TrendingUp className="w-5 h-5" style={{ color: "var(--cyan)" }} />
          </div>
          <div>
            <div className="text-base font-bold text-white">Big Five Personality Profile</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>All 5 factors with US percentile rankings</div>
          </div>
        </div>

        <div className="space-y-3">
          {(["O", "C", "E", "A", "N"] as const).map((trait) => {
            const value = result.bigFiveProfile[trait];
            const color = traitColorMap[trait];
            const pct = percentileMap[trait] || 50;
            const traitSub: Record<string, string> = {
              O: "Curiosity & Ideas", C: "Organization & Duty",
              E: "Social Energy", A: "Compassion & Trust", N: "Emotional Sensitivity",
            };
            return (
              <div key={trait} className="flex items-center gap-3">
                <div className="w-[90px] flex-shrink-0">
                  <div className="text-xs font-semibold" style={{ color }}>{TRAIT_LABELS[trait]}</div>
                  <div className="text-xs" style={{ color: "var(--text-dim)", fontSize: "10px" }}>{traitSub[trait]}</div>
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }}/>
                </div>
                <div className="w-10 text-right flex-shrink-0">
                  <div className="text-xs font-extrabold" style={{ color }}>{value}</div>
                  <div className="text-xs" style={{ color: "var(--text-dim)", fontSize: "9px" }}>{pct}th%</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Premium CTA ── */}
      {!isPremiumUnlocked && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-[20px] p-5"
          style={{
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--cyan), var(--purple))",
            borderRadius: "20px 20px 0 0", margin: "-5px -5px 0",
            width: "calc(100% + 10px)",
          }}/>
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🔓</div>
            <div className="text-base font-bold text-white mb-1">Unlock Premium Insights</div>
            <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
              Get blindspot analysis, 3 role matches, Dream Role Advisor, and the full 7-card career simulator.
            </div>
          </div>
          <button
            className="w-full py-3.5 rounded-xl text-sm font-extrabold mb-4 transition-all"
            style={{
              background: "linear-gradient(135deg, var(--teal, #06b6d4), #0891b2)",
              border: "none",
              color: "#022c22",
              boxShadow: "0 4px 24px rgba(6, 182, 212, 0.35)",
            }}
            onClick={handleUpgrade}
            disabled={isCheckingOut}
          >
            🔓 Unlock Premium — $9.99/mo
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            {["🛡 Blindspot Discovery", "🎯 3 Role Matches", "💭 Dream Role Advisor", "🎮 Career Simulator"].map((f) => (
              <div key={f} className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-dim)",
                }}>
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="h-8" />
    </div>
  );
}
