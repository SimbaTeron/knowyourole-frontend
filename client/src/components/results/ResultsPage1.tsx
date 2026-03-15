import { motion } from "framer-motion";
import { Sparkles, Brain, Award, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TRAIT_LABELS, TRAIT_ICONS, FUN_MODE_TITLES, FUN_MODE_DISC,
} from "./resultsData";
import { TopCareerMatch, CareerMatchList } from "./RoleMatchCard";
import { MoodBlendBadge, EarnedBadgesRow, HybridTypesSection } from "./MoodBlendBadge";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage1({ s }: { s: ResultsState }) {
  const {
    result, funMode, shouldReduceMotion,
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
          {isMiniExplorer && adventureArchetype && (
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/30 dark:to-fuchsia-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                    Your Adventure Archetype
                  </span>
                </div>
                <h3 className="text-lg font-bold text-warm-gray dark:text-[#F8FAFC] mb-1">
                  {adventureArchetype.archetype}
                </h3>
                <p className="text-sm text-warm-gray/70 dark:text-[#94A3B8]">
                  {adventureArchetype.description}
                </p>
                {adventureArchetype.strengths && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {adventureArchetype.strengths.map((str: string) => (
                      <span key={str} className="px-2.5 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 font-medium">
                        {str}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

              <TopCareerMatch
                topJobMatch={topJobMatch}
                jobMatchLoading={jobMatchLoading}
                jobMatches={jobMatches}
                isPremiumUnlocked={isPremiumUnlocked}
                isMiniExplorer={isMiniExplorer}
                cityName={cityName}
                stateName={stateName}
                shouldReduceMotion={shouldReduceMotion}
              />
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

          <CareerMatchList
            topJobMatch={topJobMatch}
            jobMatchLoading={jobMatchLoading}
            jobMatches={jobMatches}
            isPremiumUnlocked={isPremiumUnlocked}
            isMiniExplorer={isMiniExplorer}
            cityName={cityName}
            stateName={stateName}
            shouldReduceMotion={shouldReduceMotion}
          />

          <MoodBlendBadge
            moodBlendInfo={moodBlendInfo}
            moodBlendKey={moodBlendKey}
            isMasterAlchemist={isMasterAlchemist}
            uniqueBlendsCount={uniqueBlendsCount}
            shouldReduceMotion={shouldReduceMotion}
          />

          <EarnedBadgesRow earnedBadges={earnedBadges} shouldReduceMotion={shouldReduceMotion} />
          <HybridTypesSection hybridTypes={hybridTypes} shouldReduceMotion={shouldReduceMotion} />
            </motion.div>
  );
}
