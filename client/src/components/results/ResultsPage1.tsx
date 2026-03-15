import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Trophy, Target, Brain, Heart, Users,
  Briefcase, TrendingUp, ChevronDown, Zap, Award,
  Star, Crown, Compass, DollarSign, Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TRAIT_LABELS, TRAIT_ICONS, FUN_MODE_TITLES, FUN_MODE_DISC,
  HYBRID_TYPE_DESCRIPTIONS,
} from "./resultsData";
import { MOOD_PROXY_BOOSTS } from "@/lib/proxyCalculations";
import { getRegionalSalary, shouldShowSalary } from "@/data/regionalSalaries";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage1({ s }: { s: ResultsState }) {
  const {
    result, scores, tier, funMode, shouldReduceMotion,
    isMiniExplorer, adventureArchetype, jobMatchLoading, topJobMatch,
    isPremiumUnlocked, jobMatches, earnedBadges, hybridTypes,
    cityName, stateName,
    moodBlendInfo, moodBlendKey, isMasterAlchemist, uniqueBlendsCount,
    sortedBigFive,
  } = s;

  return (
            <motion.div
              key="page-1-summary"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isMiniExplorer && adventureArchetype && (
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardContent className="p-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg"
                  style={{ backgroundColor: adventureArchetype.badgeColor }}
                >
                  <Compass className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-1">
                  {adventureArchetype.name}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-2">
                  {adventureArchetype.superpower}
                </p>
                <p className="text-xs text-purple-500 dark:text-purple-400 mb-3 italic">
                  {adventureArchetype.description}
                </p>
                <div className="bg-white/60 dark:bg-purple-900/40 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">
                    Your Mission
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    {adventureArchetype.mission}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isMiniExplorer && adventureArchetype && (
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: adventureArchetype.badgeColor }}
                  >
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-800 dark:text-purple-200">
                      {adventureArchetype.name}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-300">
                      {adventureArchetype.superpower}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

          <Card className="overflow-hidden border-2 border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={shouldReduceMotion ? {} : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.6 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center flex-shrink-0"
                >
                  <Star className="w-6 h-6 text-soft-cream" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-terracotta uppercase tracking-wider">
                      MBTI Type
                    </span>
                  </div>
                  <motion.h2
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC]"
                    data-testid="text-mbti-type"
                  >
                    {result.mbtiType} — {result.mbtiLabel}
                  </motion.h2>
                  <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8] mt-1">
                    {result.spark}
                  </p>
                </div>
              </div>

              {!isMiniExplorer && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 pt-4 border-t border-terracotta/20"
                >
                  {jobMatchLoading ? (
                    <div className="flex items-center gap-2 text-sm text-warm-gray/50 dark:text-[#64748B]">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-terracotta/50 border-t-transparent rounded-full"
                      />
                      Finding your best career match...
                    </div>
                  ) : topJobMatch ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-terracotta" />
                        <span className="text-xs font-semibold text-terracotta uppercase tracking-wider">Top Career Match</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-terracotta/5 dark:bg-terracotta/10">
                        <div className="flex-1">
                          <p className="font-bold text-warm-gray dark:text-[#F8FAFC] text-base" data-testid="text-top-job-match">
                            {topJobMatch.roleName}
                          </p>
                          <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8] mt-0.5">
                            {topJobMatch.reason}
                          </p>

                          {cityName && shouldShowSalary(cityName) && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-terracotta/10">
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-sage-green" />
                                <span className="text-xs text-sage-green font-medium">{topJobMatch.matchScore}% match</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-amber-500" />
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                  {getRegionalSalary(topJobMatch.roleName, cityName, stateName || undefined)?.salary || topJobMatch.salary}
                                </span>
                              </div>
                              {topJobMatch.growth && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-dusty-blue" />
                                  <span className="text-xs text-dusty-blue font-medium">{topJobMatch.growth}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {(!cityName || !shouldShowSalary(cityName)) && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-terracotta/10">
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-sage-green" />
                                <span className="text-xs text-sage-green font-medium">{topJobMatch.matchScore}% match</span>
                              </div>
                              {topJobMatch.growth && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-dusty-blue" />
                                  <span className="text-xs text-dusty-blue font-medium">{topJobMatch.growth}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
              {funMode && (
                <Card className="overflow-hidden border-2 border-sage-green/30 bg-gradient-to-br from-sage-green/5 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-green to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-warm-gray dark:text-[#F8FAFC] text-sm mb-1">
                          {FUN_MODE_TITLES[result.mbtiType as keyof typeof FUN_MODE_TITLES] || result.mbtiLabel}
                        </h3>
                        <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">
                          {TRAIT_LABELS[result.mbtiType as keyof typeof TRAIT_LABELS] || "A unique personality type"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-sage-green/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-sage-green" />
                        <span className="text-xs font-semibold text-sage-green uppercase tracking-wider">DISC Vibe</span>
                      </div>
                      <p className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC]">
                        {FUN_MODE_DISC[result.discStyle as keyof typeof FUN_MODE_DISC]?.nickname || result.discLabel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            {sortedBigFive.slice(0, 3).map(([trait, value], index) => {
              const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS] || Brain;
              return (
                <div key={trait} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `var(--trait-${trait.toLowerCase()})` }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC]">
                        {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS] || trait}
                      </span>
                      <span className="text-xs font-bold text-warm-gray/70 dark:text-[#94A3B8]">
                        {Math.round(value)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#1E1E2E] rounded-full h-2 mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: `var(--trait-${trait.toLowerCase()})` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {!isMiniExplorer && isPremiumUnlocked && jobMatches.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/50 mb-3">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Crown className="w-4 h-4" />
                    Top Career Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {jobMatches.map((match, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/60 dark:bg-[#12121A]/40">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-warm-gray dark:text-[#F8FAFC]">{match.roleName}</p>
                          <p className="text-xs text-warm-gray/60 dark:text-[#94A3B8]">{match.matchScore}% match</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isMiniExplorer && isPremiumUnlocked && jobMatches.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
                <Card className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 dark:from-purple-900/30 dark:to-fuchsia-900/30 border-purple-200/60 dark:border-purple-700/50 mb-3 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wider">Role Deep Dive</span>
                    </div>
                    {jobMatches.slice(0, 1).map((match, idx) => (
                      <div key={idx} className="space-y-3">
                        <div>
                          <h4 className="font-bold text-warm-gray dark:text-[#F8FAFC] text-base">{match.roleName}</h4>
                          <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8] mt-1">{match.reason}</p>
                        </div>

                        <details className="group" data-testid="details-why-match">
                          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-300">
                            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                            Why this matches you
                          </summary>
                          <div className="mt-2 pl-6 space-y-2">
                            {match.personalityFit && (
                              <div className="flex items-start gap-2">
                                <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-300">Personality Fit</p>
                                  <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">{match.personalityFit}</p>
                                </div>
                              </div>
                            )}
                            {match.strengthsUsed && match.strengthsUsed.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-300">Strengths Used</p>
                                  <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">{match.strengthsUsed.join(", ")}</p>
                                </div>
                              </div>
                            )}
                            {match.dayInLife && (
                              <div className="flex items-start gap-2">
                                <Briefcase className="w-4 h-4 text-terracotta mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-terracotta">A Day in This Role</p>
                                  <p className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">{match.dayInLife}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>

                        {match.growth && (
                          <div className="flex items-center gap-4 pt-2 border-t border-purple-200/50 dark:border-purple-700/50">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-sage-green" />
                              <span className="text-xs text-sage-green font-medium">{match.growth}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
            </motion.div>
          )}

          {moodBlendInfo && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
            >
              <Card className="overflow-hidden border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                      <Flame className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-amber-800 dark:text-amber-200 text-base">
                          Mood Alchemist
                        </h3>
                        {isMasterAlchemist && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full"
                          >
                            MASTER
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        "{moodBlendInfo.title}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
                      Your mood blend influences these traits:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {moodBlendInfo.combinedBoosts.map((boost, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-700">
                          {boost.trait} {boost.amount}
                        </span>
                      ))}
                    </div>
                  </div>

                  {moodBlendKey && MOOD_PROXY_BOOSTS[moodBlendKey] && (
                    <div className="bg-amber-100/50 dark:bg-amber-800/20 rounded-lg p-2.5 mb-2">
                      <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">
                        Proxy Impact
                      </p>
                      <div className="flex gap-2 text-xs">
                        {MOOD_PROXY_BOOSTS[moodBlendKey].critical !== 0 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            CT: {MOOD_PROXY_BOOSTS[moodBlendKey].critical > 0 ? '+' : ''}{MOOD_PROXY_BOOSTS[moodBlendKey].critical}%
                          </span>
                        )}
                        {MOOD_PROXY_BOOSTS[moodBlendKey].firstPrinciples !== 0 && (
                          <span className="text-orange-600 dark:text-orange-400">
                            FP: {MOOD_PROXY_BOOSTS[moodBlendKey].firstPrinciples > 0 ? '+' : ''}{MOOD_PROXY_BOOSTS[moodBlendKey].firstPrinciples}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {isMasterAlchemist && (
                    <div className="mt-2 text-center">
                      <p className="text-[10px] text-amber-500 dark:text-amber-400">
                        {uniqueBlendsCount} unique blends discovered
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {earnedBadges.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {earnedBadges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap"
                >
                  <Trophy className="w-3 h-3" />
                  {badge.name}
                </div>
              ))}
            </motion.div>
          )}

          {hybridTypes.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              {hybridTypes.map((hybrid, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 mb-2"
                >
                  <Zap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{hybrid}</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                      {HYBRID_TYPE_DESCRIPTIONS[hybrid]?.short || "A unique blend of traits"}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
            </motion.div>
  );
}
