import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Clock, Zap, Target, Sparkles, Timer, Hand, SlidersHorizontal, Award } from "lucide-react";
import PathCanvas from "@/components/PathCanvas";
import CompactHeader from "@/components/CompactHeader";
import { ThemeMode } from "@/components/ThemeToggle";

const DEMO_STEPS = [
  {
    id: 1,
    title: "Quick Choices",
    description: "You'll see a question with two options. Swipe left or right to choose - go with your gut!",
    icon: Hand,
    demo: "swipe",
  },
  {
    id: 2,
    title: "Beat the Clock",
    description: "Each question has a timer. Don't overthink it - your first instinct is usually right.",
    icon: Timer,
    demo: "timer",
  },
  {
    id: 3,
    title: "Slider Questions",
    description: "Some questions use a slider. Drag it left or right to show how strongly you feel, then tap confirm.",
    icon: SlidersHorizontal,
    demo: "slider",
  },
  {
    id: 4,
    title: "Bonus Badges",
    description: "Watch for special badge and 2X questions! They pause the timer and give you extra time to answer.",
    icon: Award,
    demo: "badges",
  },
  {
    id: 5,
    title: "Power-Up Questions",
    description: "Some questions are multiple choice. These help us understand you even better.",
    icon: Sparkles,
    demo: "multichoice",
  },
];

export default function PreQuizPage() {
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [currentStep, setCurrentStep] = useState(0);
  const [demoCardX, setDemoCardX] = useState(0);
  const [timerProgress, setTimerProgress] = useState(100);
  const [dragDirection, setDragDirection] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("knowrole-theme") as ThemeMode | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (DEMO_STEPS[currentStep]?.demo === "swipe") {
      const interval = setInterval(() => {
        setDemoCardX(prev => {
          if (prev === 0) return 60;
          if (prev === 60) return -60;
          return 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDemoCardX(0);
    }
  }, [currentStep]);

  useEffect(() => {
    if (DEMO_STEPS[currentStep]?.demo === "timer") {
      setTimerProgress(100);
      const interval = setInterval(() => {
        setTimerProgress(prev => {
          if (prev <= 0) return 100;
          return prev - 5;
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
            <h1 className="text-2xl md:text-3xl font-display font-semibold compass-gradient-text mb-2">
              Here's How It Works
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60 text-sm">
              A quick look at what to expect in your personality quiz
            </p>
          </motion.div>

          {/* Step Counter */}
          <div className="flex justify-center gap-2 mb-4">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentStep 
                    ? "bg-terracotta scale-125" 
                    : "bg-warm-gray/20 dark:bg-soft-cream/20"
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-warm-gray/10 dark:border-soft-cream/10 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-sunset-amber flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-warm-gray dark:text-soft-cream text-[24px]">
                          {currentDemoStep.title}
                        </h3>
                        <p className="text-warm-gray/60 dark:text-soft-cream/50 text-[18px]">
                          Step {currentStep + 1} of {DEMO_STEPS.length}
                        </p>
                      </div>
                    </div>

                    <p className="text-warm-gray/80 dark:text-soft-cream/70 mb-6 text-[16px]">
                      {currentDemoStep.description}
                    </p>

                    {/* Visual Demo */}
                    <div className="bg-soft-cream/50 dark:bg-gray-700/50 rounded-xl p-4 flex-1 flex items-center justify-center">
                      {currentDemoStep.demo === "swipe" && (
                        <div className="relative">
                          <motion.div
                            animate={{ x: demoCardX, rotate: demoCardX / 3 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-40 h-20 bg-white dark:bg-gray-600 rounded-xl shadow-md flex items-center justify-center border-2 border-terracotta/20"
                          >
                            <span className="text-xs text-warm-gray/70 dark:text-soft-cream/60">
                              Swipe me!
                            </span>
                          </motion.div>
                          <div className="flex justify-between mt-3 px-2">
                            <span className="text-xs text-sage-green font-medium">Option A</span>
                            <span className="text-xs text-dusty-blue font-medium">Option B</span>
                          </div>
                        </div>
                      )}

                      {currentDemoStep.demo === "timer" && (
                        <div className="text-center">
                          <div className="relative w-20 h-20 mx-auto mb-2">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-warm-gray/10 dark:text-soft-cream/10"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray={`${226 * (timerProgress / 100)} 226`}
                                strokeLinecap="round"
                                className={`transition-all duration-100 ${
                                  timerProgress < 30 ? "text-red-500" : "text-terracotta"
                                }`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-warm-gray dark:text-soft-cream">
                                {Math.ceil(timerProgress / 10)}s
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                            Trust your instincts!
                          </p>
                        </div>
                      )}

                      {currentDemoStep.demo === "slider" && (
                        <div className="w-full max-w-[220px]">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-sage-green font-medium">Agree</span>
                            <span className="text-terracotta font-medium">Disagree</span>
                          </div>
                          <div className="relative">
                            <div className="h-3 rounded-full bg-gradient-to-r from-sage-green via-warm-gray/30 to-terracotta" />
                            <motion.div
                              animate={{ x: [-60, 0, 60, 0, -60] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border-2 border-terracotta"
                              style={{ left: "calc(50% - 12px)" }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] text-warm-gray/50 dark:text-soft-cream/40">
                            <span>Strongly</span>
                            <span>Slightly</span>
                            <span>Neutral</span>
                            <span>Slightly</span>
                            <span>Strongly</span>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="mt-3 px-4 py-2 rounded-lg bg-terracotta text-white text-xs text-center font-medium"
                          >
                            Confirm Choice
                          </motion.div>
                        </div>
                      )}

                      {currentDemoStep.demo === "badges" && (
                        <div className="flex gap-4 items-center">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                          >
                            <Award className="w-8 h-8 text-white" />
                          </motion.div>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.15, 1],
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
                          >
                            <span className="text-xl font-black text-white">2X</span>
                          </motion.div>
                        </div>
                      )}

                      {currentDemoStep.demo === "multichoice" && (
                        <div className="w-full max-w-[200px] space-y-2">
                          {["Creative work", "Helping others", "Solving puzzles", "Leading teams"].map((opt, idx) => (
                            <motion.div
                              key={opt}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`px-3 py-2 rounded-lg text-xs text-center transition-all ${
                                idx === 1 
                                  ? "bg-terracotta text-white" 
                                  : "bg-white dark:bg-gray-600 text-warm-gray/70 dark:text-soft-cream/60"
                              }`}
                            >
                              {opt}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Swipe hint */}
                    <p className="text-center text-xs text-warm-gray/40 dark:text-soft-cream/30 mt-4">
                      Swipe left or right to navigate
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-deep-cream dark:via-deep-cream/95 pb-8">
        <div className="max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleStartQuiz}
            className="w-full py-5 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 trail-button text-white"
            data-testid="button-start-quiz"
          >
            <Zap className="w-5 h-5" />
            I'm Ready
          </motion.button>
        </div>
      </div>
    </div>
  );
}
