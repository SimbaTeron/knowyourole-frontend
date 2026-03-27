import { motion } from "framer-motion";
import { Flame, Trophy, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MOOD_PROXY_BOOSTS } from "@/lib/proxyCalculations";
import type { BlendInfo } from "../MoodAlchemyLab";
import type { EarnedBadge } from "./resultsData";
import { HYBRID_TYPE_DESCRIPTIONS } from "./resultsData";

interface MoodBlendBadgeProps {
  moodBlendInfo: BlendInfo | null;
  moodBlendKey: string;
  isMasterAlchemist: boolean;
  uniqueBlendsCount: number;
  shouldReduceMotion: boolean | null;
}

export function MoodBlendBadge({ moodBlendInfo, moodBlendKey, isMasterAlchemist, uniqueBlendsCount, shouldReduceMotion }: MoodBlendBadgeProps) {
  if (!moodBlendInfo) return null;

  return (
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
  );
}

interface EarnedBadgesProps {
  earnedBadges: EarnedBadge[];
  shouldReduceMotion: boolean | null;
}

export function EarnedBadgesRow({ earnedBadges, shouldReduceMotion }: EarnedBadgesProps) {
  if (earnedBadges.length === 0) return null;

  return (
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
  );
}

interface HybridTypesProps {
  hybridTypes: string[];
  shouldReduceMotion: boolean | null;
}

export function HybridTypesSection({ hybridTypes, shouldReduceMotion }: HybridTypesProps) {
  if (hybridTypes.length === 0) return null;

  return (
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
  );
}
