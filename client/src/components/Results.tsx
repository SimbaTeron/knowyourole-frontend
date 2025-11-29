import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, 
  Briefcase, TrendingUp, ChevronRight, Zap, Award, MapPin, Lightbulb, Flame,
  MessageCircle, Frown, Meh, Smile, Lock, Crown, Star, Gift, BookOpen,
  Rocket, Timer, CheckCircle2, Calendar, ArrowRight, Shield, Compass, 
  Mountain, Sunrise, CircleDot, Play
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
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";

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

const FUN_MODE_DISC: Record<string, { nickname: string; vibe: string }> = {
  "D": { nickname: "The Boss Baby", vibe: "Main character energy. You walk into rooms like you own them (you probably do)." },
  "I": { nickname: "The Hype Machine", vibe: "Your enthusiasm is contagious—and slightly exhausting. In the best way!" },
  "S": { nickname: "The Rock", vibe: "Everyone's emotional support human. You've heard 'thanks for listening' 10,000 times." },
  "C": { nickname: "The Perfectionist", vibe: "If it's not done right, it's not done. Your spreadsheets have spreadsheets." },
};

const FUN_MODE_TITLES: Record<string, string> = {
  "INTJ": "Supreme Overthinker",
  "INTP": "Theoretical Wizard",
  "ENTJ": "Chief Everything Officer",
  "ENTP": "Professional Debater",
  "INFJ": "Soul Reader",
  "INFP": "Daydream Believer",
  "ENFJ": "Cheerleader-in-Chief",
  "ENFP": "Chaos Coordinator",
  "ISTJ": "Rule Keeper",
  "ISFJ": "Guardian Angel",
  "ESTJ": "Order Commander",
  "ESFJ": "Party Planner Supreme",
  "ISTP": "Silent Fixer",
  "ISFP": "Aesthetic Curator",
  "ESTP": "Action Hero",
  "ESFP": "Entertainment Director",
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

// Team Compatibility Data
const COMPATIBILITY_MATRIX: Record<string, { match: string; score: number; tip: string }[]> = {
  "INTJ": [
    { match: "ENTP", score: 92, tip: "Sparks fly when vision meets debate" },
    { match: "ENFP", score: 85, tip: "You ground their ideas, they expand yours" },
    { match: "INFJ", score: 78, tip: "Deep thinkers who finish each other's theories" },
  ],
  "INTP": [
    { match: "ENTJ", score: 88, tip: "They execute what you architect" },
    { match: "ENFP", score: 84, tip: "Infectious enthusiasm meets logic" },
    { match: "INTJ", score: 80, tip: "Two strategists building empires" },
  ],
  "ENTJ": [
    { match: "INTP", score: 88, tip: "Your drive + their depth = unstoppable" },
    { match: "ENFP", score: 82, tip: "They bring the heart to your ambition" },
    { match: "ISTP", score: 79, tip: "Doers who get things done, fast" },
  ],
  "ENTP": [
    { match: "INTJ", score: 92, tip: "Debate partners who build something real" },
    { match: "INFJ", score: 87, tip: "They see through you—and you love it" },
    { match: "ENFJ", score: 81, tip: "Charm meets depth for big impact" },
  ],
  "INFJ": [
    { match: "ENFP", score: 95, tip: "The golden pair—magic happens here" },
    { match: "ENTP", score: 87, tip: "Intellectual soulmates with edge" },
    { match: "INTJ", score: 78, tip: "Visionaries planning the future together" },
  ],
  "INFP": [
    { match: "ENFJ", score: 91, tip: "They champion your quiet brilliance" },
    { match: "ENTJ", score: 82, tip: "Opposites that balance beautifully" },
    { match: "INTJ", score: 78, tip: "Deep thinkers with mutual respect" },
  ],
  "ENFJ": [
    { match: "INFP", score: 91, tip: "You inspire their hidden potential" },
    { match: "ISFP", score: 84, tip: "Gentle souls creating harmony" },
    { match: "ENTP", score: 81, tip: "Ideas + action = world-changing" },
  ],
  "ENFP": [
    { match: "INFJ", score: 95, tip: "Deep connection, endless possibility" },
    { match: "INTJ", score: 85, tip: "Grounded visionary partnership" },
    { match: "ENTJ", score: 82, tip: "Dream big, then make it happen" },
  ],
  "ISTJ": [
    { match: "ESFP", score: 85, tip: "They loosen you up, you keep them focused" },
    { match: "ESTP", score: 80, tip: "Action-oriented partners in crime" },
    { match: "ISFJ", score: 78, tip: "Reliable duo that never drops the ball" },
  ],
  "ISFJ": [
    { match: "ESFP", score: 88, tip: "Fun meets thoughtfulness" },
    { match: "ESTP", score: 82, tip: "Adventure with a safety net" },
    { match: "ENFP", score: 79, tip: "Warmth amplified exponentially" },
  ],
  "ESTJ": [
    { match: "ISFP", score: 84, tip: "They soften your edges, beautifully" },
    { match: "ISTP", score: 81, tip: "No-nonsense efficiency together" },
    { match: "ESFJ", score: 78, tip: "Leaders who build community" },
  ],
  "ESFJ": [
    { match: "ISFP", score: 88, tip: "Harmonizers creating safe spaces" },
    { match: "ISTP", score: 82, tip: "You organize, they troubleshoot" },
    { match: "ENFP", score: 80, tip: "Social butterflies together" },
  ],
  "ISTP": [
    { match: "ESTJ", score: 81, tip: "You fix it, they ship it" },
    { match: "ESFJ", score: 82, tip: "Structure meets spontaneity" },
    { match: "ESTP", score: 78, tip: "Adventure buddies with skills" },
  ],
  "ISFP": [
    { match: "ESFJ", score: 88, tip: "Artistic soul + caring heart" },
    { match: "ESTJ", score: 84, tip: "They believe in your vision" },
    { match: "ENFJ", score: 84, tip: "Champions of your creativity" },
  ],
  "ESTP": [
    { match: "ISFJ", score: 82, tip: "They keep you grounded" },
    { match: "ISTJ", score: 80, tip: "Reliable adventurers" },
    { match: "ESFP", score: 79, tip: "Double the fun, double the action" },
  ],
  "ESFP": [
    { match: "ISFJ", score: 88, tip: "Balance of fun and warmth" },
    { match: "ISTJ", score: 85, tip: "Yin and yang perfection" },
    { match: "ESTP", score: 79, tip: "Life of every party, together" },
  ],
};

// Personality Evolution Timeline Data
const EVOLUTION_STAGES: Record<string, { current: string; growth: string; peak: string; mature: string }> = {
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

// 30-Day Growth Quest Challenges
const GROWTH_QUESTS: Record<string, { week1: string[]; week2: string[]; week3: string[]; week4: string[] }> = {
  "O": {
    week1: ["Try one new food or drink", "Listen to a genre of music you've never explored", "Take a different route to a familiar place", "Read an article about something you know nothing about", "Draw or doodle for 5 minutes"],
    week2: ["Watch a documentary on an unfamiliar topic", "Start a conversation with someone new", "Try a 10-minute meditation", "Cook something without a recipe", "Visit a new neighborhood or shop"],
    week3: ["Learn 5 words in a new language", "Experiment with a new hobby for 30 minutes", "Challenge one belief you hold", "Create something from scratch", "Attend a free online class"],
    week4: ["Write about your ideal day 10 years from now", "Try an unusual combination of flavors", "Ask someone about their passion and truly listen", "Complete a creative project you started", "Reflect: what new thing will you keep doing?"],
  },
  "C": {
    week1: ["Set one timer today to stay on track", "Write down 3 tasks before starting your day", "Complete one small task before checking your phone", "Organize one drawer or digital folder", "Review your day for 2 minutes before bed"],
    week2: ["Block 30 min for deep work, no distractions", "Create a simple checklist for a recurring task", "Set a reminder for something you keep forgetting", "Do the hardest task first tomorrow", "Track one habit (water, steps, etc.)"],
    week3: ["Plan your entire next week on Sunday", "Automate or delegate one small thing", "Finish something you've been putting off", "Review what's working and what's not", "Say no to one low-priority request"],
    week4: ["Create a 90-day goal with milestones", "Build a morning or evening routine", "Audit your commitments—what can you drop?", "Celebrate a completed goal, any size", "Reflect: what systems help you most?"],
  },
  "E": {
    week1: ["Compliment someone genuinely today", "Start a casual chat with a stranger", "Call instead of text one friend", "Attend one social event this week", "Share something personal with a trusted person"],
    week2: ["Organize a small gathering (2+ people)", "Practice active listening in every convo", "Join an online community or forum", "Collaborate on a project with someone", "Express appreciation to 3 people"],
    week3: ["Lead a group activity or meeting", "Reconnect with someone from your past", "Volunteer or help at a community event", "Give a small presentation or share a skill", "Introduce two people who might click"],
    week4: ["Host a dinner or video call hangout", "Mentor or teach someone briefly", "Plan a future social event on your calendar", "Reflect on your social wins this month", "Share your growth journey with a friend"],
  },
  "A": {
    week1: ["Let someone go first in line today", "Send an encouraging message to someone", "Listen without giving advice once", "Do a small favor without being asked", "Apologize for something, even if small"],
    week2: ["Ask someone how they're really doing", "Donate or give away one item", "Offer help to a colleague or friend", "Write a thank-you note (physical or digital)", "Be patient with someone who frustrates you"],
    week3: ["Volunteer your time for 1 hour", "Give genuine praise in a group setting", "Resolve a minor conflict peacefully", "Support someone's idea even if you disagree", "Share credit for a success"],
    week4: ["Forgive someone (even silently)", "Perform a random act of kindness", "Celebrate someone else's win publicly", "Practice empathy with a difficult person", "Reflect: how has kindness changed you?"],
  },
  "N": {
    week1: ["Name 3 things you're grateful for", "Breathe deeply for 2 minutes", "Limit news intake to 10 minutes today", "Take a 15-minute walk outside", "Journal one worry, then close the book"],
    week2: ["Try a 5-minute body scan meditation", "Reduce caffeine or sugar today", "Practice box breathing: 4-4-4-4", "Set boundaries on one stressor", "Do something purely for fun"],
    week3: ["Identify one recurring worry pattern", "Create a worry time (15 min, then stop)", "Exercise for 20 minutes", "Reach out to someone supportive", "Practice self-compassion when you slip"],
    week4: ["Celebrate small emotional wins", "Build a go-to calm-down ritual", "Plan regular stress-relief activities", "Track your mood for insight", "Reflect: what helps you feel centered?"],
  },
};

// Get weakest Big Five trait for Growth Quest
function getWeakestTrait(bigFive: { O: number; C: number; E: number; A: number; N: number }): string {
  const entries = Object.entries(bigFive);
  // For Neuroticism, higher is "weaker" (more stress), so we invert
  const adjusted = entries.map(([k, v]) => [k, k === 'N' ? 100 - v : v] as [string, number]);
  return adjusted.reduce((a, b) => a[1] < b[1] ? a : b)[0];
}

export default function Results({ scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, onRestart, onShare }: ResultsProps) {
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const { teamName, isLocalitySet } = useLocalityTheme();
  
  const isTestPremium = new URLSearchParams(window.location.search).get('test_premium') === 'true';
  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium);
  
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Premium feature states
  const [selectedQuestWeek, setSelectedQuestWeek] = useState<1 | 2 | 3 | 4>(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  
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

  // DEV MODE: Set to true to bypass Stripe and preview premium features
  const DEV_BYPASS_PAYMENT = true;
  
  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    // DEV MODE: Skip payment and unlock premium immediately
    if (DEV_BYPASS_PAYMENT) {
      console.log('[DEV MODE] Payment bypassed - unlocking premium features for preview');
      toast({
        title: "Premium Unlocked (Dev Mode)",
        description: "Payment bypassed for testing. You can now see premium features!",
      });
      setIsPremiumUnlocked(true);
      setIsCheckingOut(false);
      return;
    }
    
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

  const handleShowFullResults = async () => {
    if (!allFeedbackAnswered) return;
    
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const feedbackData = {
      sessionId: sessionId || null,
      resultsAccurate,
      questionsEngaging,
      wouldShare,
      suggestions,
      mbtiType: result?.mbtiType || null,
      discStyle: result?.discStyle || null,
      primaryRole: result?.primaryRole.title || null,
      tier,
      mood,
      funMode,
      timestamp: new Date().toISOString()
    };
    
    // Save feedback to backend for Google Sheets export
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      console.log("Feedback saved successfully:", feedbackData);
    } catch (error) {
      console.error("Failed to save feedback:", error);
      // Continue anyway - don't block user from seeing results
    }
    
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
        {/* TIER 1: PRE-FEEDBACK (TEASER) - Always visible */}
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
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-green/10 text-sage-green mb-3">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm font-semibold">{result.primaryRole.salary}</span>
              </div>
              <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed max-w-xs mx-auto">
                {result.primaryRole.desc} {result.mbtiType.includes('E') 
                  ? "Your natural energy and communication style make you well-suited for this role." 
                  : "Your thoughtful, focused approach brings unique value to this field."}
              </p>
              
              <div className="grid grid-cols-1 gap-4 mt-6">
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center px-4 py-5 rounded-2xl bg-terracotta/8 dark:bg-terracotta/15 border border-terracotta/20"
                >
                  <Brain className="w-6 h-6 text-terracotta mx-auto mb-2" />
                  <p className="text-xs text-terracotta font-semibold tracking-wide uppercase mb-1">
                    {funMode ? result.mbtiType : `MBTI ${result.mbtiType}`}
                  </p>
                  <p className="text-sm font-medium text-terracotta mb-1">
                    {funMode && FUN_MODE_TITLES[result.mbtiType] 
                      ? FUN_MODE_TITLES[result.mbtiType]
                      : result.mbtiLabel}
                  </p>
                  <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
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
                  <p className="text-xs text-sage-green font-semibold tracking-wide uppercase mb-1">
                    {funMode ? result.discStyle : `DISC ${result.discStyle}`}
                  </p>
                  <p className="text-sm font-medium text-sage-green mb-1">
                    {funMode && FUN_MODE_DISC[result.discStyle] 
                      ? FUN_MODE_DISC[result.discStyle].nickname
                      : result.discLabel}
                  </p>
                  <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
                    {funMode && FUN_MODE_DISC[result.discStyle]
                      ? FUN_MODE_DISC[result.discStyle].vibe
                      : result.discDesc}
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

        {/* TIER 2: POST-FEEDBACK (FULL) - MBTI/DISC side-by-side cards */}
        {isFull && (
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
                <p className="text-xs text-warm-gray/60 dark:text-soft-cream/60 mb-1">
                  {funMode ? "Your Title" : "MBTI Type"}
                </p>
                <p className="text-lg font-bold font-mono text-terracotta" data-testid="text-mbti">
                  {result.mbtiType}
                </p>
                <p className="text-sm font-medium text-warm-gray dark:text-soft-cream">
                  {funMode && FUN_MODE_TITLES[result.mbtiType] 
                    ? FUN_MODE_TITLES[result.mbtiType]
                    : result.mbtiLabel}
                </p>
              </CardContent>
            </Card>

            <Card className={`${discColorMap[result.discColor] || "bg-sage-green text-white"} border-0`}>
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-2">
                  <Award className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-xs opacity-70 mb-1">
                  {funMode ? "Your Vibe" : "DISC Style"}
                </p>
                <p className="text-lg font-bold" data-testid="text-disc">
                  {funMode && FUN_MODE_DISC[result.discStyle] 
                    ? FUN_MODE_DISC[result.discStyle].nickname 
                    : result.discLabel}
                </p>
                <p className="text-sm font-medium opacity-90">
                  {funMode && FUN_MODE_DISC[result.discStyle]
                    ? result.discStyle + "-type energy"
                    : result.discStyle + "-type"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TIER 2: Top Big Five Trait badge (only post-feedback) */}
        {isFull && (
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
        )}

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
                  className="space-y-3"
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
                  
                  {FUN_MODE_DISC[result.discStyle] && (
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Your Vibe Check</span>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          {FUN_MODE_DISC[result.discStyle].vibe}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Thinking Scales moved to Premium tier as combined "Analytical Thinking" */}

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

              {isPremiumUnlocked ? (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  {/* Premium Badge */}
                  <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-emerald-400 dark:border-emerald-600 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full" />
                    <CardContent className="p-5 text-center relative z-10">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-3"
                      >
                        <Crown className="w-7 h-7 text-white" />
                      </motion.div>
                      <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                        Premium Unlocked
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Welcome to your full personality journey
                      </p>
                    </CardContent>
                  </Card>

                  {/* Deep Dive Analysis */}
                  <Card className="bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-violet-700 dark:text-violet-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        Deep Dive Analysis
                      </h5>
                      <div className="text-sm text-warm-gray/80 dark:text-soft-cream/70 space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800">
                          <p className="font-semibold text-violet-800 dark:text-violet-200 mb-2">Why {result?.primaryRole.title}?</p>
                          <p className="leading-relaxed text-sm">
                            Your <span className="font-semibold text-violet-600 dark:text-violet-400">{result?.mbtiType}</span> personality type reveals a natural inclination toward {result?.mbtiType.includes('N') ? 'abstract thinking and future possibilities' : 'practical solutions and concrete details'}. Combined with your <span className="font-semibold text-violet-600 dark:text-violet-400">{result?.discLabel}</span> DISC profile, you bring a unique blend of strengths.
                          </p>
                        </div>
                        <p className="leading-relaxed">
                          Your Big Five profile shows strong <span className="font-medium">{TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]?.toLowerCase() || 'characteristics'}</span> ({topTrait[1]}%), suggesting you {topTrait[1] > 60 ? 'naturally excel in environments that leverage this trait' : 'can develop this area further with the right opportunities'}. People with your combination typically thrive when given {result?.mbtiType.includes('E') ? 'collaborative projects and team leadership opportunities' : 'focused time and space to develop deep expertise'}.
                        </p>
                        <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 italic flex items-center gap-1.5">
                          <Shield className="w-3 h-3" />
                          Based on {scores.responses.length} quiz responses
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* +2 Extra Role Matches */}
                  <Card className="bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-400" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                          <Gift className="w-4 h-4" />
                        </div>
                        +2 Extra Role Matches
                      </h5>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-warm-gray dark:text-soft-cream">
                                {result?.mbtiType.includes('N') ? 'Innovation Strategist' : 'Operations Specialist'}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                                {result?.mbtiType.includes('N') ? '$70K-130K' : '$55K-95K'}
                              </p>
                              <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
                                {result?.mbtiType.includes('N') 
                                  ? 'Your intuitive thinking makes you excellent at spotting trends and developing creative solutions.'
                                  : 'Your practical approach makes you ideal for streamlining processes and ensuring quality.'}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center flex-shrink-0">
                              <Rocket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-warm-gray dark:text-soft-cream">
                                {result?.discStyle === 'I' || result?.discStyle === 'D' ? 'Team Lead / Facilitator' : 'Technical Specialist'}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                                {result?.discStyle === 'I' || result?.discStyle === 'D' ? '$60K-110K' : '$65K-120K'}
                              </p>
                              <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 leading-relaxed">
                                {result?.discStyle === 'I' || result?.discStyle === 'D'
                                  ? 'Your natural ability to energize others positions you well for leadership roles.'
                                  : 'Your methodical approach makes you invaluable in technical roles requiring deep expertise.'}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personality Evolution Timeline - NEW FEATURE */}
                  <Card className="bg-white dark:bg-gray-800 border-cyan-200 dark:border-cyan-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-cyan-700 dark:text-cyan-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                          <Compass className="w-4 h-4" />
                        </div>
                        Personality Evolution Timeline
                      </h5>
                      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-4">
                        How your {result?.mbtiType} traits typically evolve through life stages
                      </p>
                      
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-300 via-blue-400 to-indigo-500 dark:from-cyan-600 dark:via-blue-500 dark:to-indigo-400" />
                        
                        <div className="space-y-4">
                          {/* Now */}
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-gray-800">
                              <CircleDot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-xs font-bold text-warm-gray dark:text-soft-cream uppercase tracking-wide">Now</p>
                              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">{EVOLUTION_STAGES[result?.mbtiType?.[0] as keyof typeof EVOLUTION_STAGES]?.current || "Building your foundation"}</p>
                            </div>
                          </div>
                          {/* Growth */}
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-gray-800">
                              <Sunrise className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-xs font-bold text-warm-gray dark:text-soft-cream uppercase tracking-wide">Growth</p>
                              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">{EVOLUTION_STAGES[result?.mbtiType?.[0] as keyof typeof EVOLUTION_STAGES]?.growth || "Expanding your horizons"}</p>
                            </div>
                          </div>
                          {/* Peak */}
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-gray-800">
                              <Mountain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-xs font-bold text-warm-gray dark:text-soft-cream uppercase tracking-wide">Peak</p>
                              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">{EVOLUTION_STAGES[result?.mbtiType?.[0] as keyof typeof EVOLUTION_STAGES]?.peak || "Mastering your craft"}</p>
                            </div>
                          </div>
                          {/* Wisdom */}
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-gray-800">
                              <Crown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-xs font-bold text-warm-gray dark:text-soft-cream uppercase tracking-wide">Wisdom</p>
                              <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60">{EVOLUTION_STAGES[result?.mbtiType?.[0] as keyof typeof EVOLUTION_STAGES]?.mature || "Sharing your knowledge"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Compatibility Cards - NEW FEATURE */}
                  <Card className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-red-400" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-pink-700 dark:text-pink-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                          <Users className="w-4 h-4" />
                        </div>
                        Team Compatibility
                      </h5>
                      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-4">
                        Best personality matches for collaboration
                      </p>
                      
                      <div className="space-y-3">
                        {(COMPATIBILITY_MATRIX[result?.mbtiType || "INTJ"] || COMPATIBILITY_MATRIX["INTJ"]).map((match, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-100 dark:border-pink-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-pink-700 dark:text-pink-300">{result?.mbtiType} + {match.match}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg font-bold text-pink-600 dark:text-pink-400">{match.score}%</span>
                                <div className="flex">
                                  {[1, 2, 3].map((n) => (
                                    <Heart
                                      key={n}
                                      className={`w-3 h-3 ${n <= Math.ceil(match.score / 35) ? 'text-pink-500 fill-pink-500' : 'text-pink-200 dark:text-pink-800'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-warm-gray/70 dark:text-soft-cream/60 italic">"{match.tip}"</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 30-Day Growth Quest - NEW FEATURE */}
                  <Card className="bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                          <Target className="w-4 h-4" />
                        </div>
                        30-Day Growth Quest
                      </h5>
                      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mb-4">
                        Personalized challenges to strengthen your {TRAIT_LABELS[getWeakestTrait(result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 }) as keyof typeof TRAIT_LABELS]?.toLowerCase() || "growth area"}
                      </p>
                      
                      {/* Week selector */}
                      <div className="flex gap-2 mb-4">
                        {([1, 2, 3, 4] as const).map((week) => (
                          <button
                            key={week}
                            onClick={() => setSelectedQuestWeek(week)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                              selectedQuestWeek === week
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50'
                            }`}
                            data-testid={`button-quest-week-${week}`}
                          >
                            Week {week}
                          </button>
                        ))}
                      </div>
                      
                      {/* Challenges list */}
                      <div className="space-y-2">
                        {(() => {
                          const weakTrait = getWeakestTrait(result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 });
                          const quests = GROWTH_QUESTS[weakTrait] || GROWTH_QUESTS["O"];
                          const weekKey = `week${selectedQuestWeek}` as keyof typeof quests;
                          const challenges = quests[weekKey] || [];
                          
                          return challenges.slice(0, 5).map((challenge, idx) => {
                            const challengeId = `${weakTrait}-w${selectedQuestWeek}-${idx}`;
                            const isCompleted = completedChallenges.has(challengeId);
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  const newSet = new Set(completedChallenges);
                                  if (isCompleted) {
                                    newSet.delete(challengeId);
                                  } else {
                                    newSet.add(challengeId);
                                    if (navigator.vibrate) navigator.vibrate(30);
                                  }
                                  setCompletedChallenges(newSet);
                                }}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                }`}
                                data-testid={`button-challenge-${idx}`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <p className={`text-sm flex-1 ${
                                  isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-300 line-through opacity-75'
                                    : 'text-warm-gray dark:text-soft-cream'
                                }`}>
                                  {challenge}
                                </p>
                              </button>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {completedChallenges.size} / 20 challenges completed
                          </span>
                          <div className="flex items-center gap-1">
                            <Flame className={`w-4 h-4 ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
                            <span className={`font-bold ${completedChallenges.size >= 5 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                              {completedChallenges.size >= 5 ? `${Math.floor(completedChallenges.size / 5)} week streak!` : 'Start your streak'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytical Thinking */}
                  <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border-indigo-200 dark:border-indigo-800">
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                          <Brain className="w-4 h-4" />
                        </div>
                        Analytical Thinking
                      </h5>
                      <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                            Problem-Solving Score
                          </span>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const critScore = result?.scales?.critical?.value || 3;
                              const fpScore = result?.scales?.firstPrinciples?.value || 2;
                              const combinedScore = Math.min(3, Math.round((critScore + fpScore) / 3.5));
                              return (
                                <>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3].map((n) => (
                                      <Star
                                        key={n}
                                        className={`w-5 h-5 ${
                                          n <= combinedScore
                                            ? "text-indigo-500 fill-indigo-500"
                                            : "text-indigo-200 dark:text-indigo-700"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                          {result?.scales?.critical?.value && result.scales.critical.value >= 3 
                            ? "You demonstrate strong analytical skills and break down complex problems effectively." 
                            : "You have room to grow in analytical thinking. Focus on questioning assumptions."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arc Tracker */}
                  <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
                    <CardContent className="p-5">
                      <h5 className="text-base font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        Arc Tracker
                      </h5>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">First Assessment</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mt-1">Retake in 3-6 months to track growth</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Retest Button */}
                  <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
                    <CardContent className="p-5 text-center">
                      <RefreshCw className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                      <h5 className="text-base font-bold text-pink-700 dark:text-pink-300 mb-2">Ready for a Retest?</h5>
                      <p className="text-sm text-warm-gray/70 dark:text-soft-cream/60 mb-4">
                        Compare your results to see how you've evolved
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-pink-300 text-pink-700 hover:bg-pink-100 dark:border-pink-600 dark:text-pink-300 dark:hover:bg-pink-900/30" 
                        onClick={onRestart}
                        data-testid="button-retest"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Take Quiz Again
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* COMPELLING CTA - Locked State */
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 border-2 border-amber-400/50 dark:border-amber-600/50 overflow-hidden relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-300/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-tr-full" />
                    
                    <CardContent className="p-6 relative z-10">
                      {/* Premium badge */}
                      <div className="text-center mb-5">
                        <motion.div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-400 shadow-lg shadow-orange-500/30 mb-4"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h4 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                          Unlock Your Full Potential
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Go deeper with premium insights
                        </p>
                      </div>
                      
                      {/* Feature grid - 6 features */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {[
                          { icon: Gift, title: "+2 Role Matches", desc: "More career paths" },
                          { icon: BookOpen, title: "Deep Dive", desc: "Full analysis" },
                          { icon: Compass, title: "Evolution Map", desc: "Life stage growth" },
                          { icon: Users, title: "Compatibility", desc: "Team matching" },
                          { icon: Target, title: "30-Day Quest", desc: "Growth challenges" },
                          { icon: TrendingUp, title: "Arc Tracker", desc: "Track progress" },
                        ].map((feature, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-amber-200/50 dark:border-amber-700/50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <feature.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-900 dark:text-amber-100">{feature.title}</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Price callout */}
                      <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-4 mb-4 border border-amber-200 dark:border-amber-700 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">$9</span>
                          <span className="text-sm text-amber-600 dark:text-amber-400">one-time</span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Lifetime access. No subscription. Ever.
                        </p>
                      </div>
                      
                      {/* CTA Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-base py-6 shadow-lg shadow-orange-500/30 transition-all"
                        onClick={handleUpgrade}
                        disabled={isCheckingOut}
                        data-testid="button-upgrade"
                      >
                        {isCheckingOut ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-5 h-5 mr-2" />
                            Unlock Premium Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                      
                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-amber-600/70 dark:text-amber-400/70">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Secure checkout
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Support indie dev
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
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
