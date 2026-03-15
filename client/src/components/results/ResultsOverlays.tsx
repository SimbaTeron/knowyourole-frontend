import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Heart, Crown, Star, CheckCircle2,
  ArrowRight, ArrowLeft, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalityResult } from "./resultsData";

interface ToggleButtonProps {
  value: string;
  currentValue: string;
  onChange: (v: string) => void;
  variant?: "no" | "middle" | "yes" | "default";
  children: React.ReactNode;
  testId: string;
}

function ToggleButton({ value, currentValue, onChange, variant = "default", children, testId }: ToggleButtonProps) {
  const isSelected = currentValue === value;
  const baseClasses = "flex-1 py-1.5 px-1.5 rounded-md text-[10px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variantClasses = {
    no: isSelected
      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-2 ring-red-400"
      : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-red-50 dark:hover:bg-red-900/20",
    middle: isSelected
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400"
      : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-amber-50 dark:hover:bg-amber-900/20",
    yes: isSelected
      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-2 ring-green-400"
      : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-green-50 dark:hover:bg-green-900/20",
    default: isSelected
      ? "bg-terracotta/20 text-terracotta ring-2 ring-terracotta"
      : "bg-gray-100 dark:bg-[#1E1E2E] text-gray-600 dark:text-[#94A3B8] hover:bg-terracotta/10",
  };

  return (
    <button
      type="button"
      onClick={() => {
        onChange(value);
        if (navigator.vibrate) navigator.vibrate(20);
      }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-pressed={isSelected}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export interface OverlayState {
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
  showFeedbackModal: boolean;
  usefulApp: string;
  setUsefulApp: (v: string) => void;
  resultsAccurate: string;
  setResultsAccurate: (v: string) => void;
  questionsEngaging: string;
  setQuestionsEngaging: (v: string) => void;
  wouldShare: string;
  setWouldShare: (v: string) => void;
  suggestions: string;
  setSuggestions: (v: string) => void;
  allFeedbackAnswered: boolean;
  isSubmittingFeedback: boolean;
  feedbackCompleted: boolean;
  pendingCrossroads: boolean;
  handleFeedbackSubmit: () => void;
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

              <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-300 mb-2 text-center">
                Quick Validation
              </p>
              <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-200 mb-6 text-center">
                Help us refine your insights
              </p>

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
                      <Star
                        className={`w-8 h-8 transition-all ${
                          star <= s.opennessRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-indigo-300 dark:text-indigo-600"
                        }`}
                      />
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

              <p className="text-xs text-indigo-400/70 dark:text-indigo-400/50 mt-4 text-center">
                Helps personalize your premium insights
              </p>
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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-emerald-700 dark:text-emerald-200 mb-2"
              >
                Thanks!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-emerald-600/80 dark:text-emerald-300/70"
              >
                We've refined your insights based on your input.
              </motion.p>
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

              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                className="text-[28px] font-bold text-teal-700 dark:text-teal-200 mb-2"
              >
                Premium is Free!
              </motion.p>
              <p className="text-sm text-teal-600/80 dark:text-teal-300/70 mb-6">
                We're testing! Your two cents (literally $0.02) helps us build something great.
              </p>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={s.handleProceedToResults}
                  data-testid="button-proceed-results"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Proceed to Results
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-teal-400 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 font-semibold py-4"
                  onClick={s.handleDonateClick}
                  data-testid="button-donate-kidding"
                >
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Donate (Help us build)
                </Button>
              </div>

              <p className="text-xs text-teal-500/60 dark:text-teal-400/50 mt-4">
                All features unlocked free during testing
              </p>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Heart className="w-10 h-10 text-white fill-current" />
              </motion.div>

              <p className="text-xl font-bold text-amber-700 dark:text-amber-200 mb-2">
                Support KnowRole
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-300/70 mb-6">
                Your donation helps us keep building and improving!
              </p>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => s.handleDonationTierSelect(1000)}
                  data-testid="button-donate-10"
                >
                  $10
                </Button>

                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => s.handleDonationTierSelect(2000)}
                  data-testid="button-donate-20"
                >
                  $20
                </Button>

                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Enter custom amount ($)"
                    value={s.customDonationAmount}
                    onChange={(e) => s.setCustomDonationAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min="1"
                    className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-amber-900/30 text-warm-gray dark:text-soft-cream focus:outline-none focus:ring-2 focus:ring-amber-400"
                    data-testid="input-custom-donation"
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-4 text-lg shadow-lg"
                    onClick={() => s.customDonationAmount > 0 && s.handleDonationTierSelect(s.customDonationAmount * 100)}
                    disabled={s.customDonationAmount <= 0}
                    data-testid="button-donate-custom"
                  >
                    Donate ${s.customDonationAmount}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 font-semibold py-4"
                  onClick={() => s.setShowDonationTiers(false)}
                  data-testid="button-back-donation"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            data-testid="overlay-feedback-modal"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#12121A] rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-terracotta/30 dark:border-terracotta/50 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-amber-500 flex items-center justify-center mx-auto mb-3"
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC] mb-1">
                  Quick Feedback
                </h3>
                <p className="text-sm text-warm-gray/60 dark:text-[#64748B]">
                  Help us improve KnowRole in 30 seconds
                </p>
              </div>

              <div className="space-y-4">
                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Useful App?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="no" testId="modal-toggle-useful-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="middle" testId="modal-toggle-useful-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="yes" testId="modal-toggle-useful-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Results feel accurate?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="no" testId="modal-toggle-accurate-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="middle" testId="modal-toggle-accurate-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="yes" testId="modal-toggle-accurate-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Questions engaging?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="no" testId="modal-toggle-engaging-no">No</ToggleButton>
                    <ToggleButton value="somewhat" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="middle" testId="modal-toggle-engaging-somewhat">Somewhat</ToggleButton>
                    <ToggleButton value="yes" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="yes" testId="modal-toggle-engaging-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label asChild>
                    <legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">
                      Would share with a friend?
                    </legend>
                  </Label>
                  <div className="flex justify-between w-full gap-2" role="radiogroup">
                    <ToggleButton value="no" currentValue={s.wouldShare} onChange={s.setWouldShare} variant="no" testId="modal-toggle-share-no">No</ToggleButton>
                    <ToggleButton value="yes" currentValue={s.wouldShare} onChange={s.setWouldShare} variant="yes" testId="modal-toggle-share-yes">Yes</ToggleButton>
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="modal-suggestions" className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC]">
                    Suggestions for improvement?
                  </Label>
                  <Textarea
                    id="modal-suggestions"
                    placeholder="Share your thoughts..."
                    value={s.suggestions}
                    onChange={(e) => s.setSuggestions(e.target.value)}
                    maxLength={2000}
                    rows={2}
                    className="resize-none text-sm"
                    data-testid="modal-textarea-suggestions"
                  />
                </div>

                <Button
                  onClick={s.handleFeedbackSubmit}
                  disabled={!s.allFeedbackAnswered || s.isSubmittingFeedback}
                  className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 text-base font-semibold"
                  data-testid="button-submit-feedback"
                >
                  {s.isSubmittingFeedback ? (
                    "Submitting..."
                  ) : s.allFeedbackAnswered ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {s.pendingCrossroads ? "Submit & Start Adventure" : "Submit Feedback"}
                    </>
                  ) : (
                    "Complete all fields to continue"
                  )}
                </Button>

                {!s.allFeedbackAnswered && (
                  <p className="text-center text-xs text-warm-gray/50 dark:text-[#64748B]">
                    All fields required
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
