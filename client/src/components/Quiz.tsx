"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Timer, Pause, Play, RotateCcw, MapPin, Sparkles, Lightbulb, Users, Book, Wrench, Brain, MessageCircle, Search, ChevronLeft, ChevronRight, Clock, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import CelestialProgressTracker from "./CelestialProgressTracker";
import QuizOnboardingOverlay from "./QuizOnboarding";
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
  isBadge?: boolean; // Special badge question
  badgeHint?: string; // Badge hint text
  is2x?: boolean; // 2x scoring multiplier question
}

type ActiveTierValue = "13-18" | "19-25" | "25+" | "25plus";
type TierValue = ActiveTierValue | "7-12";

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
  { id: "inner_voice", title: "Inner Voice!", description: "Trust your first instinct", effect: "hint_reveal", duration: 2500, icon: "brain" },
];

const RANDOM_EVENT_BASE_CHANCE = 0.03; // 3% base chance per question (reduced from 8%)
const RANDOM_EVENT_MAX_CHANCE = 0.06; // 6% max chance cap (reduced from 15%)

type QuizPhase = "quiz" | "superpower" | "superpower-countdown" | "energy" | "energy-countdown" | "mystery" | "mystery-countdown" | "checkpoint";

// Spin wheel recap component - cycles through insights then settles on accurate ones
interface RecapSpinWheelProps {
  currentIndex: number;
  scores: {
    mbti: Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>;
    disc: Record<"D" | "I" | "S" | "C", number>;
    bigFive: Record<"O" | "C" | "E" | "A" | "N", number>;
  };
  questionsRemaining: number;
  onContinue: () => void;
  shownInsights: Set<string>;
  onInsightShown: (insight: string) => void;
}

const INSIGHT_POOL: Record<string, string[]> = {
  extraverted: [
    "You're showing social energy",
    "You thrive around others",
    "You light up in group settings",
    "Connection energizes you"
  ],
  introverted: [
    "You're showing thoughtful focus",
    "You recharge with quiet time",
    "Deep thinking is your strength",
    "Solo reflection suits you"
  ],
  intuitive: [
    "You're seeing the big picture",
    "Patterns and possibilities catch your eye",
    "You think in concepts and ideas",
    "Future possibilities excite you"
  ],
  sensing: [
    "You're grounded in details",
    "You notice what's right in front of you",
    "Practical facts guide you",
    "You trust hands-on experience"
  ],
  thinking: [
    "You're analyzing logically",
    "Logic guides your choices",
    "You weigh pros and cons carefully",
    "Reason is your compass"
  ],
  feeling: [
    "You're tuned to feelings",
    "Values guide your decisions",
    "Harmony matters to you",
    "You consider how others feel"
  ],
  judging: [
    "You prefer structure",
    "Planning gives you peace",
    "You like things decided",
    "Organization is your friend"
  ],
  perceiving: [
    "You're staying flexible",
    "You adapt as things change",
    "Options feel better than plans",
    "Spontaneity suits you"
  ],
  openness: [
    "You're naturally curious",
    "New ideas spark your interest",
    "Creativity flows through you",
    "You embrace the unusual"
  ],
  conscientiousness: [
    "You're organized and driven",
    "You follow through on commitments",
    "Discipline is a strength",
    "Goals keep you focused"
  ],
  agreeableness: [
    "You connect well with others",
    "Kindness comes naturally",
    "You value cooperation",
    "Empathy is your strength"
  ],
  neuroticism_low: [
    "You stay calm under pressure",
    "Stress doesn't shake you easily",
    "Emotional stability is your anchor",
    "You handle challenges with grace"
  ]
};

function RecapSpinWheel({ currentIndex, scores, questionsRemaining, onContinue, shownInsights, onInsightShown }: RecapSpinWheelProps) {
  const recapMilestone = Math.floor((currentIndex + 1) / 10) * 10;
  
  const allInsights = Object.values(INSIGHT_POOL).flat();
  
  const getTraitScores = () => {
    const mbti = scores.mbti;
    const bigFive = scores.bigFive;
    
    const traitScores = [
      { trait: mbti.E >= mbti.I ? "extraverted" : "introverted", score: Math.abs(mbti.E - mbti.I) + (mbti.E >= mbti.I ? mbti.E : mbti.I) },
      { trait: mbti.N >= mbti.S ? "intuitive" : "sensing", score: Math.abs(mbti.N - mbti.S) + (mbti.N >= mbti.S ? mbti.N : mbti.S) },
      { trait: mbti.T >= mbti.F ? "thinking" : "feeling", score: Math.abs(mbti.T - mbti.F) + (mbti.T >= mbti.F ? mbti.T : mbti.F) },
      { trait: mbti.J >= mbti.P ? "judging" : "perceiving", score: Math.abs(mbti.J - mbti.P) + (mbti.J >= mbti.P ? mbti.J : mbti.P) },
      { trait: "openness", score: bigFive.O },
      { trait: "conscientiousness", score: bigFive.C },
      { trait: "agreeableness", score: bigFive.A },
      { trait: bigFive.N < 0.5 ? "neuroticism_low" : "feeling", score: bigFive.N < 0.5 ? (1 - bigFive.N) : 0 }
    ];
    
    return traitScores.sort((a, b) => b.score - a.score);
  };
  
  const getBestInsight = (): string => {
    const rankedTraits = getTraitScores();
    
    for (const { trait } of rankedTraits) {
      const pool = INSIGHT_POOL[trait] || [];
      for (const insight of pool) {
        if (!shownInsights.has(insight)) {
          return insight;
        }
      }
    }
    
    const fallbacks = INSIGHT_POOL[rankedTraits[0]?.trait || "extraverted"] || allInsights;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };
  
  const finalInsight = getBestInsight();
  
  const [displayedInsight, setDisplayedInsight] = useState<string>("...");
  const [spinComplete, setSpinComplete] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  
  useEffect(() => {
    let cycleCount = 0;
    const totalCycles = 20;
    const baseInterval = 80;
    
    const spinCycle = () => {
      cycleCount++;
      
      const progress = cycleCount / totalCycles;
      const delay = baseInterval + (progress * progress * 400);
      
      if (cycleCount < totalCycles) {
        const randomInsight = allInsights[Math.floor(Math.random() * allInsights.length)];
        setDisplayedInsight(randomInsight);
        
        setTimeout(spinCycle, delay);
      } else {
        setDisplayedInsight(finalInsight);
        onInsightShown(finalInsight);
        setSpinComplete(true);
        
        setTimeout(() => {
          setButtonActive(true);
        }, 500);
      }
    };
    
    const startTimer = setTimeout(() => {
      spinCycle();
    }, 300);
    
    return () => clearTimeout(startTimer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0F]">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-6"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center mb-4">
              <motion.div
                animate={spinComplete ? {} : { rotate: 360 }}
                transition={spinComplete ? {} : { duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-sage-green" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-warm-gray dark:text-[#F8FAFC] mb-2">
              Checkpoint: {recapMilestone} Questions
            </h2>
            <p className="text-warm-gray/70 dark:text-[#94A3B8]">
              {spinComplete ? "Here's what we're seeing so far..." : "Analyzing your responses..."}
            </p>
          </motion.div>
          
          <div className="mb-8">
            <motion.div
              animate={spinComplete ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`p-5 rounded-xl border transition-all duration-200 ${
                spinComplete 
                  ? "bg-sage-green/10 dark:bg-sage-green/20 border-sage-green/30 dark:border-sage-green/40" 
                  : "bg-soft-cream/50 dark:bg-[#12121A]/50 border-warm-gray/10 dark:border-white/10"
              }`}
            >
              <motion.p 
                key={displayedInsight}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className={`font-medium text-lg transition-colors duration-200 ${
                  spinComplete 
                    ? "text-sage-green dark:text-sage-green" 
                    : "text-warm-gray/70 dark:text-[#94A3B8]"
                }`}
              >
                {displayedInsight}
              </motion.p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onContinue}
              disabled={!buttonActive}
              className={`w-full transition-all duration-300 ${
                buttonActive 
                  ? "!bg-green-500 hover:!bg-green-600 !text-white border border-green-400/40 shadow-[0_0_24px_rgba(34,197,94,0.22)] disabled:opacity-100"
                  : "!bg-green-500/80 !text-white border border-green-400/25 cursor-not-allowed disabled:opacity-100"
              }`}
              data-testid="button-recap-continue"
            >
              Keep Going
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-warm-gray/50 dark:text-[#64748B] mt-3">
              {questionsRemaining} questions remaining
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

const getQuizConfig = (_tier: string) => {
  // Unified quiz config for all active tiers:
  // Q1-10 → checkpoint1 → Q11-20 → superpower → Q21-25 →
  // checkpoint2 → Q26-30 → energy → Q31-35 → mystery → Q36-45
  return {
    totalQuestions: 45,
    checkpoint1After: 10,
    superpowerAfter: 20,
    checkpoint2After: 25,
    energyAfter: 30,
    mysteryAfter: 35,
    hasMystery: true,
  };
};

// Dynamically adjust question wording based on mood tone
const adjustQuestionWording = (prompt: string, tone: "introspective" | "energetic" | "analytical" | "neutral"): string => {
  if (tone === "neutral") return prompt;
  
  // Mapping of common phrases to mood-adjusted versions
  const toneAdjustments: Record<string, Record<string, string>> = {
    introspective: {
      "Do you": "When you pause to reflect, do you",
      "Would you": "In quiet moments, would you",
      "Are you": "Deep down, are you",
      "You prefer": "When you listen to your inner voice, you prefer",
      "You enjoy": "In contemplative times, you enjoy",
      "You like": "At your core, you like",
    },
    energetic: {
      "Do you": "Right now, do you",
      "Would you": "If you had the chance today, would you",
      "Are you": "At your best, are you",
      "You prefer": "When you're fired up, you prefer",
      "You enjoy": "At your peak energy, you enjoy",
      "You like": "When motivated, you like",
    },
    analytical: {
      "Do you": "Thinking it through, do you",
      "Would you": "After careful consideration, would you",
      "Are you": "Logically speaking, are you",
      "You prefer": "Based on experience, you prefer",
      "You enjoy": "When solving problems, you enjoy",
      "You like": "Rationally, you like",
    }
  };
  
  const adjustments = toneAdjustments[tone] || {};
  let adjustedPrompt = prompt;
  
  // Only adjust the first matching phrase to avoid over-modification
  for (const [original, replacement] of Object.entries(adjustments)) {
    if (prompt.startsWith(original)) {
      adjustedPrompt = prompt.replace(original, replacement);
      break;
    }
  }
  
  return adjustedPrompt;
};

// Mood integration: boost proxies and adjust question tone
const getMoodEffects = (mood: string) => {
  const effects = {
    criticalBoost: 0,
    firstPrinciplesBoost: 0,
    extraversionBoost: 0,
    opennessBoost: 0,
    conscientiousnessBoost: 0,
    agreeablenessBoost: 0,
    neuroticismBoost: 0,
    questionTone: "neutral" as "introspective" | "energetic" | "analytical" | "neutral"
  };
  
  // Parse mood - could be single or blend (e.g., "Energized|Reflective" from Mixer)
  const moods = mood.split("|").map(m => m.trim().toLowerCase());
  
  for (const m of moods) {
    switch (m) {
      case "energized":
        effects.extraversionBoost += 5;
        effects.questionTone = "energetic";
        break;
      case "stuck":
        effects.criticalBoost += 10; // Boost analytical thinking for breakthroughs
        effects.conscientiousnessBoost += 5;
        effects.questionTone = "analytical";
        break;
      case "reflective":
        effects.firstPrinciplesBoost += 5;
        effects.opennessBoost += 5;
        effects.questionTone = "introspective";
        break;
      case "happy":
        effects.extraversionBoost += 3;
        effects.agreeablenessBoost += 3;
        break;
      case "calm":
        effects.neuroticismBoost -= 5; // Lower neuroticism when calm
        effects.conscientiousnessBoost += 3;
        break;
      case "curious":
        effects.opennessBoost += 8;
        effects.firstPrinciplesBoost += 5;
        break;
      case "determined":
        effects.conscientiousnessBoost += 8;
        effects.criticalBoost += 5;
        break;
      case "creative":
        effects.opennessBoost += 10;
        effects.firstPrinciplesBoost += 8;
        break;
      case "social":
        effects.extraversionBoost += 10;
        effects.agreeablenessBoost += 5;
        break;
    }
  }
  
  // Blend effects - if multiple moods, average the tone
  if (moods.length > 1) {
    effects.questionTone = "neutral"; // Blends use neutral
  }
  
  return effects;
};

const getBrowserSessionItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export default function Quiz({ tier: rawTier, mood, funMode, landmark, theme, onComplete, onExit }: QuizProps) {
  const tier: ActiveTierValue = rawTier === "7-12" ? "13-18" : rawTier;
  const tierConfig = questionsData.tierConfig[tier as keyof typeof questionsData.tierConfig] || questionsData.tierConfig["19-25"];
  const quizConfig = getQuizConfig(tier);
  const gameTier = tier === "25+" ? "25plus" : tier;
  const { teamName, isLocalitySet } = useLocalityTheme();
  const moodEffects = getMoodEffects(mood);
  const { toast } = useToast();
  
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("quiz");
  const [energyChoice, setEnergyChoice] = useState<string | null>(null);
  const [completedEnergy, setCompletedEnergy] = useState(false);
  const [completedSuperpower, setCompletedSuperpower] = useState(false);
  const [completedMystery, setCompletedMystery] = useState(false);
  const [completedCheckpoint1, setCompletedCheckpoint1] = useState(false);
  const [completedCheckpoint2, setCompletedCheckpoint2] = useState(false);
  const [shownInsights, setShownInsights] = useState<Set<string>>(new Set()); // Track shown insights to prevent repeats
  
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
  
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasUsedBack, setHasUsedBack] = useState(false);
  const [previousScoresSnapshot, setPreviousScoresSnapshot] = useState<QuizScores | null>(null);
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [showQuip, setShowQuip] = useState(false);
  const [currentQuip, setCurrentQuip] = useState(TIMEOUT_QUIPS[0]);
  const [missCount, setMissCount] = useState(0);
  const [vibrantColorIndex, setVibrantColorIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0); // Forces timer reset when incremented
  
  const [showIntroOnboarding, setShowIntroOnboarding] = useState(() => {
    return !getBrowserSessionItem("knowrole-onboarding-intro-done");
  });
  const [showSliderOnboarding, setShowSliderOnboarding] = useState(false);
  const hasShownSliderOnboarding = useRef(!!getBrowserSessionItem("knowrole-onboarding-slider-done"));
  
  // Use ref for processing lock - refs update synchronously, preventing race conditions
  const isProcessingAnswerRef = useRef(false);

  // BUG-08 FIX: Reset processing lock on component unmount
  // This prevents the lock from staying true if user navigates away mid-quiz
  // (e.g., during a break phase), which would silently ignore the next answer
  useEffect(() => {
    return () => {
      isProcessingAnswerRef.current = false;
    };
  }, []);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const leftOpacity = useTransform(x, [-300, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 300], [0, 0.5, 1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useLocalityColors = isLocalitySet;
  
  // Derived state: check if any popup is active to disable interactions
  const isAnyPopupActive = showPauseMenu || showQuip || showIntroOnboarding || showSliderOnboarding;

  // Phase 1.2: Adaptive framework quotas — unified for all active tiers.
  // 45 questions total: Big5 ~46%, MBTI ~36%, DISC ~18%.
  const getAdaptiveQuotas = (_tier: string) => {
    return { MBTI: 0.36, DISC: 0.18, Big5: 0.46, Critical: 0, FirstPrinciples: 0 };
  };
  
  const FRAMEWORK_QUOTAS = getAdaptiveQuotas(tier);
  
  // IRT Adaptive Branching: Detect ambiguous traits and prioritize relevant questions
  const detectAmbiguousTraits = (scoresData: typeof scores): string[] => {
    const ambiguousTraits: string[] = [];
    const AMBIGUITY_THRESHOLD = 0.15; // 15% difference = ambiguous
    
    // Check MBTI dimensions
    const mbtiTotal = scores.mbti.E + scores.mbti.I;
    const nsTotal = scores.mbti.N + scores.mbti.S;
    const tfTotal = scores.mbti.T + scores.mbti.F;
    const jpTotal = scores.mbti.J + scores.mbti.P;
    
    if (mbtiTotal > 0) {
      if (Math.abs(scores.mbti.E - scores.mbti.I) / mbtiTotal < AMBIGUITY_THRESHOLD) {
        ambiguousTraits.push("MBTI-E", "MBTI-I");
      }
    }
    if (nsTotal > 0) {
      if (Math.abs(scores.mbti.N - scores.mbti.S) / nsTotal < AMBIGUITY_THRESHOLD) {
        ambiguousTraits.push("MBTI-N", "MBTI-S");
      }
    }
    if (tfTotal > 0) {
      if (Math.abs(scores.mbti.T - scores.mbti.F) / tfTotal < AMBIGUITY_THRESHOLD) {
        ambiguousTraits.push("MBTI-T", "MBTI-F");
      }
    }
    if (jpTotal > 0) {
      if (Math.abs(scores.mbti.J - scores.mbti.P) / jpTotal < AMBIGUITY_THRESHOLD) {
        ambiguousTraits.push("MBTI-J", "MBTI-P");
      }
    }
    
    // Check Big Five dimensions
    const big5Traits = ["O", "C", "E", "A", "N"] as const;
    for (const trait of big5Traits) {
      // Ambiguous if between 40-60 (normalized to 100)
      const value = scores.bigFive[trait];
      if (value >= 40 && value <= 60) {
        ambiguousTraits.push(`Big5-${trait}`);
      }
    }
    
    return ambiguousTraits;
  };

  useEffect(() => {
    const tierQuestions = questionsData.questions.filter(q => q.tier === tier);
    const targetCount = quizConfig.totalQuestions;
    
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
  }, [tier, quizConfig.totalQuestions]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const currentQ = questions[currentIndex];
      
      // Give slider questions 3 extra seconds since they're more complex
      const extraTime = currentQ?.responseType === "slider" ? 3 : 0;
      setTimeRemaining(tierConfig.maxTime + extraTime);
      setQuestionStartTime(Date.now());
      
      setVibrantColorIndex(Math.floor(Math.random() * READABLE_RANDOM_COLORS.length));
      setIsTimingOut(false);
      setShowQuip(false);
      setSliderValue(0); // Reset slider for new question
    }
  }, [currentIndex, questions, tierConfig.maxTime, timerResetKey]);

  // FIX: Backup quiz state to localStorage periodically and on beforeunload
  // This provides a fallback if sessionStorage is cleared mid-quiz
  useEffect(() => {
    if (questions.length === 0 || currentIndex === 0) return; // Don't save before quiz starts
    const backupState = () => {
      try {
        const state = {
          scores,
          currentIndex,
          quizPhase,
          timestamp: Date.now(),
        };
        localStorage.setItem('kyr_quiz_backup', JSON.stringify(state));
      } catch (e) {
        // Storage full or unavailable - silently fail
      }
    };
    // Save on state changes (debounced via effect dependency)
    const interval = setInterval(backupState, 5000);
    // Also save on beforeunload
    window.addEventListener('beforeunload', backupState);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', backupState);
    };
  }, [scores, currentIndex, quizPhase, questions.length]);

  // FIX: Handle browser back button during quiz
  // Shows a confirmation rather than silently losing progress
  useEffect(() => {
    const handlePopState = () => {
      if (questions.length > 0 && currentIndex > 0) {
        const confirmBack = window.confirm(
          "Are you sure you want to go back? Your current progress will be lost."
        );
        if (!confirmBack) {
          // Push state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Initial state push to enable proper back-button detection
    window.history.pushState(null, '', window.location.href);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [questions.length, currentIndex]);

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
      setIsTimingOut(false);
      // Force timer reset by incrementing reset key - this triggers the useEffect
      setTimerResetKey(prev => prev + 1);
    }, 2000);
  }, [missCount]);

  useEffect(() => {
    // Pause timer during paused state or other conditions
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

  useEffect(() => {
    if (showIntroOnboarding && currentIndex === 0 && questions.length > 0 && quizPhase === "quiz") {
      setIsPaused(true);
    }
  }, [showIntroOnboarding, currentIndex, questions.length, quizPhase]);

  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (
      currentQ?.responseType === "slider" &&
      !hasShownSliderOnboarding.current &&
      !showIntroOnboarding &&
      quizPhase === "quiz"
    ) {
      hasShownSliderOnboarding.current = true;
      setShowSliderOnboarding(true);
      setIsPaused(true);
    }
  }, [currentIndex, questions, showIntroOnboarding, quizPhase]);

  // Phase 1.1 & 1.4: Enhanced scoring with slider support and variable boosts
  const processScore = useCallback((question: Question, choiceIndex: 0 | 1, sliderValue?: number) => {
    const meta = question.optionMeta[choiceIndex];
    
    // Phase 1.4: Variable boost range (10-30%) instead of fixed 80%
    const boostRange = question.boostRange || [0.7, 0.9];
    const variableBoost = boostRange[0] + Math.random() * (boostRange[1] - boostRange[0]);
    // Apply 2x multiplier for special 2x questions
    const multiplier = question.is2x ? 2 : 1;
    const baseWeight = (question.wildcard ? variableBoost : 1) * multiplier;
    
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

  const handleEnergyChoice = useCallback((optionId: string) => {
    const option = MID1_QUESTION.options.find(o => o.id === optionId);
    if (!option) return;
    
    if (navigator.vibrate) navigator.vibrate(50);
    setEnergyChoice(optionId);
    applyMultiChoiceWeights(option);
    setCompletedEnergy(true);
    
    setTimeout(() => {
      setQuizPhase("energy-countdown");
    }, 400);
  }, [applyMultiChoiceWeights]);

  const handleCountdownComplete = useCallback(() => {
    // Advance to next question when returning from break
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    // Reset timer to full when returning to quiz from countdown
    // Use currentIndex + 1 since we just advanced
    const nextQ = questions[currentIndex + 1];
    const extraTime = nextQ?.responseType === "slider" ? 3 : 0;
    setTimeRemaining(tierConfig.maxTime + extraTime);
    setQuestionStartTime(Date.now());
    isProcessingAnswerRef.current = false; // Reset processing lock when returning from break
    console.log(`[Quiz] Returning from break, advancing to Q${currentIndex + 2}`);
    setQuizPhase("quiz");
  }, [questions, currentIndex, tierConfig.maxTime]);

  // Phase 2.1: Dynamic difficulty calculation based on swipe speed
  const calculateDifficulty = (swipeTimes: number[], avgTime: number): "easy" | "medium" | "hard" => {
    if (swipeTimes.length < 3) return "medium";
    if (avgTime < 2) return "hard"; // Very fast responses -> harder questions
    if (avgTime < 4) return "medium";
    return "easy"; // Slower responses -> easier questions
  };

  const handleGoBack = useCallback(() => {
    if (!canGoBack || hasUsedBack || currentIndex === 0 || !previousScoresSnapshot) return;
    if (isProcessingAnswerRef.current) return;
    
    isProcessingAnswerRef.current = true;
    
    setScores(previousScoresSnapshot);
    setPreviousScoresSnapshot(null);
    setCurrentIndex(prev => prev - 1);
    setCanGoBack(false);
    setHasUsedBack(true);
    
    toast({
      title: "Gone back one question",
      description: "Your previous answer has been undone. Scores adjusted.",
      duration: 3000,
    });
    
    setTimerResetKey(prev => prev + 1);
    
    setTimeout(() => {
      isProcessingAnswerRef.current = false;
    }, 400);
  }, [canGoBack, hasUsedBack, currentIndex, previousScoresSnapshot, toast]);

  const handleSwipe = useCallback((direction: "left" | "right", isTimeout = false, sliderVal?: number) => {
    // Guard against rapid clicking - use ref for synchronous check
    if (isProcessingAnswerRef.current) return;
    if (questions.length === 0 || currentIndex >= questions.length) return;
    
    // Lock immediately (ref updates synchronously, unlike state)
    isProcessingAnswerRef.current = true;
    
    setPreviousScoresSnapshot({ ...scores, mbti: { ...scores.mbti }, disc: { ...scores.disc }, bigFive: { ...scores.bigFive }, responses: [...scores.responses], swipeTimes: [...scores.swipeTimes], hybridTypes: [...scores.hybridTypes] });
    
    if (!hasInteracted) setHasInteracted(true);
    
    const question = questions[currentIndex];
    const choiceIndex: 0 | 1 = direction === "left" ? 0 : 1;
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    if (!isTimeout && navigator.vibrate) navigator.vibrate(50);
    
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
    
    const nextQuestionNumber = currentIndex + 2; // 1-based question number after this answer
    
    // Determine if we need to trigger a break phase BEFORE updating state
    let shouldTriggerBreak = false;
    let breakPhase: QuizPhase | null = null;
    
    if (currentIndex >= questions.length - 1) {
      // Quiz complete - handled separately
      shouldTriggerBreak = false;
    } else if (quizConfig.superpowerAfter && nextQuestionNumber === quizConfig.superpowerAfter + 1 && !completedSuperpower) {
      shouldTriggerBreak = true;
      breakPhase = "superpower";
    } else if (quizConfig.checkpoint1After && nextQuestionNumber === quizConfig.checkpoint1After + 1 && !completedCheckpoint1) {
      shouldTriggerBreak = true;
      breakPhase = "checkpoint";
    } else if (quizConfig.checkpoint2After && nextQuestionNumber === quizConfig.checkpoint2After + 1 && !completedCheckpoint2) {
      shouldTriggerBreak = true;
      breakPhase = "checkpoint";
    } else if (quizConfig.energyAfter && nextQuestionNumber === quizConfig.energyAfter + 1 && !completedEnergy) {
      shouldTriggerBreak = true;
      breakPhase = "energy";
    } else if (quizConfig.hasMystery && quizConfig.mysteryAfter && nextQuestionNumber === quizConfig.mysteryAfter + 1 && !completedMystery) {
      shouldTriggerBreak = true;
      breakPhase = "mystery";
    }
    
    // Reset slider for next question
    setSliderValue(0);
    
    setScores(prev => {
      // Track swipe times for dynamic difficulty
      const updatedSwipeTimes = [...prev.swipeTimes, timeSpent];
      const newAvgTime = updatedSwipeTimes.reduce((a, b) => a + b, 0) / updatedSwipeTimes.length;
      const newDifficulty = calculateDifficulty(updatedSwipeTimes, newAvgTime);
      
      const updatedScores = {
        ...prev,
        responses: [...prev.responses, newResponse],
        swipeTimes: updatedSwipeTimes,
        averageSwipeTime: newAvgTime,
        currentDifficulty: newDifficulty,
        engagement: prev.engagement + (isTimeout ? -0.5 : 1)
      };
      
      if (currentIndex >= questions.length - 1) {
        console.log(`[Quiz] Last question answered (Q${currentIndex + 1}/${questions.length}), completing quiz...`);
        // Apply mood-based boosts to Big Five before completing
        const moodBoostedScores = {
          ...updatedScores,
          bigFive: {
            O: updatedScores.bigFive.O + (moodEffects.opennessBoost * 0.1),
            C: updatedScores.bigFive.C + (moodEffects.conscientiousnessBoost * 0.1),
            E: updatedScores.bigFive.E + (moodEffects.extraversionBoost * 0.1),
            A: updatedScores.bigFive.A + (moodEffects.agreeablenessBoost * 0.1),
            N: updatedScores.bigFive.N + (moodEffects.neuroticismBoost * 0.1),
          },
          // Store mood boosts for proxy calculations
          moodBoosts: {
            critical: moodEffects.criticalBoost,
            firstPrinciples: moodEffects.firstPrinciplesBoost,
          }
        };
        setTimeout(() => {
          console.log(`[Quiz] Calling onComplete with scores`);
          onComplete(moodBoostedScores);
        }, 300);
      }
      
      return updatedScores;
    });
    
    x.set(0);
    
    // CRITICAL FIX: Only advance index if NOT triggering a break
    // If a break triggers, we stay on current index until break completes
    if (shouldTriggerBreak && breakPhase) {
      // Trigger break phase SYNCHRONOUSLY (no setTimeout)
      // Keep processing locked - it will be unlocked when returning from break
      console.log(`[Quiz] Break triggered: ${breakPhase} after Q${currentIndex + 1}`);
      setQuizPhase(breakPhase);
      setCanGoBack(false);
      // DO NOT advance currentIndex - we'll do that when returning from break
      // DO NOT unlock processing - it will be unlocked by handleCountdownComplete or onContinue
    } else if (currentIndex < questions.length - 1) {
      // Normal progression - advance to next question
      setCurrentIndex(prev => prev + 1);
      setCanGoBack(true);
      setHasUsedBack(false);
      // Unlock processing after animation completes
      setTimeout(() => {
        isProcessingAnswerRef.current = false;
      }, 400);
    } else {
      // Quiz complete - unlock after completion animation
      setTimeout(() => {
        isProcessingAnswerRef.current = false;
      }, 400);
    }
  }, [currentIndex, questions, questionStartTime, processScore, x, completedSuperpower, completedMystery, completedEnergy, completedCheckpoint1, completedCheckpoint2, quizConfig, onComplete, hasInteracted, tierConfig.maxTime, moodEffects, scores]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isTimingOut || isProcessingAnswerRef.current || isPaused) return;
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      handleSwipe(info.offset.x > 0 ? "right" : "left");
    } else {
      x.set(0);
    }
  }, [handleSwipe, x, isTimingOut, isPaused]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showPauseMenu || isTimingOut || isProcessingAnswerRef.current || isPaused) return;
    
    if (e.key === "ArrowLeft" || e.key === "a") {
      handleSwipe("left");
    } else if (e.key === "ArrowRight" || e.key === "d") {
      handleSwipe("right");
    } else if (e.key === " " || e.key === "Escape") {
      setIsPaused(true);
      setShowPauseMenu(true);
    }
  }, [handleSwipe, showPauseMenu, isTimingOut, isPaused]);

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
  
  const [mcBreakTimer, setMcBreakTimer] = useState(20);
  const [mcBreakTimerActive, setMcBreakTimerActive] = useState(false);
  const [mcBreakVisible, setMcBreakVisible] = useState(false);
  
  useEffect(() => {
    if (quizPhase === "energy") {
      setMcBreakVisible(false);
      setMcBreakTimer(20);
      setMcBreakTimerActive(false);
      const fadeInTimeout = setTimeout(() => {
        setMcBreakVisible(true);
        setMcBreakTimerActive(true);
      }, 100);
      return () => clearTimeout(fadeInTimeout);
    }
  }, [quizPhase]);
  
  useEffect(() => {
    if (!mcBreakTimerActive || mcBreakTimer <= 0) return;
    const interval = setInterval(() => {
      setMcBreakTimer(prev => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [mcBreakTimerActive, mcBreakTimer]);

  const getMcBreakQuestionNumber = () => {
    if (quizPhase === "energy") return (quizConfig.energyAfter || 0) + 1;
    return currentIndex + 1;
  };

  const renderMultiChoiceQuestion = (
    question: MultiChoiceQuestion, 
    selectedChoice: string | null,
    onSelect: (id: string) => void,
    isOpening: boolean
  ) => {
    const mcQuestionNum = getMcBreakQuestionNumber();
    const mcTimerProgress = (mcBreakTimer / 20) * 100;
    
    return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0F]">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/90 dark:bg-[#0A0A0F]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#A78BFA]/20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${mcBreakTimer < 5 ? "text-red-500" : "text-terracotta"}`} />
            <span className={`text-lg font-mono font-bold ${mcBreakTimer < 5 ? "text-red-500" : "text-warm-gray dark:text-[#F8FAFC]"}`}>
              {mcBreakTimer.toFixed(1)}s
            </span>
          </div>
          <span className="text-lg font-bold text-warm-gray dark:text-[#F8FAFC]">
            {mcQuestionNum}/{quizConfig.totalQuestions}
          </span>
        </div>
        <div className="max-w-md mx-auto mt-2 h-2 bg-gray-200 dark:bg-[#1E1E2E] rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${mcBreakTimer < 5 ? "bg-red-500" : "bg-gradient-to-r from-terracotta to-dusty-blue"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${mcTimerProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mcBreakVisible ? 1 : 0, y: mcBreakVisible ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: mcBreakVisible ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
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
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: mcBreakVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-warm-gray/60 dark:text-[#64748B] mb-2 text-[16px]"
            >
              {question.subtitle}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: mcBreakVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-2xl font-bold text-warm-gray dark:text-[#F8FAFC]"
            >
              {question.prompt}
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const Icon = MULTI_CHOICE_ICONS[option.icon];
              const isSelected = selectedChoice === option.id;
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: mcBreakVisible ? (isSelected || !selectedChoice ? 1 : 0.5) : 0, 
                    scale: isSelected ? 1.05 : 1 
                  }}
                  transition={{ delay: mcBreakVisible ? 0.7 + idx * 0.1 : 0, duration: 0.3 }}
                  onClick={() => {
                    onSelect(option.id);
                    setMcBreakTimerActive(false);
                  }}
                  disabled={!!selectedChoice}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300
                    flex flex-col items-center justify-center gap-3 text-center
                    min-h-[140px]
                    ${isSelected 
                      ? "border-terracotta bg-terracotta/10 dark:bg-terracotta/20 scale-105" 
                      : "border-terracotta/20 dark:border-terracotta/30 bg-soft-cream/50 dark:bg-[#12121A] hover:border-terracotta/50 hover:bg-terracotta/5"
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
                  <span className="font-medium text-warm-gray dark:text-[#F8FAFC] text-[18px]">
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
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: mcBreakVisible ? 1 : 0 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-warm-gray/50 dark:text-[#64748B] mt-6"
          >
            Your answers shape your personalized results
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
  };

  if (quizPhase === "superpower") {
    return (
      <SuperpowerGame
        tier={gameTier}
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

  if (quizPhase === "energy") {
    return renderMultiChoiceQuestion(MID1_QUESTION, energyChoice, handleEnergyChoice, true);
  }

  if (quizPhase === "energy-countdown") {
    return (
      <TimedCountdown
        onComplete={handleCountdownComplete}
      />
    );
  }

  if (quizPhase === "checkpoint") {
    return (
      <RecapSpinWheel
        currentIndex={currentIndex}
        scores={scores}
        questionsRemaining={questions.length - currentIndex - 1}
        shownInsights={shownInsights}
        onInsightShown={(insight) => {
          setShownInsights(prev => new Set(Array.from(prev).concat(insight)));
        }}
        onContinue={() => {
          // Mark appropriate checkpoint as completed
          if (quizConfig.checkpoint1After && currentIndex + 1 >= quizConfig.checkpoint1After && !completedCheckpoint1) {
            setCompletedCheckpoint1(true);
          } else if (quizConfig.checkpoint2After && currentIndex + 1 >= quizConfig.checkpoint2After && !completedCheckpoint2) {
            setCompletedCheckpoint2(true);
          }
          // Advance to next question when returning from checkpoint break
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
          isProcessingAnswerRef.current = false; // Reset processing lock when returning from break
          console.log(`[Quiz] Returning from checkpoint, advancing to Q${currentIndex + 2}`);
          setQuizPhase("quiz");
          setTimerResetKey(prev => prev + 1);
        }}
      />
    );
  }

  if (quizPhase === "mystery") {
    return (
      <MysteryBoxGame
        tier={gameTier}
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#0A0A0F]">
        {/* BUG-16 FIX: Loading skeleton — questions.json is ~500KB, show informative skeleton */}
        <div className="w-full max-w-md mx-auto px-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          {/* Progress bar skeleton */}
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          {/* Card skeleton */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A2E] p-8 space-y-6">
            {/* Question text skeleton */}
            <div className="space-y-2">
              <div className="h-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mx-auto w-3/4" />
              <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mx-auto w-1/2" />
            </div>
            {/* Swipe options skeleton */}
            <div className="flex gap-4 pt-4">
              <div className="flex-1 h-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 h-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
          {/* Timer skeleton */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700 animate-pulse" />
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
        />
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
          Preparing your personality path…
        </p>
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0F]">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/95 dark:bg-[#0A0A0F]/95 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2" data-onboarding="timer">
            <AnimatePresence mode="wait">
              {timeRemaining <= 3 && timeRemaining > 0 ? (
                <motion.div
                  key="ring"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="relative w-14 h-14 flex items-center justify-center"
                >
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="text-red-500"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: Math.max(0, timeRemaining) / 3 }}
                      style={{
                        strokeDasharray: "151",
                        strokeDashoffset: 0,
                      }}
                    />
                  </svg>
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={Math.max(1, Math.ceil(timeRemaining))}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="absolute text-2xl font-black text-red-500 drop-shadow-lg"
                    >
                      {Math.max(1, Math.ceil(timeRemaining))}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              ) : timeRemaining <= 0 ? null : (
                <motion.div
                  key="timer"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Timer className={`w-6 h-6 ${timerProgress < 30 ? "text-red-500" : "text-terracotta"}`} />
                  <span className={`text-xl font-mono font-bold ${timerProgress < 30 ? "text-red-500" : "text-warm-gray dark:text-[#F8FAFC]"}`}>
                    {timeRemaining.toFixed(1)}s
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3">
            {(() => {
              const currentQuestionNumber = currentIndex + 1;
              const estimatedMinutes = currentQuestionNumber <= 10
                ? 8
                : currentQuestionNumber <= 20
                  ? 6
                  : currentQuestionNumber <= 30
                    ? 4
                    : 2;

              return (
                <div className="flex items-center gap-1 text-warm-gray/60 dark:text-[#94A3B8]" data-testid="text-time-estimate">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    ~{estimatedMinutes} min left
                  </span>
                </div>
              );
            })()}
            {canGoBack && !hasUsedBack && currentIndex > 0 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleGoBack}
                data-testid="button-go-back"
              >
                <Undo2 className="w-5 h-5" />
              </Button>
            )}
            <span className="text-xl font-bold text-warm-gray dark:text-[#F8FAFC]">
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
          </div>
        </div>
        
        <CelestialProgressTracker
          currentQuestion={currentIndex + 1}
          totalQuestions={questions.length}
          tier={tier}
          completedPhases={{
            energy: completedEnergy,
            superpower: completedSuperpower,
            mystery: completedMystery,
            checkpoint1: completedCheckpoint1,
            checkpoint2: completedCheckpoint2
          }}
        />
        
        <div className="max-w-md mx-auto mt-2 h-3 bg-gray-200 dark:bg-[#1E1E2E] rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full ${timerProgress < 30 ? "bg-red-500" : "bg-gradient-to-r from-terracotta to-dusty-blue"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timerProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-32 overflow-y-auto">
        <div className="relative w-full max-w-sm h-[min(480px,calc(100vh-220px))] min-h-[380px]">
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
                className={`w-full h-full ${currentQuestion.responseType === "slider" ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                style={{ x, rotate }}
                drag={isTimingOut || currentQuestion.responseType === "slider" ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
              >
                <div 
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl"
                  role="article"
                  aria-label={`Swipe left for ${currentQuestion.options[0]}, right for ${currentQuestion.options[1]}`}
                >
                  <div className="absolute inset-0 bg-white dark:bg-[#12121A]" />
                  
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
                      
                      <motion.h2 
                        key={`question-${currentIndex}`}
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: [1, 1.25, 1]
                        }}
                        transition={{ 
                          duration: 0.5,
                          times: [0, 0.3, 1],
                          ease: "easeOut"
                        }}
                        className={`text-3xl md:text-4xl font-bold quiz-question-text leading-tight ${promptColor}`}
                        data-testid="text-prompt"
                      >
                        {adjustQuestionWording(currentQuestion.prompt, moodEffects.questionTone)}
                      </motion.h2>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-4">
                      {currentQuestion.responseType === "slider" ? (
                        /* Slider UI for nuanced responses - improved readability */
                        (<div className="flex flex-col gap-5 px-2" data-onboarding="slider">
                          {/* Slider labels - larger text */}
                          <div className="flex justify-between gap-4">
                            <div className="flex-1 text-left">
                              <span className="text-base sm:text-lg font-semibold text-sage-green dark:text-sage-green/90 leading-tight block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                {currentQuestion.leftDesc}
                              </span>
                            </div>
                            <div className="flex-1 text-right">
                              <span className="text-base sm:text-lg font-semibold text-terracotta dark:text-terracotta/90 leading-tight block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                {currentQuestion.rightDesc}
                              </span>
                            </div>
                          </div>
                          {/* Slider track - larger thumb */}
                          <div className="relative py-2">
                            <input
                              type="range"
                              min="-2"
                              max="2"
                              step="1"
                              value={sliderValue}
                              onChange={(e) => setSliderValue(parseInt(e.target.value))}
                              disabled={isTimingOut || isAnyPopupActive}
                              className="w-full h-4 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-sage-green via-warm-gray/30 to-terracotta
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
                                [&::-moz-range-thumb]:w-10 [&::-moz-range-thumb]:h-10 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-xl [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing
                                disabled:opacity-50"
                              style={{
                                '--thumb-border-color': sliderValue < 0 ? '#7c9885' : sliderValue > 0 ? '#c97c5d' : '#9ca3af'
                              } as React.CSSProperties}
                              data-testid="slider-response"
                            />
                            
                            {/* Value indicator labels */}
                            <div className="flex justify-between mt-3 text-xs sm:text-sm font-medium text-warm-gray/70 dark:text-[#94A3B8]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                              <span>Strong</span>
                              <span>Slight</span>
                              <span>Neutral</span>
                              <span>Slight</span>
                              <span>Strong</span>
                            </div>
                          </div>
                          {/* Current value display - larger text */}
                          <motion.div 
                            className={`text-center py-4 px-6 rounded-2xl font-bold text-xl sm:text-2xl ${
                              sliderValue < -1 ? 'bg-sage-green/20 text-sage-green' :
                              sliderValue < 0 ? 'bg-sage-green/10 text-sage-green/80' :
                              sliderValue > 1 ? 'bg-terracotta/20 text-terracotta' :
                              sliderValue > 0 ? 'bg-terracotta/10 text-terracotta/80' :
                              'bg-warm-gray/10 text-warm-gray dark:text-[#94A3B8]'
                            }`}
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 0.2 }}
                            key={sliderValue}
                          >
                            {sliderValue === -2 && `Strongly: ${currentQuestion.options[0]}`}
                            {sliderValue === -1 && `Slightly: ${currentQuestion.options[0]}`}
                            {sliderValue === 0 && "Slide to choose"}
                            {sliderValue === 1 && `Slightly: ${currentQuestion.options[1]}`}
                            {sliderValue === 2 && `Strongly: ${currentQuestion.options[1]}`}
                          </motion.div>
                          {/* Confirm button for slider - larger */}
                          <Button
                            onClick={() => {
                              if (!isTimingOut && !isAnyPopupActive && sliderValue !== 0) {
                                const direction = sliderValue < 0 ? "left" : "right";
                                handleSwipe(direction, false, sliderValue);
                              }
                            }}
                            disabled={isTimingOut || isAnyPopupActive || sliderValue === 0}
                            className="w-full py-5 text-xl font-bold rounded-2xl disabled:opacity-40"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                            variant={sliderValue !== 0 ? "default" : "outline"}
                            data-testid="button-slider-confirm"
                          >
                            {sliderValue === 0 ? "Slide to choose" : "Confirm Choice"}
                          </Button>
                        </div>)
                      ) : (
                        /* Binary option buttons */
                        (<div data-onboarding="answers" className="flex flex-col gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97, rotate: -3 }}
                            onClick={() => !isTimingOut && !isAnyPopupActive && handleSwipe("left")}
                            onKeyDown={(e) => {
                              if ((e.key === "Enter" || e.key === " ") && !isTimingOut && !isAnyPopupActive) {
                                e.preventDefault();
                                handleSwipe("left");
                              }
                            }}
                            disabled={isTimingOut || isAnyPopupActive}
                            className="min-h-24 w-[90%] flex items-center gap-3 rounded-2xl bg-sage-green/10 dark:bg-sage-green/20 border-2 border-sage-green/30 hover:border-sage-green/60 focus:border-sage-green focus:ring-2 focus:ring-sage-green/50 transition-all px-5 py-4 disabled:opacity-50 -translate-x-3"
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
                            onClick={() => !isTimingOut && !isAnyPopupActive && handleSwipe("right")}
                            onKeyDown={(e) => {
                              if ((e.key === "Enter" || e.key === " ") && !isTimingOut && !isAnyPopupActive) {
                                e.preventDefault();
                                handleSwipe("right");
                              }
                            }}
                            disabled={isTimingOut || isAnyPopupActive}
                            className="min-h-24 w-[90%] flex items-center gap-3 rounded-2xl bg-terracotta/10 dark:bg-terracotta/20 border-2 border-terracotta/30 hover:border-terracotta/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/50 transition-all px-5 py-4 disabled:opacity-50 translate-x-3 self-end"
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
                        </div>)
                      )}
                    </div>
                    
                    {currentIndex === 0 && !showIntroOnboarding && (
                      <motion.div 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: hasInteracted ? 0 : 1 }}
                        className="text-center pt-2 text-xs text-warm-gray/50 dark:text-[#64748B]"
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
                    Take a breath, then try again
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <p className="text-center text-xs text-warm-gray/50 dark:text-[#64748B]">
            Tap, swipe, or use keyboard (Tab + Enter) to choose
          </p>
        </div>
      </footer>
      
      {(!isPaused || showIntroOnboarding) && quizPhase === "quiz" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-warm-charcoal dark:via-warm-charcoal/95"
        >
          <div className="max-w-sm mx-auto" data-onboarding="pause">
            <button
              onClick={togglePause}
              className="w-full py-3 px-6 rounded-xl bg-gray-100 dark:bg-[#12121A] hover:bg-gray-200 dark:hover:bg-[#1E1E2E] transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 dark:border-[#A78BFA]/20 shadow-sm"
              data-testid="button-pause"
            >
              <Pause className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tap to Pause
              </span>
            </button>
          </div>
        </motion.div>
      )}
      
      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/10 backdrop-blur-sm"
            onClick={() => togglePause()}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md mx-4 mb-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-[#0A0A0F] rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-[#A78BFA]/20">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Pause className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Quiz Paused
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-[#64748B]">
                        Take your time
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentIndex + 1}
                      <span className="text-gray-400 dark:text-gray-500">/{questions.length}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-sage-green hover:bg-sage-green/90 text-white font-semibold py-6 text-base"
                    onClick={() => togglePause()}
                    data-testid="button-resume"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-6 text-base"
                    onClick={onExit}
                    data-testid="button-exit-quiz"
                  >
                    Exit Quiz
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showIntroOnboarding && quizPhase === "quiz" && (
        <QuizOnboardingOverlay
          type="intro"
          onComplete={() => {
            sessionStorage.setItem("knowrole-onboarding-intro-done", "true");
            setShowIntroOnboarding(false);
            setIsPaused(false);
          }}
        />
      )}

      {showSliderOnboarding && quizPhase === "quiz" && (
        <QuizOnboardingOverlay
          type="slider"
          onComplete={() => {
            sessionStorage.setItem("knowrole-onboarding-slider-done", "true");
            setShowSliderOnboarding(false);
            setIsPaused(false);
          }}
        />
      )}
    </div>
  );
}
