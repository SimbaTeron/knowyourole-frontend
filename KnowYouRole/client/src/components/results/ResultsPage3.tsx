import { motion } from "framer-motion";
import {
  Target, Heart, Crown, Rocket, ArrowRight,
  BookOpen, Gift, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumCardDeck } from "../PremiumCardDeck";
import { DreamRoleAdvisor } from "../DreamRoleAdvisor";
import { PersonalityEvolutionTimeline } from "../PersonalityEvolutionTimeline";
import { ArcTracker } from "../ArcTracker";
import {
  CAREER_SIMULATOR, SIDE_HUSTLES, LEARNING_STYLES, GROWTH_QUESTS,
  TRAIT_LABELS, getWeakestTrait, getWeaknessBlindspots,
} from "./resultsData";
import type { ResultsState } from "./ResultsTypes";

export function ResultsPage3({ s }: { s: ResultsState }) {
  const {
    result, tier, shouldReduceMotion, isFull,
    isPremiumUnlocked, isCheckingOut, topTrait,
    handleUpgrade, handleCrossroadsClick, handleDonationTierSelect,
  } = s;

  return (
            <motion.div
              key="page-3-premium"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {isFull && (
                <>
                  {isPremiumUnlocked ? (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-4"
                    >
                  <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-emerald-400 dark:border-emerald-600 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full" />
                    <CardContent className="p-5 text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-3"
                      >
                        <Crown className="w-7 h-7 text-white" />
                      </motion.div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-1 text-[26px]">
                        Premium Unlocked
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Swipe through your personalized insights below
                      </p>
                    </CardContent>
                  </Card>

                  <DreamRoleAdvisor
                    bigFive={result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 }}
                    mbtiType={result?.mbtiType || "INTJ"}
                    discStyle={result?.discStyle || "C"}
                  />

                  <PremiumCardDeck
                    result={result ? {
                      mbtiType: result.mbtiType,
                      mbtiLabel: result.mbtiLabel,
                      discStyle: result.discStyle,
                      discLabel: result.discLabel,
                      primaryRole: result.primaryRole,
                      secondaryRole: result.secondaryRole,
                      bigFiveProfile: result.bigFiveProfile,
                      scales: result.scales,
                    } : {
                      mbtiType: "INTJ",
                      mbtiLabel: "Architect",
                      discStyle: "C",
                      discLabel: "Conscientious",
                      primaryRole: { title: "Analyst", salary: "$60K-90K", desc: "A great fit for your analytical nature." },
                      secondaryRole: { title: "Strategist", salary: "$70K-100K", desc: "Your secondary strength lies in strategic thinking." },
                      bigFiveProfile: { O: 50, C: 50, E: 50, A: 50, N: 50 },
                      scales: undefined,
                    }}
                    topTrait={topTrait}
                    weakestTrait={getWeakestTrait(result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 })}
                    getWeaknessBlindspots={getWeaknessBlindspots}
                    CAREER_SIMULATOR={CAREER_SIMULATOR}
                    SIDE_HUSTLES={SIDE_HUSTLES}
                    LEARNING_STYLES={LEARNING_STYLES}
                    GROWTH_QUESTS={GROWTH_QUESTS}
                    TRAIT_LABELS={TRAIT_LABELS}
                    onCrossroadsClick={handleCrossroadsClick}
                  />

                  <div className="space-y-4 mt-6">
                    <PersonalityEvolutionTimeline
                      mbtiType={result?.mbtiType || "INTJ"}
                      bigFiveProfile={result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 }}
                      tier={tier}
                    />
                    <ArcTracker />
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 border-2 border-amber-400/50 dark:border-amber-600/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-300/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-tr-full" />
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="text-center mb-5">
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-400 shadow-lg shadow-orange-500/30 mb-4"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-[26px]">
                          Unlock Your Full Potential
                        </h4>
                      </div>
                      
                      <div className="space-y-3 mb-5">
                        {[
                          { icon: BookOpen, title: "Deep Dive", desc: "Full analysis" },
                          { icon: Gift, title: "Role Matches", desc: "More career paths" },
                          { icon: Target, title: "Blindspots", desc: "Personalized blindspots and solutions" },
                        ].map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-[#12121A]/40 border border-amber-200/50 dark:border-amber-700/50"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <feature.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-amber-900 dark:text-amber-100 text-[22px]">{feature.title}</p>
                              <p className="text-amber-600 dark:text-amber-400 text-[15px]">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-8 shadow-lg shadow-orange-500/30 transition-all flex flex-col items-center justify-center gap-1"
                        onClick={handleUpgrade}
                        disabled={isCheckingOut}
                        data-testid="button-upgrade"
                      >
                        {isCheckingOut ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold flex items-center gap-2 text-[22px]">
                              <Rocket className="w-5 h-5" />
                              Unlock Premium Now
                              <ArrowRight className="w-5 h-5" />
                            </span>
                            <span className="font-normal opacity-90 text-[15px]">Lifetime access. No Subscription. Ever.</span>
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-amber-600/70 dark:text-amber-400/70">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Secure checkout
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Support indie dev
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
          </motion.div>
  );
}
