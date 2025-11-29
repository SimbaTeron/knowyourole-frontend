import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, 
  Briefcase, TrendingUp, ChevronRight, Zap, Award, MapPin, Lightbulb, Flame,
  MessageCircle, Frown, Meh, Smile, Lock, Crown, Star, Gift, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { QuizScores } from "./Quiz";
import rolesData from "@/data/roles.json";
import { useToast } from "@/hooks/use-toast";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface APIScales {
  critical: { value: number; traits: string; quest: string };
  firstPrinciples: { value: number; traits: string; quest: string };
}

interface ResultsProps {
  scores: QuizScores;
  tier: string;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  sessionId?: string | null;
  apiScales?: APIScales | null;
  onRestart: () => void;
  onShare: () => void;
}

interface ScaleData {
  value: number;
  traits: string;
  quest: string;
}

interface PersonalityResult {
  mbtiType: string;
  mbtiLabel: string;
  mbtiDesc: string;
  discStyle: string;
  discLabel: string;
  discColor: string;
  discDesc: string;
  bigFiveProfile: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  bigFiveLabels: Record<string, { high: string; low: string }>;
  primaryRole: { title: string; salary: string; desc: string };
  secondaryRole: { title: string; salary: string; desc: string };
  spark: string;
  scales?: {
    critical: ScaleData;
    firstPrinciples: ScaleData;
  };
}

function findBestRoleMatch(mbtiType: string, discStyle: string, bigFive: { O: number; C: number; E: number; A: number; N: number }): { primary: { title: string; salary: string; desc: string }; secondary: { title: string; salary: string; desc: string } } {
  const roles = rolesData.roles as Record<string, { primary: { title: string; salary: string; desc: string }; secondary: { title: string; salary: string; desc: string } }>;
  
  const sortedTraits = Object.entries(bigFive).sort((a, b) => b[1] - a[1]);
  const highestTrait = sortedTraits[0][0].toLowerCase();
  const secondTrait = sortedTraits[1][0].toLowerCase();
  
  const roleKeys = [
    `${mbtiType.toLowerCase()}-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `${mbtiType.toLowerCase()}-${discStyle.toLowerCase()}-${secondTrait}-high`,
    `${mbtiType.toLowerCase()}-${highestTrait}-high`,
    
    `tech-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `ai-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `creative-${highestTrait}-high`,
    `artistic-${highestTrait}-high`,
    `trades-${discStyle.toLowerCase()}-${secondTrait}-high`,
    
    `healthcare-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `education-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `finance-${discStyle.toLowerCase()}-${secondTrait}-high`,
    `marketing-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `science-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `legal-${discStyle.toLowerCase()}-${secondTrait}-high`,
    `media-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `service-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `government-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `security-${discStyle.toLowerCase()}-${secondTrait}-high`,
    `outdoor-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `sports-${discStyle.toLowerCase()}-${highestTrait}-high`,
    `food-${highestTrait}-high`,
    `transport-${discStyle.toLowerCase()}-${secondTrait}-high`,
  ];

  for (const key of roleKeys) {
    if (roles[key]) {
      return roles[key];
    }
  }

  const fallbackKeys = [
    `${mbtiType.toLowerCase()}-c-o-high`,
    `${mbtiType.toLowerCase()}-d-o-high`,
    `${mbtiType.toLowerCase()}-s-o-high`,
    `${mbtiType.toLowerCase()}-i-o-high`,
  ];
  
  for (const key of fallbackKeys) {
    if (roles[key]) {
      return roles[key];
    }
  }

  return roles.default;
}

function calculateResult(scores: QuizScores): PersonalityResult {
  const mbti = scores.mbti;
  const mbtiType = [
    mbti.E > mbti.I ? "E" : "I",
    mbti.S > mbti.N ? "S" : "N",
    mbti.T > mbti.F ? "T" : "F",
    mbti.J > mbti.P ? "J" : "P",
  ].join("");

  const disc = scores.disc;
  const discEntries = Object.entries(disc) as [string, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const b5 = scores.bigFive;
  const normalize = (val: number) => Math.max(5, Math.min(95, 50 + val * 12));
  const bigFiveProfile = {
    O: normalize(b5.O),
    C: normalize(b5.C),
    E: normalize(b5.E),
    A: normalize(b5.A),
    N: normalize(b5.N),
  };

  const traits = rolesData.traitDescriptions;
  const mbtiInfo = traits.mbti[mbtiType as keyof typeof traits.mbti] || traits.mbti.INTP;
  const discInfo = traits.disc[primaryDisc as keyof typeof traits.disc] || traits.disc.D;

  const roleMatch = findBestRoleMatch(mbtiType, primaryDisc, bigFiveProfile);

  const bigFiveLabels: Record<string, { high: string; low: string }> = {};
  Object.entries(traits.bigFive).forEach(([key, value]) => {
    bigFiveLabels[key] = { high: value.high, low: value.low };
  });

  return {
    mbtiType,
    mbtiLabel: mbtiInfo.label,
    mbtiDesc: mbtiInfo.desc,
    discStyle: primaryDisc,
    discLabel: discInfo.label,
    discColor: discInfo.color,
    discDesc: discInfo.desc,
    bigFiveProfile,
    bigFiveLabels,
    primaryRole: roleMatch.primary,
    secondaryRole: roleMatch.secondary,
    spark: mbtiInfo.desc,
  };
}

const TRAIT_COLORS = {
  O: { bg: "bg-violet-500", text: "text-violet-600", fill: "rgba(139, 92, 246, 0.3)", border: "rgb(139, 92, 246)" },
  C: { bg: "bg-blue-500", text: "text-blue-600", fill: "rgba(59, 130, 246, 0.3)", border: "rgb(59, 130, 246)" },
  E: { bg: "bg-amber-500", text: "text-amber-600", fill: "rgba(245, 158, 11, 0.3)", border: "rgb(245, 158, 11)" },
  A: { bg: "bg-emerald-500", text: "text-emerald-600", fill: "rgba(16, 185, 129, 0.3)", border: "rgb(16, 185, 129)" },
  N: { bg: "bg-rose-500", text: "text-rose-600", fill: "rgba(244, 63, 94, 0.3)", border: "rgb(244, 63, 94)" },
};

const TRAIT_ICONS = {
  O: Sparkles,
  C: Target,
  E: Users,
  A: Heart,
  N: Brain,
};

const TRAIT_LABELS = {
  O: "Openness",
  C: "Conscientiousness", 
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

const FUN_MODE_ROASTS: Record<string, string> = {
  "INTJ": "The mastermind who plans world domination before breakfast.",
  "INTP": "Puzzle overlord! You debug life like it's source code.",
  "ENTJ": "You run meetings like a general commands an army.",
  "ENTP": "Devil's advocate with a PhD in 'Actually, what if...'",
  "INFJ": "The mystic who knows what you're feeling before you do.",
  "INFP": "Dreaming in color while the world insists on black and white.",
  "ENFJ": "The emotional cheerleader everyone needs but didn't ask for.",
  "ENFP": "A golden retriever in human form with 47 unfinished projects.",
  "ISTJ": "The reliable rock that schedules their spontaneity.",
  "ISFJ": "Guardian angel in disguise, passive-aggressively helpful.",
  "ESTJ": "CEO energy even when ordering coffee at Starbucks.",
  "ESFJ": "The host who remembers everyone's allergies and birthdays.",
  "ISTP": "Quietly fixing things while judging your technique.",
  "ISFP": "The artist who feels everything, especially deadlines.",
  "ESTP": "Living on the edge while texting and driving metaphorically.",
  "ESFP": "The party doesn't start until you arrive and overshare.",
};

const TRAIT_QUESTS: Record<string, { high: string; low: string }> = {
  "O": { 
    high: "Try a 5-minute creative break: doodle, write, or explore something new today.", 
    low: "Challenge yourself: pick one new thing to try this week, even something small." 
  },
  "C": { 
    high: "Reward yourself! Your planning is solid—take a guilt-free 10-min break.", 
    low: "Tiny win: write down 3 things to do tomorrow before bed tonight." 
  },
  "E": { 
    high: "Social energy high? Reach out to someone you haven't talked to in a while.", 
    low: "Recharge solo: 15 minutes of quiet time with no screens or obligations." 
  },
  "A": { 
    high: "You give so much—practice saying 'no' to one thing this week.", 
    low: "Empathy boost: genuinely ask someone how they're doing and listen." 
  },
  "N": { 
    high: "Feeling stressed? Try 2-minute box breathing: inhale 4s, hold 4s, exhale 4s.", 
    low: "Your calm is a superpower—help someone who seems overwhelmed today." 
  },
};

export default function Results({ scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, onRestart, onShare }: ResultsProps) {
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  
  const isTestPremium = new URLSearchParams(window.location.search).get('test_premium') === 'true';
  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium);
  
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const chartRef = useRef<ChartJS<"radar">>(null);
  const traitButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    const calculated = calculateResult(scores);
    if (apiScales) {
      calculated.scales = apiScales;
    }
    setResult(calculated);
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
    
    if (isTestPremium) {
      console.log('[DEV MODE] Premium features unlocked for testing via ?test_premium=true');
    }
  }, [scores, apiScales, isTestPremium]);

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    try {
      const productsRes = await fetch('/api/stripe/products');
      const productsData = await productsRes.json();
      
      const proProduct = productsData.products?.find((p: any) => 
        p.metadata?.tier === 'pro' || p.name === 'KnowRole Pro'
      );
      
      if (!proProduct || !proProduct.prices?.length) {
        throw new Error('Pro product not found');
      }
      
      const priceId = proProduct.prices[0].id;
      
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          sessionId: sessionId || undefined,
        }),
      });
      
      const checkoutData = await checkoutRes.json();
      
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const allFeedbackAnswered = resultsAccurate !== "" && questionsEngaging !== "" && wouldShare !== "" && suggestions.trim().length > 0;

  const handleShowFullResults = () => {
    if (!allFeedbackAnswered) return;
    
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const feedbackData = {
      q1_accurate: resultsAccurate,
      q2_engaging: questionsEngaging,
      q3_share: wouldShare,
      openText: suggestions,
      timestamp: new Date().toISOString()
    };
    console.log("Quick Path Feedback:", feedbackData);
    
    setDashboardStage("full");
  };

  const isDark = theme === "dark";
  const isRandom = theme === "random";

  const getChartColors = () => {
    if (isRandom) {
      return {
        fill: "rgba(245, 158, 11, 0.25)",
        border: "rgb(245, 158, 11)",
        point: "rgb(220, 38, 38)",
        gridColor: "rgba(139, 92, 246, 0.3)",
        tickColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
      };
    }
    if (isDark) {
      return {
        fill: "rgba(180, 83, 9, 0.3)",
        border: "rgb(180, 83, 9)",
        point: "rgb(245, 158, 11)",
        gridColor: "rgba(255,255,255,0.15)",
        tickColor: "rgba(255,255,255,0.7)",
      };
    }
    return {
      fill: "rgba(180, 83, 9, 0.2)",
      border: "rgb(180, 83, 9)",
      point: "rgb(139, 69, 19)",
      gridColor: "rgba(0,0,0,0.1)",
      tickColor: "rgba(0,0,0,0.7)",
    };
  };

  const chartColors = getChartColors();

  const handleTraitSelect = (trait: string, index: number) => {
    setSelectedTrait(selectedTrait === trait ? null : trait);
    setFocusedTraitIndex(index);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent, trait: string, index: number) => {
    const traitKeys = Object.keys(result?.bigFiveProfile || {});
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTraitSelect(trait, index);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % traitKeys.length;
      setFocusedTraitIndex(nextIndex);
      traitButtonsRef.current[nextIndex]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + traitKeys.length) % traitKeys.length;
      setFocusedTraitIndex(prevIndex);
      traitButtonsRef.current[prevIndex]?.focus();
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
          role="status"
          aria-label="Loading results"
        />
      </div>
    );
  }

  const sortedBigFive = Object.entries(result.bigFiveProfile)
    .sort((a, b) => b[1] - a[1]);
  const topTwoTraits = sortedBigFive.slice(0, 2);
  const topTrait = sortedBigFive[0];

  const radarData = {
    labels: Object.keys(result.bigFiveProfile).map(k => TRAIT_LABELS[k as keyof typeof TRAIT_LABELS]),
    datasets: [{
      label: "Your Profile",
      data: Object.values(result.bigFiveProfile),
      backgroundColor: chartColors.fill,
      borderColor: chartColors.border,
      borderWidth: 2,
      pointBackgroundColor: chartColors.point,
      pointBorderColor: chartColors.border,
      pointHoverBackgroundColor: chartColors.border,
      pointHoverBorderColor: "#fff",
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: shouldReduceMotion ? false as const : undefined,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: chartColors.tickColor,
          backdropColor: "transparent",
          font: { size: 10 },
        },
        grid: { color: chartColors.gridColor },
        angleLines: { color: chartColors.gridColor },
        pointLabels: {
          color: chartColors.tickColor,
          font: { size: 12, weight: 600 as const },
          callback: (label: string) => label,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => `${ctx.raw}%`,
        },
      },
    },
  };

  const discColorMap: Record<string, string> = {
    terracotta: "bg-terracotta text-white",
    amber: "bg-amber-500 text-black",
    "sage-green": "bg-sage-green text-white",
    "dusty-blue": "bg-dusty-blue text-white",
  };

  const traitKeys = Object.keys(result.bigFiveProfile);
  const isFull = dashboardStage === "full";

  const getQuests = () => {
    const quests: string[] = [];
    sortedBigFive.slice(0, 3).forEach(([trait, value]) => {
      const questData = TRAIT_QUESTS[trait];
      if (questData) {
        quests.push(value > 50 ? questData.high : questData.low);
      }
    });
    return quests;
  };

  const ToggleButton = ({ 
    value, 
    currentValue, 
    onChange, 
    variant = "default",
    children,
    testId 
  }: { 
    value: string; 
    currentValue: string; 
    onChange: (v: string) => void;
    variant?: "no" | "middle" | "yes" | "default";
    children: React.ReactNode;
    testId: string;
  }) => {
    const isSelected = currentValue === value;
    const baseClasses = "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      no: isSelected 
        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-2 ring-red-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20",
      middle: isSelected 
        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20",
      yes: isSelected 
        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-2 ring-green-400" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20",
      default: isSelected 
        ? "bg-terracotta/20 text-terracotta ring-2 ring-terracotta" 
        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-terracotta/10",
    };

    return (
      <button
        type="button"
        onClick={() => {
          onChange(value);
          if (navigator.vibrate) navigator.vibrate(20);
        }}
        className={`${baseClasses} ${variantClasses[variant]}`}
        aria-pressed={isSelected}
        data-testid={testId}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-36 bg-white dark:bg-gray-900">
      <header className="pt-10 pb-6 px-4 text-center">
        <motion.div
          initial={shouldReduceMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-dusty-blue mb-3"
        >
          <Trophy className="w-8 h-8 text-soft-cream" aria-hidden="true" />
        </motion.div>
        
        <motion.h1
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-warm-gray dark:text-soft-cream mb-2"
          data-testid="text-result-title"
        >
          {isFull ? "Your Personality Map" : "Your Quick Glimpse"}
        </motion.h1>
        
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-warm-gray/70 dark:text-soft-cream/60"
        >
          Based on your {scores.responses.length} path choices
        </motion.p>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-6">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden border-2 border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-terracotta font-medium mb-1 tracking-wide uppercase">Your Primary Role Match</p>
              <h3 className="text-2xl font-bold text-warm-gray dark:text-soft-cream mb-2" data-testid="text-primary-role">
                {result.primaryRole.title}
              </h3>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-green/10 text-sage-green mb-4">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm font-semibold">{result.primaryRole.salary}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mt-6">
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center px-4 py-5 rounded-2xl bg-terracotta/8 dark:bg-terracotta/15 border border-terracotta/20"
                >
                  <Brain className="w-6 h-6 text-terracotta mx-auto mb-2" />
                  <p className="text-xs text-terracotta font-semibold tracking-wide uppercase mb-1">MBTI {result.mbtiType}</p>
                  <p className="text-sm text-warm-gray dark:text-soft-cream leading-relaxed">
                    {result.mbtiDesc}
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center px-4 py-5 rounded-2xl bg-sage-green/8 dark:bg-sage-green/15 border border-sage-green/20"
                >
                  <Award className="w-6 h-6 text-sage-green mx-auto mb-2" />
                  <p className="text-xs text-sage-green font-semibold tracking-wide uppercase mb-1">DISC {result.discStyle}</p>
                  <p className="text-sm text-warm-gray dark:text-soft-cream leading-relaxed">
                    {result.discDesc}
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center px-4 py-5 rounded-2xl bg-dusty-blue/8 dark:bg-dusty-blue/15 border border-dusty-blue/20"
                >
                  {(() => {
                    const topTraitKey = topTrait[0] as keyof typeof TRAIT_ICONS;
                    const TopIcon = TRAIT_ICONS[topTraitKey];
                    const topValue = topTrait[1];
                    return (
                      <>
                        <TopIcon className="w-6 h-6 text-dusty-blue mx-auto mb-2" />
                        <p className="text-xs text-dusty-blue font-semibold tracking-wide uppercase mb-1">
                          Big Five {TRAIT_LABELS[topTraitKey]} {topValue}%
                        </p>
                        <p className="text-sm text-warm-gray dark:text-soft-cream leading-relaxed">
                          {topValue > 50 ? result.bigFiveLabels[topTrait[0]]?.high : result.bigFiveLabels[topTrait[0]]?.low}
                        </p>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="bg-white dark:bg-gray-800 border-terracotta/20">
            <CardContent className="p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 mb-2">
                <Brain className="w-5 h-5 text-terracotta" aria-hidden="true" />
              </div>
              <p className="text-xs text-warm-gray/60 dark:text-soft-cream/60 mb-1">MBTI Type</p>
              <p className="text-lg font-bold font-mono text-terracotta" data-testid="text-mbti">
                {result.mbtiType}
              </p>
              <p className="text-sm font-medium text-warm-gray dark:text-soft-cream">
                {result.mbtiLabel}
              </p>
            </CardContent>
          </Card>

          <Card className={`${discColorMap[result.discColor] || "bg-sage-green text-white"} border-0`}>
            <CardContent className="p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-2">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-xs opacity-70 mb-1">DISC Style</p>
              <p className="text-lg font-bold" data-testid="text-disc">
                {result.discLabel}
              </p>
              <p className="text-sm font-medium opacity-90">
                {result.discStyle}-type
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-2">Top Big Five Trait</p>
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = TRAIT_ICONS[topTrait[0] as keyof typeof TRAIT_ICONS];
                  const colors = TRAIT_COLORS[topTrait[0] as keyof typeof TRAIT_COLORS];
                  return (
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} text-white text-base`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold">{TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]}</span>
                      <span className="opacity-80 font-bold">{topTrait[1]}%</span>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {!isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/10 mb-3">
                    <MessageCircle className="w-6 h-6 text-terracotta" />
                  </div>
                  <h3 className="text-lg font-bold text-warm-gray dark:text-soft-cream">
                    Complete for More Free Insights!
                  </h3>
                  <p className="text-sm text-warm-gray/60 dark:text-soft-cream/50 mt-1">
                    Answer 3 quick questions to unlock your full dashboard
                  </p>
                </div>

                <div className="space-y-5">
                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                        Results feel accurate?
                      </legend>
                    </Label>
                    <div 
                      className="flex justify-between w-full gap-2" 
                      role="radiogroup"
                      aria-label="Rate results accuracy"
                    >
                      <ToggleButton 
                        value="no" 
                        currentValue={resultsAccurate} 
                        onChange={setResultsAccurate}
                        variant="no"
                        testId="toggle-accurate-no"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Frown className="w-4 h-4" />
                          No
                        </span>
                      </ToggleButton>
                      <ToggleButton 
                        value="so-so" 
                        currentValue={resultsAccurate} 
                        onChange={setResultsAccurate}
                        variant="middle"
                        testId="toggle-accurate-soso"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Meh className="w-4 h-4" />
                          So-so
                        </span>
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={resultsAccurate} 
                        onChange={setResultsAccurate}
                        variant="yes"
                        testId="toggle-accurate-yes"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Smile className="w-4 h-4" />
                          Yes!
                        </span>
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                        Questions engaging?
                      </legend>
                    </Label>
                    <div 
                      className="flex justify-between w-full gap-2" 
                      role="radiogroup"
                      aria-label="Rate question engagement"
                    >
                      <ToggleButton 
                        value="no" 
                        currentValue={questionsEngaging} 
                        onChange={setQuestionsEngaging}
                        variant="no"
                        testId="toggle-engaging-no"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Frown className="w-4 h-4" />
                          No
                        </span>
                      </ToggleButton>
                      <ToggleButton 
                        value="so-so" 
                        currentValue={questionsEngaging} 
                        onChange={setQuestionsEngaging}
                        variant="middle"
                        testId="toggle-engaging-soso"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Meh className="w-4 h-4" />
                          So-so
                        </span>
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={questionsEngaging} 
                        onChange={setQuestionsEngaging}
                        variant="yes"
                        testId="toggle-engaging-yes"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Smile className="w-4 h-4" />
                          Yes!
                        </span>
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="text-sm font-medium text-warm-gray dark:text-soft-cream mb-3">
                        Would share with a friend?
                      </legend>
                    </Label>
                    <div 
                      className="flex justify-between w-full gap-2" 
                      role="radiogroup"
                      aria-label="Would you share"
                    >
                      <ToggleButton 
                        value="no" 
                        currentValue={wouldShare} 
                        onChange={setWouldShare}
                        variant="no"
                        testId="toggle-share-no"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Frown className="w-4 h-4" />
                          No
                        </span>
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={wouldShare} 
                        onChange={setWouldShare}
                        variant="yes"
                        testId="toggle-share-yes"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Smile className="w-4 h-4" />
                          Yes!
                        </span>
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="suggestions" 
                      className="text-sm font-medium text-warm-gray dark:text-soft-cream"
                    >
                      Suggestions for improvement?
                    </Label>
                    <Textarea
                      id="suggestions"
                      placeholder="Suggestions for improvement? (Timing, design, etc.)"
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className="resize-none text-sm"
                      data-testid="textarea-suggestions"
                    />
                    <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 text-right">
                      {suggestions.length}/1000
                    </p>
                  </div>

                  <Button
                    onClick={handleShowFullResults}
                    disabled={!allFeedbackAnswered}
                    className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 text-base font-semibold"
                    data-testid="button-show-full-results"
                  >
                    {allFeedbackAnswered ? "Show Full Results" : "Complete all fields to continue"}
                  </Button>
                  
                  {!allFeedbackAnswered && (
                    <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40">
                      All fields required to unlock full dashboard
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 text-center mb-2">
                      Or provide detailed feedback via our form
                    </p>
                    <div className="rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                      <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSfKnowRoleFeedback/viewform?embedded=true"
                        width="100%"
                        height="400"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        title="Feedback Form"
                        className="w-full"
                        data-testid="iframe-google-form"
                      >
                        Loading feedback form...
                      </iframe>
                    </div>
                    <p className="text-xs text-warm-gray/40 dark:text-soft-cream/30 text-center mt-2">
                      Anon/email opt-in available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {isFull && (
            <>
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-terracotta" aria-hidden="true" />
                      Full Big Five Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div 
                      className="w-full aspect-square max-w-[280px] mx-auto"
                      role="img"
                      aria-label={`Big Five personality radar chart: ${traitKeys.map(k => `${TRAIT_LABELS[k as keyof typeof TRAIT_LABELS]} ${result.bigFiveProfile[k as keyof typeof result.bigFiveProfile]}%`).join(", ")}`}
                    >
                      <Radar ref={chartRef} data={radarData} options={radarOptions} />
                    </div>
                    
                    <div 
                      className="flex flex-wrap justify-center gap-2 mt-4"
                      role="group"
                      aria-label="Select a trait to learn more"
                    >
                      {traitKeys.map((trait, index) => {
                        const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS];
                        const colors = TRAIT_COLORS[trait as keyof typeof TRAIT_COLORS];
                        const isSelected = selectedTrait === trait;
                        const value = result.bigFiveProfile[trait as keyof typeof result.bigFiveProfile];
                        
                        return (
                          <button
                            key={trait}
                            ref={el => traitButtonsRef.current[index] = el}
                            onClick={() => handleTraitSelect(trait, index)}
                            onKeyDown={(e) => handleTraitKeyDown(e, trait, index)}
                            tabIndex={focusedTraitIndex === -1 ? (index === 0 ? 0 : -1) : (focusedTraitIndex === index ? 0 : -1)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected 
                                ? `${colors.bg} text-white ring-2 ring-offset-2 ring-${colors.bg}` 
                                : `bg-gray-100 dark:bg-gray-700 ${colors.text} hover:scale-105`
                            }`}
                            aria-pressed={isSelected}
                            aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} petal ${value}%. ${isSelected ? "Selected" : "Click to learn more"}`}
                            data-testid={`button-trait-${trait.toLowerCase()}`}
                          >
                            <Icon className="w-3 h-3" aria-hidden="true" />
                            <span>{TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}</span>
                            <span className="opacity-70">{value}%</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedTrait && (
                      <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                        className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                        role="region"
                        aria-live="polite"
                        aria-label={`${TRAIT_LABELS[selectedTrait as keyof typeof TRAIT_LABELS]} details`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const Icon = TRAIT_ICONS[selectedTrait as keyof typeof TRAIT_ICONS];
                            const colors = TRAIT_COLORS[selectedTrait as keyof typeof TRAIT_COLORS];
                            return (
                              <>
                                <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                                  <Icon className="w-3 h-3 text-white" aria-hidden="true" />
                                </div>
                                <span className="font-semibold text-warm-gray dark:text-soft-cream">
                                  {TRAIT_LABELS[selectedTrait as keyof typeof TRAIT_LABELS]}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70">
                          {result.bigFiveProfile[selectedTrait as keyof typeof result.bigFiveProfile] > 50
                            ? result.bigFiveLabels[selectedTrait]?.high
                            : result.bigFiveLabels[selectedTrait]?.low}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
                      Growth Quests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    {getQuests().map((quest, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-600 dark:text-amber-300 text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{quest}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {funMode && FUN_MODE_ROASTS[result.mbtiType] && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 border-violet-200 dark:border-violet-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Fun Mode Roast</span>
                      </div>
                      <p className="text-sm text-violet-900 dark:text-violet-100 italic">
                        "{FUN_MODE_ROASTS[result.mbtiType]}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {result.scales && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        Thinking Scales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-4">
                      <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                            Critical Thinking
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {result.scales.critical.value}/5
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  className={`w-3.5 h-3.5 ${
                                    n <= result.scales!.critical.value
                                      ? "text-indigo-500 fill-indigo-500"
                                      : "text-indigo-200 dark:text-indigo-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                          {result.scales.critical.traits}
                        </p>
                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1 italic">
                          Quest: {result.scales.critical.quest}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">
                            First Principles
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                              {result.scales.firstPrinciples.value}/5
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  className={`w-3.5 h-3.5 ${
                                    n <= result.scales!.firstPrinciples.value
                                      ? "text-cyan-500 fill-cyan-500"
                                      : "text-cyan-200 dark:text-cyan-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-cyan-700 dark:text-cyan-300">
                          {result.scales.firstPrinciples.traits}
                        </p>
                        <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1 italic">
                          Quest: {result.scales.firstPrinciples.quest}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-sage-green/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-sage-green/20 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-sage-green" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-sage-green font-medium mb-0.5">Also Consider</p>
                        <h4 className="text-base font-semibold text-warm-gray dark:text-soft-cream">
                          {result.secondaryRole.title}
                        </h4>
                        <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mt-1">
                          {result.secondaryRole.salary}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {landmark && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="bg-dusty-blue/10 dark:bg-dusty-blue/20 border-dusty-blue/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-dusty-blue" />
                      <p className="text-sm text-dusty-blue">
                        Your journey started near <span className="font-semibold">{landmark}</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700">
                  <CardContent className="p-5 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800/50 mb-3">
                      <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                      Unlock Deep Insights
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4 max-w-xs mx-auto">
                      Get comprehensive role analysis, personality evolution tracking, and expanded career matches.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-left">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-800/30">
                        <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">+2 Extra Role Matches</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Expanded career options</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-800/30">
                        <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Deep Dive Analysis</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Why you fit each role</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-800/30">
                        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Arc Tracker</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Personality over time</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-100/50 dark:bg-amber-800/30">
                        <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Retest Versions</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">Compare your growth</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8"
                      onClick={handleUpgrade}
                      disabled={isCheckingOut}
                      data-testid="button-upgrade"
                    >
                      {isCheckingOut ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Unlock for $9 One-Time
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-3">
                      No subscription. Access forever. Support indie development.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRestart}
            data-testid="button-restart"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <Button
            className="flex-1 bg-terracotta hover:bg-terracotta/90"
            onClick={onShare}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </footer>
    </div>
  );
}
