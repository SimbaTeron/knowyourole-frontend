import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  Heart,
  Brain,
  Zap,
  Shield,
  Users,
  Target,
  Star,
  Share2,
  RefreshCw,
  Trophy,
  ArrowRight,
  Flame,
  Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Scenario {
  id: string;
  title: string;
  situation: string;
  choiceA: {
    text: string;
    emoji: string;
    trait: string;
    insight: string;
    consequence: string;
    bigFiveTrait?: string;
  };
  choiceB: {
    text: string;
    emoji: string;
    trait: string;
    insight: string;
    consequence: string;
    bigFiveTrait?: string;
  };
}

interface TraitSnapshot {
  trait: string;
  label: string;
  icon: typeof Heart;
  color: string;
  score: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "1",
    title: "The Unexpected Opportunity",
    situation: "Your dream company just posted a position that's a stretch for your current skills. The deadline is in 3 hours.",
    choiceA: {
      text: "Apply now with what I have - fortune favors the bold!",
      emoji: "rocket",
      trait: "risk-taker",
      insight: "You leap before you look. This boldness can open doors others never see.",
      consequence: "Reveals your appetite for risk and spontaneous action",
      bigFiveTrait: "O"
    },
    choiceB: {
      text: "Bookmark it and work toward being ready next time",
      emoji: "target",
      trait: "strategic",
      insight: "You play the long game. Your patience often leads to better-prepared wins.",
      consequence: "Shows your preference for preparation over impulsiveness",
      bigFiveTrait: "C"
    }
  },
  {
    id: "2",
    title: "The Team Conflict",
    situation: "Two colleagues are in a heated disagreement about a project direction. Both have valid points, and they're looking at you.",
    choiceA: {
      text: "Jump in and help find a middle ground",
      emoji: "handshake",
      trait: "mediator",
      insight: "You're naturally drawn to harmony. Your ability to see all sides makes you invaluable in conflicts.",
      consequence: "Demonstrates your drive for social harmony",
      bigFiveTrait: "A"
    },
    choiceB: {
      text: "Let them work it out - they're both capable adults",
      emoji: "thinking",
      trait: "observer",
      insight: "You trust others to solve their own problems. This restraint often leads to stronger team dynamics.",
      consequence: "Reveals your trust in others' autonomy",
      bigFiveTrait: "C"
    }
  },
  {
    id: "3",
    title: "The Moral Dilemma",
    situation: "You discover a small error in a report that benefits you. Fixing it would take hours and delay your vacation.",
    choiceA: {
      text: "Fix it immediately - my integrity isn't negotiable",
      emoji: "shield",
      trait: "principled",
      insight: "Your moral compass is unwavering. People trust you because you never take shortcuts on ethics.",
      consequence: "Shows your commitment to doing what's right",
      bigFiveTrait: "C"
    },
    choiceB: {
      text: "Note it for later - the impact is minimal",
      emoji: "scales",
      trait: "pragmatic",
      insight: "You weigh costs and benefits realistically. This practical wisdom helps you avoid burnout.",
      consequence: "Reveals your practical approach to prioritization",
      bigFiveTrait: "N"
    }
  },
  {
    id: "4",
    title: "The Creative Block",
    situation: "You've been staring at a blank page for an hour. A deadline looms.",
    choiceA: {
      text: "Force something out - anything is better than nothing",
      emoji: "lightning",
      trait: "action-oriented",
      insight: "You believe motion creates momentum. Your bias toward action often breaks through paralysis.",
      consequence: "Demonstrates your need for forward movement",
      bigFiveTrait: "E"
    },
    choiceB: {
      text: "Take a walk, let my subconscious work on it",
      emoji: "nature",
      trait: "intuitive",
      insight: "You trust your inner wisdom. Stepping back often leads to your best breakthroughs.",
      consequence: "Shows your trust in creative incubation",
      bigFiveTrait: "O"
    }
  },
  {
    id: "5",
    title: "The Social Invitation",
    situation: "After a long week, you get invited to a networking event with people in your field.",
    choiceA: {
      text: "I'm in! New connections could change everything",
      emoji: "people",
      trait: "connector",
      insight: "You energize through connection. Your network often becomes your greatest asset.",
      consequence: "Reveals how you recharge through social interaction",
      bigFiveTrait: "E"
    },
    choiceB: {
      text: "Rain check - I need to recharge first",
      emoji: "battery",
      trait: "self-aware",
      insight: "You know your limits. This self-awareness prevents burnout and keeps you effective long-term.",
      consequence: "Shows your awareness of personal boundaries",
      bigFiveTrait: "N"
    }
  },
  {
    id: "6",
    title: "The Criticism",
    situation: "Someone gives you harsh but potentially valid feedback about your work.",
    choiceA: {
      text: "Thank them and examine the feedback carefully",
      emoji: "growth",
      trait: "growth-minded",
      insight: "You see feedback as fuel. This openness accelerates your development.",
      consequence: "Demonstrates your openness to growth",
      bigFiveTrait: "O"
    },
    choiceB: {
      text: "Consider the source and their motives first",
      emoji: "detective",
      trait: "discerning",
      insight: "You filter information thoughtfully. Not all feedback deserves equal weight.",
      consequence: "Shows your analytical approach to information",
      bigFiveTrait: "C"
    }
  },
  {
    id: "7",
    title: "The Big Decision",
    situation: "You're offered a higher-paying job, but it means leaving a team you love.",
    choiceA: {
      text: "Take the money - I can build new relationships",
      emoji: "money",
      trait: "ambitious",
      insight: "You prioritize growth and advancement. Your drive often leads to rapid career progress.",
      consequence: "Reveals your drive for advancement",
      bigFiveTrait: "E"
    },
    choiceB: {
      text: "Stay - the culture and people matter more",
      emoji: "heart",
      trait: "values-driven",
      insight: "You prioritize meaning over money. Your loyalty builds deep, lasting professional bonds.",
      consequence: "Shows your commitment to relationships",
      bigFiveTrait: "A"
    }
  }
];

const TRAIT_CONFIG: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  "risk-taker": { label: "Boldness", icon: Zap, color: "text-orange-500" },
  "strategic": { label: "Strategy", icon: Target, color: "text-blue-500" },
  "mediator": { label: "Harmony", icon: Users, color: "text-pink-500" },
  "observer": { label: "Wisdom", icon: Brain, color: "text-purple-500" },
  "principled": { label: "Integrity", icon: Shield, color: "text-emerald-500" },
  "pragmatic": { label: "Practicality", icon: Mountain, color: "text-slate-500" },
  "action-oriented": { label: "Action", icon: Flame, color: "text-red-500" },
  "intuitive": { label: "Intuition", icon: Sparkles, color: "text-violet-500" },
  "connector": { label: "Connection", icon: Heart, color: "text-rose-500" },
  "self-aware": { label: "Self-Care", icon: Star, color: "text-amber-500" },
  "growth-minded": { label: "Growth", icon: ArrowRight, color: "text-green-500" },
  "discerning": { label: "Discernment", icon: Compass, color: "text-cyan-500" },
  "ambitious": { label: "Ambition", icon: Trophy, color: "text-yellow-500" },
  "values-driven": { label: "Values", icon: Heart, color: "text-indigo-500" },
};

// Big Five trait labels for personality echo
const BIG_FIVE_LABELS: Record<string, { name: string; highDesc: string; lowDesc: string }> = {
  "O": { name: "Openness", highDesc: "your curious, creative nature", lowDesc: "your practical, grounded approach" },
  "C": { name: "Conscientiousness", highDesc: "your organized, disciplined side", lowDesc: "your flexible, spontaneous style" },
  "E": { name: "Extraversion", highDesc: "your outgoing, energetic spirit", lowDesc: "your thoughtful, reserved nature" },
  "A": { name: "Agreeableness", highDesc: "your cooperative, empathetic heart", lowDesc: "your independent, direct approach" },
  "N": { name: "Emotional Stability", highDesc: "your calm, steady presence", lowDesc: "your depth of feeling and sensitivity" },
};

// Personality Echo - personalized messages based on Big Five
const getPersonalityEcho = (bigFive: Record<string, number> | null, choice: Scenario['choiceA'] | Scenario['choiceB']): string | null => {
  if (!bigFive || !choice.bigFiveTrait) return null;
  
  const trait = choice.bigFiveTrait;
  const score = bigFive[trait] || 50;
  const traitInfo = BIG_FIVE_LABELS[trait];
  
  if (!traitInfo) return null;
  
  if (score >= 60) {
    return `This choice aligns with ${traitInfo.highDesc}`;
  } else if (score <= 40) {
    return `This might stretch ${traitInfo.lowDesc}`;
  }
  return null;
};

export default function CrossroadsAdventure() {
  const [, setLocation] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  const [currentScenario, setCurrentScenario] = useState(0);
  const [choices, setChoices] = useState<("A" | "B")[]>([]);
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [traitSnapshots, setTraitSnapshots] = useState<TraitSnapshot[]>([]);
  const [showConsequence, setShowConsequence] = useState<"A" | "B" | null>(null);
  
  // Get Big Five profile from session storage (from quiz results)
  const [bigFiveProfile, setBigFiveProfile] = useState<Record<string, number> | null>(null);
  
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('knowrole-big-five');
      if (stored) {
        setBigFiveProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.log("No quiz data found for personality echo");
    }
  }, []);
  
  const scenario = SCENARIOS[currentScenario];
  const progress = ((currentScenario + (showInsight ? 1 : 0)) / SCENARIOS.length) * 100;
  
  useEffect(() => {
    if (choices.length === SCENARIOS.length && !isComplete) {
      const snapshots: TraitSnapshot[] = [];
      choices.forEach((choice, idx) => {
        const trait = choice === "A" 
          ? SCENARIOS[idx].choiceA.trait 
          : SCENARIOS[idx].choiceB.trait;
        const config = TRAIT_CONFIG[trait];
        if (config) {
          const existing = snapshots.find(s => s.trait === trait);
          if (existing) {
            existing.score += 1;
          } else {
            snapshots.push({
              trait,
              label: config.label,
              icon: config.icon,
              color: config.color,
              score: 1
            });
          }
        }
      });
      
      snapshots.sort((a, b) => b.score - a.score);
      setTraitSnapshots(snapshots);
      setIsComplete(true);
    }
  }, [choices, isComplete]);
  
  const handleChoice = (choice: "A" | "B") => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const selectedChoice = choice === "A" ? scenario.choiceA : scenario.choiceB;
    setCurrentInsight(selectedChoice.insight);
    setShowInsight(true);
    setChoices([...choices, choice]);
  };
  
  const handleContinue = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setShowInsight(false);
      setCurrentInsight("");
      setShowConsequence(null);
    }
  };
  
  const handleRestart = () => {
    setCurrentScenario(0);
    setChoices([]);
    setShowInsight(false);
    setCurrentInsight("");
    setIsComplete(false);
    setTraitSnapshots([]);
    setShowConsequence(null);
  };
  
  const handleShare = async () => {
    const topTraits = traitSnapshots.slice(0, 3).map(t => t.label).join(", ");
    const shareText = `I just completed the Crossroads Adventure on KnowRole! My top traits: ${topTraits}. Discover yours!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Crossroads Adventure Results",
          text: shareText,
          url: window.location.origin + "/crossroads"
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-soft-cream via-white to-soft-cream dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-warm-gray dark:text-soft-cream mb-2">
              Adventure Complete!
            </h1>
            <p className="text-warm-gray/70 dark:text-soft-cream/60">
              Here's what your choices revealed about you
            </p>
          </motion.div>
          
          <Card className="bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800 overflow-hidden mb-6">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-warm-gray dark:text-soft-cream mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Your Personality Snapshot
              </h2>
              
              <div className="space-y-3">
                {traitSnapshots.slice(0, 5).map((trait, idx) => {
                  const Icon = trait.icon;
                  return (
                    <motion.div
                      key={trait.trait}
                      initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                    >
                      <div className={`w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-5 h-5 ${trait.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-warm-gray dark:text-soft-cream">
                            {trait.label}
                          </span>
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {trait.score > 1 ? `${trait.score}x chosen` : "chosen"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(trait.score / choices.length) * 100}%` }}
                            transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 mb-6">
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                What This Means
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {traitSnapshots.length > 0 && (
                  <>
                    Your strongest tendency is <span className="font-bold">{traitSnapshots[0]?.label}</span>
                    {traitSnapshots.length > 1 && (
                      <>, balanced by <span className="font-bold">{traitSnapshots[1]?.label}</span></>
                    )}.
                    This combination suggests you approach life with a unique blend of {
                      traitSnapshots.slice(0, 2).map(t => t.label.toLowerCase()).join(" and ")
                    }.
                  </>
                )}
              </p>
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6"
              onClick={handleShare}
              data-testid="button-share-crossroads"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Results
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-warm-gray/30"
                onClick={handleRestart}
                data-testid="button-restart-crossroads"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-warm-gray/30"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <Compass className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-cream via-white to-soft-cream dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-crossroads-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-terracotta" />
            <span className="text-sm font-bold text-warm-gray dark:text-soft-cream">
              Crossroads
            </span>
          </div>
          
          <div className="text-xs font-medium text-warm-gray/60 dark:text-soft-cream/50">
            {currentScenario + 1}/{SCENARIOS.length}
          </div>
        </header>
        
        <Progress value={progress} className="h-2 mb-8" />
        
        <AnimatePresence mode="wait">
          {!showInsight ? (
            <motion.div
              key={`scenario-${currentScenario}`}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="bg-white dark:bg-gray-800 border-terracotta/30 dark:border-terracotta/50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-terracotta via-amber-500 to-sage-green" />
                <CardContent className="p-5">
                  <h2 className="text-lg font-bold text-warm-gray dark:text-soft-cream mb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-terracotta" />
                    {scenario.title}
                  </h2>
                  <p className="text-base text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed">
                    {scenario.situation}
                  </p>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice("A")}
                  onMouseEnter={() => setShowConsequence("A")}
                  onMouseLeave={() => setShowConsequence(null)}
                  onTouchStart={() => setShowConsequence("A")}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-sage-green/10 to-emerald-50 dark:from-sage-green/20 dark:to-emerald-900/20 border-2 border-sage-green/30 hover:border-sage-green/60 transition-all text-left"
                  data-testid="button-choice-a"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-sage-green/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-sage-green">A</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-warm-gray dark:text-soft-cream leading-relaxed">
                        {scenario.choiceA.text}
                      </p>
                      <AnimatePresence>
                        {showConsequence === "A" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pt-2 border-t border-sage-green/20"
                          >
                            <p className="text-xs text-sage-green/80 dark:text-sage-green/70 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {scenario.choiceA.consequence}
                            </p>
                            {bigFiveProfile && getPersonalityEcho(bigFiveProfile, scenario.choiceA) && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {getPersonalityEcho(bigFiveProfile, scenario.choiceA)}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice("B")}
                  onMouseEnter={() => setShowConsequence("B")}
                  onMouseLeave={() => setShowConsequence(null)}
                  onTouchStart={() => setShowConsequence("B")}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-terracotta/10 to-orange-50 dark:from-terracotta/20 dark:to-orange-900/20 border-2 border-terracotta/30 hover:border-terracotta/60 transition-all text-left"
                  data-testid="button-choice-b"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-terracotta">B</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-warm-gray dark:text-soft-cream leading-relaxed">
                        {scenario.choiceB.text}
                      </p>
                      <AnimatePresence>
                        {showConsequence === "B" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pt-2 border-t border-terracotta/20"
                          >
                            <p className="text-xs text-terracotta/80 dark:text-terracotta/70 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {scenario.choiceB.consequence}
                            </p>
                            {bigFiveProfile && getPersonalityEcho(bigFiveProfile, scenario.choiceB) && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {getPersonalityEcho(bigFiveProfile, scenario.choiceB)}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              </div>
              
              <p className="text-center text-xs text-warm-gray/50 dark:text-soft-cream/40">
                {bigFiveProfile ? "Your quiz results personalize these choices" : "Tap and hold to preview what each choice reveals"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`insight-${currentScenario}`}
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={shouldReduceMotion ? {} : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
                    Insight Revealed
                  </h3>
                  
                  <p className="text-base text-amber-800 dark:text-amber-200 leading-relaxed">
                    {currentInsight}
                  </p>
                </CardContent>
              </Card>
              
              <Button
                className="w-full bg-gradient-to-r from-terracotta to-amber-500 hover:from-terracotta/90 hover:to-amber-600 text-white font-bold py-6"
                onClick={handleContinue}
                data-testid="button-continue-crossroads"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
