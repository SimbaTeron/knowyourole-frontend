import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, Crown, Star, CheckCircle2,
  ArrowRight, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PersonalityResult } from "./resultsData";
import { FeedbackOverlay, type FeedbackState } from "./FeedbackOverlay";

export interface OverlayState extends FeedbackState {
  result: PersonalityResult | null;
  showValidation: boolean;
  mbtiMatchAnswer: string;
  setMbtiMatchAnswer: (v: string) => void;
  opennessRating: number;
  setOpennessRating: (v: number) => void;
  handleValidationSubmit: () => void;
  showRefinedMessage: boolean;
  showJustKidding: boolean;
  handleProceedToResults: () => void;
  handleDonateClick: () => void;
  showDonationTiers: boolean;
  setShowDonationTiers: (v: boolean) => void;
  handleDonationTierSelect: (amount: number) => void;
  customDonationAmount: number;
  setCustomDonationAmount: (v: number) => void;
}

export function ResultsOverlays({ s }: { s: OverlayState }) {
  return (
    <>
      <AnimatePresence>
        {s.showValidation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-validation"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/90 dark:via-purple-900/80 dark:to-indigo-800/90 rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl border-2 border-indigo-200 dark:border-indigo-700"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-300 mb-2 text-center">Quick Validation</p>
              <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-200 mb-6 text-center">Help us refine your insights</p>

              <div className="mb-6">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-3">
                  1. Does this MBTI type ({s.result?.mbtiType || "XXXX"}) match you?
                </p>
                <div className="flex gap-2 justify-center">
                  {["no", "somewhat", "yes"].map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => s.setMbtiMatchAnswer(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        s.mbtiMatchAnswer === option
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-white dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-200 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-700/50"
                      }`}
                      data-testid={`radio-mbti-${option}`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-3">
                  2. Rate the accuracy of your Openness score ({s.result?.bigFiveProfile.O || 50}%)
                </p>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => s.setOpennessRating(star)}
                      className="p-1 transition-all"
                      data-testid={`star-rating-${star}`}
                    >
                      <Star className={`w-8 h-8 transition-all ${star <= s.opennessRating ? "fill-amber-400 text-amber-400" : "text-indigo-300 dark:text-indigo-600"}`} />
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-indigo-400/70 dark:text-indigo-400/50 mt-1 text-center">
                  {s.opennessRating === 0 && "Tap to rate"}
                  {s.opennessRating === 1 && "Very inaccurate"}
                  {s.opennessRating === 2 && "Somewhat inaccurate"}
                  {s.opennessRating === 3 && "Neutral"}
                  {s.opennessRating === 4 && "Mostly accurate"}
                  {s.opennessRating === 5 && "Very accurate"}
                </p>
              </div>

              <Button
                onClick={s.handleValidationSubmit}
                disabled={!s.mbtiMatchAnswer || s.opennessRating === 0}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-validation-submit"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit & Continue
              </Button>

              <p className="text-xs text-indigo-400/70 dark:text-indigo-400/50 mt-4 text-center">Helps personalize your premium insights</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.showRefinedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-refined"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-900/90 dark:via-teal-900/80 dark:to-emerald-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-emerald-200 dark:border-emerald-700"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, ease: "easeOut" }}>
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-emerald-700 dark:text-emerald-200 mb-2">Thanks!</motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-sm text-emerald-600/80 dark:text-emerald-300/70">We've refined your insights based on your input.</motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.showJustKidding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-just-kidding"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-900/90 dark:via-cyan-900/80 dark:to-teal-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-teal-200 dark:border-teal-700"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>

              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 400 }} className="text-[28px] font-bold text-teal-700 dark:text-teal-200 mb-2">Premium is Free!</motion.p>
              <p className="text-sm text-teal-600/80 dark:text-teal-300/70 mb-6">We're testing! Your two cents (literally $0.02) helps us build something great.</p>

              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 text-lg shadow-lg" onClick={s.handleProceedToResults} data-testid="button-proceed-results">
                  <ArrowRight className="w-5 h-5 mr-2" />Proceed to Results
                </Button>
                <Button variant="outline" className="w-full border-2 border-teal-400 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 font-semibold py-4" onClick={s.handleDonateClick} data-testid="button-donate-kidding">
                  <Heart className="w-4 h-4 mr-2 fill-current" />Donate (Help us build)
                </Button>
              </div>
              <p className="text-xs text-teal-500/60 dark:text-teal-400/50 mt-4">All features unlocked free during testing</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.showDonationTiers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && s.setShowDonationTiers(false)}
            data-testid="overlay-donation-tiers"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/90 dark:via-orange-900/80 dark:to-amber-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-amber-200 dark:border-amber-700"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 400 }} className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-10 h-10 text-white fill-current" />
              </motion.div>

              <p className="text-xl font-bold text-amber-700 dark:text-amber-200 mb-2">Support KnowRole</p>
              <p className="text-sm text-amber-600/80 dark:text-amber-300/70 mb-6">Your donation helps us keep building and improving!</p>

              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg" onClick={() => s.handleDonationTierSelect(1000)} data-testid="button-donate-10">$10</Button>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg" onClick={() => s.handleDonationTierSelect(2000)} data-testid="button-donate-20">$20</Button>
                <div className="space-y-2">
                  <input type="number" placeholder="Enter custom amount ($)" value={s.customDonationAmount} onChange={(e) => s.setCustomDonationAmount(Math.max(0, parseInt(e.target.value) || 0))} min="1" className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-amber-900/30 text-warm-gray dark:text-soft-cream focus:outline-none focus:ring-2 focus:ring-amber-400" data-testid="input-custom-donation" />
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-4 text-lg shadow-lg" onClick={() => s.customDonationAmount > 0 && s.handleDonationTierSelect(s.customDonationAmount * 100)} disabled={s.customDonationAmount <= 0} data-testid="button-donate-custom">Donate ${s.customDonationAmount}</Button>
                </div>
                <Button variant="outline" className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 font-semibold py-4" onClick={() => s.setShowDonationTiers(false)} data-testid="button-back-donation">
                  <ArrowLeft className="w-4 h-4 mr-2" />Go Back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackOverlay s={s} />
    </>
  );
}
