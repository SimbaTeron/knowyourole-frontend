import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Clock, Zap, Target, Sparkles, Timer, Hand, SlidersHorizontal, Award } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";

const SKIP_BUTTON_DELAY = 0; // Show skip button immediately

const DEMO_STEPS = [
  {
    id: 1,
    title: "Swipe or Tap",
    description: "Most questions have two choices. Tap or swipe left/right to answer. Watch the timer - trust your gut!",
    icon: Hand,
    demo: "binary",
  },
  {
    id: 2,
    title: "Slider Questions",
    description: "Some questions let you show how strongly you feel. Drag the slider, then tap confirm.",
    icon: SlidersHorizontal,
    demo: "slider",
  },
  {
    id: 3,
    title: "Your Results",
    description: "Earn badges along the way and unlock detailed insights about your personality, strengths, and potential career paths.",
    icon: Target,
    demo: "results",
  },
];

export default function PreQuizPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
      return stored === "light" ? "light" : "dark";
    }
    return "dark";
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [demoCardX, setDemoCardX] = useState(0);
  const [timerProgress, setTimerProgress] = useState(100);
  const [dragDirection, setDragDirection] = useState<number>(0);
  const [viewedSteps, setViewedSteps] = useState<Set<number>>(new Set([0]));
  const [showSkipButton, setShowSkipButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allStepsViewed = viewedSteps.size === DEMO_STEPS.length;

  // Show skip button after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, SKIP_BUTTON_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");
    if (theme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  }, [theme]);

  useEffect(() => {
    setViewedSteps(prev => new Set(Array.from(prev).concat([currentStep])));
  }, [currentStep]);

  useEffect(() => {
    if (DEMO_STEPS[currentStep]?.demo === "binary") {
      const interval = setInterval(() => {
        setDemoCardX(prev => {
          if (prev === 0) return 50;
          if (prev === 50) return -50;
          return 0;
        });
      }, 1200);
      return () => clearInterval(interval);
    } else {
      setDemoCardX(0);
    }
  }, [currentStep]);

  useEffect(() => {
    if (DEMO_STEPS[currentStep]?.demo === "binary") {
      setTimerProgress(100);
      const interval = setInterval(() => {
        setTimerProgress(prev => {
          if (prev <= 0) return 100;
          return prev - 4;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("knowrole-theme", newTheme);
    
    document.documentElement.classList.remove("dark", "light-clinical", "dark-mysterious");

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark", "dark-mysterious");
    } else {
      document.documentElement.classList.add("light-clinical");
    }
  };

  const handleStartQuiz = () => {
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    setLocation("/quiz");
  };

  const handleBack = () => {
    setLocation("/location");
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(20);
    } else if (info.offset.x > threshold && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (navigator.vibrate) navigator.vibrate(20);
    }
    setDragDirection(0);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragDirection(info.offset.x);
  };

  const getThemeClass = () => {
    return theme === "dark" ? "dark-mysterious" : "light-clinical";
  };

  const currentDemoStep = DEMO_STEPS[currentStep];
  const Icon = currentDemoStep.icon;

  const swipeVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      <PathCanvas />
      <CompactHeader
        onBack={handleBack}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />
      <main className="relative z-10 pt-12 pb-32 px-4 min-h-screen flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-4"
          >
            <h1 className="md:text-3xl font-display font-semibold compass-gradient-text mb-2 text-[36px]">
              Here's How It Works
            </h1>
            <p className="text-warm-gray/70 dark:text-[#94A3B8] text-[18px]">Five minutes of focus REQUIRED ;-)</p>
          </motion.div>

          {/* Step Counter */}
          <div className="flex justify-center gap-2 mb-4">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentStep 
                    ? "bg-terracotta dark:bg-[#A78BFA] scale-125" 
                    : viewedSteps.has(idx)
                    ? "bg-sage-green dark:bg-[#67E8F9]"
                    : "bg-warm-gray/20 dark:bg-[#1E1E2E]"
                }`}
                data-testid={`button-demo-step-${idx}`}
              />
            ))}
          </div>

          {/* Swipeable Demo Card */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col relative overflow-hidden"
          >
            <div className="relative flex-1 min-h-[320px]">
              <AnimatePresence initial={false} custom={dragDirection} mode="popLayout">
                <motion.div
                  key={currentStep}
                  custom={dragDirection}
                  variants={swipeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <div className="bg-white dark:bg-[#12121A] rounded-2xl shadow-lg dark:shadow-[0_0_30px_rgba(167,139,250,0.1)] p-6 border border-warm-gray/10 dark:border-[#A78BFA]/20 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-sunset-amber dark:from-[#A78BFA] dark:to-[#67E8F9] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-warm-gray dark:text-[#F8FAFC] text-[24px]">
                          {currentDemoStep.title}
                        </h3>
                        <p className="text-warm-gray/60 dark:text-[#64748B] text-[18px]">
                          Step {currentStep + 1} of {DEMO_STEPS.length}
                        </p>
                      </div>
                    </div>

                    <p className="text-warm-gray/80 dark:text-[#94A3B8] mb-6 text-[18px]">
                      {currentDemoStep.description}
                    </p>

                    {/* Visual Demo */}
                    <div className="bg-soft-cream/50 dark:bg-[#1E1E2E]/50 rounded-xl p-4 flex-1 flex items-center justify-center">
                      {currentDemoStep.demo === "binary" && (
                        <div className="w-full max-w-[280px]">
                          <div className="bg-white dark:bg-[#1E1E2E] rounded-xl p-4 shadow-md border border-warm-gray/10 dark:border-[#A78BFA]/20 relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="relative w-12 h-12">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-warm-gray/10 dark:text-[#1E1E2E]" />
                                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${125 * (timerProgress / 100)} 125`} strokeLinecap="round" className={`transition-all duration-100 ${timerProgress < 30 ? "text-red-500" : "text-terracotta dark:text-[#A78BFA]"}`} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-bold text-warm-gray dark:text-[#F8FAFC]">{Math.ceil(timerProgress / 10)}s</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-warm-gray/10 dark:bg-[#1E1E2E] flex items-center justify-center">
                                <div className="flex gap-0.5">
                                  <div className="w-1 h-3 bg-warm-gray/50 rounded-sm" />
                                  <div className="w-1 h-3 bg-warm-gray/50 rounded-sm" />
                                </div>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-warm-gray/10 dark:bg-[#1E1E2E] rounded-full mb-4 overflow-hidden">
                              <motion.div className={`h-full rounded-full transition-all ${timerProgress < 30 ? "bg-red-500" : "bg-terracotta dark:bg-[#A78BFA]"}`} style={{ width: `${timerProgress}%` }} />
                            </div>
                            <motion.div animate={{ x: demoCardX, rotate: demoCardX / 5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-soft-cream/70 dark:bg-[#0A0A0F] rounded-lg p-3 mb-3 shadow-sm dark:border dark:border-[#A78BFA]/20">
                              <p className="text-sm text-center text-warm-gray dark:text-[#F8FAFC] font-medium">"I enjoy meeting new people"</p>
                            </motion.div>
                            <div className="flex gap-2">
                              <motion.div animate={{ scale: demoCardX < 0 ? 1.05 : 1, opacity: demoCardX < 0 ? 1 : 0.7 }} className="flex-1 py-2 rounded-lg bg-sage-green/20 dark:bg-[#67E8F9]/20 text-sage-green dark:text-[#67E8F9] text-sm text-center font-semibold flex items-center justify-center gap-1">
                                <span>←</span> Agree
                              </motion.div>
                              <motion.div animate={{ scale: demoCardX > 0 ? 1.05 : 1, opacity: demoCardX > 0 ? 1 : 0.7 }} className="flex-1 py-2 rounded-lg bg-terracotta/20 dark:bg-[#A78BFA]/20 text-terracotta dark:text-[#A78BFA] text-sm text-center font-semibold flex items-center justify-center gap-1">
                                Disagree <span>→</span>
                              </motion.div>
                            </div>
                          </div>
                          <p className="text-xs text-center text-warm-gray/50 dark:text-[#64748B] mt-3">Tap or swipe left/right to choose</p>
                        </div>
                      )}

                      {currentDemoStep.demo === "slider" && (
                        <div className="w-full max-w-[260px]">
                          <div className="bg-white dark:bg-[#1E1E2E] rounded-xl p-4 shadow-md dark:border dark:border-[#A78BFA]/20">
                            <p className="text-sm text-center text-warm-gray dark:text-[#F8FAFC] font-medium mb-4">"I prefer plans over spontaneity"</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-sage-green dark:text-[#67E8F9] font-semibold">Agree</span>
                              <span className="text-terracotta dark:text-[#A78BFA] font-semibold">Disagree</span>
                            </div>
                            <div className="relative py-2">
                              <div className="h-4 rounded-full bg-gradient-to-r from-sage-green via-warm-gray/30 to-terracotta dark:from-[#67E8F9] dark:via-[#1E1E2E] dark:to-[#A78BFA]" />
                              <motion.div animate={{ x: [-70, 0, 70, 0, -70] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl border-4 border-terracotta dark:border-[#A78BFA]" style={{ left: "calc(50% - 16px)" }} />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-warm-gray/60 dark:text-[#64748B]">
                              <span>Strong</span>
                              <span>Slight</span>
                              <span>Neutral</span>
                              <span>Slight</span>
                              <span>Strong</span>
                            </div>
                            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-4 px-4 py-3 rounded-xl bg-terracotta dark:bg-gradient-to-r dark:from-[#A78BFA] dark:to-[#67E8F9] text-white text-sm text-center font-bold">
                              Confirm Choice
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {currentDemoStep.demo === "results" && (
                        <div className="w-full max-w-[280px]">
                          <div className="flex justify-center gap-3 mb-4">
                            <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] flex items-center justify-center shadow-lg dark:shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                              <Award className="w-6 h-6 text-white" />
                            </motion.div>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#67E8F9] to-[#06B6D4] flex items-center justify-center shadow-lg dark:shadow-[0_0_15px_rgba(103,232,249,0.3)]">
                              <span className="text-base font-black text-white">2X</span>
                            </motion.div>
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#A78BFA] flex items-center justify-center shadow-lg dark:shadow-[0_0_15px_rgba(196,181,253,0.3)]">
                              <Sparkles className="w-6 h-6 text-white" />
                            </motion.div>
                          </div>
                          <div className="bg-white dark:bg-[#1E1E2E] rounded-xl p-4 shadow-md dark:border dark:border-[#A78BFA]/20 space-y-2">
                            {[
                              { label: "Personality Type", value: "ENFP", color: "text-purple-600 dark:text-[#A78BFA]" },
                              { label: "Top Strength", value: "Creativity", color: "text-amber-600 dark:text-[#67E8F9]" },
                              { label: "Career Match", value: "Designer", color: "text-teal-600 dark:text-[#C4B5FD]" }
                            ].map((item, idx) => (
                              <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }} className="flex justify-between items-center py-1.5 border-b border-warm-gray/10 dark:border-[#A78BFA]/10 last:border-0">
                                <span className="text-xs text-warm-gray/70 dark:text-[#94A3B8]">{item.label}</span>
                                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                              </motion.div>
                            ))}
                          </div>
                          <p className="text-xs text-center text-warm-gray/50 dark:text-[#64748B] mt-3">Unlock insights about your unique traits</p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-[#0A0A0F] dark:via-[#0A0A0F]/95 pb-8">
        <div className="max-w-md mx-auto">
          {!allStepsViewed && (
            <p className="text-center text-xs text-warm-gray/60 dark:text-[#64748B] mb-4">
              Swipe through all {DEMO_STEPS.length} steps to unlock ({viewedSteps.size}/{DEMO_STEPS.length})
            </p>
          )}
          
          {/* Subtle Skip Instructions button - appears after 2 seconds */}
          <AnimatePresence>
            {showSkipButton && !allStepsViewed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onClick={handleStartQuiz}
                className="w-full py-2 mb-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                data-testid="button-skip-instructions"
              >
                Skip Instructions
              </motion.button>
            )}
          </AnimatePresence>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleStartQuiz}
            disabled={!allStepsViewed}
            className={`w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              allStepsViewed 
                ? "trail-button text-white" 
                : "bg-gray-300 dark:bg-[#1E1E2E] text-gray-500 dark:text-[#64748B] cursor-not-allowed"
            }`}
            data-testid="button-start-quiz"
          >
            <Zap className="w-5 h-5" />
            {allStepsViewed ? "I'm Ready" : `View All Steps (${viewedSteps.size}/${DEMO_STEPS.length})`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
