import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, Mountain, Sunrise, Star, Crown, ChevronRight,
  Sparkles, Target, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EvolutionStage {
  current: string;
  growth: string;
  peak: string;
  mature: string;
}

interface PersonalityEvolutionTimelineProps {
  mbtiType: string;
  bigFiveProfile: { O: number; C: number; E: number; A: number; N: number };
  tier: string;
}

const EVOLUTION_STAGES: Record<string, EvolutionStage> = {
  "E": {
    current: "Social energy drives your connections",
    growth: "Learning when to recharge solo",
    peak: "Masterful at reading room energy",
    mature: "Wise mentor who uplifts others",
  },
  "I": {
    current: "Deep inner world shapes your thinking",
    growth: "Sharing insights with trusted circle",
    peak: "Strategic networker with depth",
    mature: "Sage with profound influence",
  },
  "N": {
    current: "Future possibilities excite you",
    growth: "Grounding vision in practical steps",
    peak: "Innovator turning dreams to reality",
    mature: "Visionary guiding next generation",
  },
  "S": {
    current: "Present details anchor your world",
    growth: "Expanding to see the bigger picture",
    peak: "Expert at turning ideas into action",
    mature: "Master craftsperson of life",
  },
  "T": {
    current: "Logic guides your decisions",
    growth: "Integrating emotional intelligence",
    peak: "Balanced leader with sharp insight",
    mature: "Wise strategist with heart",
  },
  "F": {
    current: "Values drive your choices",
    growth: "Setting boundaries that serve you",
    peak: "Empathic leader who inspires",
    mature: "Compassionate wisdom keeper",
  },
  "J": {
    current: "Structure brings you peace",
    growth: "Embracing calculated spontaneity",
    peak: "Flexible planner who adapts",
    mature: "Orchestrator of complex projects",
  },
  "P": {
    current: "Adaptability is your superpower",
    growth: "Building sustainable routines",
    peak: "Creative executor with follow-through",
    mature: "Renaissance spirit with focus",
  },
};

const STAGE_ICONS = [Compass, Mountain, Sunrise, Crown];
const STAGE_LABELS = ["Current", "Growth", "Peak", "Mature"];
const STAGE_COLORS = [
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-500", 
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500"
];

function getAgeBasedStage(tier: string): number {
  switch(tier) {
    case "7-12": return 0;
    case "13-18": return 0;
    case "19-25": return 1;
    case "25+": return 2;
    default: return 1;
  }
}

export function PersonalityEvolutionTimeline({ mbtiType, bigFiveProfile, tier }: PersonalityEvolutionTimelineProps) {
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [showAllStages, setShowAllStages] = useState(false);
  
  const dominantMBTI = mbtiType.split('').filter(letter => 
    ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'].includes(letter)
  );
  
  const currentStageIndex = getAgeBasedStage(tier);
  
  const sortedTraits = Object.entries(bigFiveProfile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([trait]) => trait);

  const primaryTrait = dominantMBTI[0] || 'E';
  const evolution = EVOLUTION_STAGES[primaryTrait];

  if (!evolution) return null;

  const stages = [
    { key: 'current', label: 'Current', text: evolution.current },
    { key: 'growth', label: 'Growth', text: evolution.growth },
    { key: 'peak', label: 'Peak', text: evolution.peak },
    { key: 'mature', label: 'Mature', text: evolution.mature },
  ];

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-pink-900/20 border-indigo-200 dark:border-indigo-700 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Your Growth Journey
        </CardTitle>
        <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
          Based on your {primaryTrait === 'E' || primaryTrait === 'I' ? 'social energy' : 
            primaryTrait === 'N' || primaryTrait === 'S' ? 'perception style' :
            primaryTrait === 'T' || primaryTrait === 'F' ? 'decision making' : 'lifestyle'} preference
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 via-amber-400 via-emerald-400 to-violet-400" />
          
          <div className="space-y-4 pl-10">
            {stages.map((stage, idx) => {
              const Icon = STAGE_ICONS[idx];
              const isCurrentStage = idx === currentStageIndex;
              const isPastStage = idx < currentStageIndex;
              const isFutureStage = idx > currentStageIndex;
              
              if (!showAllStages && idx > currentStageIndex + 1) return null;
              
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative ${isFutureStage ? 'opacity-60' : ''}`}
                >
                  <div className={`absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center
                    ${isCurrentStage 
                      ? `bg-gradient-to-br ${STAGE_COLORS[idx]} shadow-lg ring-2 ring-white dark:ring-gray-800` 
                      : isPastStage 
                        ? 'bg-gray-200 dark:bg-gray-700' 
                        : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrentStage ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  
                  <div className={`p-3 rounded-lg transition-all
                    ${isCurrentStage 
                      ? 'bg-white dark:bg-gray-800 shadow-md border border-indigo-200 dark:border-indigo-700' 
                      : 'bg-white/50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wide
                        ${isCurrentStage ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {stage.label}
                      </span>
                      {isCurrentStage && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-full">
                          You are here
                        </span>
                      )}
                      {isPastStage && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-full">
                          Achieved
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isCurrentStage ? 'text-warm-gray dark:text-soft-cream font-medium' : 'text-warm-gray/70 dark:text-soft-cream/60'}`}>
                      {stage.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {!showAllStages && currentStageIndex < 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllStages(true)}
            className="w-full justify-center gap-2 text-indigo-600 dark:text-indigo-400"
            data-testid="button-show-all-stages"
          >
            <Sparkles className="w-4 h-4" />
            See Your Full Journey
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        <div className="pt-3 border-t border-indigo-100 dark:border-indigo-800">
          <h4 className="text-xs font-semibold text-warm-gray/60 dark:text-soft-cream/50 uppercase tracking-wide mb-2">
            Other Traits to Develop
          </h4>
          <div className="flex flex-wrap gap-2">
            {dominantMBTI.slice(1, 4).map(trait => {
              const traitEvolution = EVOLUTION_STAGES[trait];
              if (!traitEvolution) return null;
              
              return (
                <button
                  key={trait}
                  onClick={() => setExpandedTrait(expandedTrait === trait ? null : trait)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${expandedTrait === trait 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {trait === 'E' ? 'Extraversion' : 
                   trait === 'I' ? 'Introversion' :
                   trait === 'N' ? 'Intuition' :
                   trait === 'S' ? 'Sensing' :
                   trait === 'T' ? 'Thinking' :
                   trait === 'F' ? 'Feeling' :
                   trait === 'J' ? 'Judging' : 'Perceiving'}
                </button>
              );
            })}
          </div>
          
          <AnimatePresence>
            {expandedTrait && EVOLUTION_STAGES[expandedTrait] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-warm-gray/80 dark:text-soft-cream/70">
                      Growth Focus
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">
                    {EVOLUTION_STAGES[expandedTrait].growth}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
