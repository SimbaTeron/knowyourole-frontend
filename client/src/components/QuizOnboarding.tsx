"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, Pause, SlidersHorizontal, Timer, type LucideIcon } from "lucide-react";

interface SliderOnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
}

interface HighlightItem {
  key: "timer" | "answers" | "pause";
  selector: string;
  label: string;
  guideLabel: string;
  icon: LucideIcon;
}

const INTRO_HIGHLIGHTS: HighlightItem[] = [
  {
    key: "timer",
    selector: "[data-onboarding='timer']",
    label: "Timer",
    guideLabel: "15 Second Timer",
    icon: Timer,
  },
  {
    key: "answers",
    selector: "[data-onboarding='answers'], [data-onboarding='slider']",
    label: "Tap or click",
    guideLabel: "Tap or click to select",
    icon: MousePointerClick,
  },
  {
    key: "pause",
    selector: "[data-onboarding='pause']",
    label: "Pause",
    guideLabel: "Pause button",
    icon: Pause,
  },
];

const SLIDER_ONBOARDING_STEP: SliderOnboardingStep = {
  targetSelector: "[data-onboarding='slider']",
  title: "Slider questions",
  description: "Move the slider toward the side that feels more like you, then tap Confirm.",
  icon: SlidersHorizontal,
  buttonText: "Got it",
};

interface QuizOnboardingOverlayProps {
  type: "intro" | "slider";
  onComplete: () => void;
}

type HighlightRects = Partial<Record<HighlightItem["key"], DOMRect>>;

const spotlightPadding = 12;
const tooltipHorizontalMargin = 16;

function getTargetRect(selector: string): DOMRect | null {
  const target = document.querySelector(selector);
  return target?.getBoundingClientRect() ?? null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getRectCenter(rect: DOMRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export default function QuizOnboardingOverlay({ type, onComplete }: QuizOnboardingOverlayProps) {
  const [sliderRect, setSliderRect] = useState<DOMRect | null>(null);
  const [highlightRects, setHighlightRects] = useState<HighlightRects>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRects = () => {
      if (type === "slider") {
        setSliderRect(getTargetRect(SLIDER_ONBOARDING_STEP.targetSelector));
        return;
      }

      const nextRects: HighlightRects = {};
      INTRO_HIGHLIGHTS.forEach((item) => {
        const rect = getTargetRect(item.selector);
        if (rect) nextRects[item.key] = rect;
      });
      setHighlightRects(nextRects);
    };

    updateRects();

    const resizeObserver = new ResizeObserver(updateRects);
    const observedTargets = type === "slider"
      ? [document.querySelector(SLIDER_ONBOARDING_STEP.targetSelector)]
      : INTRO_HIGHLIGHTS.map((item) => document.querySelector(item.selector));

    observedTargets.forEach((target) => {
      if (target) resizeObserver.observe(target);
    });

    window.addEventListener("resize", updateRects);
    window.addEventListener("scroll", updateRects, true);

    return () => {
      window.removeEventListener("resize", updateRects);
      window.removeEventListener("scroll", updateRects, true);
      resizeObserver.disconnect();
    };
  }, [type]);

  if (type === "intro") {
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999]"
        onClick={(e) => e.stopPropagation()}
        data-testid="quiz-onboarding-overlay"
      >
        <style>{`
          @keyframes kyr-onboarding-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.045); opacity: 1; }
          }
          @keyframes kyr-onboarding-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .kyr-onboarding-target {
            animation: kyr-onboarding-pulse 1.6s ease-in-out infinite;
          }
          .kyr-onboarding-card-float {
            animation: kyr-onboarding-float 2.4s ease-in-out infinite;
          }
        `}</style>

        <div className="absolute inset-0 bg-black/72 backdrop-blur-[2px]" />

        <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
          <defs>
            <linearGradient id="quiz-guide-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="55%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {INTRO_HIGHLIGHTS.map((item) => {
            const rect = highlightRects[item.key];
            if (!rect) return null;
            return (
              <rect
                key={`mask-${item.key}`}
                x={rect.left - spotlightPadding}
                y={rect.top - spotlightPadding}
                width={rect.width + spotlightPadding * 2}
                height={rect.height + spotlightPadding * 2}
                rx="18"
                fill="none"
                stroke="url(#quiz-guide-line)"
                strokeWidth="2.5"
                strokeDasharray="8 8"
                className="kyr-onboarding-target"
              />
            );
          })}

        </svg>

        {INTRO_HIGHLIGHTS.map((item, index) => {
          const rect = highlightRects[item.key];
          if (!rect) return null;
          const center = getRectCenter(rect);
          const Icon = item.icon;
          const pillWidth = 132;
          const left = clamp(center.x - pillWidth / 2, 12, window.innerWidth - pillWidth - 12);
          const shouldPlaceBelow = center.y < window.innerHeight * 0.38;
          const top = shouldPlaceBelow
            ? rect.bottom + spotlightPadding + 8
            : rect.top - spotlightPadding - 42;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9, y: shouldPlaceBelow ? -6 : 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.12 * index, duration: 0.25 }}
              className="absolute z-20 flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-white/95 px-2.5 text-xs font-black text-warm-gray shadow-xl dark:border-[#A78BFA]/30 dark:bg-[#12121A]/95 dark:text-[#F8FAFC]"
              style={{ left, top, width: pillWidth }}
            >
              <Icon className="h-3.5 w-3.5 text-terracotta dark:text-[#67E8F9]" />
              <span className="truncate">{item.label}</span>
            </motion.div>
          );
        })}

        <AnimatePresence mode="wait">
          <motion.div
            key="intro-onboarding"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-1/2 z-30 w-[min(304px,calc(100vw-40px))]"
            style={{ x: "-50%", y: "-50%" }}
          >
            <div className="overflow-hidden rounded-[1.35rem] border border-[#A78BFA]/35 bg-white shadow-2xl dark:bg-[#11111A]">
              <div className="border-b border-warm-gray/10 px-4 pb-2.5 pt-3 dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-terracotta dark:text-[#67E8F9]">Quick guide</p>
              </div>

              <div className="space-y-2.5 p-3.5">
                <div className="grid gap-2">
                  {INTRO_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex min-h-[52px] items-center gap-3 rounded-2xl bg-warm-gray/5 px-3 py-2.5 dark:bg-white/5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-terracotta/12 text-terracotta dark:bg-[#A78BFA]/20 dark:text-[#67E8F9]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-black leading-tight text-warm-gray dark:text-[#F8FAFC]">{item.guideLabel}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={onComplete}
                  className="trail-button min-h-11 w-full rounded-2xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition-transform active:scale-[0.98]"
                  data-testid="button-onboarding-start-quiz"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const Icon = SLIDER_ONBOARDING_STEP.icon;
  const tooltipWidth = Math.min(340, typeof window === "undefined" ? 340 : window.innerWidth - tooltipHorizontalMargin * 2);
  const targetCenter = sliderRect ? sliderRect.left + sliderRect.width / 2 : (typeof window === "undefined" ? 170 : window.innerWidth / 2);
  const tooltipLeft = typeof window === "undefined"
    ? "50%"
    : clamp(targetCenter - tooltipWidth / 2, tooltipHorizontalMargin, window.innerWidth - tooltipWidth - tooltipHorizontalMargin);
  const tooltipStyle: React.CSSProperties = sliderRect
    ? {
        bottom: window.innerHeight - sliderRect.top + spotlightPadding + 8,
        left: tooltipLeft,
        width: "min(340px, calc(100vw - 32px))",
        maxWidth: "min(340px, calc(100vw - 32px))",
      }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

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

      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {sliderRect && (
              <rect
                x={sliderRect.left - spotlightPadding}
                y={sliderRect.top - spotlightPadding}
                width={sliderRect.width + spotlightPadding * 2}
                height={sliderRect.height + spotlightPadding * 2}
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

      {sliderRect && (
        <>
          <div
            className="absolute rounded-xl border-2 border-terracotta/60 pointer-events-none dark:border-[#A78BFA]/60"
            style={{
              left: sliderRect.left - spotlightPadding,
              top: sliderRect.top - spotlightPadding,
              width: sliderRect.width + spotlightPadding * 2,
              height: sliderRect.height + spotlightPadding * 2,
            }}
          />
          <div
            className="onboarding-arrow-down absolute"
            style={{
              bottom: window.innerHeight - sliderRect.top + spotlightPadding - 6,
              left: sliderRect.left + sliderRect.width / 2 - 10,
              "--arrow-color": "var(--terracotta, #A78BFA)",
            } as React.CSSProperties}
          />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="slider-onboarding"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="absolute z-10 max-[380px]:text-sm"
          style={tooltipStyle}
        >
          <div className="w-full rounded-2xl border border-warm-gray/20 bg-white p-4 shadow-2xl dark:border-[#A78BFA]/30 dark:bg-[#1E1E2E] sm:p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-sunset-amber dark:from-[#A78BFA] dark:to-[#67E8F9]">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-warm-gray dark:text-[#F8FAFC] sm:text-xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                {SLIDER_ONBOARDING_STEP.title}
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-warm-gray/80 dark:text-[#94A3B8] sm:text-base" style={{ fontFamily: "Nunito, sans-serif" }}>
              {SLIDER_ONBOARDING_STEP.description}
            </p>
            <div className="flex items-center justify-end">
              <button
                onClick={onComplete}
                className="trail-button ml-auto rounded-xl px-6 py-3 text-base font-bold text-white transition-all"
                data-testid="button-onboarding-got-it"
              >
                {SLIDER_ONBOARDING_STEP.buttonText}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
