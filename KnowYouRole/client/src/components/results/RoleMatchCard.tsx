import { motion } from "framer-motion";
import {
  Sparkles, Target, Brain, Briefcase, TrendingUp,
  ChevronDown, Zap, Crown, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRegionalSalary, shouldShowSalary } from "@/data/regionalSalaries";
import type { JobMatch } from "./resultsData";

interface RoleMatchCardProps {
  topJobMatch: JobMatch | null;
  jobMatchLoading: boolean;
  jobMatches: JobMatch[];
  isPremiumUnlocked: boolean;
  isMiniExplorer: boolean;
  cityName: string | null;
  stateName: string | null;
  shouldReduceMotion: boolean | null;
}

export function TopCareerMatch({ topJobMatch, jobMatchLoading, cityName, stateName, isMiniExplorer, shouldReduceMotion }: RoleMatchCardProps) {
  if (isMiniExplorer) return null;

  return (
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
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-terracotta/10">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-sage-green" />
                  <span className="text-xs text-sage-green font-medium">{topJobMatch.matchScore}% match</span>
                </div>
                {cityName && shouldShowSalary(cityName) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {getRegionalSalary(topJobMatch.roleName, cityName, stateName || undefined)?.salary || topJobMatch.salary}
                    </span>
                  </div>
                )}
                {topJobMatch.growth && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-dusty-blue" />
                    <span className="text-xs text-dusty-blue font-medium">{topJobMatch.growth}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function CareerMatchList({ jobMatches, isPremiumUnlocked, isMiniExplorer, shouldReduceMotion }: RoleMatchCardProps) {
  if (isMiniExplorer || !isPremiumUnlocked || jobMatches.length === 0) return null;

  return (
    <>
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
    </>
  );
}
