import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Timer, Pause, Play, ChevronLeft, ChevronRight, Zap, RotateCcw, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import questionsData from "@/data/questions.json";

interface Question {
  id: number;
  prompt: string;
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
}

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;

const RANDOM_VIBRANT_COLORS = [
  "text-orange-500",
  "text-cyan-400", 
  "text-emerald-400",
  "text-pink-400",
  "text-amber-400",
  "text-violet-400",
  "text-rose-400",
];

function parsePrompt(prompt: string): { topic: string; question: string } {
  const colonIndex = prompt.indexOf(":");
  if (colonIndex > 0 && colonIndex < 30) {
    return {
      topic: prompt.slice(0, colonIndex + 1),
      question: prompt.slice(colonIndex + 1).trim()
    };
  }
  const words = prompt.split(" ");
  if (words.length > 3) {
    return {
      topic: words.slice(0, 2).join(" ") + ":",
      question: words.slice(2).join(" ")
    };
  }
  return { topic: "", question: prompt };
}

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
    wildcardBoost: false
  });
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [fastResponses, setFastResponses] = useState(0);
  const [showTimeoutFade, setShowTimeoutFade] = useState(false);
  const [showMissedModal, setShowMissedModal] = useState(false);
  const [missCount, setMissCount] = useState(0);
  const [vibrantColorIndex, setVibrantColorIndex] = useState(0);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const leftOpacity = useTransform(x, [-300, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 300], [0, 0.5, 1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isRandomTheme = theme === "random";

  useEffect(() => {
    const tierQuestions = questionsData.questions.filter(q => q.tier === tier);
    const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(tierConfig.baseCount, shuffled.length));
    
    if (selected.length < tierConfig.baseCount) {
      const otherQuestions = questionsData.questions
        .filter(q => q.tier !== tier && !q.paid)
        .sort(() => Math.random() - 0.5)
        .slice(0, tierConfig.baseCount - selected.length);
      selected.push(...otherQuestions);
    }
    
    setQuestions(selected.sort(() => Math.random() - 0.5) as Question[]);
  }, [tier, tierConfig.baseCount]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setTimeRemaining(questions[currentIndex].time);
      setQuestionStartTime(Date.now());
      setVibrantColorIndex(Math.floor(Math.random() * RANDOM_VIBRANT_COLORS.length));
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0 || questions.length === 0 || showTimeoutFade || showMissedModal) return;
    
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
  }, [isPaused, currentIndex, questions.length, showTimeoutFade, showMissedModal]);

  const handleTimeout = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    setShowTimeoutFade(true);
    setMissCount(prev => prev + 1);
    
    setTimeout(() => {
      setShowTimeoutFade(false);
      setShowMissedModal(true);
    }, 1000);
  }, []);

  const handleRetryQuestion = () => {
    setShowMissedModal(false);
    if (questions.length > 0 && currentIndex < questions.length) {
      setTimeRemaining(questions[currentIndex].time);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSkipQuestion = () => {
    setShowMissedModal(false);
    handleSwipe(Math.random() > 0.5 ? "right" : "left", true);
  };

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
    
    if (timeSpent < question.time * 0.5) {
      setFastResponses(prev => prev + 1);
    }
    
    processScore(question, choiceIndex);
    
    setScores(prev => ({
      ...prev,
      responses: [...prev.responses, {
        questionId: question.id,
        choice: choiceIndex,
        timeSpent,
        swipeDirection: direction
      }],
      engagement: prev.engagement + (isTimeout ? -0.5 : 1)
    }));
    
    x.set(0);
    
    if (currentIndex >= questions.length - 1) {
      setTimeout(() => onComplete(scores), 300);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions, questionStartTime, processScore, scores, onComplete, x]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      handleSwipe(info.offset.x > 0 ? "right" : "left");
    } else {
      x.set(0);
    }
  }, [handleSwipe, x]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showPauseMenu || showMissedModal) return;
    
    if (e.key === "ArrowLeft" || e.key === "a") {
      handleSwipe("left");
    } else if (e.key === "ArrowRight" || e.key === "d") {
      handleSwipe("right");
    } else if (e.key === " " || e.key === "Escape") {
      setIsPaused(true);
      setShowPauseMenu(true);
    }
  }, [handleSwipe, showPauseMenu, showMissedModal]);

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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timerProgress = (timeRemaining / currentQuestion.time) * 100;
  const { topic, question: questionText } = parsePrompt(currentQuestion.prompt);
  const vibrantColor = isRandomTheme ? RANDOM_VIBRANT_COLORS[vibrantColorIndex] : "text-sage-green";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-soft-cream/80 dark:bg-warm-charcoal/80 backdrop-blur-md">
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
            <Timer className="w-4 h-4 text-terracotta" />
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

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-32">
        <div className="relative w-full max-w-sm h-[420px]">
          <AnimatePresence mode="wait">
            {showTimeoutFade && (
              <motion.div
                key="timeout-fade"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 z-20"
              >
                <div className="absolute inset-0 bg-red-500/10 rounded-3xl animate-pulse" />
              </motion.div>
            )}
            
            <motion.div
              key={currentQuestion.id}
              className="absolute inset-0"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: showTimeoutFade ? 0.9 : 1, 
                opacity: showTimeoutFade ? 0 : 1 
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
              >
                <div 
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl"
                  role="article"
                  aria-label={`Swipe left for ${currentQuestion.options[0]}, right for ${currentQuestion.options[1]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-cream via-white to-pale-sage dark:from-warm-charcoal dark:via-gray-800 dark:to-gray-900" />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-sage-green/30 to-transparent rounded-3xl"
                    style={{ opacity: leftOpacity }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-terracotta/30 to-transparent rounded-3xl"
                    style={{ opacity: rightOpacity }}
                  />
                  
                  <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 pt-8 pb-6">
                    <div className="text-center flex-1 flex flex-col justify-center">
                      {currentQuestion.wildcard && (
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="mb-3 px-3 py-1 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium inline-block mx-auto"
                        >
                          Wildcard
                        </motion.div>
                      )}
                      
                      {topic && (
                        <h2 
                          className={`text-base font-semibold mb-3 ${vibrantColor}`}
                          data-testid="text-topic"
                        >
                          {topic}
                        </h2>
                      )}
                      
                      <p 
                        className="text-xl md:text-2xl font-display text-warm-gray dark:text-soft-cream leading-relaxed opacity-90"
                        data-testid="text-question"
                      >
                        {questionText}
                      </p>
                    </div>
                    
                    <div className="w-full flex items-stretch justify-between gap-4 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSwipe("left")}
                        className="flex-1 min-h-16 flex flex-col items-center justify-center gap-2 rounded-2xl bg-sage-green/10 border-2 border-sage-green/20 hover:border-sage-green/50 transition-colors p-3"
                        data-testid="card-option-left"
                      >
                        <ChevronLeft className="w-6 h-6 text-sage-green" />
                        <span className="text-xl font-bold text-sage-green text-center leading-tight">
                          {currentQuestion.options[0]}
                        </span>
                      </motion.button>
                      
                      <div className="flex items-center text-warm-gray/30 dark:text-soft-cream/30 text-sm font-medium">
                        or
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSwipe("right")}
                        className="flex-1 min-h-16 flex flex-col items-center justify-center gap-2 rounded-2xl bg-terracotta/10 border-2 border-terracotta/20 hover:border-terracotta/50 transition-colors p-3"
                        data-testid="card-option-right"
                      >
                        <ChevronRight className="w-6 h-6 text-terracotta" />
                        <span className="text-xl font-bold text-terracotta text-center leading-tight">
                          {currentQuestion.options[1]}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-6 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-warm-charcoal dark:via-warm-charcoal/95">
        <div className="max-w-sm mx-auto flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("left")}
            className="flex-1 max-w-[160px] min-h-14 text-lg font-bold border-2 border-sage-green text-sage-green hover:bg-sage-green/10 hover:scale-105 transition-all"
            data-testid="button-swipe-left"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {currentQuestion.options[0]}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("right")}
            className="flex-1 max-w-[160px] min-h-14 text-lg font-bold border-2 border-terracotta text-terracotta hover:bg-terracotta/10 hover:scale-105 transition-all"
            data-testid="button-swipe-right"
          >
            {currentQuestion.options[1]}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        
        <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-3">
          Swipe card or tap to choose
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

      <AnimatePresence>
        {showMissedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-soft-cream to-white dark:from-warm-charcoal dark:to-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-red-200 dark:border-red-900/30"
              data-testid="modal-missed"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4"
                >
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </motion.div>
                
                <h3 className="text-2xl font-display font-bold text-warm-gray dark:text-soft-cream mb-2">
                  Missed fork!
                </h3>
                <p className="text-warm-gray/70 dark:text-soft-cream/70">
                  Time ran out on this path. What would you like to do?
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-sage-green hover:bg-sage-green/90 min-h-12 text-lg font-semibold"
                  onClick={handleRetryQuestion}
                  data-testid="button-retry"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retry this fork
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full min-h-12 text-lg font-semibold border-2"
                  onClick={handleSkipQuestion}
                  data-testid="button-skip"
                >
                  Skip ahead
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {missCount > 1 && (
                <p className="text-center text-xs text-red-500/70 mt-4">
                  {missCount} forks missed this session
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
