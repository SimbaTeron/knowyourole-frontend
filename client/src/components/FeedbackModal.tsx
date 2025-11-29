import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, MessageCircle, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FeedbackModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const UNLOCK_TIME = 20;

export default function FeedbackModal({ isOpen, onComplete }: FeedbackModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(UNLOCK_TIME);
  const [canUnlock, setCanUnlock] = useState(false);
  const [question1, setQuestion1] = useState<string>("");
  const [question2, setQuestion2] = useState<string>("");
  const [question3, setQuestion3] = useState<string>("");
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
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      engagementRating: question1,
      wouldShare: question2,
      accuracyRating: question3,
      timestamp: new Date().toISOString()
    };
    console.log("Quick Path Feedback:", feedbackData);
    
    onComplete();
  };

  const handleSkip = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    onComplete();
  };

  const allAnswered = question1 !== "" && question2 !== "" && question3 !== "";
  const canProceed = canUnlock || allAnswered;

  const animationProps = prefersReducedMotion 
    ? {} 
    : { initial: { scale: 0.9, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.9, opacity: 0, y: 20 } };

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
                Quick Path Check
              </h2>
              
              <p id="feedback-description" className="text-sm text-warm-gray/70 dark:text-soft-cream/60 mt-1">
                {UNLOCK_TIME}s to unlock your results
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

            <div className="space-y-6">
              <fieldset className="space-y-3">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    How engaging were the questions?
                  </legend>
                </Label>
                <RadioGroup 
                  value={question1} 
                  onValueChange={setQuestion1}
                  className="flex justify-between"
                  aria-label="Question engagement rating from 1 to 5"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center gap-1">
                      <RadioGroupItem 
                        value={value.toString()} 
                        id={`q1-${value}`}
                        className="border-2 data-[state=checked]:border-terracotta data-[state=checked]:text-terracotta"
                        data-testid={`radio-engagement-${value}`}
                      />
                      <Label 
                        htmlFor={`q1-${value}`}
                        className="text-xs text-warm-gray/60 dark:text-soft-cream/50 cursor-pointer"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between text-xs text-warm-gray/50 dark:text-soft-cream/40 px-1" aria-hidden="true">
                  <span>Meh</span>
                  <span>Loved it!</span>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-sage-green" aria-hidden="true" />
                    Would you share KnowRole with a friend?
                  </legend>
                </Label>
                <RadioGroup 
                  value={question2} 
                  onValueChange={setQuestion2}
                  className="flex gap-4"
                  aria-label="Would you share with a friend"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem 
                      value="yes" 
                      id="q2-yes" 
                      className="border-2 data-[state=checked]:border-sage-green data-[state=checked]:text-sage-green" 
                      data-testid="radio-share-yes"
                    />
                    <Label htmlFor="q2-yes" className="text-sm cursor-pointer">Yes, totally!</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem 
                      value="maybe" 
                      id="q2-maybe" 
                      className="border-2 data-[state=checked]:border-dusty-blue data-[state=checked]:text-dusty-blue" 
                      data-testid="radio-share-maybe"
                    />
                    <Label htmlFor="q2-maybe" className="text-sm cursor-pointer">Maybe later</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem 
                      value="no" 
                      id="q2-no" 
                      className="border-2 data-[state=checked]:border-warm-gray data-[state=checked]:text-warm-gray" 
                      data-testid="radio-share-no"
                    />
                    <Label htmlFor="q2-no" className="text-sm cursor-pointer">Not yet</Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <Label asChild>
                  <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream flex items-center gap-2">
                    <Star className="w-4 h-4 text-dusty-blue" aria-hidden="true" />
                    How accurate does your result feel?
                  </legend>
                </Label>
                <RadioGroup 
                  value={question3} 
                  onValueChange={setQuestion3}
                  className="flex justify-between"
                  aria-label="Result accuracy rating from 1 to 5"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center gap-1">
                      <RadioGroupItem 
                        value={value.toString()} 
                        id={`q3-${value}`}
                        className="border-2 data-[state=checked]:border-dusty-blue data-[state=checked]:text-dusty-blue"
                        data-testid={`radio-accuracy-${value}`}
                      />
                      <Label 
                        htmlFor={`q3-${value}`}
                        className="text-xs text-warm-gray/60 dark:text-soft-cream/50 cursor-pointer"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between text-xs text-warm-gray/50 dark:text-soft-cream/40 px-1" aria-hidden="true">
                  <span>Way off</span>
                  <span>Spot on!</span>
                </div>
              </fieldset>
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
