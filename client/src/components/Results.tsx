import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuizScores } from "./Quiz";

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
  discStyle: string;
  bigFiveProfile: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  primaryTrait: string;
  secondaryTrait: string;
  spark: string;
  description: string;
}

const MBTI_DESCRIPTIONS: Record<string, { title: string; spark: string }> = {
  INTJ: { title: "Strategic Visionary", spark: "You see patterns others miss" },
  INTP: { title: "Logic Architect", spark: "Your mind builds frameworks for everything" },
  ENTJ: { title: "Decisive Commander", spark: "You turn chaos into organized action" },
  ENTP: { title: "Innovation Catalyst", spark: "Every problem is a puzzle you love" },
  INFJ: { title: "Insightful Guide", spark: "You understand what people don't say" },
  INFP: { title: "Authentic Dreamer", spark: "Your values light your unique path" },
  ENFJ: { title: "Inspiring Mentor", spark: "You bring out the best in others" },
  ENFP: { title: "Possibility Explorer", spark: "Your enthusiasm is contagious" },
  ISTJ: { title: "Reliable Guardian", spark: "Your consistency builds trust" },
  ISFJ: { title: "Caring Protector", spark: "You remember what matters to people" },
  ESTJ: { title: "Efficient Organizer", spark: "You make things happen" },
  ESFJ: { title: "Harmonious Host", spark: "You create belonging everywhere" },
  ISTP: { title: "Practical Problem-Solver", spark: "You fix things others give up on" },
  ISFP: { title: "Gentle Artisan", spark: "You find beauty in the everyday" },
  ESTP: { title: "Dynamic Doer", spark: "You thrive in the moment" },
  ESFP: { title: "Joyful Entertainer", spark: "Your energy lifts every room" },
};

const DISC_STYLES: Record<string, string> = {
  D: "Direct Driver",
  I: "Inspiring Influencer",
  S: "Steady Supporter",
  C: "Careful Analyst",
};

function calculateResult(scores: QuizScores): PersonalityResult {
  const mbti = scores.mbti;
  const mbtiType = [
    mbti.E > mbti.I ? "E" : "I",
    mbti.S > mbti.N ? "S" : "N",
    mbti.T > mbti.F ? "T" : "F",
    mbti.J > mbti.P ? "J" : "P",
  ].join("");

  const disc = scores.disc;
  const discEntries = Object.entries(disc) as [keyof typeof disc, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const b5 = scores.bigFive;
  const normalize = (val: number) => Math.max(0, Math.min(100, 50 + val * 10));
  const bigFiveProfile = {
    openness: normalize(b5.O),
    conscientiousness: normalize(b5.C),
    extraversion: normalize(b5.E),
    agreeableness: normalize(b5.A),
    neuroticism: normalize(b5.N),
  };

  const traits = Object.entries(bigFiveProfile);
  traits.sort((a, b) => b[1] - a[1]);
  const primaryTrait = traits[0][0];
  const secondaryTrait = traits[1][0];

  const mbtiInfo = MBTI_DESCRIPTIONS[mbtiType] || MBTI_DESCRIPTIONS.INTP;

  return {
    mbtiType,
    discStyle: DISC_STYLES[primaryDisc] || "Balanced",
    bigFiveProfile,
    primaryTrait,
    secondaryTrait,
    spark: mbtiInfo.spark,
    description: mbtiInfo.title,
  };
}

const traitLabels: Record<string, string> = {
  openness: "Openness",
  conscientiousness: "Conscientiousness",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  neuroticism: "Emotional Range",
};

const traitIcons: Record<string, typeof Brain> = {
  openness: Sparkles,
  conscientiousness: Target,
  extraversion: Users,
  agreeableness: Heart,
  neuroticism: Brain,
};

export default function Results({ scores, tier, mood, funMode, landmark, theme, onRestart, onShare }: ResultsProps) {
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    const calculated = calculateResult(scores);
    setResult(calculated);
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
  }, [scores]);

  if (!result) {
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

  return (
    <div className="min-h-screen pb-32">
      <header className="pt-12 pb-8 px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-terracotta to-dusty-blue mb-4"
        >
          <Trophy className="w-10 h-10 text-soft-cream" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-display font-bold text-warm-gray dark:text-soft-cream mb-2"
          data-testid="text-result-title"
        >
          {result.description}
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta font-mono font-semibold">
            {result.mbtiType}
          </span>
          <span className="text-warm-gray/30 dark:text-soft-cream/30">+</span>
          <span className="px-3 py-1 rounded-full bg-sage-green/10 text-sage-green font-medium text-sm">
            {result.discStyle}
          </span>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg italic font-handwritten text-dusty-blue"
          data-testid="text-spark"
        >
          "{result.spark}"
        </motion.p>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/50 dark:bg-white/5 rounded-2xl p-5 border border-warm-gray/10 dark:border-soft-cream/10"
        >
          <h2 className="text-lg font-display font-semibold text-warm-gray dark:text-soft-cream mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-terracotta" />
            Your Trait Profile
          </h2>
          
          <div className="space-y-4">
            {Object.entries(result.bigFiveProfile).map(([trait, value], index) => {
              const Icon = traitIcons[trait];
              return (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-sage-green" />
                      <span className="text-sm font-medium text-warm-gray dark:text-soft-cream">
                        {traitLabels[trait]}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-warm-gray/60 dark:text-soft-cream/60">
                      {Math.round(value)}%
                    </span>
                  </div>
                  <Progress value={value} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-br from-terracotta/5 to-dusty-blue/5 rounded-2xl p-5 border border-terracotta/10"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-warm-gray dark:text-soft-cream mb-1">
                Unlock Full Insights
              </h3>
              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/70 mb-3">
                Get detailed career matches, relationship dynamics, and growth paths tailored to your {result.mbtiType} profile.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnlock(true)}
                className="border-terracotta text-terracotta hover:bg-terracotta/10"
                data-testid="button-unlock"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Coming Soon
              </Button>
            </div>
          </div>
        </motion.section>

        {landmark && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
            className="text-center py-4"
          >
            <p className="text-sm text-warm-gray/60 dark:text-soft-cream/60">
              Your path was inspired by <span className="font-medium text-dusty-blue">{landmark}</span>
            </p>
          </motion.div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-6 bg-gradient-to-t from-soft-cream via-soft-cream/95 to-transparent dark:from-warm-charcoal dark:via-warm-charcoal/95">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRestart}
            data-testid="button-retake"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          
          <Button
            className="flex-1 bg-terracotta hover:bg-terracotta/90"
            onClick={onShare}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Result
          </Button>
        </div>
      </footer>
    </div>
  );
}
