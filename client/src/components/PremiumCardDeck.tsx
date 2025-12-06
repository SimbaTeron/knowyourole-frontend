import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, PanInfo } from "framer-motion";
import { 
  BookOpen, Shield, DollarSign, Target, Brain, Gift, Crown,
  Lightbulb, CheckCircle2, ArrowRight, Star, Zap, Flame, ChevronLeft, ChevronRight,
  RotateCw, Play, Pause, Clock, Sparkles, TrendingUp, Eye, EyeOff, GripHorizontal,
  MessageSquare, Heart, Users, Compass
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  getRandomQuestions, 
  getAdaptiveQuestions, 
  ThinkingQuestion, 
  CategoryProgressMap, 
  initCategoryProgress,
  updateCategoryProgress
} from "@/data/thinkingQuestions";

interface PremiumInsight {
  id: string;
  title: string;
  description: string;
}

interface SideHustleInsight extends PremiumInsight {
  incomeRange: string;
  timeCommitment: string;
  difficulty: string;
  tags: string;
}

interface BlindspotInsight extends PremiumInsight {
  actionTip: string;
  severity: string;
  targetTrait: string;
}

interface CareerPathInsight extends PremiumInsight {
  salaryRange: string;
  growthOutlook: string;
  industry: string;
}

interface GrowthTipInsight extends PremiumInsight {
  actionSteps: string;
  timeframe: string;
  difficulty: string;
  targetTrait: string;
}

interface StrengthInsight extends PremiumInsight {
  howToLeverage: string;
}

interface CommunicationStyleInsight extends PremiumInsight {
  tipsForOthers: string;
  tipsForSelf: string;
}

interface WorkEnvironmentInsight extends PremiumInsight {
  idealFor: string;
  challenges: string;
}

interface RelationshipInsight extends PremiumInsight {
  strengthsInRelationships: string;
  growthAreas: string;
  compatibilityNotes: string;
}

interface PremiumInsightsResponse {
  success: boolean;
  insights: {
    sideHustles: SideHustleInsight[];
    blindspots: BlindspotInsight[];
    careerPaths: CareerPathInsight[];
    growthTips: GrowthTipInsight[];
    strengths: StrengthInsight[];
    communicationStyles: CommunicationStyleInsight[];
    workEnvironments: WorkEnvironmentInsight[];
    relationshipInsights: RelationshipInsight[];
  };
}

interface PremiumCardDeckProps {
  result: {
    mbtiType: string;
    mbtiLabel: string;
    discStyle: string;
    discLabel: string;
    primaryRole: { title: string; salary: string; desc: string };
    secondaryRole: { title: string; salary: string; desc: string };
    bigFiveProfile: { O: number; C: number; E: number; A: number; N: number };
    scales?: {
      critical: { value: number; traits: string; quest: string };
      firstPrinciples: { value: number; traits: string; quest: string };
    };
  };
  topTrait: [string, number];
  weakestTrait: string;
  getWeaknessBlindspots: (mbtiType: string) => Array<{ title: string; blindspot: string; workaround: string; realWorld: string }>;
  CAREER_SIMULATOR: Record<string, { title: string; morningRoutine: string; afternoonTasks: string; eveningReflection: string; satisfaction: string; growth: string }>;
  SIDE_HUSTLES: Record<string, Array<{ name: string; fit: string; income: string; startupCost: string; timeCommit: string }>>;
  LEARNING_STYLES: Record<string, { style: string; description: string; bestFor: string[]; resources: string[]; tips: string[] }>;
  GROWTH_QUESTS: Record<string, { week1: string[]; week2: string[]; week3: string[]; week4: string[] }>;
  TRAIT_LABELS: Record<string, string>;
}

// Static color class mappings for Tailwind CSS compilation
const COLOR_CLASSES = {
  violet: {
    bg100: "bg-violet-100 dark:bg-violet-900/50",
    bg500: "bg-violet-500",
    border200: "border-violet-200 dark:border-violet-800",
    dotActive: "bg-violet-500 w-6",
    dotInactive: "bg-violet-200 dark:bg-violet-700",
  },
  amber: {
    bg100: "bg-amber-100 dark:bg-amber-900/50",
    bg500: "bg-amber-500",
    border200: "border-amber-200 dark:border-amber-800",
    dotActive: "bg-amber-500 w-6",
    dotInactive: "bg-amber-200 dark:bg-amber-700",
  },
  rose: {
    bg100: "bg-rose-100 dark:bg-rose-900/50",
    bg500: "bg-rose-500",
    border200: "border-rose-200 dark:border-rose-800",
    dotActive: "bg-rose-500 w-6",
    dotInactive: "bg-rose-200 dark:bg-rose-700",
  },
  sky: {
    bg100: "bg-sky-100 dark:bg-sky-900/50",
    bg500: "bg-sky-500",
    border200: "border-sky-200 dark:border-sky-800",
    dotActive: "bg-sky-500 w-6",
    dotInactive: "bg-sky-200 dark:bg-sky-700",
  },
  teal: {
    bg100: "bg-teal-100 dark:bg-teal-900/50",
    bg500: "bg-teal-500",
    border200: "border-teal-200 dark:border-teal-800",
    dotActive: "bg-teal-500 w-6",
    dotInactive: "bg-teal-200 dark:bg-teal-700",
  },
  emerald: {
    bg100: "bg-emerald-100 dark:bg-emerald-900/50",
    bg500: "bg-emerald-500",
    border200: "border-emerald-200 dark:border-emerald-800",
    dotActive: "bg-emerald-500 w-6",
    dotInactive: "bg-emerald-200 dark:bg-emerald-700",
  },
  indigo: {
    bg100: "bg-indigo-100 dark:bg-indigo-900/50",
    bg500: "bg-indigo-500",
    border200: "border-indigo-200 dark:border-indigo-800",
    dotActive: "bg-indigo-500 w-6",
    dotInactive: "bg-indigo-200 dark:bg-indigo-700",
  },
} as const;


type ColorKey = keyof typeof COLOR_CLASSES;

const CARD_CONFIGS = [
  { id: "deep-dive", title: "Deep Dive", icon: BookOpen, color: "violet" as ColorKey, gradient: "from-violet-400 via-purple-500 to-fuchsia-500" },
  { id: "role-matches", title: "Role Matches", icon: Gift, color: "amber" as ColorKey, gradient: "from-amber-400 via-orange-500 to-red-400" },
  { id: "blindspots", title: "Your Blindspots", icon: Shield, color: "rose" as ColorKey, gradient: "from-rose-400 via-pink-500 to-fuchsia-500" },
  { id: "side-hustle", title: "Side Hustles", icon: DollarSign, color: "amber" as ColorKey, gradient: "from-amber-400 via-yellow-500 to-orange-500" },
  { id: "learning", title: "How You Learn", icon: BookOpen, color: "teal" as ColorKey, gradient: "from-teal-400 via-cyan-500 to-emerald-500" },
  { id: "growth-quest", title: "30-Day Quest", icon: Target, color: "emerald" as ColorKey, gradient: "from-emerald-400 via-green-500 to-teal-500" },
  { id: "thinking", title: "Sharpen Thinking", icon: Brain, color: "indigo" as ColorKey, gradient: "from-indigo-400 via-blue-500 to-cyan-500" },
];

// LocalStorage key constants
const STORAGE_KEYS = {
  COMPLETED_CHALLENGES: 'knowrole-completed-challenges',
  SELECTED_WEEK: 'knowrole-selected-week',
  CURRENT_CARD: 'knowrole-current-card',
};

// Custom hook for localStorage-persisted Set
function usePersistedSet(key: string, defaultValue: Set<string> = new Set()): [Set<string>, (updater: (prev: Set<string>) => Set<string>) => void] {
  const [value, setValue] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
    }
    return defaultValue;
  });

  const setPersistedValue = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setValue(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn(`Failed to save ${key} to localStorage`, e);
      }
      return next;
    });
  }, [key]);

  return [value, setPersistedValue];
}

// Custom hook for localStorage-persisted value
function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
    }
    return defaultValue;
  });

  const setPersistedValue = useCallback((newValue: T) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }, [key]);

  return [value, setPersistedValue];
}

export function PremiumCardDeck({
  result,
  topTrait,
  weakestTrait,
  getWeaknessBlindspots,
  CAREER_SIMULATOR,
  SIDE_HUSTLES,
  LEARNING_STYLES,
  GROWTH_QUESTS,
  TRAIT_LABELS,
}: PremiumCardDeckProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interactive states for each card
  const [flippedBlindspots, setFlippedBlindspots] = useState<Set<number>>(new Set());
  const [selectedHustle, setSelectedHustle] = useState(0);
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [selectedQuestWeek, setSelectedQuestWeek] = usePersistedState<1 | 2 | 3 | 4>(STORAGE_KEYS.SELECTED_WEEK, 1);
  const [completedChallenges, setCompletedChallenges] = usePersistedSet(STORAGE_KEYS.COMPLETED_CHALLENGES);
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());
  const [expandedDeepDive, setExpandedDeepDive] = useState<Set<string>>(new Set());
  const [thinkingChallengeRevealed, setThinkingChallengeRevealed] = useState(false);
  const [thinkingAnswer, setThinkingAnswer] = useState<string | null>(null);

  // Fetch personalized premium insights from API
  const { data: premiumInsights } = useQuery<PremiumInsightsResponse>({
    queryKey: ['/api/premium-insights', result?.mbtiType, result?.discStyle],
    queryFn: async () => {
      const response = await fetch('/api/premium-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bigFive: result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 },
          mbtiType: result?.mbtiType,
          discStyle: result?.discStyle,
          ageTier: sessionStorage.getItem('knowrole-age-tier') || 'adult',
        }),
      });
      return response.json();
    },
    enabled: !!result?.bigFiveProfile,
    staleTime: 1000 * 60 * 5,
  });

  const goToCard = (index: number) => {
    setDirection(index > currentCard ? 1 : -1);
    setCurrentCard(index);
  };

  const nextCard = () => {
    if (currentCard < CARD_CONFIGS.length - 1) {
      setDirection(1);
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(currentCard - 1);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentCard < CARD_CONFIGS.length - 1) {
      nextCard();
    } else if (info.offset.x > threshold && currentCard > 0) {
      prevCard();
    }
  };

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  // Get side hustles data
  const getSideHustles = () => {
    const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    let hustleKey = "default";
    if (bigFive.O > 65) hustleKey = "creative-high";
    else if (bigFive.C > 65) hustleKey = "analytical-high";
    else if (bigFive.E > 65) hustleKey = "people-high";
    else if (bigFive.E < 40 && bigFive.C > 50) hustleKey = "hands-on-high";
    return SIDE_HUSTLES[hustleKey] || SIDE_HUSTLES["default"];
  };

  // Get learning style
  const getLearningStyle = () => {
    const mbti = result?.mbtiType || "INTJ";
    const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    let styleKey = "logical-sequential";
    if (mbti.includes("S") && mbti.includes("P")) styleKey = "visual-kinesthetic";
    else if (mbti.includes("E") && mbti.includes("F")) styleKey = "auditory-social";
    else if (mbti.includes("I") && bigFive.O > 60) styleKey = "reading-writing";
    return LEARNING_STYLES[styleKey];
  };

  // Render individual cards
  const renderCardContent = (cardId: string) => {
    switch (cardId) {
      case "deep-dive":
        return <DeepDiveCard 
          result={result} 
          topTrait={topTrait}
          expandedSections={expandedDeepDive}
          toggleSection={(id) => {
            const newSet = new Set(expandedDeepDive);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setExpandedDeepDive(newSet);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "role-matches":
        return <RoleMatchesCard 
          result={result}
          apiCareerPaths={premiumInsights?.insights?.careerPaths || []}
          expandedRoles={expandedRoles}
          toggleRole={(idx) => {
            const newSet = new Set(expandedRoles);
            if (newSet.has(idx)) newSet.delete(idx);
            else newSet.add(idx);
            setExpandedRoles(newSet);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "blindspots":
        return <BlindSpotsCard 
          blindspots={getWeaknessBlindspots(result?.mbtiType || "INTJ")}
          apiBlindspots={premiumInsights?.insights?.blindspots || []}
          flippedCards={flippedBlindspots}
          toggleFlip={(idx) => {
            const newSet = new Set(flippedBlindspots);
            if (newSet.has(idx)) newSet.delete(idx);
            else newSet.add(idx);
            setFlippedBlindspots(newSet);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "side-hustle":
        return <SideHustleCard 
          hustles={getSideHustles()}
          apiHustles={premiumInsights?.insights?.sideHustles || []}
          selectedIndex={selectedHustle}
          setSelectedIndex={setSelectedHustle}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "learning":
        return <LearningStyleCard 
          style={getLearningStyle()}
          expandedTips={expandedTips}
          toggleTip={(idx) => {
            const newSet = new Set(expandedTips);
            if (newSet.has(idx)) newSet.delete(idx);
            else newSet.add(idx);
            setExpandedTips(newSet);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "growth-quest":
        return <GrowthQuestCard 
          weakestTrait={weakestTrait}
          GROWTH_QUESTS={GROWTH_QUESTS}
          TRAIT_LABELS={TRAIT_LABELS}
          apiGrowthTips={premiumInsights?.insights?.growthTips || []}
          selectedWeek={selectedQuestWeek}
          setSelectedWeek={setSelectedQuestWeek}
          completedChallenges={completedChallenges}
          toggleChallenge={(id) => {
            const wasCompleted = completedChallenges.has(id);
            setCompletedChallenges((prev) => {
              const newSet = new Set(prev);
              if (newSet.has(id)) newSet.delete(id);
              else newSet.add(id);
              return newSet;
            });
            if (!wasCompleted && navigator.vibrate) navigator.vibrate(30);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "thinking":
        // Determine weak proxy to prioritize in Sharpen Thinking
        const criticalValue = result?.scales?.critical?.value || 3;
        const firstPrinciplesValue = result?.scales?.firstPrinciples?.value || 3;
        const weakProxy = criticalValue < firstPrinciplesValue ? 'critical' : 
                          firstPrinciplesValue < criticalValue ? 'firstPrinciples' : null;
        return <ThinkingCard 
          reduceMotion={shouldReduceMotion ?? false}
          weakProxy={weakProxy}
        />;
      
      default:
        return null;
    }
  };

  const currentConfig = CARD_CONFIGS[currentCard];

  return (
    <div className="relative" ref={containerRef}>
      {/* Header with card navigation dots */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-2 rounded-lg ${COLOR_CLASSES[currentConfig.color].bg100}`}>
            <currentConfig.icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-warm-gray dark:text-soft-cream">
            {currentConfig.title}
          </h4>
          <span className="text-sm sm:text-base text-warm-gray/50 dark:text-soft-cream/40">
            {currentCard + 1}/{CARD_CONFIGS.length}
          </span>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={prevCard}
            disabled={currentCard === 0}
            data-testid="button-prev-card"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={nextCard}
            disabled={currentCard === CARD_CONFIGS.length - 1}
            data-testid="button-next-card"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Card deck */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCard}
            custom={direction}
            variants={shouldReduceMotion ? {} : cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <Card className={`bg-white dark:bg-gray-800 ${COLOR_CLASSES[currentConfig.color].border200} overflow-hidden shadow-lg`}>
              <div className={`h-1.5 bg-gradient-to-r ${currentConfig.gradient}`} />
              <CardContent className="p-5">
                {renderCardContent(currentConfig.id)}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Swipe hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-warm-gray/40 dark:text-soft-cream/30">
          <GripHorizontal className="w-4 h-4" />
          <span>Swipe or tap arrows</span>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-4">
        {CARD_CONFIGS.map((config, idx) => (
          <button
            key={config.id}
            onClick={() => goToCard(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentCard
                ? COLOR_CLASSES[config.color].dotActive
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            data-testid={`dot-${config.id}`}
            aria-label={`Go to ${config.title}`}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== INDIVIDUAL CARD COMPONENTS ====================

// Deep Dive Card - Collapsible sections
function DeepDiveCard({ 
  result, 
  topTrait,
  expandedSections,
  toggleSection,
  reduceMotion
}: { 
  result: PremiumCardDeckProps['result']; 
  topTrait: [string, number];
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
  reduceMotion: boolean;
}) {
  const sections = [
    {
      id: "why",
      title: `Why ${result?.primaryRole.title}?`,
      content: `Your ${result?.mbtiType} personality type reveals a natural inclination toward ${result?.mbtiType.includes('N') ? 'abstract thinking and future possibilities' : 'practical solutions and concrete details'}. Combined with your ${result?.discLabel} DISC profile, you bring a unique blend of strengths.`
    },
    {
      id: "bigfive",
      title: "Your Big Five Profile",
      content: `Your profile shows strong ${topTrait[0].toLowerCase()} (${topTrait[1]}%), suggesting you ${topTrait[1] > 60 ? 'naturally excel in environments that leverage this trait' : 'can develop this area further with the right opportunities'}.`
    },
    {
      id: "environment",
      title: "Ideal Work Environment",
      content: `People with your combination typically thrive when given ${result?.mbtiType.includes('E') ? 'collaborative projects and team leadership opportunities' : 'focused time and space to develop deep expertise'}.`
    }
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-2">
        Tap each section to explore your personality insights
      </p>
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800 overflow-hidden"
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-violet-100/50 dark:hover:bg-violet-800/30 transition-colors"
            data-testid={`toggle-${section.id}`}
          >
            <span className="font-semibold text-violet-800 dark:text-violet-200 text-sm">{section.title}</span>
            <div className={`transform transition-transform ${reduceMotion ? '' : 'duration-200'} ${expandedSections.has(section.id) ? 'rotate-90' : ''}`}>
              <ChevronRight className="w-4 h-4 text-violet-500" />
            </div>
          </button>
          {expandedSections.has(section.id) && (
            <div className="overflow-hidden">
              <p className="px-4 pb-4 text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed">
                {section.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Role display type
interface DisplayRole {
  title: string | undefined;
  salary: string | undefined;
  desc: string | undefined;
  icon: typeof Star;
  fit: number;
  industry?: string;
  growthOutlook?: string;
}

// Role Matches Card - Expandable chips
function RoleMatchesCard({ 
  result,
  apiCareerPaths = [],
  expandedRoles,
  toggleRole,
  reduceMotion
}: { 
  result: PremiumCardDeckProps['result'];
  apiCareerPaths?: CareerPathInsight[];
  expandedRoles: Set<number>;
  toggleRole: (idx: number) => void;
  reduceMotion: boolean;
}) {
  const hasApiData = apiCareerPaths.length > 0;
  
  // Static fallback roles
  const staticRoles: DisplayRole[] = [
    {
      title: result?.mbtiType.includes('N') ? 'Innovation Strategist' : 'Operations Specialist',
      salary: result?.mbtiType.includes('N') ? '$70K-130K' : '$55K-95K',
      desc: result?.mbtiType.includes('N') 
        ? 'Your intuitive thinking makes you excellent at spotting trends and developing creative solutions.'
        : 'Your practical approach makes you ideal for streamlining processes and ensuring quality.',
      icon: Sparkles,
      fit: result?.mbtiType.includes('N') ? 95 : 88
    },
    {
      title: result?.discStyle === 'I' || result?.discStyle === 'D' ? 'Team Lead' : 'Technical Specialist',
      salary: result?.discStyle === 'I' || result?.discStyle === 'D' ? '$60K-110K' : '$65K-120K',
      desc: result?.discStyle === 'I' || result?.discStyle === 'D'
        ? 'Your natural ability to energize others positions you well for leadership roles.'
        : 'Your methodical approach makes you invaluable in technical roles requiring deep expertise.',
      icon: TrendingUp,
      fit: result?.discStyle === 'I' || result?.discStyle === 'D' ? 92 : 90
    },
    {
      title: result?.primaryRole?.title,
      salary: result?.primaryRole?.salary,
      desc: result?.primaryRole?.desc,
      icon: Star,
      fit: 98
    }
  ];
  
  // Map API career paths to roles format
  const apiRoles: DisplayRole[] = hasApiData 
    ? apiCareerPaths.slice(0, 3).map((path, idx) => ({
        title: path.title,
        salary: path.salaryRange,
        desc: path.description,
        icon: idx === 0 ? Star : idx === 1 ? TrendingUp : Sparkles,
        fit: 95 - (idx * 3), // Best match first
        industry: path.industry,
        growthOutlook: path.growthOutlook,
      }))
    : [];
  
  const roles: DisplayRole[] = hasApiData ? apiRoles : staticRoles;

  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-2">
        {hasApiData ? "Personalized career matches for your profile" : "Tap a role to see why it matches your personality"}
      </p>
      {roles.map((role, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 overflow-hidden"
        >
          <button
            onClick={() => toggleRole(idx)}
            className="w-full p-4 hover:bg-amber-100/50 dark:hover:bg-amber-800/30 transition-colors"
            data-testid={`toggle-role-${idx}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <role.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-warm-gray dark:text-soft-cream text-sm">{role.title}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{role.salary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                  {role.fit}% match
                </span>
              </div>
            </div>
          </button>
          {expandedRoles.has(idx) && (
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-2 border-t border-amber-100 dark:border-amber-800">
                <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed mb-2">
                  {role.desc}
                </p>
                {role.industry && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {role.industry}
                    </span>
                    {role.growthOutlook && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        role.growthOutlook === 'high' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                        role.growthOutlook === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {role.growthOutlook} growth
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Unified blindspot display type
interface DisplayBlindspot {
  title: string;
  blindspot: string;
  workaround: string;
  realWorld: string;
  severity?: string;
}

// Blindspots Card - Flip cards with API data
function BlindSpotsCard({ 
  blindspots,
  apiBlindspots = [],
  flippedCards,
  toggleFlip,
  reduceMotion
}: { 
  blindspots: Array<{ title: string; blindspot: string; workaround: string; realWorld: string }>;
  apiBlindspots?: BlindspotInsight[];
  flippedCards: Set<number>;
  toggleFlip: (idx: number) => void;
  reduceMotion: boolean;
}) {
  // Combine API blindspots with static data fallback
  const displayBlindspots: DisplayBlindspot[] = apiBlindspots.length > 0
    ? apiBlindspots.map(b => ({
        title: b.title,
        blindspot: b.description,
        workaround: b.actionTip,
        realWorld: `Focus on improving your ${b.targetTrait === 'O' ? 'openness' : b.targetTrait === 'C' ? 'consistency' : b.targetTrait === 'E' ? 'social energy' : b.targetTrait === 'A' ? 'empathy' : 'emotional balance'}`,
        severity: b.severity,
      }))
    : blindspots;

  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-2 flex items-center gap-2">
        <RotateCw className="w-3 h-3" />
        {apiBlindspots.length > 0 ? "Your personalized blindspots - tap to reveal solutions" : "Tap each card to reveal the solution"}
      </p>
      {displayBlindspots.map((item, idx) => (
        <div
          key={idx}
          onClick={() => toggleFlip(idx)}
          className="cursor-pointer perspective-1000"
          data-testid={`flip-blindspot-${idx}`}
        >
          <div
            className={`relative h-32 preserve-3d ${reduceMotion ? '' : 'transition-transform duration-500'}`}
            style={{ 
              transformStyle: "preserve-3d",
              transform: flippedCards.has(idx) ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front - The Blindspot */}
            <div 
              className="absolute inset-0 backface-hidden rounded-xl p-4 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 border border-rose-200 dark:border-rose-700"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h6 className="text-sm font-bold text-rose-800 dark:text-rose-200">{item.title}</h6>
                    {item.severity && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.severity === 'high' ? 'bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        item.severity === 'medium' ? 'bg-amber-200 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                        'bg-green-200 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{item.blindspot}</p>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-rose-400 dark:text-rose-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Tap to flip
              </div>
            </div>
            
            {/* Back - The Solution */}
            <div 
              className="absolute inset-0 backface-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-700"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h6 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-1">The Fix</h6>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed mb-2">{item.workaround}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">Try: {item.realWorld}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Unified hustle display type
interface DisplayHustle {
  name: string;
  fit: string;
  income: string;
  startupCost: string;
  timeCommit: string;
  tags?: string;
}

// Side Hustle Card - Mini carousel with API data
function SideHustleCard({ 
  hustles,
  apiHustles = [],
  selectedIndex,
  setSelectedIndex,
  reduceMotion
}: { 
  hustles: Array<{ name: string; fit: string; income: string; startupCost: string; timeCommit: string }>;
  apiHustles?: SideHustleInsight[];
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  reduceMotion: boolean;
}) {
  // Combine API hustles with static data fallback
  const displayHustles: DisplayHustle[] = apiHustles.length > 0 
    ? apiHustles.map(h => ({
        name: h.title,
        fit: h.description,
        income: h.incomeRange,
        startupCost: h.difficulty === "beginner" ? "$0-100" : h.difficulty === "intermediate" ? "$100-500" : "$500+",
        timeCommit: h.timeCommitment,
        tags: h.tags,
      }))
    : hustles.map(h => ({ ...h, tags: undefined }));

  const nextHustle = () => {
    setSelectedIndex((selectedIndex + 1) % displayHustles.length);
  };

  const prevHustle = () => {
    setSelectedIndex((selectedIndex - 1 + displayHustles.length) % displayHustles.length);
  };

  const currentHustle = displayHustles[selectedIndex] || displayHustles[0];

  return (
    <div className="space-y-4">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
        {apiHustles.length > 0 ? "Personalized" : "Extra"} income ideas matched to your traits
      </p>

      {/* Carousel controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevHustle} data-testid="prev-hustle">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex gap-1.5">
          {displayHustles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-2 h-2 rounded-full ${reduceMotion ? '' : 'transition-all'} ${
                idx === selectedIndex ? 'bg-amber-500 w-4' : 'bg-amber-200 dark:bg-amber-700'
              }`}
              data-testid={`hustle-dot-${idx}`}
            />
          ))}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextHustle} data-testid="next-hustle">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Hustle card */}
      <div
        key={selectedIndex}
        className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800"
      >
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-lg font-bold text-amber-800 dark:text-amber-200">{currentHustle.name}</h6>
          <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
            {currentHustle.income}
          </span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4 leading-relaxed">{currentHustle.fit}</p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-warm-gray/70 dark:text-soft-cream/60">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Startup: {currentHustle.startupCost}</span>
          </div>
          <div className="flex items-center gap-1.5 text-warm-gray/70 dark:text-soft-cream/60">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentHustle.timeCommit}</span>
          </div>
        </div>
        {/* Tags from API */}
        {currentHustle.tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {currentHustle.tags.split(',').slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Learning Style Card - Expandable tips
function LearningStyleCard({ 
  style, 
  expandedTips,
  toggleTip,
  reduceMotion
}: { 
  style: { style: string; description: string; bestFor: string[]; resources: string[]; tips: string[] };
  expandedTips: Set<number>;
  toggleTip: (idx: number) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800">
        <h6 className="text-lg font-bold text-teal-800 dark:text-teal-200 mb-2">{style?.style}</h6>
        <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">{style?.description}</p>
      </div>

      {/* Best For section */}
      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30">
        <h6 className="text-xs font-bold text-teal-800 dark:text-teal-200 uppercase mb-2">Best For</h6>
        <div className="flex flex-wrap gap-2">
          {style?.bestFor.slice(0, 4).map((item, idx) => (
            <span key={idx} className="text-xs bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full border border-teal-200 dark:border-teal-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable tips */}
      <div className="space-y-2">
        <h6 className="text-xs font-bold text-teal-800 dark:text-teal-200 uppercase">Try These Tips</h6>
        {style?.tips.slice(0, 3).map((tip, idx) => (
          <button
            key={idx}
            onClick={() => toggleTip(idx)}
            className={`w-full p-3 rounded-xl text-left ${reduceMotion ? '' : 'transition-all'} ${
              expandedTips.has(idx)
                ? 'bg-teal-100 dark:bg-teal-900/40'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20'
            }`}
            data-testid={`toggle-tip-${idx}`}
          >
            <div className="flex items-start gap-2">
              <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${expandedTips.has(idx) ? 'text-amber-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${expandedTips.has(idx) ? 'text-teal-800 dark:text-teal-200' : 'text-warm-gray dark:text-soft-cream'}`}>
                {tip}
              </p>
            </div>
            {expandedTips.has(idx) && (
              <div className="mt-2 ml-6 text-xs text-teal-600 dark:text-teal-400">
                Start practicing this today for better learning outcomes!
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Week theme descriptions for each week
const WEEK_THEMES: Record<number, { title: string; focus: string }> = {
  1: { title: "Foundation", focus: "Start with quick wins" },
  2: { title: "Build Habits", focus: "Create momentum" },
  3: { title: "Deep Practice", focus: "Challenge yourself" },
  4: { title: "Integration", focus: "Make it permanent" },
};

// Trait improvement descriptions
const TRAIT_IMPROVEMENTS: Record<string, { icon: string; improvement: string }> = {
  "O": { icon: "Creativity", improvement: "Expanding your horizons and embracing new experiences" },
  "C": { icon: "Focus", improvement: "Building discipline and achieving your goals" },
  "E": { icon: "Connection", improvement: "Growing your social skills and relationships" },
  "A": { icon: "Kindness", improvement: "Strengthening empathy and cooperation" },
  "N": { icon: "Calm", improvement: "Building emotional resilience and inner peace" },
};

// Growth Quest Card - Tappable calendar with personality-based improvements
function GrowthQuestCard({ 
  weakestTrait,
  GROWTH_QUESTS,
  TRAIT_LABELS,
  apiGrowthTips = [],
  selectedWeek,
  setSelectedWeek,
  completedChallenges,
  toggleChallenge,
  reduceMotion
}: { 
  weakestTrait: string;
  GROWTH_QUESTS: Record<string, { week1: string[]; week2: string[]; week3: string[]; week4: string[] }>;
  TRAIT_LABELS: Record<string, string>;
  apiGrowthTips?: GrowthTipInsight[];
  selectedWeek: 1 | 2 | 3 | 4;
  setSelectedWeek: (week: 1 | 2 | 3 | 4) => void;
  completedChallenges: Set<string>;
  toggleChallenge: (id: string) => void;
  reduceMotion: boolean;
}) {
  // Use API growth tips if available, otherwise use static data
  const hasApiData = apiGrowthTips.length > 0;
  
  const quests = GROWTH_QUESTS[weakestTrait] || GROWTH_QUESTS["O"];
  const weekKey = `week${selectedWeek}` as keyof typeof quests;
  const staticChallenges = quests[weekKey] || [];
  
  // Map API data to challenges format - group by week based on timeframe and difficulty
  const apiChallenges = hasApiData 
    ? apiGrowthTips
        .filter(tip => {
          // Assign tips to weeks based on timeframe and difficulty
          if (selectedWeek === 1) return tip.timeframe.toLowerCase() === "daily" || tip.difficulty === "easy";
          if (selectedWeek === 2) return tip.timeframe.toLowerCase() === "weekly" && tip.difficulty !== "advanced";
          if (selectedWeek === 3) return tip.timeframe.toLowerCase() === "weekly" && tip.difficulty !== "easy";
          return tip.timeframe.toLowerCase().includes("30") || tip.difficulty === "advanced";
        })
        .slice(0, 5)
        .map(tip => {
          // Parse actionSteps if it's a JSON string
          try {
            const steps = JSON.parse(tip.actionSteps);
            return Array.isArray(steps) ? steps[0] : tip.actionSteps;
          } catch {
            return tip.actionSteps;
          }
        })
    : [];
  
  const challenges = hasApiData && apiChallenges.length > 0 ? apiChallenges : staticChallenges;
  const traitInfo = TRAIT_IMPROVEMENTS[weakestTrait] || TRAIT_IMPROVEMENTS["O"];
  const weekTheme = WEEK_THEMES[selectedWeek];

  return (
    <div className="space-y-4">
      {/* Trait being improved header */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
            Improving: {TRAIT_LABELS[weakestTrait] || "Growth Area"}
          </span>
        </div>
        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">
          {hasApiData ? "Personalized challenges based on your unique profile" : traitInfo.improvement}
        </p>
      </div>

      {/* Week selector - Calendar style with themes */}
      <div className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as const).map((week) => {
          const weekChallenges = (quests[`week${week}` as keyof typeof quests] || []).length;
          const weekCompleted = Array.from(completedChallenges).filter(id => id.includes(`-w${week}-`)).length;
          const allWeekDone = weekCompleted >= 5;
          
          return (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`relative p-2 rounded-xl ${reduceMotion ? '' : 'transition-all'} ${
                selectedWeek === week
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : allWeekDone
                    ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50'
              }`}
              data-testid={`week-${week}`}
            >
              <div className="text-center">
                <div className="text-base font-bold">{week}</div>
                <div className="text-[10px] opacity-80 leading-tight">{WEEK_THEMES[week].title}</div>
              </div>
              {weekCompleted > 0 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  allWeekDone 
                    ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-gray-900'
                    : 'bg-amber-500 text-white'
                }`}>
                  {allWeekDone ? <CheckCircle2 className="w-3 h-3" /> : weekCompleted}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Week focus description */}
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-3 h-3 text-emerald-500" />
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Week {selectedWeek} Focus: {weekTheme.focus}
        </span>
      </div>

      {/* 5 Challenges - always showing exactly 5 unique items */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => {
          // Combine API and static challenges to ensure 5 unique items
          const challenge = challenges[idx] || staticChallenges[idx] || staticChallenges[idx % staticChallenges.length];
          const challengeId = `${weakestTrait}-w${selectedWeek}-${idx}`;
          const isCompleted = completedChallenges.has(challengeId);
          
          return (
            <button
              key={idx}
              onClick={() => toggleChallenge(challengeId)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left ${reduceMotion ? '' : 'transition-all'} ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
              }`}
              data-testid={`challenge-${idx}`}
            >
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <p className={`text-sm flex-1 ${isCompleted ? 'text-emerald-700 dark:text-emerald-300 line-through opacity-75' : 'text-warm-gray dark:text-soft-cream'}`}>
                {challenge}
              </p>
            </button>
          );
        })}
      </div>

      {/* Progress with personality growth context */}
      <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {completedChallenges.size} / 20 growth tasks done
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className={`w-4 h-4 ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-300'}`} />
            <span className={`text-xs font-bold ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-400'}`}>
              {completedChallenges.size >= 5 ? `${Math.floor(completedChallenges.size / 5)} week streak!` : 'Complete 5 to start streak'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thinking Card - 5-Question Challenge with scoring
const THINKING_STORAGE_KEYS = {
  BEST_SCORE: 'knowrole-thinking-best-score',
  COMPLETED_IDS: 'knowrole-thinking-completed-ids',
  CURRENT_SESSION: 'knowrole-thinking-current-session',
  CATEGORY_PROGRESS: 'knowrole-thinking-category-progress',
};

interface ThinkingSessionState {
  questions: ThinkingQuestion[];
  currentIndex: number;
  answers: { questionId: string; selectedId: string; correct: boolean }[];
  completed: boolean;
  score: number;
}

function ThinkingCard({ 
  reduceMotion,
  weakProxy
}: { 
  reduceMotion: boolean;
  weakProxy?: 'critical' | 'firstPrinciples' | null;
}) {
  const [session, setSession] = useState<ThinkingSessionState | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(THINKING_STORAGE_KEYS.BEST_SCORE);
      return stored ? parseInt(stored, 10) : 0;
    } catch { return 0; }
  });
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(THINKING_STORAGE_KEYS.COMPLETED_IDS);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgressMap>(() => {
    try {
      const stored = localStorage.getItem(THINKING_STORAGE_KEYS.CATEGORY_PROGRESS);
      return stored ? JSON.parse(stored) : initCategoryProgress();
    } catch { return initCategoryProgress(); }
  });

  const initializeSession = useCallback(() => {
    // Use adaptive questions that prioritize weak categories
    const questions = getAdaptiveQuestions(5, completedIds.slice(-20), categoryProgress, weakProxy);
    setSession({
      questions,
      currentIndex: 0,
      answers: [],
      completed: false,
      score: 0,
    });
    setShowExplanation(false);
  }, [completedIds, categoryProgress, weakProxy]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THINKING_STORAGE_KEYS.CURRENT_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && !parsed.completed) {
          setSession(parsed);
          return;
        }
      }
    } catch {}
    initializeSession();
  }, []);

  useEffect(() => {
    if (session) {
      try {
        localStorage.setItem(THINKING_STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      } catch {}
    }
  }, [session]);

  const handleAnswer = (optionId: string) => {
    if (!session || showExplanation) return;
    
    const currentQuestion = session.questions[session.currentIndex];
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.correct || false;
    
    const newAnswers = [...session.answers, {
      questionId: currentQuestion.id,
      selectedId: optionId,
      correct: isCorrect,
    }];
    
    setSession(prev => prev ? { ...prev, answers: newAnswers } : null);
    setShowExplanation(true);
    
    const newCompletedIds = [...completedIds, currentQuestion.id];
    setCompletedIds(newCompletedIds);
    try {
      localStorage.setItem(THINKING_STORAGE_KEYS.COMPLETED_IDS, JSON.stringify(newCompletedIds.slice(-50)));
    } catch {}
    
    // Update category progress for adaptive learning
    const updatedProgress = updateCategoryProgress(categoryProgress, currentQuestion.category, isCorrect);
    setCategoryProgress(updatedProgress);
    try {
      localStorage.setItem(THINKING_STORAGE_KEYS.CATEGORY_PROGRESS, JSON.stringify(updatedProgress));
    } catch {}
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentIndex >= 4) {
      const correctCount = session.answers.filter(a => a.correct).length;
      const newScore = correctCount;
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        try {
          localStorage.setItem(THINKING_STORAGE_KEYS.BEST_SCORE, newScore.toString());
        } catch {}
      }
      
      setSession(prev => prev ? { ...prev, completed: true, score: newScore } : null);
    } else {
      setSession(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
    }
    setShowExplanation(false);
  };

  const getStars = (score: number) => {
    if (score >= 4) return 3;
    if (score >= 2) return 2;
    return 1;
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    logic: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-700" },
    bias: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-700" },
    statistics: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-700" },
    arguments: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-700" },
    firstPrinciples: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700" },
  };

  const categoryLabels: Record<string, string> = {
    logic: "Logic",
    bias: "Bias Detection",
    statistics: "Statistics",
    arguments: "Arguments",
    firstPrinciples: "First Principles",
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session.completed) {
    const stars = getStars(session.score);
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-100 dark:border-indigo-800 text-center">
          <h5 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">Challenge Complete!</h5>
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-8 h-8 ${n <= stars ? "text-indigo-500 fill-indigo-500" : "text-indigo-200 dark:text-indigo-700"}`}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">
            {session.score} / 5 Correct
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
            {stars === 3 ? "Excellent critical thinking!" : stars === 2 ? "Good job! Keep practicing." : "Keep sharpening your skills!"}
          </p>
          {bestScore > 0 && (
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-4">
              Your best score: {bestScore}/5 ({getStars(bestScore)} stars)
            </p>
          )}
          <Button
            onClick={initializeSession}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-testid="try-again"
          >
            <RotateCw className="w-4 h-4 mr-2" /> New Challenge
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-gray/60 dark:text-soft-cream/50">Your Answers:</p>
          {session.answers.map((ans, idx) => {
            const q = session.questions[idx];
            return (
              <div 
                key={ans.questionId}
                className={`p-3 rounded-lg text-xs ${ans.correct ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'}`}
              >
                <div className="flex items-start gap-2">
                  {ans.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Eye className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${ans.correct ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                      Q{idx + 1}: {q?.question.substring(0, 60)}...
                    </p>
                    <p className={`text-xs mt-1 ${ans.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {ans.correct ? "Correct!" : `Explanation: ${q?.explanation.substring(0, 80)}...`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];
  const currentAnswer = session.answers.find(a => a.questionId === currentQuestion.id);
  const colors = categoryColors[currentQuestion.category] || categoryColors.logic;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {categoryLabels[currentQuestion.category]}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {currentQuestion.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx < session.currentIndex ? 'bg-indigo-500' :
                idx === session.currentIndex ? 'bg-indigo-400 ring-2 ring-indigo-200' :
                'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
          <span className="text-xs text-warm-gray/60 dark:text-soft-cream/50 ml-2">
            {session.currentIndex + 1}/5
          </span>
        </div>
      </div>

      {bestScore > 0 && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
          <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
          <span>Best: {bestScore}/5</span>
        </div>
      )}

      <div className={`p-4 rounded-xl bg-white dark:bg-gray-800 border ${colors.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-500" />
          <h6 className="text-sm font-bold text-indigo-800 dark:text-indigo-200">Question {session.currentIndex + 1}</h6>
        </div>
        
        <p className="text-sm text-warm-gray dark:text-soft-cream mb-4 leading-relaxed">
          {currentQuestion.question}
        </p>

        {!showExplanation ? (
          <div className="space-y-2">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                className={`w-full p-3 rounded-xl text-left text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 ${reduceMotion ? '' : 'transition-colors'} border border-indigo-100 dark:border-indigo-800`}
                data-testid={`answer-${opt.id}`}
              >
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">{opt.id.toUpperCase()}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        ) : (
          <div className={`p-4 rounded-xl ${currentAnswer?.correct ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700' : 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700'}`}>
            <div className="flex items-start gap-2 mb-2">
              {currentAnswer?.correct ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Correct!</p>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">Not quite right</p>
                </>
              )}
            </div>
            <p className={`text-xs leading-relaxed mb-3 ${currentAnswer?.correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
              {currentQuestion.explanation}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={nextQuestion}
              data-testid="next-question"
            >
              {session.currentIndex >= 4 ? 'See Results' : 'Next Question'} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PremiumCardDeck;
