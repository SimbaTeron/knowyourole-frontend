import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Timer, Pause, Play, Zap, RotateCcw, MapPin, Sparkles, Lightbulb, Users, Book, Wrench, Brain, MessageCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import questionsData from "@/data/questions.json";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";
import { 
  SuperpowerGame, 
  MysteryBoxGame, 
  TimedCountdown, 
  SpinningWheel,
  StackedCards,
  type SuperpowerChoice, 
  type MysteryBoxChoice,
  type AgeTier,
  type MultiChoiceOption as GameMultiChoiceOption
} from "./QuizGames";

type IconKey = "creative" | "analytical" | "people" | "learning" | "hands" | "mind" | "discuss" | "research";

interface LocalMultiChoiceOption {
  id: string;
  label: string;
  icon: IconKey;
  weights: {
    mbti?: Partial<Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>>;
    disc?: Partial<Record<"D" | "I" | "S" | "C", number>>;
    bigFive?: Partial<Record<"O" | "C" | "E" | "A" | "N", number>>;
  };
}

interface MultiChoiceQuestion {
  id: string;
  prompt: string;
  subtitle: string;
  options: LocalMultiChoiceOption[];
}

const MID1_QUESTION: MultiChoiceQuestion = {
  id: "mid1",
  prompt: "What energizes you most right now?",
  subtitle: "Quick break! Pick the one that feels most like you",
  options: [
    {
      id: "creative",
      label: "Creating something new",
      icon: "creative",
      weights: { mbti: { N: 2, P: 1 }, disc: { I: 1 }, bigFive: { O: 3 } }
    },
    {
      id: "analytical",
      label: "Solving practical problems",
      icon: "analytical",
      weights: { mbti: { T: 2, S: 1 }, disc: { D: 1, C: 1 }, bigFive: { C: 2 } }
    },
    {
      id: "people",
      label: "Connecting with people",
      icon: "people",
      weights: { mbti: { E: 2, F: 1 }, disc: { I: 2 }, bigFive: { E: 3, A: 1 } }
    },
    {
      id: "learning",
      label: "Understanding how things work",
      icon: "learning",
      weights: { mbti: { I: 1, N: 1, T: 1 }, disc: { C: 2 }, bigFive: { O: 2, C: 1 } }
    }
  ]
};

const MID2_QUESTION: MultiChoiceQuestion = {
  id: "mid2",
  prompt: "When tackling a challenge, you naturally...",
  subtitle: "Almost there! One more insight",
  options: [
    {
      id: "hands",
      label: "Jump in and figure it out hands-on",
      icon: "hands",
      weights: { mbti: { E: 1, S: 2, P: 1 }, disc: { D: 2 }, bigFive: { E: 1 } }
    },
    {
      id: "mind",
      label: "Plan it out mentally first",
      icon: "mind",
      weights: { mbti: { I: 1, N: 1, J: 2 }, disc: { C: 2 }, bigFive: { C: 2 } }
    },
    {
      id: "discuss",
      label: "Talk it through with others",
      icon: "discuss",
      weights: { mbti: { E: 2, F: 1 }, disc: { I: 2, S: 1 }, bigFive: { E: 2, A: 1 } }
    },
    {
      id: "research",
      label: "Research until you feel ready",
      icon: "research",
      weights: { mbti: { I: 2, N: 1, J: 1 }, disc: { C: 2, S: 1 }, bigFive: { C: 2, O: 1 } }
    }
  ]
};

const MULTI_CHOICE_ICONS: Record<IconKey, typeof Sparkles> = {
  creative: Sparkles,
  analytical: Wrench,
  people: Users,
  learning: Book,
  hands: Wrench,
  mind: Brain,
  discuss: MessageCircle,
  research: Search
};

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
  responseType?: "binary" | "slider"; // Phase 1.1: slider support
  difficulty?: "easy" | "medium" | "hard"; // Phase 2.1: dynamic difficulty
  boostRange?: [number, number]; // Phase 1.4: variable boost range
}

type TierValue = "7-12" | "13-18" | "19-25" | "25plus";

interface QuizProps {
  tier: TierValue;
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
    sliderValue?: number; // Phase 1.1: -2 to +2 for slider questions
    responseType?: "binary" | "slider";
  }>;
  swipeTimes: number[]; // Phase 2.1: Track all swipe times for dynamic difficulty
  averageSwipeTime: number; // Phase 2.1: Running average for difficulty scaling
  currentDifficulty: "easy" | "medium" | "hard"; // Phase 2.1: Current difficulty level
  engagement: number;
  wildcardBoost: boolean;
  criticalWildcard: number;
  firstPrinciplesWildcard: number;
  hybridTypes: string[]; // Phase 1.4: Detected hybrid types like "Ambivert"
}

const SWIPE_THRESHOLD = 100;
const ROTATION_RANGE = 15;

const TIMEOUT_QUIPS = [
  { quip: "Take a breath! No rush here" },
  { quip: "Deep thoughts take time" },
  { quip: "Pause, reset, try again!" },
  { quip: "Your pace is perfect" },
  { quip: "Take a moment, then decide" },
  { quip: "No pressure - you've got this" },
  { quip: "Let that one simmer" },
  { quip: "Some questions need extra thought" },
  { quip: "Thinking is a superpower" },
  { quip: "Take your time, champ" },
  { quip: "Good things take time" },
  { quip: "Breathe and try again" },
  { quip: "Your brain needed a break" },
  { quip: "Slow and steady wins" },
  { quip: "Reset and refocus" },
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

// Phase 2.3: Random event definitions with 5-10% trigger chance
interface RandomEvent {
  id: string;
  title: string;
  description: string;
  effect: "bonus_time" | "double_points" | "skip_allowed" | "hint_reveal" | "mood_boost";
  duration: number;
  icon: string;
}

const RANDOM_EVENTS: RandomEvent[] = [
  { id: "time_warp", title: "Time Warp!", description: "+3 seconds on next question", effect: "bonus_time", duration: 3000, icon: "clock" },
  { id: "insight_flash", title: "Insight Flash!", description: "Your next answer counts double", effect: "double_points", duration: 2500, icon: "sparkles" },
  { id: "compass_spin", title: "Compass Spin!", description: "Skip one question if needed", effect: "skip_allowed", duration: 3000, icon: "compass" },
  { id: "inner_voice", title: "Inner Voice!", description: "Trust your first instinct", effect: "hint_reveal", duration: 2500, icon: "brain" },
  { id: "energy_surge", title: "Energy Surge!", description: "Feeling extra decisive!", effect: "mood_boost", duration: 2000, icon: "zap" },
];

const RANDOM_EVENT_CHANCE = 0.07; // 7% chance per question

type QuizPhase = "quiz" | "superpower" | "superpower-countdown" | "mid1" | "mid1-countdown" | "mid2" | "mid2-countdown" | "mystery" | "mystery-countdown" | "random-event";

const getQuizConfig = (tier: string) => {
  switch (tier) {
    case "7-12":
      // Mini 16: 5 binary → MC1 → 4 binary → Superpower → 4 binary → Mystery → 3 binary → MC2
      return { 
        totalQuestions: 16, 
        mid1After: 5, 
        superpowerAfter: 9,
        mysteryAfter: 13,
        mid2After: 16,
        hasMid2: true, 
        hasMystery: true 
      };
    case "13-18":
      // Teen 22: 7 binary → MC1 → 6 binary → Superpower → 5 binary → Mystery → 4 binary → MC2
      return { 
        totalQuestions: 22, 
        mid1After: 7, 
        superpowerAfter: 13,
        mysteryAfter: 18,
        mid2After: 22,
        hasMid2: true, 
        hasMystery: true 
      };
    case "19-25":
      // Young Adult 28: 8 binary → MC1 → 7 binary → Superpower → 7 binary → Mystery → 6 binary → MC2
      return { 
        totalQuestions: 28, 
        mid1After: 8, 
        superpowerAfter: 15,
        mysteryAfter: 22,
        mid2After: 28,
        hasMid2: true, 
        hasMystery: true 
      };
    case "25+":
    case "25plus":
    default:
      // Adult 34: 9 binary → MC1 → 9 binary → Superpower → 9 binary → Mystery → 7 binary → MC2
      return { 
        totalQuestions: 34, 
        mid1After: 9, 
        superpowerAfter: 18,
        mysteryAfter: 27,
        mid2After: 34,
        hasMid2: true, 
        hasMystery: true 
      };
  }
};

export default function Quiz({ tier, mood, funMode, landmark, theme, onComplete, onExit }: QuizProps) {
  const tierConfig = questionsData.tierConfig[tier as keyof typeof questionsData.tierConfig] || questionsData.tierConfig["19-25"];
  const quizConfig = getQuizConfig(tier);
  const { teamName, isLocalitySet } = useLocalityTheme();
  
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("quiz");
  const [mid1Choice, setMid1Choice] = useState<string | null>(null);
  const [mid2Choice, setMid2Choice] = useState<string | null>(null);
  const [completedMid1, setCompletedMid1] = useState(false);
  const [completedMid2, setCompletedMid2] = useState(false);
  const [completedSuperpower, setCompletedSuperpower] = useState(false);
  const [completedMystery, setCompletedMystery] = useState(false);
  
  // Phase 2.3: Random event state
  const [currentRandomEvent, setCurrentRandomEvent] = useState<RandomEvent | null>(null);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [canSkip, setCanSkip] = useState(false);
  
  // Phase 1.1: Slider state for slider-type questions
  const [sliderValue, setSliderValue] = useState(0);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<QuizScores>({
    mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    disc: { D: 0, I: 0, S: 0, C: 0 },
    bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
    responses: [],
    swipeTimes: [], // Phase 2.1: Track swipe times
    averageSwipeTime: 0,
    currentDifficulty: "medium",
    engagement: 0,
    wildcardBoost: false,
    criticalWildcard: 0,
    firstPrinciplesWildcard: 0,
    hybridTypes: [] // Phase 1.4: Hybrid type detection
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
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const leftOpacity = useTransform(x, [-300, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 300], [0, 0.5, 1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useLocalityColors = isLocalitySet;

  // Phase 1.2: Framework quotas for balanced trait coverage
  const FRAMEWORK_QUOTAS = {
    MBTI: 0.3,
    DISC: 0.25,
    Big5: 0.35,
    Critical: 0.05,
    FirstPrinciples: 0.05
  };

  useEffect(() => {
    const tierQuestions = questionsData.questions.filter(q => q.tier === tier);
    const targetCount = tierConfig.baseCount;
    
    // Phase 1.2: Quota-based selection
    const quotaSelection: Question[] = [];
    const frameworkCounts: Record<string, number> = {};
    
    // Shuffle first
    const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);
    
    // Select questions while respecting quotas
    for (const q of shuffled) {
      const framework = q.psych.split("-")[0]; // Extract MBTI, DISC, Big5
      const currentQuota = (frameworkCounts[framework] || 0) / targetCount;
      const targetQuota = FRAMEWORK_QUOTAS[framework as keyof typeof FRAMEWORK_QUOTAS] || 0.2;
      
      if (currentQuota < targetQuota || quotaSelection.length < targetCount * 0.7) {
        quotaSelection.push(q as Question);
        frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
      }
      
      if (quotaSelection.length >= targetCount) break;
    }
    
    // Fill remaining with any available questions
    if (quotaSelection.length < targetCount) {
      const remaining = shuffled
        .filter(q => !quotaSelection.includes(q as Question))
        .slice(0, targetCount - quotaSelection.length);
      quotaSelection.push(...(remaining as Question[]));
    }
    
    // Add scale wildcards
    const scaleWildcards = questionsData.questions.filter(
      q => q.tier === "all" && (q.psych === "Critical" || q.psych === "FirstPrinciples")
    );
    quotaSelection.push(...(scaleWildcards as Question[]));
    
    // Final shuffle
    setQuestions(quotaSelection.sort(() => Math.random() - 0.5));
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
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTimeout = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    
    const randomQuipIndex = Math.floor(Math.random() * TIMEOUT_QUIPS.length);
    setCurrentQuip(TIMEOUT_QUIPS[randomQuipIndex]);
    setMissCount(prev => prev + 1);
    setIsTimingOut(true);
    setShowQuip(true);
    
    timeoutRef.current = setTimeout(() => {
      setShowQuip(false);
      setTimeRemaining(tierConfig.maxTime);
      setQuestionStartTime(Date.now());
      setIsTimingOut(false);
    }, 2000);
  }, [missCount, tierConfig.maxTime]);

  useEffect(() => {
    if (isPaused || questions.length === 0 || isTimingOut) return;
    
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
  }, [isPaused, currentIndex, questions.length, isTimingOut, handleTimeout]);

  // Phase 1.1 & 1.4: Enhanced scoring with slider support and variable boosts
  const processScore = useCallback((question: Question, choiceIndex: 0 | 1, sliderValue?: number) => {
    const meta = question.optionMeta[choiceIndex];
    
    // Phase 1.4: Variable boost range (10-30%) instead of fixed 80%
    const boostRange = question.boostRange || [0.7, 0.9];
    const variableBoost = boostRange[0] + Math.random() * (boostRange[1] - boostRange[0]);
    const baseWeight = question.wildcard ? variableBoost : 1;
    
    // Phase 1.1: Apply slider multiplier (-2 to +2) if slider response
    const sliderMultiplier = sliderValue !== undefined ? sliderValue / 2 : 1; // Normalize to -1 to +1
    const weight = baseWeight * (sliderValue !== undefined ? Math.abs(sliderMultiplier) + 0.5 : 1);
    
    setScores(prev => {
      const newScores = { ...prev };
      
      if (question.psych.startsWith("MBTI")) {
        const trait = meta.replace("+", "").replace("-", "") as keyof typeof newScores.mbti;
        if (trait in newScores.mbti) {
          // Phase 1.1: For sliders, apply weighted value; for binary, apply full weight
          const traitValue = sliderValue !== undefined 
            ? weight * (sliderValue > 0 ? 1 : -1) * Math.abs(sliderMultiplier)
            : weight;
          newScores.mbti = { ...newScores.mbti, [trait]: newScores.mbti[trait] + Math.abs(traitValue) };
          
          // Also boost the opposite trait slightly for slider neutral responses
          if (sliderValue !== undefined && Math.abs(sliderValue) < 1) {
            const oppositeTrait = getOppositeMBTI(trait);
            if (oppositeTrait) {
              newScores.mbti = { 
                ...newScores.mbti, 
                [oppositeTrait]: newScores.mbti[oppositeTrait as keyof typeof newScores.mbti] + (0.5 - Math.abs(sliderMultiplier)) 
              };
            }
          }
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
          // Phase 1.1: Slider provides nuanced Big Five scoring
          const adjustedWeight = sliderValue !== undefined ? weight * sliderMultiplier : weight * modifier;
          newScores.bigFive = { ...newScores.bigFive, [trait]: newScores.bigFive[trait] + adjustedWeight };
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

  // Helper function to get opposite MBTI trait for hybrid detection
  const getOppositeMBTI = (trait: string): string | null => {
    const pairs: Record<string, string> = { E: "I", I: "E", S: "N", N: "S", T: "F", F: "T", J: "P", P: "J" };
    return pairs[trait] || null;
  };

  const applyMultiChoiceWeights = useCallback((option: LocalMultiChoiceOption | { weights: LocalMultiChoiceOption['weights'] }) => {
    setScores(prev => {
      const newScores = { ...prev };
      
      if (option.weights.mbti) {
        Object.entries(option.weights.mbti).forEach(([trait, weight]) => {
          if (trait in newScores.mbti && typeof weight === 'number') {
            newScores.mbti = { 
              ...newScores.mbti, 
              [trait]: newScores.mbti[trait as keyof typeof newScores.mbti] + weight 
            };
          }
        });
      }
      
      if (option.weights.disc) {
        Object.entries(option.weights.disc).forEach(([trait, weight]) => {
          if (trait in newScores.disc && typeof weight === 'number') {
            newScores.disc = { 
              ...newScores.disc, 
              [trait]: newScores.disc[trait as keyof typeof newScores.disc] + weight 
            };
          }
        });
      }
      
      if (option.weights.bigFive) {
        Object.entries(option.weights.bigFive).forEach(([trait, weight]) => {
          if (trait in newScores.bigFive && typeof weight === 'number') {
            newScores.bigFive = { 
              ...newScores.bigFive, 
              [trait]: newScores.bigFive[trait as keyof typeof newScores.bigFive] + weight 
            };
          }
        });
      }
      
      return newScores;
    });
  }, []);

  const handleSuperpowerChoice = useCallback((choice: SuperpowerChoice) => {
    if (navigator.vibrate) navigator.vibrate(50);
    applyMultiChoiceWeights({ weights: choice.weights });
    setCompletedSuperpower(true);
    
    setTimeout(() => {
      setQuizPhase("superpower-countdown");
    }, 600);
  }, [applyMultiChoiceWeights]);

  const handleMysteryChoice = useCallback((choice: MysteryBoxChoice) => {
    if (navigator.vibrate) navigator.vibrate(50);
    applyMultiChoiceWeights({ weights: choice.weights });
    setCompletedMystery(true);
    
    setTimeout(() => {
      setQuizPhase("mystery-countdown");
    }, 600);
  }, [applyMultiChoiceWeights]);

  const handleMid1Choice = useCallback((optionId: string) => {
    const option = MID1_QUESTION.options.find(o => o.id === optionId);
    if (!option) return;
    
    if (navigator.vibrate) navigator.vibrate(50);
    setMid1Choice(optionId);
    applyMultiChoiceWeights(option);
    setCompletedMid1(true);
    
    setTimeout(() => {
      setQuizPhase("mid1-countdown");
    }, 400);
  }, [applyMultiChoiceWeights]);

  const handleMid2Choice = useCallback((optionId: string) => {
    const option = MID2_QUESTION.options.find(o => o.id === optionId);
    if (!option) return;
    
    if (navigator.vibrate) navigator.vibrate(50);
    setMid2Choice(optionId);
    applyMultiChoiceWeights(option);
    setCompletedMid2(true);
    
    setTimeout(() => {
      setQuizPhase("mid2-countdown");
    }, 400);
  }, [applyMultiChoiceWeights]);

  const handleCountdownComplete = useCallback(() => {
    setQuizPhase("quiz");
  }, []);

  // Phase 2.1: Dynamic difficulty calculation based on swipe speed
  const calculateDifficulty = (swipeTimes: number[], avgTime: number): "easy" | "medium" | "hard" => {
    if (swipeTimes.length < 3) return "medium";
    if (avgTime < 2) return "hard"; // Very fast responses -> harder questions
    if (avgTime < 4) return "medium";
    return "easy"; // Slower responses -> easier questions
  };

  // Phase 2.3: Trigger random event with 7% chance
  const triggerRandomEvent = useCallback(() => {
    if (Math.random() < RANDOM_EVENT_CHANCE) {
      const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setCurrentRandomEvent(event);
      
      // Apply effect
      if (event.effect === "skip_allowed") {
        setCanSkip(true);
      }
      setActiveEffects(prev => new Set([...prev, event.effect]));
      
      // Auto-dismiss after duration
      setTimeout(() => {
        setCurrentRandomEvent(null);
      }, event.duration);
    }
  }, []);

  // Phase 2.3: Handle skip (from random event)
  const handleSkip = useCallback(() => {
    if (!canSkip || currentIndex >= questions.length - 1) return;
    setCanSkip(false);
    setActiveEffects(prev => {
      const newSet = new Set(prev);
      newSet.delete("skip_allowed");
      return newSet;
    });
    setCurrentIndex(prev => prev + 1);
    setSliderValue(0);
  }, [canSkip, currentIndex, questions.length]);

  const handleSwipe = useCallback((direction: "left" | "right", isTimeout = false, sliderVal?: number) => {
    if (questions.length === 0 || currentIndex >= questions.length) return;
    
    if (!hasInteracted) setHasInteracted(true);
    
    const question = questions[currentIndex];
    const choiceIndex: 0 | 1 = direction === "left" ? 0 : 1;
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    if (!isTimeout && navigator.vibrate) navigator.vibrate(50);
    
    if (timeSpent < tierConfig.maxTime * 0.5) {
      setFastResponses(prev => prev + 1);
    }
    
    // Phase 1.1: Pass slider value to score processing
    processScore(question, choiceIndex, sliderVal);
    
    // Phase 2.1: Enhanced response with slider support
    const newResponse = {
      questionId: question.id,
      choice: choiceIndex,
      timeSpent,
      swipeDirection: direction,
      sliderValue: sliderVal, // Phase 1.1
      responseType: question.responseType || "binary" as const
    };
    
    const nextQuestionNumber = currentIndex + 2;
    
    // Phase 2.3: Check for random event trigger
    if (currentIndex < questions.length - 1 && !isTimeout) {
      triggerRandomEvent();
    }
    
    // Reset slider for next question
    setSliderValue(0);
    
    setScores(prev => {
      // Phase 2.1: Track swipe times for dynamic difficulty
      const updatedSwipeTimes = [...prev.swipeTimes, timeSpent];
      const newAvgTime = updatedSwipeTimes.reduce((a, b) => a + b, 0) / updatedSwipeTimes.length;
      const newDifficulty = calculateDifficulty(updatedSwipeTimes, newAvgTime);
      
      // Phase 2.3: Apply double points if active
      const engagementBonus = activeEffects.has("double_points") ? 2 : 1;
      
      const updatedScores = {
        ...prev,
        responses: [...prev.responses, newResponse],
        swipeTimes: updatedSwipeTimes,
        averageSwipeTime: newAvgTime,
        currentDifficulty: newDifficulty,
        engagement: prev.engagement + (isTimeout ? -0.5 : 1 * engagementBonus)
      };
      
      // Clear double points after use
      if (activeEffects.has("double_points")) {
        setActiveEffects(prevEffects => {
          const newSet = new Set(prevEffects);
          newSet.delete("double_points");
          return newSet;
        });
      }
      
      if (currentIndex >= questions.length - 1) {
        setTimeout(() => onComplete(updatedScores), 300);
      } else if (nextQuestionNumber === quizConfig.mid1After + 1 && !completedMid1) {
        setTimeout(() => setQuizPhase("mid1"), 300);
      } else if (quizConfig.superpowerAfter && nextQuestionNumber === quizConfig.superpowerAfter + 1 && !completedSuperpower) {
        setTimeout(() => setQuizPhase("superpower"), 300);
      } else if (quizConfig.hasMystery && quizConfig.mysteryAfter && nextQuestionNumber === quizConfig.mysteryAfter + 1 && !completedMystery) {
        setTimeout(() => setQuizPhase("mystery"), 300);
      } else if (quizConfig.hasMid2 && quizConfig.mid2After && nextQuestionNumber === quizConfig.mid2After + 1 && !completedMid2) {
        setTimeout(() => setQuizPhase("mid2"), 300);
      }
      
      return updatedScores;
    });
    
    x.set(0);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions, questionStartTime, processScore, x, completedMid1, completedMid2, completedSuperpower, completedMystery, quizConfig, onComplete, hasInteracted, tierConfig.maxTime]);

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
  
  const renderMultiChoiceQuestion = (
    question: MultiChoiceQuestion, 
    selectedChoice: string | null,
    onSelect: (id: string) => void,
    isOpening: boolean
  ) => (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isOpening 
                  ? "bg-gradient-to-br from-terracotta to-dusty-blue" 
                  : "bg-gradient-to-br from-sage-green to-dusty-blue"
              }`}
            >
              {isOpening ? (
                <Sparkles className="w-8 h-8 text-white" />
              ) : (
                <Lightbulb className="w-8 h-8 text-white" />
              )}
            </motion.div>
            
            <p className="text-sm text-warm-gray/60 dark:text-soft-cream/50 mb-2">
              {question.subtitle}
            </p>
            <h2 className="text-2xl font-bold text-warm-gray dark:text-soft-cream">
              {question.prompt}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const Icon = MULTI_CHOICE_ICONS[option.icon];
              const isSelected = selectedChoice === option.id;
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onSelect(option.id)}
                  disabled={!!selectedChoice}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300
                    flex flex-col items-center justify-center gap-3 text-center
                    min-h-[140px]
                    ${isSelected 
                      ? "border-terracotta bg-terracotta/10 dark:bg-terracotta/20 scale-105" 
                      : "border-terracotta/20 dark:border-terracotta/30 bg-soft-cream/50 dark:bg-gray-800 hover:border-terracotta/50 hover:bg-terracotta/5"
                    }
                    ${selectedChoice && !isSelected ? "opacity-50" : ""}
                  `}
                  data-testid={`button-choice-${option.id}`}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isSelected 
                      ? "bg-terracotta text-white" 
                      : "bg-terracotta/10 dark:bg-terracotta/20 text-terracotta"
                    }
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`
                    text-sm font-medium leading-tight
                    ${isSelected 
                      ? "text-terracotta" 
                      : "text-warm-gray dark:text-soft-cream"
                    }
                  `}>
                    {option.label}
                  </span>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {!isOpening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40 mt-6"
            >
              Your answers shape your personalized results
            </motion.p>
          )}
        </motion.div>
      </main>
    </div>
  );

  if (quizPhase === "superpower") {
    return (
      <SuperpowerGame
        tier={tier}
        onSelect={handleSuperpowerChoice}
      />
    );
  }

  if (quizPhase === "superpower-countdown") {
    return (
      <TimedCountdown
        onComplete={handleCountdownComplete}
      />
    );
  }

  if (quizPhase === "mid1") {
    return renderMultiChoiceQuestion(MID1_QUESTION, mid1Choice, handleMid1Choice, true);
  }

  if (quizPhase === "mid1-countdown") {
    return (
      <TimedCountdown
        onComplete={handleCountdownComplete}
      />
    );
  }

  if (quizPhase === "mid2") {
    return renderMultiChoiceQuestion(MID2_QUESTION, mid2Choice, handleMid2Choice, false);
  }

  if (quizPhase === "mid2-countdown") {
    return (
      <TimedCountdown
        onComplete={handleCountdownComplete}
      />
    );
  }

  if (quizPhase === "mystery") {
    return (
      <MysteryBoxGame
        tier={tier}
        onSelect={handleMysteryChoice}
      />
    );
  }

  if (quizPhase === "mystery-countdown") {
    return (
      <TimedCountdown
        onComplete={handleCountdownComplete}
      />
    );
  }
  
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
  const promptColor = useLocalityColors 
    ? "locality-gradient px-3 py-1 rounded-lg inline-block" 
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
            {useLocalityColors && isLocalitySet && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full locality-gradient"
              >
                <MapPin className="w-3 h-3" />
              </motion.div>
            )}
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
            <AnimatePresence mode="wait">
              {timeRemaining <= 3 ? (
                <motion.div
                  key="ring"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="relative w-8 h-8 flex items-center justify-center"
                >
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-red-500"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: timeRemaining / 3 }}
                      style={{
                        strokeDasharray: "88",
                        strokeDashoffset: 0,
                      }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-red-500">
                    {Math.ceil(timeRemaining)}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Timer className={`w-4 h-4 ${timerProgress < 30 ? "text-red-500" : "text-terracotta"}`} />
                  <span className={`text-sm font-mono font-medium ${timerProgress < 30 ? "text-red-500" : "text-warm-gray dark:text-soft-cream"}`}>
                    {timeRemaining.toFixed(1)}s
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="max-w-md mx-auto mt-2">
          <Progress value={progress} className="h-1.5" data-testid="progress-quiz" />
        </div>
        
        <div className="max-w-md mx-auto mt-2 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full ${timerProgress < 30 ? "bg-red-500" : "bg-gradient-to-r from-terracotta to-dusty-blue"}`}
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
                        className={`text-3xl md:text-4xl font-bold quiz-question-text leading-tight ${promptColor}`}
                        data-testid="text-prompt"
                      >
                        {currentQuestion.prompt}
                      </h2>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97, rotate: -3 }}
                        onClick={() => !isTimingOut && handleSwipe("left")}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !isTimingOut) {
                            e.preventDefault();
                            handleSwipe("left");
                          }
                        }}
                        disabled={isTimingOut}
                        className="min-h-28 flex items-center gap-3 rounded-2xl bg-sage-green/10 dark:bg-sage-green/20 border-2 border-sage-green/30 hover:border-sage-green/60 focus:border-sage-green focus:ring-2 focus:ring-sage-green/50 transition-all px-5 py-5 disabled:opacity-50 -translate-x-4 -rotate-1"
                        data-testid="card-option-left"
                        aria-label={`Choose: ${currentQuestion.leftDesc}`}
                        tabIndex={0}
                        role="button"
                      >
                        <ChevronLeft className="w-6 h-6 text-sage-green/60 flex-shrink-0" />
                        <p className="text-xl md:text-2xl font-bold text-sage-green dark:text-sage-green leading-snug text-center flex-1">
                          {currentQuestion.leftDesc}
                        </p>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97, rotate: 3 }}
                        onClick={() => !isTimingOut && handleSwipe("right")}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !isTimingOut) {
                            e.preventDefault();
                            handleSwipe("right");
                          }
                        }}
                        disabled={isTimingOut}
                        className="min-h-28 flex items-center gap-3 rounded-2xl bg-terracotta/10 dark:bg-terracotta/20 border-2 border-terracotta/30 hover:border-terracotta/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/50 transition-all px-5 py-5 disabled:opacity-50 translate-x-4 rotate-1"
                        data-testid="card-option-right"
                        aria-label={`Choose: ${currentQuestion.rightDesc}`}
                        tabIndex={0}
                        role="button"
                      >
                        <p className="text-xl md:text-2xl font-bold text-terracotta dark:text-terracotta leading-snug text-center flex-1">
                          {currentQuestion.rightDesc}
                        </p>
                        <ChevronRight className="w-6 h-6 text-terracotta/60 flex-shrink-0" />
                      </motion.button>
                    </div>
                    
                    {currentIndex === 0 && (
                      <motion.div 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: hasInteracted ? 0 : 1 }}
                        className="text-center pt-2 text-xs text-warm-gray/50 dark:text-soft-cream/40"
                      >
                        Tap a card or swipe to choose
                      </motion.div>
                    )}
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

          {/* Phase 2.3: Random Event Overlay */}
          <AnimatePresence>
            {currentRandomEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-40"
                data-testid="random-event-overlay"
              >
                <div className="bg-gradient-to-r from-dusty-blue via-terracotta to-sage-green rounded-2xl px-6 py-4 shadow-2xl text-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-2"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  
                  <p className="text-lg font-display font-bold text-white">
                    {currentRandomEvent.title}
                  </p>
                  
                  <p className="text-sm text-white/80">
                    {currentRandomEvent.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40">
            Tap, swipe, or use keyboard (Tab + Enter) to choose
          </p>
          
          {/* Phase 2.3: Skip button when available */}
          {canSkip && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="px-3 py-1 rounded-full bg-dusty-blue text-white text-xs font-medium"
              data-testid="button-skip"
            >
              Skip Question
            </motion.button>
          )}
        </div>
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
