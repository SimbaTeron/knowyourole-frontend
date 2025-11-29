import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Timer, Pause, Play, ChevronLeft, ChevronRight, Zap } from "lucide-react";
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
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const leftOpacity = useTransform(x, [-300, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 300], [0, 0.5, 1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0 || questions.length === 0) return;
    
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
  }, [isPaused, currentIndex, questions.length]);

  const handleTimeout = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    handleSwipe(Math.random() > 0.5 ? "right" : "left", true);
  }, [currentIndex, questions]);

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
    if (showPauseMenu) return;
    
    if (e.key === "ArrowLeft" || e.key === "a") {
      handleSwipe("left");
    } else if (e.key === "ArrowRight" || e.key === "d") {
      handleSwipe("right");
    } else if (e.key === " " || e.key === "Escape") {
      setIsPaused(true);
      setShowPauseMenu(true);
    }
  }, [handleSwipe, showPauseMenu]);

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
        <div className="relative w-full max-w-sm h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              className="absolute inset-0"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
                  
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                    {currentQuestion.wildcard && (
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-4 px-3 py-1 rounded-full bg-dusty-blue/10 text-dusty-blue text-xs font-medium"
                      >
                        Wildcard
                      </motion.div>
                    )}
                    
                    <h2 
                      className="text-2xl md:text-3xl font-display font-semibold text-warm-gray dark:text-soft-cream leading-tight mb-8"
                      data-testid="text-question"
                    >
                      {currentQuestion.prompt}
                    </h2>
                    
                    <div className="w-full flex items-center justify-between px-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-sage-green/10 flex items-center justify-center">
                          <ChevronLeft className="w-6 h-6 text-sage-green" />
                        </div>
                        <span className="text-sm font-medium text-sage-green max-w-[100px] text-center">
                          {currentQuestion.options[0]}
                        </span>
                      </motion.div>
                      
                      <div className="text-warm-gray/30 dark:text-soft-cream/30 text-sm">or</div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                          <ChevronRight className="w-6 h-6 text-terracotta" />
                        </div>
                        <span className="text-sm font-medium text-terracotta max-w-[100px] text-center">
                          {currentQuestion.options[1]}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-6 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-warm-charcoal dark:via-warm-charcoal/95">
        <div className="max-w-sm mx-auto flex justify-center gap-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("left")}
            className="flex-1 max-w-[140px] border-sage-green text-sage-green hover:bg-sage-green/10"
            data-testid="button-swipe-left"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {currentQuestion.options[0]}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSwipe("right")}
            className="flex-1 max-w-[140px] border-terracotta text-terracotta hover:bg-terracotta/10"
            data-testid="button-swipe-right"
          >
            {currentQuestion.options[1]}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        
        <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-3">
          Swipe or tap to choose
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
