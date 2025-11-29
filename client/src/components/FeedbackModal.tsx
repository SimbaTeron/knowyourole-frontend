import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageCircle, X, Frown, Meh, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const UNLOCK_TIME = 15;

export default function FeedbackModal({ isOpen, onComplete }: FeedbackModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(UNLOCK_TIME);
  const [canUnlock, setCanUnlock] = useState(false);
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const unlockStartTime = useRef<number>(0);

  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches 
    : false;

  const checkTimeElapsed = useCallback(() => {
    if (unlockStartTime.current === 0) return false;
    const elapsed = (Date.now() - unlockStartTime.current) / 1000;
    return elapsed >= UNLOCK_TIME;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    setTimeRemaining(UNLOCK_TIME);
    setCanUnlock(false);
    unlockStartTime.current = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = (Date.now() - unlockStartTime.current) / 1000;
      const remaining = Math.max(0, UNLOCK_TIME - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setCanUnlock(true);
        clearInterval(timer);
      }
    }, 100);

    const fallbackTimeout = setTimeout(() => {
      setCanUnlock(true);
    }, (UNLOCK_TIME + 1) * 1000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(fallbackTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && checkTimeElapsed()) {
        setCanUnlock(true);
        setTimeRemaining(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen, checkTimeElapsed]);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canUnlock) {
        handleSubmit();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, canUnlock]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    const feedbackData = {
      q1_accurate: resultsAccurate,
      q2_engaging: questionsEngaging,
      q3_share: wouldShare,
      openText: suggestions,
      timestamp: new Date().toISOString()
    };
    console.log("Quick Path Feedback:", feedbackData);
    
    onComplete();
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    onComplete();
  };

  const allAnswered = resultsAccurate !== "" && questionsEngaging !== "" && wouldShare !== "";
  const canProceed = canUnlock || allAnswered;

  const animationProps = prefersReducedMotion 
    ? {} 
    : { initial: { scale: 0.9, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.9, opacity: 0, y: 20 } };

  const ToggleButton = ({ 
    value, 
    currentValue, 
    onChange, 
    variant = "default",
    children,
    testId 
  }: { 
    value: string; 
    currentValue: string; 
    onChange: (v: string) => void;
    variant?: "no" | "middle" | "yes" | "default";
    children: React.ReactNode;
    testId: string;
  }) => {
    const isSelected = currentValue === value;
    const baseClasses = "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      no: isSelected 
        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-2 ring-red-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20",
      middle: isSelected 
        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20",
      yes: isSelected 
        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-2 ring-green-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20",
      default: isSelected 
        ? "bg-terracotta/20 text-terracotta ring-2 ring-terracotta" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-terracotta/10",
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? {} : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          aria-describedby="feedback-description"
          data-testid="feedback-modal-overlay"
        >
          <motion.div
            ref={modalRef}
            {...animationProps}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            data-testid="feedback-modal"
          >
            {canUnlock && (
              <button
                ref={firstFocusableRef}
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Skip feedback and view results"
                data-testid="button-skip-feedback"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/10 mb-3">
                <MessageCircle className="w-6 h-6 text-terracotta" />
              </div>
              
              <h2 
                id="feedback-title"
                className="text-xl font-display font-bold text-warm-gray dark:text-soft-cream"
              >
                Quick Path Check?
              </h2>
              
              <p id="feedback-description" className="text-sm text-warm-gray/70 dark:text-soft-cream/60 mt-1">
                {UNLOCK_TIME}s to unlock more free insights!
              </p>
              
              {!canUnlock && (
                <div 
                  className="flex items-center justify-center gap-2 mt-3"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <Clock className="w-4 h-4 text-terracotta" aria-hidden="true" />
                  <span className="text-lg font-medium font-mono text-terracotta">
                    {Math.ceil(timeRemaining)}s
                  </span>
                </div>
              )}
              
              {canUnlock && !allAnswered && (
                <motion.p 
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-sage-green font-medium mt-3"
                  aria-live="polite"
                >
                  Unlocked! View your results now or answer below.
                </motion.p>
              )}
            </div>

            <div className="space-y-5">
              <fieldset className="space-y-2">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                    Results feel accurate?
                  </legend>
                </Label>
                <div 
                  className="flex justify-between w-full gap-2" 
                  role="radiogroup"
                  aria-label="Rate results accuracy: No, So-so, or Yes"
                >
                  <ToggleButton 
                    value="no" 
                    currentValue={resultsAccurate} 
                    onChange={setResultsAccurate}
                    variant="no"
                    testId="toggle-accurate-no"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Frown className="w-4 h-4" />
                      No
                    </span>
                  </ToggleButton>
                  <ToggleButton 
                    value="so-so" 
                    currentValue={resultsAccurate} 
                    onChange={setResultsAccurate}
                    variant="middle"
                    testId="toggle-accurate-soso"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Meh className="w-4 h-4" />
                      So-so
                    </span>
                  </ToggleButton>
                  <ToggleButton 
                    value="yes" 
                    currentValue={resultsAccurate} 
                    onChange={setResultsAccurate}
                    variant="yes"
                    testId="toggle-accurate-yes"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Smile className="w-4 h-4" />
                      Yes!
                    </span>
                  </ToggleButton>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                    Engaging questions?
                  </legend>
                </Label>
                <div 
                  className="flex justify-between w-full gap-2" 
                  role="radiogroup"
                  aria-label="Rate question engagement: No, So-so, or Yes"
                >
                  <ToggleButton 
                    value="no" 
                    currentValue={questionsEngaging} 
                    onChange={setQuestionsEngaging}
                    variant="no"
                    testId="toggle-engaging-no"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Frown className="w-4 h-4" />
                      No
                    </span>
                  </ToggleButton>
                  <ToggleButton 
                    value="so-so" 
                    currentValue={questionsEngaging} 
                    onChange={setQuestionsEngaging}
                    variant="middle"
                    testId="toggle-engaging-soso"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Meh className="w-4 h-4" />
                      So-so
                    </span>
                  </ToggleButton>
                  <ToggleButton 
                    value="yes" 
                    currentValue={questionsEngaging} 
                    onChange={setQuestionsEngaging}
                    variant="yes"
                    testId="toggle-engaging-yes"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Smile className="w-4 h-4" />
                      Yes!
                    </span>
                  </ToggleButton>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                    Would you share KnowRole with a friend?
                  </legend>
                </Label>
                <div 
                  className="flex justify-between w-full gap-4" 
                  role="radiogroup"
                  aria-label="Would you share: No or Yes"
                >
                  <ToggleButton 
                    value="no" 
                    currentValue={wouldShare} 
                    onChange={setWouldShare}
                    variant="no"
                    testId="toggle-share-no"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Frown className="w-4 h-4" />
                      No
                    </span>
                  </ToggleButton>
                  <div className="flex-1" />
                  <ToggleButton 
                    value="yes" 
                    currentValue={wouldShare} 
                    onChange={setWouldShare}
                    variant="yes"
                    testId="toggle-share-yes"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Smile className="w-4 h-4" />
                      Yes
                    </span>
                  </ToggleButton>
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label 
                  htmlFor="suggestions" 
                  className="text-sm font-medium text-warm-gray dark:text-soft-cream"
                >
                  Suggestions for improvement?
                </Label>
                <Textarea
                  id="suggestions"
                  placeholder="Timing, design, questions..."
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="resize-none text-sm"
                  data-testid="textarea-suggestions"
                />
                <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 text-right">
                  {suggestions.length}/1000
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 text-base font-semibold"
                data-testid="button-view-results"
                aria-describedby={!canProceed ? "unlock-hint" : undefined}
              >
                {allAnswered 
                  ? "View My Results" 
                  : canUnlock 
                    ? "Skip to Results" 
                    : `Unlock in ${Math.ceil(timeRemaining)}s...`
                }
              </Button>
              
              {!canUnlock && !allAnswered && (
                <p id="unlock-hint" className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40">
                  Answer all 3 questions to unlock immediately
                </p>
              )}
              
              {allAnswered && (
                <motion.p 
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-sage-green"
                  aria-live="polite"
                >
                  Thanks for your feedback! Ready to see your results.
                </motion.p>
              )}
            </div>

            <p className="text-center text-xs text-warm-gray/40 dark:text-soft-cream/30 mt-4">
              Your feedback shapes KnowRole's future
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
