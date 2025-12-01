import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, PanInfo } from "framer-motion";
import { 
  BookOpen, Shield, Briefcase, DollarSign, Target, Brain, Gift, Crown,
  Lightbulb, CheckCircle2, ArrowRight, Star, Sunrise, Zap, Flame, ChevronLeft, ChevronRight,
  RotateCw, Play, Pause, Clock, Sparkles, TrendingUp, Eye, EyeOff, GripHorizontal,
  MessageSquare, Heart, Users, Compass
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

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

// Static time-of-day color classes
const TIME_COLORS = {
  morning: {
    bgSelected: "bg-amber-100 dark:bg-amber-900/40",
    bgUnselected: "hover:bg-gray-100 dark:hover:bg-gray-700",
    circleSelected: "bg-gradient-to-br from-amber-400 to-amber-500",
    circleUnselected: "bg-gray-200 dark:bg-gray-700",
    textSelected: "text-amber-700 dark:text-amber-300",
    textUnselected: "text-gray-500",
    contentBg: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800",
    iconColor: "text-amber-500",
  },
  afternoon: {
    bgSelected: "bg-sky-100 dark:bg-sky-900/40",
    bgUnselected: "hover:bg-gray-100 dark:hover:bg-gray-700",
    circleSelected: "bg-gradient-to-br from-sky-400 to-sky-500",
    circleUnselected: "bg-gray-200 dark:bg-gray-700",
    textSelected: "text-sky-700 dark:text-sky-300",
    textUnselected: "text-gray-500",
    contentBg: "bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800",
    iconColor: "text-sky-500",
  },
  evening: {
    bgSelected: "bg-purple-100 dark:bg-purple-900/40",
    bgUnselected: "hover:bg-gray-100 dark:hover:bg-gray-700",
    circleSelected: "bg-gradient-to-br from-purple-400 to-purple-500",
    circleUnselected: "bg-gray-200 dark:bg-gray-700",
    textSelected: "text-purple-700 dark:text-purple-300",
    textUnselected: "text-gray-500",
    contentBg: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
    iconColor: "text-purple-500",
  },
} as const;

type ColorKey = keyof typeof COLOR_CLASSES;

const CARD_CONFIGS = [
  { id: "deep-dive", title: "Deep Dive", icon: BookOpen, color: "violet" as ColorKey, gradient: "from-violet-400 via-purple-500 to-fuchsia-500" },
  { id: "role-matches", title: "Role Matches", icon: Gift, color: "amber" as ColorKey, gradient: "from-amber-400 via-orange-500 to-red-400" },
  { id: "blindspots", title: "Your Blindspots", icon: Shield, color: "rose" as ColorKey, gradient: "from-rose-400 via-pink-500 to-fuchsia-500" },
  { id: "career-sim", title: "Career Simulator", icon: Briefcase, color: "sky" as ColorKey, gradient: "from-sky-400 via-blue-500 to-indigo-500" },
  { id: "side-hustle", title: "Side Hustles", icon: DollarSign, color: "amber" as ColorKey, gradient: "from-amber-400 via-yellow-500 to-orange-500" },
  { id: "learning", title: "How You Learn", icon: BookOpen, color: "teal" as ColorKey, gradient: "from-teal-400 via-cyan-500 to-emerald-500" },
  { id: "growth-quest", title: "30-Day Quest", icon: Target, color: "emerald" as ColorKey, gradient: "from-emerald-400 via-green-500 to-teal-500" },
  { id: "thinking", title: "Sharpen Thinking", icon: Brain, color: "indigo" as ColorKey, gradient: "from-indigo-400 via-blue-500 to-cyan-500" },
];

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
  const [careerTimeOfDay, setCareerTimeOfDay] = useState<"morning" | "afternoon" | "evening">("morning");
  const [selectedHustle, setSelectedHustle] = useState(0);
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [selectedQuestWeek, setSelectedQuestWeek] = useState<1 | 2 | 3 | 4>(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
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

  // Get career data
  const getCareerData = () => {
    const careerKey = Object.keys(CAREER_SIMULATOR).find(k => 
      result?.primaryRole?.title?.toLowerCase().includes(k.toLowerCase().split(' ')[0])
    ) || Object.keys(CAREER_SIMULATOR)[0];
    return CAREER_SIMULATOR[careerKey];
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
          flippedCards={flippedBlindspots}
          toggleFlip={(idx) => {
            const newSet = new Set(flippedBlindspots);
            if (newSet.has(idx)) newSet.delete(idx);
            else newSet.add(idx);
            setFlippedBlindspots(newSet);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "career-sim":
        return <CareerSimCard 
          career={getCareerData()}
          roleTitle={result?.primaryRole?.title || "your matched career"}
          timeOfDay={careerTimeOfDay}
          setTimeOfDay={setCareerTimeOfDay}
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
          selectedWeek={selectedQuestWeek}
          setSelectedWeek={setSelectedQuestWeek}
          completedChallenges={completedChallenges}
          toggleChallenge={(id) => {
            const newSet = new Set(completedChallenges);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setCompletedChallenges(newSet);
            if (!completedChallenges.has(id) && navigator.vibrate) navigator.vibrate(30);
          }}
          reduceMotion={shouldReduceMotion ?? false}
        />;
      
      case "thinking":
        return <ThinkingCard 
          result={result}
          revealed={thinkingChallengeRevealed}
          setRevealed={setThinkingChallengeRevealed}
          answer={thinkingAnswer}
          setAnswer={setThinkingAnswer}
          reduceMotion={shouldReduceMotion ?? false}
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

// Role Matches Card - Expandable chips
function RoleMatchesCard({ 
  result, 
  expandedRoles,
  toggleRole,
  reduceMotion
}: { 
  result: PremiumCardDeckProps['result']; 
  expandedRoles: Set<number>;
  toggleRole: (idx: number) => void;
  reduceMotion: boolean;
}) {
  const roles = [
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

  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-2">
        Tap a role to see why it matches your personality
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
                <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed">
                  {role.desc}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Blindspots Card - Flip cards
function BlindSpotsCard({ 
  blindspots, 
  flippedCards,
  toggleFlip,
  reduceMotion
}: { 
  blindspots: Array<{ title: string; blindspot: string; workaround: string; realWorld: string }>;
  flippedCards: Set<number>;
  toggleFlip: (idx: number) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-2 flex items-center gap-2">
        <RotateCw className="w-3 h-3" />
        Tap each card to reveal the solution
      </p>
      {blindspots.map((item, idx) => (
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
                <div>
                  <h6 className="text-sm font-bold text-rose-800 dark:text-rose-200 mb-1">{item.title}</h6>
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

// Career Simulator Card - Timeline slider
function CareerSimCard({ 
  career, 
  roleTitle,
  timeOfDay,
  setTimeOfDay,
  reduceMotion
}: { 
  career: { morningRoutine: string; afternoonTasks: string; eveningReflection: string; growth: string };
  roleTitle: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  setTimeOfDay: (time: "morning" | "afternoon" | "evening") => void;
  reduceMotion: boolean;
}) {
  const times = [
    { id: "morning" as const, label: "Morning", icon: Sunrise, content: career?.morningRoutine },
    { id: "afternoon" as const, label: "Afternoon", icon: Zap, content: career?.afternoonTasks },
    { id: "evening" as const, label: "Evening", icon: Star, content: career?.eveningReflection },
  ];

  const timeIndex = times.findIndex(t => t.id === timeOfDay);
  const currentTimeColors = TIME_COLORS[timeOfDay];

  return (
    <div className="space-y-4">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
        A day in the life as a <span className="font-semibold">{roleTitle}</span>
      </p>
      
      {/* Timeline slider */}
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          {times.map((time) => {
            const isSelected = timeOfDay === time.id;
            const colors = TIME_COLORS[time.id];
            return (
              <button
                key={time.id}
                onClick={() => setTimeOfDay(time.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isSelected ? colors.bgSelected : colors.bgUnselected
                }`}
                data-testid={`time-${time.id}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? colors.circleSelected : colors.circleUnselected
                }`}>
                  <time.icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs font-medium ${
                  isSelected ? colors.textSelected : colors.textUnselected
                }`}>
                  {time.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-amber-400 via-sky-400 to-purple-400 ${reduceMotion ? '' : 'transition-all duration-300'}`}
            style={{ width: `${((timeIndex + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Content area */}
      <div
        key={timeOfDay}
        className={`p-4 rounded-xl ${currentTimeColors.contentBg}`}
      >
        <div className="flex items-start gap-3">
          <Clock className={`w-5 h-5 ${currentTimeColors.iconColor} flex-shrink-0 mt-0.5`} />
          <p className="text-sm text-warm-gray dark:text-soft-cream leading-relaxed">
            {times.find(t => t.id === timeOfDay)?.content}
          </p>
        </div>
      </div>

      {/* 5-Year Vision */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 border border-sky-200 dark:border-sky-700">
        <p className="text-xs text-sky-700 dark:text-sky-300">
          <span className="font-bold">5-Year Vision:</span> {career?.growth}
        </p>
      </div>
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

// Growth Quest Card - Tappable calendar
function GrowthQuestCard({ 
  weakestTrait,
  GROWTH_QUESTS,
  TRAIT_LABELS,
  selectedWeek,
  setSelectedWeek,
  completedChallenges,
  toggleChallenge,
  reduceMotion
}: { 
  weakestTrait: string;
  GROWTH_QUESTS: Record<string, { week1: string[]; week2: string[]; week3: string[]; week4: string[] }>;
  TRAIT_LABELS: Record<string, string>;
  selectedWeek: 1 | 2 | 3 | 4;
  setSelectedWeek: (week: 1 | 2 | 3 | 4) => void;
  completedChallenges: Set<string>;
  toggleChallenge: (id: string) => void;
  reduceMotion: boolean;
}) {
  const quests = GROWTH_QUESTS[weakestTrait] || GROWTH_QUESTS["O"];
  const weekKey = `week${selectedWeek}` as keyof typeof quests;
  const challenges = quests[weekKey] || [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
        Personalized challenges to strengthen your {TRAIT_LABELS[weakestTrait]?.toLowerCase() || "growth area"}
      </p>

      {/* Week selector - Calendar style */}
      <div className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as const).map((week) => {
          const weekChallenges = (quests[`week${week}` as keyof typeof quests] || []).length;
          const weekCompleted = Array.from(completedChallenges).filter(id => id.includes(`-w${week}-`)).length;
          
          return (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`relative p-3 rounded-xl ${reduceMotion ? '' : 'transition-all'} ${
                selectedWeek === week
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50'
              }`}
              data-testid={`week-${week}`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{week}</div>
                <div className="text-xs opacity-80">Week</div>
              </div>
              {weekCompleted > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-full flex items-center justify-center text-xs text-white dark:text-gray-900 font-bold">
                  {weekCompleted}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        {challenges.slice(0, 5).map((challenge, idx) => {
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

      {/* Progress */}
      <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {completedChallenges.size} / 20 completed
          </span>
          <div className="flex items-center gap-1">
            <Flame className={`w-4 h-4 ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-300'}`} />
            <span className={`text-xs font-bold ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-400'}`}>
              {completedChallenges.size >= 5 ? `${Math.floor(completedChallenges.size / 5)} week streak!` : 'Start streak'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thinking Card - Mini challenge
function ThinkingCard({ 
  result,
  revealed,
  setRevealed,
  answer,
  setAnswer,
  reduceMotion
}: { 
  result: PremiumCardDeckProps['result'];
  revealed: boolean;
  setRevealed: (val: boolean) => void;
  answer: string | null;
  setAnswer: (val: string | null) => void;
  reduceMotion: boolean;
}) {
  const critScore = result?.scales?.critical?.value || 3;
  const fpScore = result?.scales?.firstPrinciples?.value || 2;
  const combinedScore = Math.min(3, Math.round((critScore + fpScore) / 3.5));

  const challenge = {
    question: "A company claims their new diet pill helps 90% of users lose weight. What's the first thing you should question?",
    options: [
      { id: "a", text: "How was 'lose weight' defined?", correct: true },
      { id: "b", text: "What was the sample size?", correct: true },
      { id: "c", text: "Who funded the study?", correct: true },
      { id: "d", text: "All of the above", correct: true },
    ],
    explanation: "Great critical thinking! All of these are valid questions. The definition of success, sample size, and funding source all affect the reliability of such claims."
  };

  return (
    <div className="space-y-4">
      {/* Score display */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Problem-Solving Score</span>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-5 h-5 ${n <= combinedScore ? "text-indigo-500 fill-indigo-500" : "text-indigo-200 dark:text-indigo-700"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-indigo-700 dark:text-indigo-300">
          {combinedScore >= 3 ? "You demonstrate strong analytical skills!" : "Focus on questioning assumptions to grow this skill."}
        </p>
      </div>

      {/* Mini Challenge */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-500" />
          <h6 className="text-sm font-bold text-indigo-800 dark:text-indigo-200">Quick Challenge</h6>
        </div>
        
        <p className="text-sm text-warm-gray dark:text-soft-cream mb-4 leading-relaxed">
          {challenge.question}
        </p>

        {!revealed ? (
          <div className="space-y-2">
            {challenge.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setAnswer(opt.id);
                  setRevealed(true);
                }}
                className={`w-full p-3 rounded-xl text-left text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 ${reduceMotion ? '' : 'transition-colors'} border border-indigo-100 dark:border-indigo-800`}
                data-testid={`answer-${opt.id}`}
              >
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">{opt.id.toUpperCase()}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Great thinking!</p>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              {challenge.explanation}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => {
                setRevealed(false);
                setAnswer(null);
              }}
              data-testid="try-again"
            >
              <RotateCw className="w-3 h-3 mr-1" /> Try another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PremiumCardDeck;
