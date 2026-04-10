"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Pause, MousePointerClick, SlidersHorizontal } from "lucide-react";

interface OnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
  icon: typeof Timer;
  position: "below" | "above" | "center";
  buttonText: string;
}

const QUIZ_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetSelector: "[data-onboarding='timer']",
    title: "Watch the Timer",
    description: "Each question has a countdown. Trust your gut and answer before time runs out!",
    icon: Timer,
    position: "below",
    buttonText: "Next",
  },
  {
    targetSelector: "[data-onboarding='pause']",
    title: "Need a Break?",
    description: "Tap the pause button at the bottom anytime you need to take a breather.",
    icon: Pause,
    position: "above",
    buttonText: "Next",
  },
  {
    targetSelector: "[data-onboarding='answers'], [data-onboarding='slider']",
    title: "Tap to Answer",
    description: "Tap, click, or swipe the option that feels most like you. There are no wrong answers!",
    icon: MousePointerClick,
    position: "above",
    buttonText: "Start Quiz",
  },
];

const SLIDER_ONBOARDING_STEP: OnboardingStep = {
  targetSelector: "[data-onboarding='slider']",
  title: "Slide to Choose",
  description: "Drag the slider to show how strongly you feel, then tap Confirm. The closer to the edge, the stronger your preference.",
  icon: SlidersHorizontal,
  position: "above",
  buttonText: "Got It",
};

interface QuizOnboardingOverlayProps {
  type: "intro" | "slider";
  onComplete: () => void;
}

export default function QuizOnboardingOverlay({ type, onComplete }: QuizOnboardingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const steps = type === "intro" ? QUIZ_ONBOARDING_STEPS : [SLIDER_ONBOARDING_STEP];
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const updateSpotlight = () => {
      const target = document.querySelector(currentStep.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setSpotlightRect(rect);
      } else {
        setSpotlightRect(null);
      }
    };

    updateSpotlight();
    const resizeObserver = new ResizeObserver(updateSpotlight);
    const target = document.querySelector(currentStep.targetSelector);
    if (target) resizeObserver.observe(target);

    window.addEventListener("resize", updateSpotlight);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      resizeObserver.disconnect();
    };
  }, [currentStep.targetSelector, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const Icon = currentStep.icon;

  const tooltipGap = 8;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotlightRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    if (currentStep.position === "below") {
      return {
        top: spotlightRect.bottom + spotlightPadding + tooltipGap,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "min(340px, calc(100vw - 32px))",
      };
    }

    if (currentStep.position === "above") {
      return {
        bottom: window.innerHeight - spotlightRect.top + spotlightPadding + tooltipGap,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "min(340px, calc(100vw - 32px))",
      };
    }

    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  };

  const spotlightPadding = 12;

  const getArrowStyle = (): { className: string; style: React.CSSProperties } | null => {
    if (!spotlightRect) return null;

    if (currentStep.position === "below") {
      return {
        className: "onboarding-arrow-up",
        style: {
          position: "absolute" as const,
          top: spotlightRect.bottom + spotlightPadding,
          left: spotlightRect.left + spotlightRect.width / 2 - 10,
        },
      };
    }

    if (currentStep.position === "above") {
      return {
        className: "onboarding-arrow-down",
        style: {
          position: "absolute" as const,
          bottom: window.innerHeight - spotlightRect.top + spotlightPadding - tooltipGap + 2,
          left: spotlightRect.left + spotlightRect.width / 2 - 10,
        },
      };
    }

    return null;
  };

  const arrowProps = getArrowStyle();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999]"
      onClick={(e) => e.stopPropagation()}
      data-testid="quiz-onboarding-overlay"
    >
      <style>{`
        @keyframes onboarding-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-6px); opacity: 0.7; }
        }
        .onboarding-arrow-up {
          width: 0; height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid var(--arrow-color, #A78BFA);
          animation: onboarding-bounce 1s ease-in-out infinite;
          z-index: 10;
          filter: drop-shadow(0 0 4px rgba(167,139,250,0.5));
        }
        .onboarding-arrow-down {
          width: 0; height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid var(--arrow-color, #A78BFA);
          animation: onboarding-bounce 1s ease-in-out infinite;
          z-index: 10;
          filter: drop-shadow(0 0 4px rgba(167,139,250,0.5));
        }
      `}</style>

      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - spotlightPadding}
                y={spotlightRect.top - spotlightPadding}
                width={spotlightRect.width + spotlightPadding * 2}
                height={spotlightRect.height + spotlightPadding * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: "all" }}
        />
      </svg>

      {spotlightRect && (
        <div
          className="absolute rounded-xl border-2 border-terracotta/60 dark:border-[#A78BFA]/60 pointer-events-none"
          style={{
            left: spotlightRect.left - spotlightPadding,
            top: spotlightRect.top - spotlightPadding,
            width: spotlightRect.width + spotlightPadding * 2,
            height: spotlightRect.height + spotlightPadding * 2,
          }}
        />
      )}

      {arrowProps && (
        <div
          className={arrowProps.className}
          style={{
            ...arrowProps.style,
            "--arrow-color": "var(--terracotta, #A78BFA)",
          } as React.CSSProperties}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="absolute z-10"
          style={getTooltipStyle()}
        >
          <div className="bg-white dark:bg-[#1E1E2E] rounded-2xl shadow-2xl border border-warm-gray/20 dark:border-[#A78BFA]/30 p-5 w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-terracotta to-sunset-amber dark:from-[#A78BFA] dark:to-[#67E8F9] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC]" style={{ fontFamily: "Nunito, sans-serif" }}>
                {currentStep.title}
              </h3>
            </div>
            <p className="text-base text-warm-gray/80 dark:text-[#94A3B8] mb-4 leading-relaxed" style={{ fontFamily: "Nunito, sans-serif" }}>
              {currentStep.description}
            </p>
            <div className="flex items-center justify-between gap-3">
              {steps.length > 1 && (
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? "bg-terracotta dark:bg-[#A78BFA] scale-125"
                          : idx < currentStepIndex
                          ? "bg-sage-green dark:bg-[#67E8F9]"
                          : "bg-warm-gray/20 dark:bg-[#1E1E2E]"
                      }`}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-3 rounded-xl text-base font-bold text-white transition-all trail-button"
                data-testid={`button-onboarding-${currentStep.buttonText.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {currentStep.buttonText}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}