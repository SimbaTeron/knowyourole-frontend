import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Zap, Building2, ArrowRight,
  Flame, MapPin
} from "lucide-react";
import { RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TRAIT_LABELS, FUN_MODE_ROASTS, FUN_MODE_DISC,
} from "./resultsData";
import { getPersonalizedInsight } from "@/data/localeInsights";
import { TraitDetailPanel } from "./TraitDetailPanel";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage2({ s }: { s: ResultsState }) {
  const {
    result, funMode, landmark, shouldReduceMotion, isFull,
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
                  <summary className="px-4 py-3 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-terracotta" />
                      <div>
                        <p className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC]">MBTI: {result.mbtiType}</p>
                        <p className="text-xs text-warm-gray/50 dark:text-[#64748B]">{result.mbtiLabel}</p>
                      </div>
                    </div>
                  </summary>
                  <div className="px-4 pb-3 text-sm text-warm-gray/70 dark:text-[#94A3B8]">{result.spark}</div>
                </details>

                <details className="group border-b border-gray-100 dark:border-[#A78BFA]/20">
                  <summary className="px-4 py-3 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-sage-green" />
                      <div>
                        <p className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC]">DISC: {result.discStyle}</p>
                        <p className="text-xs text-warm-gray/50 dark:text-[#64748B]">{result.discLabel}</p>
                      </div>
                    </div>
                  </summary>
                  <div className="px-4 pb-3 text-sm text-warm-gray/70 dark:text-[#94A3B8]">{result.discDesc}</div>
                </details>

                <details className="group">
                  <summary className="px-4 py-3 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-dusty-blue" />
                      <div>
                        <p className="text-sm font-semibold text-warm-gray dark:text-[#F8FAFC]">Top Big Five</p>
                        <p className="text-xs text-warm-gray/50 dark:text-[#64748B]">{TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]} at {topTrait[1]}%</p>
                      </div>
                    </div>
                  </summary>
                  <div className="px-4 pb-3 text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                    Your strongest trait suggests a natural inclination towards {TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]?.toLowerCase()}-oriented thinking and behavior.
                  </div>
                </details>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isFull && localeInsight && cityName && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-br from-sage-green/5 to-emerald-50/50 dark:from-sage-green/10 dark:to-emerald-900/20 border-sage-green/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-sage-green flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-warm-gray dark:text-[#F8FAFC] text-sm">{localeInsight.metro || localeInsight.city}</h4>
                    <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">
                      {getPersonalizedInsight(
                        cityName,
                        stateName,
                        result.mbtiType.startsWith('E'),
                        result.mbtiType.includes('T') || result.discStyle === 'C'
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {localeInsight.opportunities.slice(0, 4).map((opp) => (
                        <span key={opp} className="text-xs px-2 py-1 rounded-full bg-sage-green/10 text-sage-green">{opp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isFull && (
          <motion.div initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="bg-gradient-to-br from-terracotta/10 via-amber-50 to-orange-50 dark:from-terracotta/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg border-2 border-terracotta/30 dark:border-terracotta/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-4">
                  <motion.div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center mb-4 shadow-lg" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-warm-gray dark:text-[#F8FAFC] text-[22px]">View Your Complete Results</h3>
                  <p className="text-warm-gray/60 dark:text-[#64748B] mt-2 text-base max-w-xs">See your full personality profile, Big Five traits, and personalized insights</p>
                </div>
                <Button onClick={handleShowFullResults} className="w-full bg-terracotta hover:bg-terracotta/90 min-h-14 text-lg font-bold shadow-lg" data-testid="button-show-full-results">
                  <ArrowRight className="w-5 h-5 mr-2" />See Full Results
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {isFull && (
            <>
              <motion.div initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="overflow-hidden bg-white dark:bg-[#12121A]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-terracotta" aria-hidden="true" />
                      Your Big Five Profile
                    </CardTitle>
                    <p className="text-xs text-warm-gray/60 dark:text-[#64748B] mt-1">Tap any trait to learn more about what it means for you</p>
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
                          cx="50%" cy="50%" outerRadius="70%"
                        >
                          <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                          <PolarAngleAxis dataKey="trait" tick={{ fill: 'currentColor', fontSize: 11, className: 'text-warm-gray/70 dark:text-[#94A3B8]' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'currentColor', className: 'text-warm-gray/40 dark:text-[#64748B]' }} tickCount={5} />
                          <Radar name="Big Five" dataKey="value" stroke="rgb(139, 92, 246)" fill="rgba(139, 92, 246, 0.25)" fillOpacity={1} strokeWidth={2} dot={{ r: 4, fill: 'rgb(139, 92, 246)', stroke: '#fff', strokeWidth: 1.5 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <TraitDetailPanel
                      traitKeys={traitKeys}
                      selectedTrait={selectedTrait}
                      focusedTraitIndex={focusedTraitIndex}
                      traitButtonsRef={traitButtonsRef}
                      bigFiveProfile={result.bigFiveProfile}
                      shouldReduceMotion={shouldReduceMotion}
                      handleTraitSelect={handleTraitSelect}
                      handleTraitKeyDown={handleTraitKeyDown}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {funMode && (
                <motion.div initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
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

              {result.proxyNudge && (
                <Card className="bg-dusty-blue/10 dark:bg-dusty-blue/20 border-dusty-blue/30">
                  <CardContent className="p-4 text-sm text-dusty-blue font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {result.proxyNudge}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </AnimatePresence>

        {isFull && landmark && (
          <motion.div initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 text-sm text-warm-gray/60 dark:text-[#64748B]">
            <MapPin className="w-4 h-4" />
            <span>Near {landmark}</span>
          </motion.div>
        )}
            </motion.div>
  );
}
