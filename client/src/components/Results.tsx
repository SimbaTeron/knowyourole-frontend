import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, 
  Briefcase, TrendingUp, ChevronRight, Zap, Award, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ResultsProps {
  scores: QuizScores;
  tier: string;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  onRestart: () => void;
  onShare: () => void;
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

  const mbtiCategory = mbtiType.charAt(0) === "I" ? "introvert" : "extrovert";
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

export default function Results({ scores, tier, mood, funMode, landmark, theme, onRestart, onShare }: ResultsProps) {
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const chartRef = useRef<ChartJS<"radar">>(null);
  const traitButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const calculated = calculateResult(scores);
    setResult(calculated);
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
  }, [scores]);

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
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen pb-36">
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
          Your Personality Map
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
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-terracotta" aria-hidden="true" />
                Big Five Profile
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
                  className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
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
                          <span className={`font-semibold ${colors.text}`}>
                            {TRAIT_LABELS[selectedTrait as keyof typeof TRAIT_LABELS]}
                          </span>
                          <span className="text-sm text-warm-gray/60 dark:text-soft-cream/60 ml-auto">
                            {result.bigFiveProfile[selectedTrait as keyof typeof result.bigFiveProfile]}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-warm-gray/80 dark:text-soft-cream/80">
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
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="bg-terracotta/5 border-terracotta/20">
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
              <p className="text-xs text-warm-gray/60 dark:text-soft-cream/60 mt-1">
                {result.mbtiDesc}
              </p>
            </CardContent>
          </Card>

          <Card className={`${discColorMap[result.discColor] || "bg-sage-green/5 border-sage-green/20"} border`}>
            <CardContent className="p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-2">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-xs opacity-70 mb-1">DISC Style</p>
              <p className="text-lg font-bold" data-testid="text-disc">
                {result.discStyle}
              </p>
              <p className="text-sm font-medium">
                {result.discLabel}
              </p>
              <p className="text-xs opacity-70 mt-1">
                {result.discDesc}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sage-green" aria-hidden="true" />
                Career Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-sage-green/10 border border-sage-green/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-sage-green text-white">
                        Primary
                      </span>
                    </div>
                    <p className="font-semibold text-warm-gray dark:text-soft-cream" data-testid="text-primary-role">
                      {result.primaryRole.title}
                    </p>
                    <p className="text-sm text-warm-gray/70 dark:text-soft-cream/70 mt-0.5">
                      {result.primaryRole.desc}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sage-green">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      <span className="text-xs font-medium">{result.primaryRole.salary}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-dusty-blue/10 border border-dusty-blue/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-dusty-blue text-white">
                        Secondary
                      </span>
                    </div>
                    <p className="font-semibold text-warm-gray dark:text-soft-cream" data-testid="text-secondary-role">
                      {result.secondaryRole.title}
                    </p>
                    <p className="text-sm text-warm-gray/70 dark:text-soft-cream/70 mt-0.5">
                      {result.secondaryRole.desc}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-dusty-blue">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      <span className="text-xs font-medium">{result.secondaryRole.salary}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-terracotta hover:text-terracotta/80 transition-colors"
                data-testid="button-more-careers"
                aria-label="Explore more career paths based on your profile"
              >
                <span>Explore more career paths</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {landmark && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-dusty-blue/10"
          >
            <MapPin className="w-4 h-4 text-dusty-blue" aria-hidden="true" />
            <p className="text-sm text-warm-gray/70 dark:text-soft-cream/70">
              Inspired by <span className="font-medium text-dusty-blue">{landmark}</span>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center py-4"
        >
          <p className="text-xs text-warm-gray/40 dark:text-soft-cream/30">
            Engagement score: {Math.round(scores.engagement)} | 
            {scores.wildcardBoost && " Wildcard bonus applied |"} 
            {" "}{tier} tier
          </p>
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-5 bg-gradient-to-t from-soft-cream via-soft-cream/98 to-transparent dark:from-warm-charcoal dark:via-warm-charcoal/98">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 min-h-11"
            onClick={onRestart}
            data-testid="button-retake"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Retake
          </Button>
          
          <Button
            className="flex-1 bg-terracotta hover:bg-terracotta/90 min-h-11"
            onClick={onShare}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Share
          </Button>
        </div>
      </footer>
    </div>
  );
}
