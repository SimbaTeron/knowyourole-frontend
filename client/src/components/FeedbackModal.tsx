import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackData {
  tier?: string;
  intuitiveRating: number;
  funSwipes: boolean | null;
  moodLocationRating: number;
  traitsRating: number;
  traitsContext: string;
  themePreference: string;
  themeWhy: string;
  oneChange: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: string;
  selectedTheme?: string;
}

export default function FeedbackModal({ isOpen, onClose, tier, selectedTheme }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    tier: tier,
    intuitiveRating: 0,
    funSwipes: null,
    moodLocationRating: 0,
    traitsRating: 0,
    traitsContext: "",
    themePreference: selectedTheme || "light",
    themeWhy: "",
    oneChange: ""
  });
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [isOpen, onClose]);

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
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const summary = {
      tier: feedback.tier,
      intuitiveRating: feedback.intuitiveRating,
      funSwipes: feedback.funSwipes,
      moodLocationRating: feedback.moodLocationRating,
      traitsRating: feedback.traitsRating,
      traitsContext: feedback.traitsContext,
      themePreference: feedback.themePreference,
      themeWhy: feedback.themeWhy,
      oneChange: feedback.oneChange,
      timestamp: new Date().toISOString()
    };
    
    console.log("KnowRole Feedback Summary:", summary);
    setShowGoogleForm(true);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        onChange(Math.min(5, star + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        onChange(Math.max(1, star - 1));
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange(star);
        if (navigator.vibrate) navigator.vibrate(15);
      }
    };

    return (
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              onChange(star);
              if (navigator.vibrate) navigator.vibrate(15);
            }}
            onKeyDown={(e) => handleKeyDown(e, star)}
            tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
            className={`p-1 rounded transition-all focus:outline-none focus:ring-2 focus:ring-terracotta/50 ${
              star <= value 
                ? "text-amber-500" 
                : "text-gray-300 dark:text-gray-600"
            } hover:scale-110`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-checked={star === value}
            role="radio"
            data-testid={`star-${label.toLowerCase().replace(/\s+/g, "-")}-${star}`}
          >
            <Star className={`w-6 h-6 ${star <= value ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    );
  };

  const YesNoButtons = ({ 
    value, 
    onChange 
  }: { 
    value: boolean | null; 
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex gap-2" role="radiogroup" aria-label="Fun and quick swipes">
      <button
        type="button"
        onClick={() => {
          onChange(true);
          if (navigator.vibrate) navigator.vibrate(15);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          value === true
            ? "bg-sage-green/20 border-sage-green text-sage-green"
            : "border-gray-200 dark:border-gray-700 text-gray-500"
        } hover:scale-105`}
        aria-label="Yes"
        aria-checked={value === true}
        role="radio"
        data-testid="button-fun-yes"
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm font-medium">Yes</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onChange(false);
          if (navigator.vibrate) navigator.vibrate(15);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          value === false
            ? "bg-terracotta/20 border-terracotta text-terracotta"
            : "border-gray-200 dark:border-gray-700 text-gray-500"
        } hover:scale-105`}
        aria-label="No"
        aria-checked={value === false}
        role="radio"
        data-testid="button-fun-no"
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm font-medium">No</span>
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 feedback-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          data-testid="feedback-modal-overlay"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl"
            data-testid="feedback-modal"
          >
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close feedback modal"
              data-testid="button-close-feedback"
            >
              <X className="w-5 h-5" />
            </button>

            {!showGoogleForm ? (
              <>
                <div className="mb-6 pr-8">
                  <h2 
                    id="feedback-title" 
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    Quick Feedback Trail?
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Takes 30s — helps shape paths!
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="feedback-question" data-testid="question-intuitive">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      1. Intuitive path choice?
                    </label>
                    <StarRating
                      value={feedback.intuitiveRating}
                      onChange={(v) => setFeedback({ ...feedback, intuitiveRating: v })}
                      label="Intuitive path choice"
                    />
                  </div>

                  <div className="feedback-question" data-testid="question-fun">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      2. Fun/quick swipes?
                    </label>
                    <YesNoButtons
                      value={feedback.funSwipes}
                      onChange={(v) => setFeedback({ ...feedback, funSwipes: v })}
                    />
                  </div>

                  <div className="feedback-question" data-testid="question-mood-location">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      3. Mood/location felt like "you"?
                    </label>
                    <StarRating
                      value={feedback.moodLocationRating}
                      onChange={(v) => setFeedback({ ...feedback, moodLocationRating: v })}
                      label="Mood location rating"
                    />
                  </div>

                  <div className="feedback-question" data-testid="question-traits">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      4. Useful traits/sparks?
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <StarRating
                        value={feedback.traitsRating}
                        onChange={(v) => setFeedback({ ...feedback, traitsRating: v })}
                        label="Useful traits rating"
                      />
                      <select
                        value={feedback.traitsContext}
                        onChange={(e) => setFeedback({ ...feedback, traitsContext: e.target.value })}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
                        aria-label="Context for traits usefulness"
                        data-testid="select-traits-context"
                      >
                        <option value="">Context...</option>
                        <option value="career">Career</option>
                        <option value="mental-health">Mental Health</option>
                        <option value="relationships">Relationships</option>
                        <option value="personal-growth">Personal Growth</option>
                      </select>
                    </div>
                  </div>

                  <div className="feedback-question" data-testid="question-theme">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      5. Theme vibe?
                    </label>
                    <div className="space-y-2">
                      <select
                        value={feedback.themePreference}
                        onChange={(e) => setFeedback({ ...feedback, themePreference: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
                        aria-label="Theme preference"
                        data-testid="select-theme-preference"
                      >
                        <option value="light">Light (Clinical Cream)</option>
                        <option value="dark">Dark (Mysterious Amber)</option>
                        <option value="random">Random (Vibrant Vibes)</option>
                      </select>
                      <textarea
                        value={feedback.themeWhy}
                        onChange={(e) => setFeedback({ ...feedback, themeWhy: e.target.value })}
                        placeholder="Why this theme resonates..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta resize-none"
                        aria-label="Why this theme"
                        data-testid="textarea-theme-why"
                      />
                    </div>
                  </div>

                  <div className="feedback-question" data-testid="question-change">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      6. One change you'd make?
                    </label>
                    <textarea
                      value={feedback.oneChange}
                      onChange={(e) => {
                        if (e.target.value.length <= 280) {
                          setFeedback({ ...feedback, oneChange: e.target.value });
                        }
                      }}
                      placeholder="Your thoughts..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta resize-none"
                      aria-label="One change suggestion"
                      data-testid="textarea-one-change"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {feedback.oneChange.length}/280
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full mt-6 bg-gradient-to-r from-terracotta to-terracotta/80 hover:from-terracotta/90 hover:to-terracotta/70 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                  data-testid="button-send-feedback"
                >
                  <Send className="w-4 h-4" />
                  Send Sparks!
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Almost there!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Optional: Submit via form for detailed tracking
                  </p>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe
                    src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title="KnowRole Feedback Form"
                    className="bg-white"
                    data-testid="google-form-iframe"
                  >
                    Loading form...
                  </iframe>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Your local feedback was already saved. This form is optional for additional insights.
                </p>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  data-testid="button-close-after-submit"
                >
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
