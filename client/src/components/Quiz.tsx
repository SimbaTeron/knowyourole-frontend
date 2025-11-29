import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Timer, Pause, Play, ChevronLeft, ChevronRight, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import questionsData from "@/data/questions.json";

interface Question {
  id: number;
  prompt: string;
  leftDesc: string;
  rightDesc: string;
  options: [string, string];
  optionMeta: [string, string];
  psych: string;
  time: number;
  tier: string;
  version: string;
  paid: boolean;
  wildcard: boolean;
}

interface QuizProps {
  tier: string;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  onComplete: (scores: QuizScores) => void;
  onExit: () => void;
}

export interface QuizScores {
  mbti: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  disc: {
    D: number; I: number; S: number; C: number;
  };
  bigFive: {
    O: number; C: number; E: number; A: number; N: number;
  };
  responses: Array<{
    questionId: number;
    choice: 0 | 1;
    timeSpent: number;
    swipeDirection: "left" | "right";
  }>;
  engagement: number;
  wildcardBoost: boolean;
  criticalWildcard: number;
  firstPrinciplesWildcard: number;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;

const TIMEOUT_QUIPS = [
  { quip: "Time flies when you're pondering!" },
  { quip: "The universe chose for you this time" },
  { quip: "Sometimes the best choice is a surprise" },
  { quip: "Going with the cosmic flow on this one" },
  { quip: "Your future self just picked for you" },
  { quip: "Let fate decide this fork in the road" },
  { quip: "Even quick-thinkers need a breather" },
  { quip: "The timer won, but you're still winning" },
];

const READABLE_RANDOM_COLORS = [
  { accent: "bg-orange-500", text: "text-white" },
  { accent: "bg-cyan-600", text: "text-white" },
  { accent: "bg-emerald-600", text: "text-white" },
  { accent: "bg-pink-500", text: "text-white" },
  { accent: "bg-amber-500", text: "text-black" },
  { accent: "bg-violet-600", text: "text-white" },
  { accent: "bg-rose-500", text: "text-white" },
  { accent: "bg-teal-600", text: "text-white" },
];

export default function Quiz({ tier, mood, funMode, landmark, theme, onComplete, onExit }: QuizProps) {
  const tierConfig = questionsData.tierConfig[tier as keyof typeof questionsData.tierConfig] || questionsData.tierConfig["19-25"];
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<QuizScores>({
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    responses: [],
    engagement: 0,
    wildcardBoost: false,
    criticalWildcard: 0,
    firstPrinciplesWildcard: 0
  });
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [fastResponses, setFastResponses] = useState(0);
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [showQuip, setShowQuip] = useState(false);
  const [currentQuip, setCurrentQuip] = useState(TIMEOUT_QUIPS[0]);
  const [missCount, setMissCount] = useState(0);
  const [vibrantColorIndex, setVibrantColorIndex] = useState(0);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const leftOpacity = useTransform(x, [-300, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 300], [0, 0.5, 1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRandomTheme = theme === "random";

  useEffect(() => {
    const tierQuestions = questionsData.questions.filter(q => q.tier === tier);
    const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(tierConfig.baseCount, shuffled.length));
    
    if (selected.length < tierConfig.baseCount) {
      const otherQuestions = questionsData.questions
        .filter(q => q.tier !== tier && q.tier !== "all" && !q.paid)
        .sort(() => Math.random() - 0.5)
        .slice(0, tierConfig.baseCount - selected.length);
      selected.push(...otherQuestions);
    }
    
    const scaleWildcards = questionsData.questions.filter(
      q => q.tier === "all" && (q.psych === "Critical" || q.psych === "FirstPrinciples")
    );
    selected.push(...scaleWildcards);
    
    setQuestions(selected.sort(() => Math.random() - 0.5) as Question[]);
  }, [tier, tierConfig.baseCount]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setTimeRemaining(tierConfig.maxTime);
      setQuestionStartTime(Date.now());
      setVibrantColorIndex(Math.floor(Math.random() * READABLE_RANDOM_COLORS.length));
      setIsTimingOut(false);
      setShowQuip(false);
    }
  }, [currentIndex, questions, tierConfig.maxTime]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0 || questions.length === 0 || isTimingOut) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex, questions.length, isTimingOut]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTimeout = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    
    const quipIndex = missCount % TIMEOUT_QUIPS.length;
    setCurrentQuip(TIMEOUT_QUIPS[quipIndex]);
    setMissCount(prev => prev + 1);
    setIsTimingOut(true);
    setShowQuip(true);
    
    timeoutRef.current = setTimeout(() => {
      setShowQuip(false);
      
      setTimeout(() => {
        handleSwipe(Math.random() > 0.5 ? "right" : "left", true);
        setIsTimingOut(false);
      }, 300);
    }, 2000);
  }, [missCount]);

  const processScore = useCallback((question: Question, choiceIndex: 0 | 1) => {
    const meta = question.optionMeta[choiceIndex];
    const weight = question.wildcard ? 0.8 : 1;
    
    setScores(prev => {
      const newScores = { ...prev };
      
      if (question.psych.startsWith("MBTI")) {
        const trait = meta.replace("+", "").replace("-", "") as keyof typeof newScores.mbti;
        if (trait in newScores.mbti) {
          newScores.mbti = { ...newScores.mbti, [trait]: newScores.mbti[trait] + weight };
        }
      } else if (question.psych.startsWith("DISC")) {
        const trait = meta as keyof typeof newScores.disc;
        if (trait in newScores.disc) {
          newScores.disc = { ...newScores.disc, [trait]: newScores.disc[trait] + weight };
        }
      } else if (question.psych.startsWith("Big5")) {
        const trait = meta.replace("+", "").replace("-", "") as keyof typeof newScores.bigFive;
        if (trait in newScores.bigFive) {
          const modifier = meta.includes("+") ? 1 : -1;
          newScores.bigFive = { ...newScores.bigFive, [trait]: newScores.bigFive[trait] + (weight * modifier) };
        }
      } else if (question.psych === "Critical") {
        if (meta === "CT1") {
          newScores.criticalWildcard = 1;
        }
      } else if (question.psych === "FirstPrinciples") {
        if (meta === "FP1") {
          newScores.firstPrinciplesWildcard = 1;
        }
      }
      
      if (question.wildcard) {
        newScores.wildcardBoost = true;
      }
      
      return newScores;
    });
  }, []);

  const handleSwipe = useCallback((direction: "left" | "right", isTimeout = false) => {
    if (questions.length === 0 || currentIndex >= questions.length) return;
    
    const question = questions[currentIndex];
    const choiceIndex: 0 | 1 = direction === "left" ? 0 : 1;
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    if (!isTimeout && navigator.vibrate) navigator.vibrate(50);
    
    if (timeSpent < tierConfig.maxTime * 0.5) {
      setFastResponses(prev => prev + 1);
    }
    
    processScore(question, choiceIndex);
    
    const newResponse = {
      questionId: question.id,
      choice: choiceIndex,
      timeSpent,
      swipeDirection: direction
    };
    
    setScores(prev => {
      const updatedScores = {
        ...prev,
        responses: [...prev.responses, newResponse],
        engagement: prev.engagement + (isTimeout ? -0.5 : 1)
      };
      
      if (currentIndex >= questions.length - 1) {
        setTimeout(() => onComplete(updatedScores), 300);
      }
      
      return updatedScores;
    });
    
    x.set(0);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions, questionStartTime, processScore, onComplete, x]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isTimingOut) return;
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      handleSwipe(info.offset.x > 0 ? "right" : "left");
    } else {
      x.set(0);
    }
  }, [handleSwipe, x, isTimingOut]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showPauseMenu || isTimingOut) return;
    
    if (e.key === "ArrowLeft" || e.key === "a") {
      handleSwipe("left");
    } else if (e.key === "ArrowRight" || e.key === "d") {
      handleSwipe("right");
    } else if (e.key === " " || e.key === "Escape") {
      setIsPaused(true);
      setShowPauseMenu(true);
    }
  }, [handleSwipe, showPauseMenu, isTimingOut]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const togglePause = () => {
    if (showPauseMenu) {
      setShowPauseMenu(false);
      setIsPaused(false);
    } else {
      setIsPaused(true);
      setShowPauseMenu(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  
  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timerProgress = (timeRemaining / tierConfig.maxTime) * 100;
  
  const randomColor = READABLE_RANDOM_COLORS[vibrantColorIndex];
  const promptColor = isRandomTheme 
    ? `${randomColor.accent} ${randomColor.text} px-3 py-1 rounded-lg inline-block` 
    : "text-sage-green";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePause}
            data-testid="button-pause"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-warm-gray dark:text-soft-cream">
              {currentIndex + 1}/{questions.length}
            </span>
            {fastResponses >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta"
              >
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">Fast!</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <Timer className={`w-4 h-4 ${timerProgress < 30 ? "text-red-500" : "text-terracotta"}`} />
            <span className={`text-sm font-mono font-medium ${timerProgress < 30 ? "text-red-500" : "text-warm-gray dark:text-soft-cream"}`}>
              {timeRemaining.toFixed(1)}s
            </span>
          </div>
        </div>
        
        <div className="max-w-md mx-auto mt-2">
          <Progress value={progress} className="h-1.5" data-testid="progress-quiz" />
        </div>
        
        <div className="max-w-md mx-auto mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timerProgress < 30 ? "bg-red-500" : "bg-terracotta"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timerProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-24">
        <div className="relative w-full max-w-sm h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              className="absolute inset-0"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: isTimingOut ? 0.85 : 1, 
                opacity: isTimingOut ? 0 : 1,
                filter: isTimingOut ? "blur(4px)" : "blur(0px)"
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                type: isTimingOut ? "tween" : "spring",
                duration: isTimingOut ? 2 : undefined,
                ease: isTimingOut ? "easeOut" : undefined,
                stiffness: isTimingOut ? undefined : 300, 
                damping: isTimingOut ? undefined : 25 
              }}
            >
              <motion.div
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ x, rotate }}
                drag={isTimingOut ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
              >
                <div 
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl"
                  role="article"
                  aria-label={`Swipe left for ${currentQuestion.options[0]}, right for ${currentQuestion.options[1]}`}
                >
                  <div className="absolute inset-0 bg-white dark:bg-gray-800" />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-sage-green/30 to-transparent rounded-3xl"
                    style={{ opacity: leftOpacity }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-terracotta/30 to-transparent rounded-3xl"
                    style={{ opacity: rightOpacity }}
                  />
                  
                  <div className="relative z-10 flex flex-col h-full p-5">
                    <div className="text-center mb-4">
                      {currentQuestion.wildcard && (
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="mb-2 px-3 py-1 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium inline-block"
                        >
                          Wildcard
                        </motion.div>
                      )}
                      
                      <h2 
                        className={`text-base font-semibold ${promptColor}`}
                        data-testid="text-prompt"
                      >
                        {currentQuestion.prompt}
                      </h2>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03, x: -8 }}
                        whileTap={{ scale: 0.98, x: -20 }}
                        onClick={() => !isTimingOut && handleSwipe("left")}
                        disabled={isTimingOut}
                        className="min-h-20 flex items-center text-center rounded-2xl bg-sage-green/10 dark:bg-sage-green/20 border-2 border-sage-green/30 hover:border-sage-green/60 transition-all p-4 disabled:opacity-50 -ml-2 mr-4"
                        data-testid="card-option-left"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <ChevronLeft className="w-6 h-6 text-sage-green flex-shrink-0" />
                          <p className="text-sm font-bold text-sage-green dark:text-sage-green leading-snug text-left flex-1">
                            {currentQuestion.leftDesc}
                          </p>
                        </div>
                      </motion.button>
                      
                      <div className="flex items-center justify-center">
                        <span className="text-warm-gray/40 dark:text-soft-cream/30 text-xs font-medium tracking-wider">SWIPE or TAP</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.03, x: 8 }}
                        whileTap={{ scale: 0.98, x: 20 }}
                        onClick={() => !isTimingOut && handleSwipe("right")}
                        disabled={isTimingOut}
                        className="min-h-20 flex items-center text-center rounded-2xl bg-terracotta/10 dark:bg-terracotta/20 border-2 border-terracotta/30 hover:border-terracotta/60 transition-all p-4 disabled:opacity-50 ml-4 -mr-2"
                        data-testid="card-option-right"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <p className="text-sm font-bold text-terracotta dark:text-terracotta leading-snug text-left flex-1">
                            {currentQuestion.rightDesc}
                          </p>
                          <ChevronRight className="w-6 h-6 text-terracotta flex-shrink-0" />
                        </div>
                      </motion.button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 text-xs text-warm-gray/50 dark:text-soft-cream/40">
                      <span>Swipe left</span>
                      <span>Swipe right</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {showQuip && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 z-30 flex items-center justify-center"
                data-testid="quip-overlay"
              >
                <div className="bg-warm-gray dark:bg-soft-cream rounded-3xl px-8 py-6 shadow-2xl max-w-xs text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/20 mb-4"
                  >
                    <RotateCcw className="w-6 h-6 text-terracotta" />
                  </motion.div>
                  
                  <p className="text-lg font-display font-semibold text-soft-cream dark:text-warm-gray mb-2">
                    {currentQuip.quip}
                  </p>
                  
                  <p className="text-sm text-soft-cream/60 dark:text-warm-gray/60">
                    Moving to the next path...
                  </p>
                  
                  {missCount > 1 && (
                    <p className="text-xs text-terracotta/70 mt-3">
                      {missCount} cosmic assists so far
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-white dark:bg-gray-900">
        <div className="max-w-sm mx-auto flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("left")}
            disabled={isTimingOut}
            className="flex-1 max-w-[140px] min-h-12 text-base font-bold border-2 border-sage-green text-sage-green hover:bg-sage-green/10 hover:scale-105 transition-all disabled:opacity-50"
            data-testid="button-swipe-left"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {currentQuestion.options[0]}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("right")}
            disabled={isTimingOut}
            className="flex-1 max-w-[140px] min-h-12 text-base font-bold border-2 border-terracotta text-terracotta hover:bg-terracotta/10 hover:scale-105 transition-all disabled:opacity-50"
            data-testid="button-swipe-right"
          >
            {currentQuestion.options[1]}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        
        <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-2">
          Tap card or buttons to choose
        </p>
      </footer>

      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => togglePause()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-soft-cream dark:bg-warm-charcoal rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-warm-gray dark:text-soft-cream text-center mb-4">
                Paused
              </h3>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-terracotta hover:bg-terracotta/90"
                  onClick={() => togglePause()}
                  data-testid="button-resume"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onExit}
                  data-testid="button-exit-quiz"
                >
                  Exit Quiz
                </Button>
              </div>
              
              <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-4">
                Progress: {currentIndex + 1}/{questions.length} questions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
