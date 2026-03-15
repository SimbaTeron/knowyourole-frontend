import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ToggleButtonProps {
  value: string;
  currentValue: string;
  onChange: (v: string) => void;
  variant?: "no" | "middle" | "yes";
  children: React.ReactNode;
  testId: string;
}

function ToggleButton({ value, currentValue, onChange, variant = "yes", children, testId }: ToggleButtonProps) {
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
  };

  return (
    <button
      type="button"
      onClick={() => { onChange(value); if (navigator.vibrate) navigator.vibrate(20); }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-pressed={isSelected}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export interface FeedbackState {
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

export function FeedbackOverlay({ s }: { s: FeedbackState }) {
  return (
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
              <h3 className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC] mb-1">Quick Feedback</h3>
              <p className="text-sm text-warm-gray/60 dark:text-[#64748B]">Help us improve KnowRole in 30 seconds</p>
            </div>

            <div className="space-y-4">
              <fieldset className="space-y-2">
                <Label asChild><legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">Useful App?</legend></Label>
                <div className="flex justify-between w-full gap-2" role="radiogroup">
                  <ToggleButton value="no" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="no" testId="modal-toggle-useful-no">No</ToggleButton>
                  <ToggleButton value="somewhat" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="middle" testId="modal-toggle-useful-somewhat">Somewhat</ToggleButton>
                  <ToggleButton value="yes" currentValue={s.usefulApp} onChange={s.setUsefulApp} variant="yes" testId="modal-toggle-useful-yes">Yes</ToggleButton>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <Label asChild><legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">Results feel accurate?</legend></Label>
                <div className="flex justify-between w-full gap-2" role="radiogroup">
                  <ToggleButton value="no" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="no" testId="modal-toggle-accurate-no">No</ToggleButton>
                  <ToggleButton value="somewhat" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="middle" testId="modal-toggle-accurate-somewhat">Somewhat</ToggleButton>
                  <ToggleButton value="yes" currentValue={s.resultsAccurate} onChange={s.setResultsAccurate} variant="yes" testId="modal-toggle-accurate-yes">Yes</ToggleButton>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <Label asChild><legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">Questions engaging?</legend></Label>
                <div className="flex justify-between w-full gap-2" role="radiogroup">
                  <ToggleButton value="no" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="no" testId="modal-toggle-engaging-no">No</ToggleButton>
                  <ToggleButton value="somewhat" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="middle" testId="modal-toggle-engaging-somewhat">Somewhat</ToggleButton>
                  <ToggleButton value="yes" currentValue={s.questionsEngaging} onChange={s.setQuestionsEngaging} variant="yes" testId="modal-toggle-engaging-yes">Yes</ToggleButton>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <Label asChild><legend className="font-medium text-warm-gray dark:text-[#F8FAFC] mb-2 text-sm">Would share with a friend?</legend></Label>
                <div className="flex justify-between w-full gap-2" role="radiogroup">
                  <ToggleButton value="no" currentValue={s.wouldShare} onChange={s.setWouldShare} variant="no" testId="modal-toggle-share-no">No</ToggleButton>
                  <ToggleButton value="yes" currentValue={s.wouldShare} onChange={s.setWouldShare} variant="yes" testId="modal-toggle-share-yes">Yes</ToggleButton>
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="modal-suggestions" className="text-sm font-medium text-warm-gray dark:text-[#F8FAFC]">Suggestions for improvement?</Label>
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
                {s.isSubmittingFeedback ? "Submitting..." : s.allFeedbackAnswered ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" />{s.pendingCrossroads ? "Submit & Start Adventure" : "Submit Feedback"}</>
                ) : "Complete all fields to continue"}
              </Button>

              {!s.allFeedbackAnswered && (
                <p className="text-center text-xs text-warm-gray/50 dark:text-[#64748B]">All fields required</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
