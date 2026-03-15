import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Award, Zap, ChevronDown,
  Building2, ArrowRight, TrendingUp, Flame, MapPin
} from "lucide-react";
import { RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TRAIT_LABELS, TRAIT_ICONS, TRAIT_COLORS, TRAIT_QUARTILE_DESCRIPTIONS,
  FUN_MODE_TITLES, FUN_MODE_DISC, FUN_MODE_ROASTS,
  getQuartileKey, calculatePercentile, getPercentileLabel,
} from "./resultsData";
import { getPersonalizedInsight } from "@/data/localeInsights";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage2({ s }: { s: ResultsState }) {
  const {
    result, scores, funMode, landmark, shouldReduceMotion, isFull,
    topTrait, traitKeys, selectedTrait, focusedTraitIndex, traitButtonsRef,
    cityName, stateName, localeInsight,
    handleShowFullResults, handleTraitSelect, handleTraitKeyDown,
  } = s;

  return (
            <motion.div
              key="page-2-details"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
        {isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white dark:bg-[#12121A] border border-gray-200 dark:border-[#A78BFA]/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#A78BFA]/20 bg-gray-50/50 dark:bg-[#12121A]/50">
                  <h3 className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    Your Personality Profile
                  </h3>
                  <p className="text-xs text-warm-gray/50 dark:text-[#64748B] mt-0.5">Tap each to learn more</p>
                </div>
                
                <details className="group border-b border-gray-100 dark:border-[#A78BFA]/20">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-terracotta" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Thinking Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-mbti">
                        {funMode && FUN_MODE_TITLES[result.mbtiType]
                          ? FUN_MODE_TITLES[result.mbtiType]
                          : result.mbtiLabel}
                        <span className="text-xs font-mono text-terracotta ml-1.5">({result.mbtiType})</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                      {result.mbtiDesc}
                    </p>
                  </div>
                </details>

                <details className="group border-b border-gray-100 dark:border-[#A78BFA]/20">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-green/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-sage-green" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Work Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-disc">
                        {funMode && FUN_MODE_DISC[result.discStyle]
                          ? FUN_MODE_DISC[result.discStyle].nickname
                          : result.discLabel}
                        <span className="text-xs font-mono text-sage-green ml-1.5">({result.discStyle}-type)</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                      {result.discDesc}
                    </p>
                  </div>
                </details>

                {(() => {
                  const Icon = TRAIT_ICONS[topTrait[0] as keyof typeof TRAIT_ICONS];
                  const colors = TRAIT_COLORS[topTrait[0] as keyof typeof TRAIT_COLORS];
                  const quartileKey = getQuartileKey(topTrait[1]);
                  const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[topTrait[0]]?.[quartileKey];
                  return (
                    <details className="group">
                      <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2E]/30 transition-colors list-none">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg}/10 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-warm-gray/50 dark:text-[#64748B] uppercase tracking-wide">Core Strength</p>
                          <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC] leading-tight" data-testid="text-bigfive">
                            {TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]}
                            <span className={`text-xs font-mono ml-1.5 ${colors.text}`}>({topTrait[1]}%)</span>
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed pl-[52px]">
                          <span className="font-semibold">{quartileData?.vibe}:</span> {quartileData?.description}
                        </p>
                      </div>
                    </details>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className="bg-white dark:bg-[#12121A] border border-gray-200 dark:border-[#A78BFA]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-terracotta" aria-hidden="true" />
                  DISC Work Style Breakdown
                </CardTitle>
                <p className="text-xs text-warm-gray/60 dark:text-[#64748B] mt-1">
                  How your behavioral traits compare across work styles
                </p>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                {(() => {
                  const discScores = {
                    D: scores.disc.D,
                    I: scores.disc.I,
                    S: scores.disc.S,
                    C: scores.disc.C,
                  };
                  const total = Object.values(discScores).reduce((sum, v) => sum + Math.abs(v), 0) || 1;
                  const discItems = [
                    { key: "D", label: "Dominance", color: "bg-terracotta", textColor: "text-terracotta", desc: "Direct, decisive, competitive" },
                    { key: "I", label: "Influence", color: "bg-amber-500", textColor: "text-amber-500", desc: "Enthusiastic, optimistic, collaborative" },
                    { key: "S", label: "Steadiness", color: "bg-sage-green", textColor: "text-sage-green", desc: "Patient, reliable, team-oriented" },
                    { key: "C", label: "Conscientiousness", color: "bg-dusty-blue", textColor: "text-dusty-blue", desc: "Analytical, precise, systematic" },
                  ];
                  const dominant = discItems.reduce((best, item) =>
                    Math.abs(discScores[item.key as keyof typeof discScores]) > Math.abs(discScores[best.key as keyof typeof discScores]) ? item : best
                  );

                  return discItems.map((item) => {
                    const raw = Math.abs(discScores[item.key as keyof typeof discScores]);
                    const pct = Math.round((raw / total) * 100);
                    const isDominant = item.key === dominant.key;

                    return (
                      <div key={item.key} className={`rounded-xl p-3 transition-all ${isDominant ? "bg-gray-50 dark:bg-[#1E1E2E]/50 ring-1 ring-gray-200 dark:ring-[#A78BFA]/20" : ""}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDominant ? item.textColor : "text-warm-gray dark:text-[#F8FAFC]"}`}>
                              {item.label}
                            </span>
                            {isDominant && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-medium" data-testid="badge-disc-dominant">
                                Dominant
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-bold ${item.textColor}`} data-testid={`text-disc-pct-${item.key.toLowerCase()}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-[#1E1E2E] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-[11px] text-warm-gray/50 dark:text-[#64748B] mt-1">
                          {item.desc}
                        </p>
                      </div>
                    );
                  });
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isFull && localeInsight && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="bg-gradient-to-br from-dusty-blue/10 to-sage-green/10 dark:from-dusty-blue/20 dark:to-sage-green/20 border-dusty-blue/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dusty-blue/20 dark:bg-dusty-blue/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-dusty-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC]">
                        Your {localeInsight.city} Edge
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-dusty-blue/10 text-dusty-blue">
                        {localeInsight.metro}
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed mb-3">
                      {getPersonalizedInsight(
                        cityName,
                        stateName,
                        result.mbtiType.startsWith('E'),
                        result.mbtiType.includes('T') || result.discStyle === 'C'
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {localeInsight.opportunities.slice(0, 4).map((opp) => (
                        <span
                          key={opp}
                          className="text-xs px-2 py-1 rounded-full bg-sage-green/10 text-sage-green"
                        >
                          {opp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-terracotta/10 via-amber-50 to-orange-50 dark:from-terracotta/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg border-2 border-terracotta/30 dark:border-terracotta/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-4">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center mb-4 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-warm-gray dark:text-[#F8FAFC] text-[22px]">
                    View Your Complete Results
                  </h3>
                  <p className="text-warm-gray/60 dark:text-[#64748B] mt-2 text-base max-w-xs">
                    See your full personality profile, Big Five traits, and personalized insights
                  </p>
                </div>

                <Button
                  onClick={handleShowFullResults}
                  className="w-full bg-terracotta hover:bg-terracotta/90 min-h-14 text-lg font-bold shadow-lg"
                  data-testid="button-show-full-results"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  See Full Results
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

            <AnimatePresence>
              {isFull && (
                <>
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="overflow-hidden bg-white dark:bg-[#12121A]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-terracotta" aria-hidden="true" />
                      Your Big Five Profile
                    </CardTitle>
                    <p className="text-xs text-warm-gray/60 dark:text-[#64748B] mt-1">
                      Tap any trait to learn more about what it means for you
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    <div className="w-full flex justify-center mb-2" data-testid="chart-bigfive-radar">
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart
                          data={Object.entries(result.bigFiveProfile).map(([key, val]) => ({
                            trait: TRAIT_LABELS[key as keyof typeof TRAIT_LABELS],
                            value: val,
                            fullMark: 100,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                        >
                          <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <PolarAngleAxis
                            dataKey="trait"
                            tick={{ fill: 'currentColor', fontSize: 11, className: 'text-warm-gray/70 dark:text-[#94A3B8]' }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 9, fill: 'currentColor', className: 'text-warm-gray/40 dark:text-[#64748B]' }}
                            tickCount={5}
                          />
                          <Radar
                            name="Big Five"
                            dataKey="value"
                            stroke="rgb(139, 92, 246)"
                            fill="rgba(139, 92, 246, 0.25)"
                            fillOpacity={1}
                            strokeWidth={2}
                            dot={{
                              r: 4,
                              fill: 'rgb(139, 92, 246)',
                              stroke: '#fff',
                              strokeWidth: 1.5,
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {traitKeys.map((trait, index) => {
                      const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS];
                      const colors = TRAIT_COLORS[trait as keyof typeof TRAIT_COLORS];
                      const isSelected = selectedTrait === trait;
                      const value = result.bigFiveProfile[trait as keyof typeof result.bigFiveProfile];
                      const quartileKey = getQuartileKey(value);
                      const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[trait]?.[quartileKey];
                      
                      return (
                        <div key={trait} className="space-y-2">
                          <button
                            ref={el => { traitButtonsRef.current[index] = el; }}
                            onClick={() => handleTraitSelect(trait, index)}
                            onKeyDown={(e) => handleTraitKeyDown(e, trait, index)}
                            tabIndex={focusedTraitIndex === -1 ? (index === 0 ? 0 : -1) : (focusedTraitIndex === index ? 0 : -1)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                              isSelected
                                ? `${colors.bg} text-white shadow-lg`
                                : `bg-gray-50 dark:bg-[#1E1E2E]/50 hover:bg-gray-100 dark:hover:bg-[#1E1E2E]`
                            }`}
                            aria-pressed={isSelected}
                            aria-expanded={isSelected}
                            aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} ${value}%. ${isSelected ? "Selected, tap to collapse" : "Tap to learn more"}`}
                            data-testid={`button-trait-${trait.toLowerCase()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-white/20' : colors.bg
                              }`}>
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} aria-hidden="true" />
                              </div>
                              <div>
                                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-warm-gray dark:text-[#F8FAFC]'}`}>
                                  {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}
                                </span>
                                {!isSelected && quartileData && (
                                  <p className={`text-xs ${colors.text} opacity-80`}>
                                    {quartileData.vibe}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : colors.text}`}>
                                  {value}%
                                </span>
                                {(() => {
                                  const percentile = calculatePercentile(value, trait);
                                  const pLabel = getPercentileLabel(percentile);
                                  return (
                                    <p className={`text-[10px] ${isSelected ? 'text-white/80' : pLabel.color}`}>
                                      Top {100 - percentile}%
                                    </p>
                                  );
                                })()}
                              </div>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180 text-white' : 'text-warm-gray/40 dark:text-[#64748B]'}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isSelected && quartileData && (
                              <motion.div
                                initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E1E2E]/50 border-l-4"
                                  style={{ borderColor: colors.border }}
                                  role="region"
                                  aria-live="polite"
                                  aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} details`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-bold ${colors.text}`}>
                                      {quartileData.vibe}
                                    </span>
                                    <span className="text-xs text-warm-gray/50 dark:text-[#64748B]">
                                      ({value <= 25 ? '0-25%' : value <= 50 ? '26-50%' : value <= 75 ? '51-75%' : '76-100%'})
                                    </span>
                                  </div>
                                  <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed mb-3">
                                    {quartileData.description}
                                  </p>
                                  {(() => {
                                    const percentile = calculatePercentile(value, trait);
                                    const pLabel = getPercentileLabel(percentile);
                                    return (
                                      <div className="flex items-center gap-2 pt-2 border-t border-warm-gray/10 dark:border-white/5">
                                        <TrendingUp className={`w-3.5 h-3.5 ${pLabel.color}`} />
                                        <span className={`text-xs font-medium ${pLabel.color}`}>
                                          {pLabel.label} — Top {100 - percentile}% of people
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </CardContent>
                    </Card>
                  </motion.div>

                  {funMode && (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                  <Card className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border-violet-200 dark:border-violet-800">
                    <CardContent className="p-4 text-center">
                      <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                        {FUN_MODE_ROASTS[result.mbtiType as keyof typeof FUN_MODE_ROASTS] || `${result.mbtiType}: A rare breed indeed.`}
                      </p>
                    </CardContent>
                  </Card>
                    </motion.div>
                  )}

                  {funMode && FUN_MODE_DISC[result.discStyle] && (
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4 text-center">
                        <Flame className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          DISC Vibe: {FUN_MODE_DISC[result.discStyle]?.vibe}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {(result as any).proxyNudge && (
                  <Card className="bg-dusty-blue/10 dark:bg-dusty-blue/20 border-dusty-blue/30">
                    <CardContent className="p-4 text-sm text-dusty-blue font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {(result as any).proxyNudge}
                    </CardContent>
                  </Card>
                  )}
                </>
              )}
            </AnimatePresence>

        {isFull && landmark && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 text-sm text-warm-gray/60 dark:text-[#64748B]"
          >
            <MapPin className="w-4 h-4" />
            <span>Near {landmark}</span>
          </motion.div>
        )}
            </motion.div>
  );
}
