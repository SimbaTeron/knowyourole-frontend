import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Trophy, Target, Brain, Heart, Users, RefreshCw, Share2, 
  Briefcase, TrendingUp, ChevronRight, ChevronDown, Zap, Award, MapPin, Lightbulb, Flame,
  MessageCircle, Frown, Meh, Smile, Lock, Crown, Star, Gift, BookOpen,
  Rocket, Timer, CheckCircle2, Calendar, ArrowRight, ArrowLeft, Shield, Compass, 
  Mountain, Sunrise, CircleDot, Play, Building2, DollarSign, PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuizScores } from "./Quiz";
import rolesData from "@/data/roles.json";
import { useToast } from "@/hooks/use-toast";
import { useLocalityTheme } from "@/contexts/LocalityThemeContext";
import { getLocaleInsight, getPersonalizedInsight, type LocaleInsight } from "@/data/localeInsights";
import { getRegionalSalary, shouldShowSalary } from "@/data/regionalSalaries";
import { PremiumCardDeck } from "./PremiumCardDeck";

interface APIScales {
  critical: { value: number; traits: string; quest: string };
  firstPrinciples: { value: number; traits: string; quest: string };
}

// Phase 2.2: Badge interface for earned achievements
interface EarnedBadge {
  name: string;
  type: string;
  icon: string;
  color: string;
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
  earnedBadges?: EarnedBadge[];
  hybridTypes?: string[];
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
  const normalize = (val: number) => Math.round(Math.max(5, Math.min(95, 50 + val * 12)));
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
  O: { bg: "bg-violet-500", text: "text-violet-600", fill: "rgba(139, 92, 246, 0.3)", border: "rgb(139, 92, 246)", ring: "ring-violet-500" },
  C: { bg: "bg-blue-500", text: "text-blue-600", fill: "rgba(59, 130, 246, 0.3)", border: "rgb(59, 130, 246)", ring: "ring-blue-500" },
  E: { bg: "bg-amber-500", text: "text-amber-600", fill: "rgba(245, 158, 11, 0.3)", border: "rgb(245, 158, 11)", ring: "ring-amber-500" },
  A: { bg: "bg-emerald-500", text: "text-emerald-600", fill: "rgba(16, 185, 129, 0.3)", border: "rgb(16, 185, 129)", ring: "ring-emerald-500" },
  N: { bg: "bg-rose-500", text: "text-rose-600", fill: "rgba(244, 63, 94, 0.3)", border: "rgb(244, 63, 94)", ring: "ring-rose-500" },
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

const TRAIT_QUARTILE_DESCRIPTIONS: Record<string, Record<string, { vibe: string; description: string }>> = {
  O: {
    low: { 
      vibe: "Steady Traditionalist", 
      description: "You love familiar routines and practical details—like a cozy librarian curating timeless classics, thriving in structured worlds where reliability trumps reinvention." 
    },
    lowMid: { 
      vibe: "Balanced Appreciator", 
      description: "You enjoy a dash of novelty but stick to proven paths—like a weekend hobbyist tinkering with grandma's recipes, blending comfort with occasional tweaks." 
    },
    midHigh: { 
      vibe: "Curious Explorer", 
      description: "You dip into ideas with enthusiasm—like a book club enthusiast debating plot twists over coffee, weaving fresh perspectives into everyday chats." 
    },
    high: { 
      vibe: "Boundless Visionary", 
      description: "You chase wild 'what ifs' and abstract dreams—like a street artist turning urban walls into surreal stories, fueled by endless curiosity." 
    }
  },
  C: {
    low: { 
      vibe: "Free-Spirited Improviser", 
      description: "You flow with the moment over checklists—like a spontaneous road-tripper packing light and letting detours dictate the adventure." 
    },
    lowMid: { 
      vibe: "Flexible Doer", 
      description: "You start strong but adapt on the fly—like a casual gardener planting intuitively, weeding when inspired rather than on schedule." 
    },
    midHigh: { 
      vibe: "Dependable Achiever", 
      description: "You plan just enough to deliver—like a project coordinator juggling tasks with a trusty notebook, hitting milestones reliably." 
    },
    high: { 
      vibe: "Meticulous Mastermind", 
      description: "You have laser-focused discipline—like an elite chef prepping every ingredient hours ahead, orchestrating flawless meals through unwavering routines." 
    }
  },
  E: {
    low: { 
      vibe: "Serene Solo Navigator", 
      description: "You recharge in quiet depths—like a midnight reader lost in novels by lamplight, savoring intimate connections over crowds." 
    },
    lowMid: { 
      vibe: "Selective Socializer", 
      description: "You shine in small circles—like a coffee shop conversationalist trading stories with a few friends, drawing energy from meaningful exchanges." 
    },
    midHigh: { 
      vibe: "Engaging Connector", 
      description: "You thrive in moderate mingles—like a team brainstormer rallying ideas at lunch meetups, energizing groups with charm." 
    },
    high: { 
      vibe: "Magnetic Energizer", 
      description: "You light up every room—like a festival host weaving through crowds with infectious laughs, turning strangers into instant allies." 
    }
  },
  A: {
    low: { 
      vibe: "Bold Challenger", 
      description: "You prioritize truth over harmony—like a witty debater at dinner parties, cutting through fluff with sharp insights." 
    },
    lowMid: { 
      vibe: "Pragmatic Peacemaker", 
      description: "You compromise strategically—like a negotiation-savvy colleague advocating firmly but fairly, blending empathy with a no-nonsense edge." 
    },
    midHigh: { 
      vibe: "Warm Collaborator", 
      description: "You foster easy alliances—like a community organizer smoothing group tensions with genuine smiles, building bridges through kindness." 
    },
    high: { 
      vibe: "Heartfelt Harmonizer", 
      description: "You put others first—like a devoted mentor cheering on dreams with unwavering support, creating ripple effects of positivity." 
    }
  },
  N: {
    low: { 
      vibe: "Unflappable Zen Master", 
      description: "You roll with life's punches—like a surfer riding waves without a flinch, channeling calm focus into steady progress." 
    },
    lowMid: { 
      vibe: "Even-Keeled Responder", 
      description: "You feel dips but bounce quick—like a hiker pausing at tough trails for a breath, then pushing on with quiet resilience." 
    },
    midHigh: { 
      vibe: "Attuned Empath", 
      description: "You navigate emotions with depth—like a journal-keeping friend processing worries into wisdom, turning inner turbulence into empathetic connections." 
    },
    high: { 
      vibe: "Passionate Feeler", 
      description: "Your intensity fuels profound change—like an activist pouring heart into causes, transforming raw sensitivity into powerful advocacy." 
    }
  }
};

function getQuartileKey(value: number): string {
  if (value <= 25) return "low";
  if (value <= 50) return "lowMid";
  if (value <= 75) return "midHigh";
  return "high";
}

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

const HYBRID_TYPE_DESCRIPTIONS: Record<string, { short: string; description: string }> = {
  "Ambivert": { 
    short: "Best of Both Worlds", 
    description: "You're equally comfortable in social settings and alone time. You can adapt your energy to match any situation—turning up the charm when needed, then recharging in solitude." 
  },
  "Ambi-Sensing": { 
    short: "Practical Dreamer", 
    description: "You blend real-world awareness with imaginative thinking. You notice details others miss while also seeing the bigger picture and future possibilities." 
  },
  "Ambi-Judging": { 
    short: "Flexible Planner", 
    description: "You appreciate structure but aren't rigid about it. You can make plans and stick to them, or pivot gracefully when life throws curveballs." 
  },
  "Thinking-Feeling Balance": { 
    short: "Heart & Head Harmony", 
    description: "You make decisions using both logic and empathy. You consider the facts while also understanding how choices affect people's feelings." 
  },
  "Balanced Mind": { 
    short: "Steady Navigator", 
    description: "Your emotional landscape is remarkably even. You experience the full range of feelings without getting stuck in extremes, maintaining calm under pressure." 
  },
  "Balanced Openness": { 
    short: "Curious Yet Grounded", 
    description: "You're open to new ideas while respecting tradition. You explore innovation without losing sight of what's tried and true." 
  },
  "Balanced Conscientiousness": { 
    short: "Organized Free Spirit", 
    description: "You can focus when it counts but also know when to relax. Your productivity comes in waves, and you're at peace with that rhythm." 
  },
  "Balanced Agreeableness": { 
    short: "Diplomatic Straight-Shooter", 
    description: "You stand your ground while remaining kind. You can disagree without being disagreeable, and cooperate without being a pushover." 
  },
  "Balanced Extraversion": { 
    short: "Social Chameleon", 
    description: "You flow easily between group energy and solo time. You're neither the life of the party nor a wallflower—you're wherever you need to be." 
  },
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

// WEAKNESS BLINDSPOTS DATA - Based on MBTI and Big Five
const WEAKNESS_BLINDSPOTS: Record<string, { title: string; blindspot: string; workaround: string; realWorld: string }[]> = {
  "INTJ": [
    { title: "Dismissing Others' Ideas", blindspot: "You might shut down suggestions before fully hearing them out.", workaround: "Ask 'What if this worked?' before critiquing.", realWorld: "Try letting a team member lead a small project their way." },
    { title: "Over-Planning", blindspot: "Waiting for the perfect plan can mean missing opportunities.", workaround: "Set a 'good enough' threshold and act.", realWorld: "Launch that project at 80% instead of waiting for 100%." },
  ],
  "INTP": [
    { title: "Analysis Paralysis", blindspot: "You can get lost researching when action is needed.", workaround: "Time-box your research with a hard deadline.", realWorld: "Give yourself 2 hours max to research, then decide." },
    { title: "Avoiding Emotions", blindspot: "Skipping emotional conversations damages relationships.", workaround: "Schedule regular check-ins with people who matter.", realWorld: "Ask 'How are we doing?' to one person weekly." },
  ],
  "ENTJ": [
    { title: "Steamrolling Others", blindspot: "Your drive can make others feel unheard.", workaround: "Ask for input before sharing your conclusion.", realWorld: "In your next meeting, speak last instead of first." },
    { title: "Impatience with Process", blindspot: "Rushing can create mistakes and resentment.", workaround: "Build in buffer time for others to catch up.", realWorld: "Add 20% more time to project estimates." },
  ],
  "ENTP": [
    { title: "Starting Without Finishing", blindspot: "New ideas distract you from completing current ones.", workaround: "Keep a 'parking lot' list for future ideas.", realWorld: "Finish one project before allowing yourself to start another." },
    { title: "Arguing for Sport", blindspot: "Debating can feel like attacking to others.", workaround: "State 'I'm just exploring ideas' before debating.", realWorld: "Notice when someone gets defensive and shift gears." },
  ],
  "INFJ": [
    { title: "Absorbing Others' Stress", blindspot: "You take on problems that aren't yours to solve.", workaround: "Ask 'Is this my problem to fix?' before diving in.", realWorld: "Practice saying 'That sounds hard' instead of 'I'll fix it'." },
    { title: "Perfectionist Standards", blindspot: "Your high bar can paralyze you and frustrate others.", workaround: "Define 'done' before starting.", realWorld: "Ship something imperfect and iterate." },
  ],
  "INFP": [
    { title: "Conflict Avoidance", blindspot: "Unaddressed issues build into bigger problems.", workaround: "Address small issues before they grow.", realWorld: "Practice: 'Can I share something that's been on my mind?'" },
    { title: "Dreaming Without Acting", blindspot: "Beautiful visions need ugly first steps.", workaround: "Identify the smallest possible action today.", realWorld: "Spend 10 minutes on that dream project right now." },
  ],
  "ENFJ": [
    { title: "People-Pleasing Burnout", blindspot: "Saying yes to everyone means neglecting yourself.", workaround: "Check your energy before agreeing to help.", realWorld: "Practice: 'Let me check my schedule and get back to you.'" },
    { title: "Taking Rejection Personally", blindspot: "Others' choices aren't about your worth.", workaround: "Separate their decision from your value.", realWorld: "When rejected, list 3 things you're proud of." },
  ],
  "ENFP": [
    { title: "Overcommitting", blindspot: "Enthusiasm leads to impossible schedules.", workaround: "Halve the commitments, double the impact.", realWorld: "Before saying yes, check if you can realistically deliver." },
    { title: "Avoiding Boring Tasks", blindspot: "Necessary routines get neglected.", workaround: "Pair boring tasks with something enjoyable.", realWorld: "Listen to your favorite podcast only while doing admin work." },
  ],
  "ISTJ": [
    { title: "Rigidity", blindspot: "Sticking to 'how it's always done' misses better ways.", workaround: "Try one new approach monthly.", realWorld: "Ask a younger colleague how they'd approach your task." },
    { title: "Difficulty Delegating", blindspot: "Doing everything yourself limits growth.", workaround: "Delegate the how, keep the what.", realWorld: "Let someone else handle a task their way this week." },
  ],
  "ISFJ": [
    { title: "Difficulty Saying No", blindspot: "You exhaust yourself serving others.", workaround: "Your needs are needs too, not wants.", realWorld: "Decline one request this week without explaining why." },
    { title: "Change Resistance", blindspot: "Comfort zones can become prisons.", workaround: "Make small changes to build adaptability.", realWorld: "Take a different route or try a new restaurant." },
  ],
  "ESTJ": [
    { title: "Dismissing Feelings", blindspot: "Efficiency without empathy creates resentment.", workaround: "Acknowledge feelings before problem-solving.", realWorld: "Say 'That sounds frustrating' before offering solutions." },
    { title: "Control Issues", blindspot: "Micromanaging destroys trust and motivation.", workaround: "Define outcomes, not methods.", realWorld: "Assign a task with a deadline but no process instructions." },
  ],
  "ESFJ": [
    { title: "Seeking Approval", blindspot: "Others' opinions shouldn't define your worth.", workaround: "Build internal validation sources.", realWorld: "Do one thing purely because YOU want to this week." },
    { title: "Avoiding Conflict", blindspot: "Keeping peace now creates war later.", workaround: "Address issues while they're small.", realWorld: "Have that conversation you've been putting off." },
  ],
  "ISTP": [
    { title: "Emotional Distance", blindspot: "People need words, not just actions.", workaround: "Express care verbally, not just through doing.", realWorld: "Tell someone 'I appreciate you' out loud this week." },
    { title: "Impulsive Decisions", blindspot: "Acting fast sometimes means acting wrong.", workaround: "Count to 10 before major decisions.", realWorld: "Sleep on any decision over $100 or affecting others." },
  ],
  "ISFP": [
    { title: "Avoiding Structure", blindspot: "Some structure enables more creativity.", workaround: "Create minimal frameworks that free you.", realWorld: "Schedule your creative time like an appointment." },
    { title: "Taking Criticism Hard", blindspot: "Feedback is data, not an attack.", workaround: "Ask 'What can I learn?' before reacting.", realWorld: "Request feedback proactively to reduce surprise." },
  ],
  "ESTP": [
    { title: "Risk Blindness", blindspot: "Excitement can overshadow danger.", workaround: "Ask one cautious person before leaping.", realWorld: "Run your next big idea by the most skeptical person you know." },
    { title: "Impatience with Details", blindspot: "Skipping steps causes revisiting them later.", workaround: "Build in quick check moments.", realWorld: "Re-read that important email before sending." },
  ],
  "ESFP": [
    { title: "Present-Focus Blindness", blindspot: "Today's fun can be tomorrow's regret.", workaround: "Ask 'How will I feel about this in a week?'", realWorld: "Before a big purchase, wait 48 hours." },
    { title: "Conflict Avoidance", blindspot: "Keeping things light means leaving issues unresolved.", workaround: "Schedule serious conversations like appointments.", realWorld: "Block 15 minutes to address something you've avoided." },
  ],
};

const DEFAULT_BLINDSPOTS = [
  { title: "Blind to Blind Spots", blindspot: "We all have areas we can't see clearly about ourselves.", workaround: "Ask a trusted friend for honest feedback.", realWorld: "Have a 'what should I work on?' conversation with someone you trust." },
  { title: "Comfort Zone Trap", blindspot: "Staying comfortable can mean missing growth opportunities.", workaround: "Regularly try something that makes you slightly uncomfortable.", realWorld: "Sign up for one new experience this month." },
];

function getWeaknessBlindspots(mbtiType: string) {
  return WEAKNESS_BLINDSPOTS[mbtiType] || DEFAULT_BLINDSPOTS;
}

// CAREER PATH SIMULATOR - Day-in-the-life scenarios (25+ diverse roles)
const CAREER_SIMULATOR: Record<string, { title: string; morningRoutine: string; afternoonTasks: string; eveningReflection: string; satisfaction: string; growth: string }> = {
  "Software Developer": { 
    title: "Software Developer", 
    morningRoutine: "Coffee in hand, you review yesterday's code and check your team's Slack messages.",
    afternoonTasks: "Deep work time: you're building a feature that will help thousands of users.",
    eveningReflection: "That bug you fixed? It's live now, and users are thanking you.",
    satisfaction: "Creating something from nothing, seeing your work used worldwide.",
    growth: "In 5 years, you could be leading a team or architecting major systems."
  },
  "Nurse Practitioner": {
    title: "Nurse Practitioner",
    morningRoutine: "You check your patient list, prioritizing those who need immediate attention.",
    afternoonTasks: "Helping a worried parent understand their child's diagnosis and treatment plan.",
    eveningReflection: "A patient texted: 'Thank you for listening. I finally feel heard.'",
    satisfaction: "Direct impact on people's health and peace of mind every single day.",
    growth: "In 5 years, you might run your own clinic or specialize in a field you love."
  },
  "Electrician": {
    title: "Electrician",
    morningRoutine: "You load your truck and head to a job site, reviewing blueprints on the way.",
    afternoonTasks: "Wiring a new home that a family will move into next month.",
    eveningReflection: "Lights turn on. Everything works perfectly. That's all you.",
    satisfaction: "Tangible results you can see and touch. No two days are the same.",
    growth: "In 5 years, you might run your own crew or start your own business."
  },
  "Marketing Manager": {
    title: "Marketing Manager",
    morningRoutine: "You review campaign analytics over coffee, spotting trends others miss.",
    afternoonTasks: "Brainstorming session with your team on the next big product launch.",
    eveningReflection: "That tagline you wrote? It's everywhere now. People are talking about it.",
    satisfaction: "Creativity meets strategy. Your ideas reach millions.",
    growth: "In 5 years, you could be CMO or running your own agency."
  },
  "Social Worker": {
    title: "Social Worker",
    morningRoutine: "You prepare for today's home visits, reviewing case notes and resources.",
    afternoonTasks: "Helping a family navigate the system and find the support they need.",
    eveningReflection: "That teenager you helped? They're back in school and thriving.",
    satisfaction: "Being the bridge between people and the help they desperately need.",
    growth: "In 5 years, you might be a program director or policy advocate."
  },
  "Data Analyst": {
    title: "Data Analyst",
    morningRoutine: "You pull reports and start cleaning yesterday's data imports.",
    afternoonTasks: "Creating a dashboard that will help executives make better decisions.",
    eveningReflection: "Your insight saved the company from a costly mistake. They noticed.",
    satisfaction: "Finding stories in numbers that nobody else can see.",
    growth: "In 5 years, you could be a data science lead or analytics director."
  },
  "Firefighter": {
    title: "Firefighter",
    morningRoutine: "You check your gear, run equipment tests, and train with your crew.",
    afternoonTasks: "Responding to a call—could be a house fire, car accident, or medical emergency.",
    eveningReflection: "You helped rescue a family today. They're safe because of your team.",
    satisfaction: "Being there when people need you most. Real hero work.",
    growth: "In 5 years, you could be a lieutenant, paramedic captain, or fire inspector."
  },
  "Police Officer": {
    title: "Police Officer",
    morningRoutine: "Roll call briefing, checking your patrol car, reviewing incident reports.",
    afternoonTasks: "Community patrol, responding to calls, de-escalating a tense situation.",
    eveningReflection: "A scared kid you helped today felt safe enough to wave goodbye.",
    satisfaction: "Protecting your community and making real differences daily.",
    growth: "In 5 years, you might be a detective, SWAT member, or community liaison."
  },
  "Paramedic": {
    title: "Paramedic",
    morningRoutine: "Stocking the ambulance, checking meds, reviewing protocols with your partner.",
    afternoonTasks: "Racing to a cardiac arrest—your skills and speed save a life today.",
    eveningReflection: "That patient's family called dispatch to say thank you. You mattered.",
    satisfaction: "Being the difference between life and death in critical moments.",
    growth: "In 5 years, you could be a flight paramedic or EMS supervisor."
  },
  "Plumber": {
    title: "Plumber",
    morningRoutine: "Loading your van with pipes and fittings, checking today's job orders.",
    afternoonTasks: "Installing a new bathroom for a young couple's first home.",
    eveningReflection: "No leaks. Perfect joints. The homeowner shakes your hand warmly.",
    satisfaction: "Solving problems that people can't fix themselves. Essential work.",
    growth: "In 5 years, you might run your own plumbing company with a full crew."
  },
  "HVAC Technician": {
    title: "HVAC Technician",
    morningRoutine: "Checking your service schedule and gathering diagnostic tools.",
    afternoonTasks: "Fixing AC for a grateful family during a heat wave.",
    eveningReflection: "That elderly couple can sleep comfortably tonight because of you.",
    satisfaction: "Being the person who makes homes comfortable year-round.",
    growth: "In 5 years, you could specialize in commercial systems or own your business."
  },
  "Welder": {
    title: "Welder",
    morningRoutine: "Setting up your station, checking equipment, reviewing blueprints.",
    afternoonTasks: "Joining steel beams that will become part of a new bridge.",
    eveningReflection: "Your welds will hold for decades. That's craftsmanship.",
    satisfaction: "Building structures that will stand long after you're gone.",
    growth: "In 5 years, you could be a welding inspector, foreman, or underwater welder."
  },
  "Chef": {
    title: "Chef",
    morningRoutine: "Inspecting deliveries, prepping ingredients, briefing your kitchen team.",
    afternoonTasks: "Creating today's special—a dish that tells a story on every plate.",
    eveningReflection: "A guest asked to meet the chef. They called it the best meal of their life.",
    satisfaction: "Creating edible art that brings people joy and brings them together.",
    growth: "In 5 years, you might open your own restaurant or become an executive chef."
  },
  "Graphic Designer": {
    title: "Graphic Designer",
    morningRoutine: "Reviewing client briefs, sketching initial concepts, gathering inspiration.",
    afternoonTasks: "Crafting a brand identity that perfectly captures a startup's vision.",
    eveningReflection: "The client cried happy tears when they saw their new logo.",
    satisfaction: "Turning abstract ideas into visual stories that connect with people.",
    growth: "In 5 years, you could be an art director or running your own design studio."
  },
  "Physical Therapist": {
    title: "Physical Therapist",
    morningRoutine: "Reviewing patient charts, preparing treatment plans, setting up equipment.",
    afternoonTasks: "Helping a stroke survivor take their first unassisted steps in months.",
    eveningReflection: "Watching someone regain their independence—that's why you do this.",
    satisfaction: "Guiding people from pain and limitation back to full lives.",
    growth: "In 5 years, you might specialize in sports medicine or open your own clinic."
  },
  "Teacher": {
    title: "Teacher",
    morningRoutine: "Preparing lesson materials, decorating the classroom, greeting early arrivals.",
    afternoonTasks: "That 'aha moment' when a struggling student finally gets it.",
    eveningReflection: "A former student emails to say you changed their life. You cry a little.",
    satisfaction: "Shaping the future, one young mind at a time.",
    growth: "In 5 years, you might be a department head, curriculum designer, or principal."
  },
  "Farmer": {
    title: "Farmer",
    morningRoutine: "Up before dawn, feeding animals, checking crops, planning the day's work.",
    afternoonTasks: "Harvesting vegetables that will be on dinner tables by evening.",
    eveningReflection: "You grew food that will nourish families. There's pride in that.",
    satisfaction: "Working with the land, being part of something bigger than yourself.",
    growth: "In 5 years, you might expand to farmers markets or run a successful CSA."
  },
  "Mechanic": {
    title: "Mechanic",
    morningRoutine: "Opening the shop, reviewing service tickets, organizing your tools.",
    afternoonTasks: "Diagnosing a mysterious engine noise that three other shops missed.",
    eveningReflection: "That single mom's car will run safely for another year. Good day.",
    satisfaction: "Problem-solving with your hands. Fixing what others can't.",
    growth: "In 5 years, you might own your own shop or specialize in classic cars."
  },
  "Veterinarian": {
    title: "Veterinarian",
    morningRoutine: "Checking on overnight patients, reviewing surgery schedules, greeting staff.",
    afternoonTasks: "Saving a puppy that ate something it shouldn't have—again.",
    eveningReflection: "A little girl hugged her healthy cat goodbye. You made that possible.",
    satisfaction: "Healing animals and comforting the people who love them.",
    growth: "In 5 years, you might specialize in exotic animals or open your own practice."
  },
  "Architect": {
    title: "Architect",
    morningRoutine: "Reviewing project specifications, sketching concepts, meeting with clients.",
    afternoonTasks: "Designing a community center that will serve thousands for decades.",
    eveningReflection: "Your building won't just stand—it will inspire.",
    satisfaction: "Creating spaces where life happens. Shaping cities themselves.",
    growth: "In 5 years, you might be a partner or start your own firm."
  },
  "Accountant": {
    title: "Accountant",
    morningRoutine: "Reviewing financial statements, responding to client emails, checking deadlines.",
    afternoonTasks: "Finding a tax strategy that saves a small business $50,000.",
    eveningReflection: "That family business can now afford to hire their first employee.",
    satisfaction: "Being the trusted advisor who helps people build wealth.",
    growth: "In 5 years, you might be a CFO or run your own accounting firm."
  },
  "Personal Trainer": {
    title: "Personal Trainer",
    morningRoutine: "Early session with your most dedicated client, planning workout progressions.",
    afternoonTasks: "Coaching someone through their first-ever pull-up. Pure joy.",
    eveningReflection: "A client just hit a goal they thought was impossible. Your belief paid off.",
    satisfaction: "Transforming bodies and confidence, one workout at a time.",
    growth: "In 5 years, you might own a gym or build a successful online coaching business."
  },
  "Real Estate Agent": {
    title: "Real Estate Agent",
    morningRoutine: "Checking new listings, following up with leads, preparing for showings.",
    afternoonTasks: "Helping first-time buyers find their dream home within budget.",
    eveningReflection: "That couple just got the keys. They're crying happy tears.",
    satisfaction: "Being there for life's biggest purchases. Making dreams happen.",
    growth: "In 5 years, you might be a broker or lead your own real estate team."
  },
  "UX Designer": {
    title: "UX Designer",
    morningRoutine: "Reviewing user research, sketching wireframes, planning user tests.",
    afternoonTasks: "Redesigning a checkout flow that will reduce cart abandonment by 40%.",
    eveningReflection: "Millions of users will have a better experience because of your work.",
    satisfaction: "Making technology actually work for humans, not against them.",
    growth: "In 5 years, you could be a design lead or VP of Product Design."
  },
  "Construction Manager": {
    title: "Construction Manager",
    morningRoutine: "Site walk-through, safety briefing, coordinating with subcontractors.",
    afternoonTasks: "Solving a supply chain issue that could have delayed the project by weeks.",
    eveningReflection: "That building is on schedule and under budget. Leadership wins.",
    satisfaction: "Orchestrating complex projects that create lasting structures.",
    growth: "In 5 years, you might be overseeing multiple major projects or starting your own firm."
  },
  "Photographer": {
    title: "Photographer",
    morningRoutine: "Editing last night's shoot, responding to inquiries, scouting new locations.",
    afternoonTasks: "Capturing a couple's wedding—moments they'll treasure forever.",
    eveningReflection: "You froze time today. Those photos will be passed down for generations.",
    satisfaction: "Preserving life's most precious moments in art.",
    growth: "In 5 years, you might be shooting for major brands or teaching your craft."
  },
};

// SIDE HUSTLE FINDER - Based on personality traits
const SIDE_HUSTLES: Record<string, { name: string; fit: string; income: string; startupCost: string; timeCommit: string }[]> = {
  "creative-high": [
    { name: "Freelance Graphic Design", fit: "Your creativity shines in visual work.", income: "$25-75/hour", startupCost: "Low ($50-200)", timeCommit: "5-20 hours/week" },
    { name: "Content Creation", fit: "Your unique perspective attracts audiences.", income: "$100-2,000/month", startupCost: "Minimal", timeCommit: "10-15 hours/week" },
    { name: "Etsy Shop", fit: "Turn your crafts into cash.", income: "$200-2,000/month", startupCost: "Low ($100-500)", timeCommit: "10-20 hours/week" },
  ],
  "analytical-high": [
    { name: "Freelance Data Analysis", fit: "Companies need your number-crunching skills.", income: "$40-100/hour", startupCost: "Minimal", timeCommit: "10-20 hours/week" },
    { name: "Online Tutoring", fit: "Share your expertise with students.", income: "$30-80/hour", startupCost: "None", timeCommit: "5-15 hours/week" },
    { name: "Tax Prep Services", fit: "Your detail orientation is invaluable.", income: "$50-150/return", startupCost: "Low ($100-300)", timeCommit: "Seasonal" },
  ],
  "people-high": [
    { name: "Life Coaching", fit: "Your people skills help others thrive.", income: "$50-200/session", startupCost: "Low ($200-500)", timeCommit: "10-20 hours/week" },
    { name: "Event Planning", fit: "You make every gathering memorable.", income: "$500-3,000/event", startupCost: "Low", timeCommit: "Variable" },
    { name: "Airbnb Host", fit: "Your hospitality creates great experiences.", income: "$500-2,000/month", startupCost: "Medium", timeCommit: "5-10 hours/week" },
  ],
  "hands-on-high": [
    { name: "Handyman Services", fit: "Your fix-it skills are in demand.", income: "$35-75/hour", startupCost: "Medium ($200-1,000)", timeCommit: "10-25 hours/week" },
    { name: "Pet Sitting/Dog Walking", fit: "Turn your love of animals into income.", income: "$15-40/hour", startupCost: "Minimal", timeCommit: "Flexible" },
    { name: "Furniture Flipping", fit: "Your restoration skills add value.", income: "$100-500/piece", startupCost: "Low ($50-200)", timeCommit: "10-15 hours/week" },
  ],
  "default": [
    { name: "Freelance Writing", fit: "Everyone has valuable knowledge to share.", income: "$25-100/hour", startupCost: "None", timeCommit: "5-20 hours/week" },
    { name: "Virtual Assistant", fit: "Help busy professionals stay organized.", income: "$20-50/hour", startupCost: "Minimal", timeCommit: "10-30 hours/week" },
    { name: "Online Reselling", fit: "Turn finds into profit.", income: "$200-1,500/month", startupCost: "Low ($100-300)", timeCommit: "10-15 hours/week" },
  ],
};

// LEARNING STYLE DECODER - Based on personality
const LEARNING_STYLES: Record<string, { style: string; description: string; bestFor: string[]; tips: string[]; resources: string[] }> = {
  "visual-kinesthetic": {
    style: "Hands-On Visual Learner",
    description: "You learn best by doing and seeing. Abstract concepts click when you can visualize or physically work with them.",
    bestFor: ["Trade skills", "Lab sciences", "Design fields", "Sports/athletics"],
    tips: ["Draw diagrams while learning", "Use color-coding systems", "Build physical models or prototypes", "Watch video tutorials before reading"],
    resources: ["YouTube tutorials", "Interactive online labs", "Skillshare courses", "Maker spaces"],
  },
  "auditory-social": {
    style: "Discussion-Based Learner",
    description: "You absorb information through conversation and explanation. Teaching others helps you master material.",
    bestFor: ["Sales", "Counseling", "Teaching", "Leadership"],
    tips: ["Join study groups or mastermind groups", "Record yourself explaining concepts", "Use podcasts and audiobooks", "Discuss ideas with colleagues"],
    resources: ["Podcasts", "Clubhouse/audio apps", "Debate clubs", "Toastmasters"],
  },
  "reading-writing": {
    style: "Text-Based Learner",
    description: "You thrive with written material. Taking notes and reading deeply helps concepts stick.",
    bestFor: ["Research", "Writing", "Law", "Academia"],
    tips: ["Take detailed handwritten notes", "Rewrite key concepts in your own words", "Create summaries after each chapter", "Use flashcards for memorization"],
    resources: ["Books and articles", "Online courses with transcripts", "Research journals", "Note-taking apps"],
  },
  "logical-sequential": {
    style: "Step-by-Step Learner",
    description: "You learn best when information is presented logically with clear progression from simple to complex.",
    bestFor: ["Programming", "Engineering", "Finance", "Science"],
    tips: ["Create outlines before diving in", "Follow structured curricula", "Build on fundamentals before advancing", "Use flowcharts and decision trees"],
    resources: ["Structured online courses", "Textbooks with exercises", "Khan Academy", "Codecademy"],
  },
};

// Adventure Archetype type for Mini Explorer
interface AdventureArchetype {
  name: string;
  superpower: string;
  description: string;
  mission: string;
  badgeColor: string;
}

export default function Results({ scores, tier, mood, funMode, landmark, theme, sessionId, apiScales, earnedBadges = [], hybridTypes = [], onRestart, onShare }: ResultsProps) {
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [focusedTraitIndex, setFocusedTraitIndex] = useState<number>(-1);
  const { teamName, cityName, stateName, isLocalitySet } = useLocalityTheme();
  
  const localeInsight = cityName ? getLocaleInsight(cityName, stateName || undefined) : null;
  
  const isTestPremium = new URLSearchParams(window.location.search).get('test_premium') === 'true';
  const [dashboardStage, setDashboardStage] = useState<"teaser" | "full">(isTestPremium ? "full" : "teaser");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(isTestPremium);
  
  // Mini Explorer (ages 12 and under) - Adventure Archetype instead of job roles
  const isMiniExplorer = tier === "7-12";
  const [adventureArchetype, setAdventureArchetype] = useState<AdventureArchetype | null>(null);
  
  const [showJustKidding, setShowJustKidding] = useState(false);
  const [showDonationTiers, setShowDonationTiers] = useState(false);
  
  const [usefulApp, setUsefulApp] = useState<string>("");
  const [resultsAccurate, setResultsAccurate] = useState<string>("");
  const [questionsEngaging, setQuestionsEngaging] = useState<string>("");
  const [wouldShare, setWouldShare] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Premium feature states
  const [selectedQuestWeek, setSelectedQuestWeek] = useState<1 | 2 | 3 | 4>(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  
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

  // Fetch Adventure Archetype for all tiers
  useEffect(() => {
    if (!result) return;
    
    const fetchArchetype = async () => {
      try {
        const response = await fetch('/api/adventure-archetype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            openness: result.bigFiveProfile.O,
            conscientiousness: result.bigFiveProfile.C,
            extraversion: result.bigFiveProfile.E,
            agreeableness: result.bigFiveProfile.A,
            neuroticism: result.bigFiveProfile.N,
            mbtiType: result.mbtiType,
            discStyle: result.discStyle,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch archetype');
        const archetype = await response.json();
        setAdventureArchetype(archetype);
      } catch (error) {
        console.error('Failed to fetch adventure archetype:', error);
        // Fallback archetype
        setAdventureArchetype({
          name: "The Explorer",
          superpower: "You discover what others miss!",
          description: "You're always curious and asking 'why?' You love learning new things.",
          mission: "Find something new to explore today!",
          badgeColor: "#10B981",
        });
      }
    };
    
    fetchArchetype();
  }, [result]);

  // DEV MODE: Set to true to show Just Kidding page before premium unlock
  const DEV_BYPASS_PAYMENT = true;
  
  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    // Show Just Kidding interstitial instead of payment
    if (DEV_BYPASS_PAYMENT) {
      console.log('[DEV MODE] Showing Just Kidding interstitial');
      setShowJustKidding(true);
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

  const allFeedbackAnswered = usefulApp !== "" && resultsAccurate !== "" && questionsEngaging !== "" && wouldShare !== "" && suggestions.trim().length > 0;

  const handleShowFullResults = async () => {
    if (!allFeedbackAnswered) return;
    
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    
    const feedbackData = {
      sessionId: sessionId || null,
      usefulApp,
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
    const baseClasses = "flex-1 py-1.5 px-1.5 rounded-md text-[10px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";
    
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

  const handleProceedToResults = () => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    setShowJustKidding(false);
    setIsPremiumUnlocked(true);
    toast({
      title: "Premium Unlocked",
      description: "Enjoy your full personality insights!",
    });
  };

  const handleDonateClick = () => {
    setShowDonationTiers(true);
  };
  
  const handleDonationTierSelect = async (amount: number) => {
    try {
      const checkoutRes = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, sessionId: sessionId || undefined }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: "Donation Error",
        description: "Unable to process donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-36 bg-white dark:bg-gray-900">
      {/* Just Kidding Interstitial Overlay */}
      <AnimatePresence>
        {showJustKidding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-just-kidding"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-900/90 dark:via-cyan-900/80 dark:to-teal-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-teal-200 dark:border-teal-700"
            >
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="text-4xl font-bold text-teal-600 dark:text-teal-300 italic mb-4"
                style={{ fontFamily: "'Georgia', serif", textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
              >
                Just Kidding!
              </motion.p>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              
              <p className="text-lg font-semibold text-teal-700 dark:text-teal-200 mb-2">
                Premium is Free (For Now)
              </p>
              <p className="text-sm text-teal-600/80 dark:text-teal-300/70 mb-6">
                We're testing! Your two cents (literally $0.02) helps us build something great.
              </p>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={handleProceedToResults}
                  data-testid="button-proceed-results"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Proceed to Results
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-2 border-teal-400 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 font-semibold py-4"
                  onClick={handleDonateClick}
                  data-testid="button-donate-kidding"
                >
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Donate (Help us build)
                </Button>
              </div>
              
              <p className="text-xs text-teal-500/60 dark:text-teal-400/50 mt-4">
                All features unlocked free during testing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Donation Tiers Overlay */}
      <AnimatePresence>
        {showDonationTiers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            data-testid="overlay-donation-tiers"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/90 dark:via-orange-900/80 dark:to-amber-800/90 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-2 border-amber-200 dark:border-amber-700"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Heart className="w-10 h-10 text-white fill-current" />
              </motion.div>
              
              <p className="text-xl font-bold text-amber-700 dark:text-amber-200 mb-2">
                Support KnowRole
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-300/70 mb-6">
                Your donation helps us keep building and improving!
              </p>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => handleDonationTierSelect(333)}
                  data-testid="button-donate-333"
                >
                  $3.33
                </Button>
                
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg"
                  onClick={() => handleDonationTierSelect(3333)}
                  data-testid="button-donate-3333"
                >
                  $33.33
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 font-semibold py-4"
                  onClick={() => setShowDonationTiers(false)}
                  data-testid="button-back-kidding"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Persistent Test Mode Premium Banner */}
      {isTestPremium && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="sticky top-0 z-50 shadow-lg"
          data-testid="banner-test-premium"
        >
          <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 px-4 pt-4 pb-5">
            <div className="max-w-md mx-auto text-center">
              <p className="text-2xl font-bold text-white italic mb-3" style={{ fontFamily: "'Georgia', serif", textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                Just Kidding!
              </p>
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-2 shadow-md">
                <Crown className="w-7 h-7 text-teal-500" />
              </div>
              <p className="text-lg font-bold text-teal-700 mb-1">Premium Unlocked</p>
              <p className="text-sm text-gray-600">Welcome to your full personality journey</p>
            </div>
          </div>
          <Button
            className="w-full rounded-none bg-teal-500 hover:bg-teal-600 text-white text-lg font-bold py-6 h-auto shadow-md"
            onClick={handleDonateClick}
            data-testid="button-donate-here"
          >
            <Heart className="w-5 h-5 mr-2 fill-current" />
            DONATE HERE
          </Button>
        </motion.div>
      )}
      <header className={`${isTestPremium ? 'pt-6' : 'pt-10'} pb-6 px-4 text-center`}>
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
          {/* Mini Explorer: Adventure Archetype Display */}
          {isMiniExplorer && adventureArchetype ? (
            <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: adventureArchetype.badgeColor }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium mb-1 tracking-wide uppercase">Your Adventure Type</p>
                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-200 mb-2" data-testid="text-adventure-archetype">
                  {adventureArchetype.name}
                </h3>
                <div className="mb-4 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700">
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-300">
                    {adventureArchetype.superpower}
                  </p>
                </div>
                <p className="text-sm text-purple-700/80 dark:text-purple-200/80 leading-relaxed max-w-sm mx-auto mb-4">
                  {adventureArchetype.description}
                </p>
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Your Mission</p>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {adventureArchetype.mission}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Regular Role Display for Teen/Adult tiers */
            (<Card className="overflow-hidden border-2 border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent">
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
                {/* Salary - Only show for premium users */}
                {isPremiumUnlocked && (() => {
                  const regionalInfo = getRegionalSalary(result.primaryRole.title, cityName || undefined, stateName || undefined);
                  const displaySalary = regionalInfo.hasRegionalData ? regionalInfo.salary : result.primaryRole.salary;
                  return (
                    <div className="space-y-1 mb-3">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-green/10 text-sage-green">
                        {regionalInfo.hasRegionalData ? <DollarSign className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        <span className="text-sm font-semibold">{displaySalary}</span>
                        {regionalInfo.hasRegionalData && cityName && (
                          <span className="text-xs opacity-70">in {cityName}</span>
                        )}
                      </div>
                      <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50">
                        {regionalInfo.growthOutlook}
                      </p>
                    </div>
                  );
                })()}
                <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed max-w-sm mx-auto">
                  {result.primaryRole.desc}: {result.mbtiType.includes('E') 
                    ? "Your natural energy and communication style make you well-suited for collaborative environments." 
                    : "Your thoughtful, focused approach brings unique depth and precision to this field."} 
                  {result.discStyle === 'D' ? " As a natural leader, you thrive when given autonomy and clear goals." 
                    : result.discStyle === 'I' ? " Your enthusiasm and persuasive abilities help you connect with diverse people." 
                    : result.discStyle === 'S' ? " Your steady reliability makes you a trusted anchor in team settings." 
                    : " Your attention to detail ensures high-quality outcomes in everything you do."} 
                  {topTrait[1] > 60 
                    ? ` With ${TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]} as your strongest trait, you bring a distinctive edge to your work.`
                    : ` You have a balanced personality profile that adapts well across different situations.`}
                </p>
              
              <div className="grid grid-cols-3 gap-2 mt-6">
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center px-2 py-4 rounded-xl bg-terracotta/8 dark:bg-terracotta/15 border border-terracotta/20"
                >
                  <Brain className="w-5 h-5 text-terracotta mx-auto mb-1.5" />
                  <p className="text-sm font-bold text-terracotta mb-0.5 leading-tight line-clamp-2" data-testid="text-mbti-teaser">
                    {funMode && FUN_MODE_TITLES[result.mbtiType] 
                      ? FUN_MODE_TITLES[result.mbtiType]
                      : result.mbtiLabel}
                  </p>
                  <p className="text-[10px] text-terracotta/60 font-mono">
                    ({result.mbtiType})
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center px-2 py-4 rounded-xl bg-sage-green/8 dark:bg-sage-green/15 border border-sage-green/20"
                >
                  <Award className="w-5 h-5 text-sage-green mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold text-sage-green mb-0.5 leading-tight" data-testid="text-disc-teaser">
                    {funMode && FUN_MODE_DISC[result.discStyle] 
                      ? FUN_MODE_DISC[result.discStyle].nickname
                      : result.discLabel}
                  </p>
                  <p className="text-[9px] text-sage-green/60 font-mono">
                    ({result.discStyle}-type)
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center px-2 py-4 rounded-xl bg-dusty-blue/8 dark:bg-dusty-blue/15 border border-dusty-blue/20"
                >
                  {(() => {
                    const topTraitKey = topTrait[0] as keyof typeof TRAIT_ICONS;
                    const TopIcon = TRAIT_ICONS[topTraitKey];
                    const topValue = topTrait[1];
                    return (
                      <>
                        <TopIcon className="w-5 h-5 text-dusty-blue mx-auto mb-1.5" />
                        <p className={`font-bold text-dusty-blue mb-0.5 leading-tight ${
                          TRAIT_LABELS[topTraitKey].length > 12 ? 'text-[10px]' : 'text-sm'
                        }`} data-testid="text-bigfive-teaser">
                          {TRAIT_LABELS[topTraitKey]}
                        </p>
                        <p className="text-[10px] text-dusty-blue/60 font-mono">
                          ({topValue}%)
                        </p>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
              
              {/* Adventure Type for Teen/Adult - Compact Display */}
              {!isMiniExplorer && adventureArchetype && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 pt-5 border-t border-terracotta/20"
                >
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-100/60 to-pink-100/60 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50">
                    <motion.div 
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: adventureArchetype.badgeColor }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <Star className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-purple-600 dark:text-purple-300 font-medium uppercase tracking-wider mb-0.5">
                        Your Inner Hero
                      </p>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-200 leading-tight" data-testid="text-adventure-type-compact">
                        {adventureArchetype.name}
                      </p>
                      <p className="text-xs text-purple-600/80 dark:text-purple-300/80 mt-0.5">
                        {adventureArchetype.superpower}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
            </Card>)
          )}

          {/* Phase 2.2: Badges & Hybrid Types Section */}
          {(earnedBadges.length > 0 || hybridTypes.length > 0) && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-4"
            >
              {/* Hybrid Types - Tappable with explanations */}
              {hybridTypes.length > 0 && (
                <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/50 mb-3">
                  <CardContent className="p-4">
                    <p className="text-xs text-center text-indigo-600 dark:text-indigo-300 font-medium mb-3 uppercase tracking-wide">
                      Your Unique Blend
                    </p>
                    <div className="space-y-2">
                      {hybridTypes.map((type, i) => {
                        const hybridInfo = HYBRID_TYPE_DESCRIPTIONS[type] || { 
                          short: type, 
                          description: "You have a balanced approach in this area." 
                        };
                        return (
                          <motion.details
                            key={type}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                            className="group"
                          >
                            <summary className="flex items-center justify-between cursor-pointer list-none px-3 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-indigo-200/50 dark:border-indigo-700/30 hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{type}</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-indigo-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-2 px-3 py-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border-l-3 border-indigo-400">
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1">
                                {hybridInfo.short}
                              </p>
                              <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed">
                                {hybridInfo.description}
                              </p>
                            </div>
                          </motion.details>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {earnedBadges.map((badge, i) => (
                    <motion.div
                      key={badge.name}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1.0 + i * 0.15, type: "spring" }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700"
                      data-testid={`badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                        {badge.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* TIER 2: POST-FEEDBACK (FULL) - Unified Personality Profile Card */}
        {isFull && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-bold text-warm-gray dark:text-soft-cream flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    Your Personality Profile
                  </h3>
                  <p className="text-xs text-warm-gray/50 dark:text-soft-cream/50 mt-0.5">Tap each to learn more</p>
                </div>
                
                {/* MBTI Row */}
                <details className="group border-b border-gray-100 dark:border-gray-700">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-terracotta" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-soft-cream/50 uppercase tracking-wide">Thinking Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-soft-cream leading-tight" data-testid="text-mbti">
                        {funMode && FUN_MODE_TITLES[result.mbtiType] 
                          ? FUN_MODE_TITLES[result.mbtiType]
                          : result.mbtiLabel}
                        <span className="text-xs font-mono text-terracotta ml-1.5">({result.mbtiType})</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-soft-cream/70 leading-relaxed pl-[52px]">
                      {result.mbtiDesc}
                    </p>
                  </div>
                </details>

                {/* DISC Row */}
                <details className="group border-b border-gray-100 dark:border-gray-700">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-green/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-sage-green" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-warm-gray/50 dark:text-soft-cream/50 uppercase tracking-wide">Work Style</p>
                      <p className="text-sm font-bold text-warm-gray dark:text-soft-cream leading-tight" data-testid="text-disc">
                        {funMode && FUN_MODE_DISC[result.discStyle] 
                          ? FUN_MODE_DISC[result.discStyle].nickname 
                          : result.discLabel}
                        <span className="text-xs font-mono text-sage-green ml-1.5">({result.discStyle}-type)</span>
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-warm-gray/70 dark:text-soft-cream/70 leading-relaxed pl-[52px]">
                      {result.discDesc}
                    </p>
                  </div>
                </details>

                {/* Big Five Row */}
                {(() => {
                  const Icon = TRAIT_ICONS[topTrait[0] as keyof typeof TRAIT_ICONS];
                  const colors = TRAIT_COLORS[topTrait[0] as keyof typeof TRAIT_COLORS];
                  const quartileKey = getQuartileKey(topTrait[1]);
                  const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[topTrait[0]]?.[quartileKey];
                  return (
                    <details className="group">
                      <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors list-none">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg}/10 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-warm-gray/50 dark:text-soft-cream/50 uppercase tracking-wide">Core Strength</p>
                          <p className="text-sm font-bold text-warm-gray dark:text-soft-cream leading-tight" data-testid="text-bigfive">
                            {TRAIT_LABELS[topTrait[0] as keyof typeof TRAIT_LABELS]}
                            <span className={`text-xs font-mono ml-1.5 ${colors.text}`}>({topTrait[1]}%)</span>
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-xs text-warm-gray/70 dark:text-soft-cream/70 leading-relaxed pl-[52px]">
                          <span className="font-semibold">{quartileData?.vibe}:</span> {quartileData?.description}
                        </p>
                      </div>
                    </details>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Locale Insights Card - shows personalized insights based on location */}
        {isFull && localeInsight && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="bg-gradient-to-br from-dusty-blue/10 to-sage-green/10 dark:from-dusty-blue/20 dark:to-sage-green/20 border-dusty-blue/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dusty-blue/20 dark:bg-dusty-blue/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-dusty-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-warm-gray dark:text-soft-cream">
                        Your {localeInsight.city} Edge
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-dusty-blue/10 text-dusty-blue">
                        {localeInsight.metro}
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed mb-3">
                      {getPersonalizedInsight(
                        cityName,
                        stateName,
                        result.mbtiType.startsWith('E'),
                        result.mbtiType.includes('T') || result.discStyle === 'C'
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {localeInsight.opportunities.slice(0, 4).map((opp) => (
                        <span 
                          key={opp}
                          className="text-xs px-2 py-1 rounded-full bg-sage-green/10 text-sage-green"
                        >
                          {opp}
                        </span>
                      ))}
                    </div>
                  </div>
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
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-4 border-gray-900 dark:border-gray-100">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                  <h3 className="font-bold text-warm-gray dark:text-soft-cream text-[22px]">
                    Complete for More Free Insights!
                  </h3>
                  <p className="text-warm-gray/60 dark:text-soft-cream/50 mt-1 text-[16px]">
                    Answer questions to unlock dashboard
                  </p>
                </div>

                <div className="space-y-5">
                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-warm-gray dark:text-soft-cream mb-3 text-[16px]">
                        Useful App?
                      </legend>
                    </Label>
                    <div 
                      className="flex justify-between w-full gap-2" 
                      role="radiogroup"
                      aria-label="Rate app usefulness"
                    >
                      <ToggleButton 
                        value="no" 
                        currentValue={usefulApp} 
                        onChange={setUsefulApp}
                        variant="no"
                        testId="toggle-useful-no"
                      >
                        No
                      </ToggleButton>
                      <ToggleButton 
                        value="somewhat" 
                        currentValue={usefulApp} 
                        onChange={setUsefulApp}
                        variant="middle"
                        testId="toggle-useful-somewhat"
                      >
                        Somewhat
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={usefulApp} 
                        onChange={setUsefulApp}
                        variant="yes"
                        testId="toggle-useful-yes"
                      >
                        Yes
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-warm-gray dark:text-soft-cream mb-3 text-[16px]">
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
                        No
                      </ToggleButton>
                      <ToggleButton 
                        value="somewhat" 
                        currentValue={resultsAccurate} 
                        onChange={setResultsAccurate}
                        variant="middle"
                        testId="toggle-accurate-somewhat"
                      >
                        Somewhat
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={resultsAccurate} 
                        onChange={setResultsAccurate}
                        variant="yes"
                        testId="toggle-accurate-yes"
                      >
                        Yes
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-warm-gray dark:text-soft-cream mb-3 text-[16px]">
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
                        No
                      </ToggleButton>
                      <ToggleButton 
                        value="somewhat" 
                        currentValue={questionsEngaging} 
                        onChange={setQuestionsEngaging}
                        variant="middle"
                        testId="toggle-engaging-somewhat"
                      >
                        Somewhat
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={questionsEngaging} 
                        onChange={setQuestionsEngaging}
                        variant="yes"
                        testId="toggle-engaging-yes"
                      >
                        Yes
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <Label asChild>
                      <legend className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-warm-gray dark:text-soft-cream mb-3 text-[16px]">Would share this app with a friend?</legend>
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
                        No
                      </ToggleButton>
                      <ToggleButton 
                        value="yes" 
                        currentValue={wouldShare} 
                        onChange={setWouldShare}
                        variant="yes"
                        testId="toggle-share-yes"
                      >
                        Yes
                      </ToggleButton>
                    </div>
                  </fieldset>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="suggestions" 
                      className="text-lg font-medium text-warm-gray dark:text-soft-cream"
                    >
                      Suggestions for improvement?
                    </Label>
                    <Textarea
                      id="suggestions"
                      placeholder="Share your thoughts (timing, design, features, etc.)"
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      className="resize-none text-sm"
                      data-testid="textarea-suggestions"
                    />
                    <p className="text-xs text-warm-gray/50 dark:text-soft-cream/40 text-right">
                      {suggestions.length}/2000
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
                      Your Big Five Profile
                    </CardTitle>
                    <p className="text-xs text-warm-gray/60 dark:text-soft-cream/50 mt-1">
                      Tap any trait to learn more about what it means for you
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    {traitKeys.map((trait, index) => {
                      const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS];
                      const colors = TRAIT_COLORS[trait as keyof typeof TRAIT_COLORS];
                      const isSelected = selectedTrait === trait;
                      const value = result.bigFiveProfile[trait as keyof typeof result.bigFiveProfile];
                      const quartileKey = getQuartileKey(value);
                      const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[trait]?.[quartileKey];
                      
                      return (
                        <div key={trait} className="space-y-2">
                          <button
                            ref={el => traitButtonsRef.current[index] = el}
                            onClick={() => handleTraitSelect(trait, index)}
                            onKeyDown={(e) => handleTraitKeyDown(e, trait, index)}
                            tabIndex={focusedTraitIndex === -1 ? (index === 0 ? 0 : -1) : (focusedTraitIndex === index ? 0 : -1)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                              isSelected 
                                ? `${colors.bg} text-white shadow-lg` 
                                : `bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700`
                            }`}
                            aria-pressed={isSelected}
                            aria-expanded={isSelected}
                            aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} ${value}%. ${isSelected ? "Selected, tap to collapse" : "Tap to learn more"}`}
                            data-testid={`button-trait-${trait.toLowerCase()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-white/20' : colors.bg
                              }`}>
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} aria-hidden="true" />
                              </div>
                              <div>
                                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-warm-gray dark:text-soft-cream'}`}>
                                  {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}
                                </span>
                                {!isSelected && quartileData && (
                                  <p className={`text-xs ${colors.text} opacity-80`}>
                                    {quartileData.vibe}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${isSelected ? 'text-white' : colors.text}`}>
                                {value}%
                              </span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180 text-white' : 'text-warm-gray/40 dark:text-soft-cream/40'}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isSelected && quartileData && (
                              <motion.div
                                initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div 
                                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-l-4"
                                  style={{ borderColor: colors.border }}
                                  role="region"
                                  aria-live="polite"
                                  aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} details`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-bold ${colors.text}`}>
                                      {quartileData.vibe}
                                    </span>
                                    <span className="text-xs text-warm-gray/50 dark:text-soft-cream/40">
                                      ({value <= 25 ? '0-25%' : value <= 50 ? '26-50%' : value <= 75 ? '51-75%' : '76-100%'})
                                    </span>
                                  </div>
                                  <p className="text-sm text-warm-gray/80 dark:text-soft-cream/70 leading-relaxed">
                                    {quartileData.description}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Growth Quests moved to Premium tier */}

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
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-1 text-[26px]">
                        Premium Unlocked
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Swipe through your personalized insights below
                      </p>
                    </CardContent>
                  </Card>

                  {/* Interactive Premium Card Deck */}
                  <PremiumCardDeck 
                    result={result ? {
                      mbtiType: result.mbtiType,
                      mbtiLabel: result.mbtiLabel,
                      discStyle: result.discStyle,
                      discLabel: result.discLabel,
                      primaryRole: result.primaryRole,
                      secondaryRole: result.secondaryRole,
                      bigFiveProfile: result.bigFiveProfile,
                      scales: result.scales,
                    } : {
                      mbtiType: "INTJ",
                      mbtiLabel: "Architect",
                      discStyle: "C",
                      discLabel: "Conscientious",
                      primaryRole: { title: "Analyst", salary: "$60K-90K", desc: "A great fit for your analytical nature." },
                      secondaryRole: { title: "Strategist", salary: "$70K-100K", desc: "Your secondary strength lies in strategic thinking." },
                      bigFiveProfile: { O: 50, C: 50, E: 50, A: 50, N: 50 },
                      scales: undefined,
                    }}
                    topTrait={topTrait}
                    weakestTrait={getWeakestTrait(result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 })}
                    getWeaknessBlindspots={getWeaknessBlindspots}
                    CAREER_SIMULATOR={CAREER_SIMULATOR}
                    SIDE_HUSTLES={SIDE_HUSTLES}
                    LEARNING_STYLES={LEARNING_STYLES}
                    GROWTH_QUESTS={GROWTH_QUESTS}
                    TRAIT_LABELS={TRAIT_LABELS}
                  />

                  {/* Crossroads Adventure CTA - Featured prominently after Premium cards */}
                  <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-rose-900/20 border-2 border-amber-300 dark:border-amber-700 overflow-hidden shadow-lg">
                    <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-400" />
                    <CardContent className="p-6 text-center">
                      <motion.div 
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-400 flex items-center justify-center shadow-xl"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Compass className="w-8 h-8 text-white" />
                      </motion.div>
                      <h5 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">Crossroads Adventure</h5>
                      <p className="text-base text-amber-700/80 dark:text-amber-300/70 mb-5 max-w-xs mx-auto">
                        Face 7 life scenarios with branching choices. Discover hidden traits you didn't know you had.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-5">
                        <span className="px-3 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">7 Scenarios</span>
                        <span className="px-3 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">Your Choices Matter</span>
                        <span className="px-3 py-1 text-xs font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-full">Trait Reveals</span>
                      </div>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-orange-500/30"
                        onClick={() => window.location.href = "/crossroads"}
                        data-testid="button-crossroads-cta"
                      >
                        <Compass className="w-5 h-5 mr-2" />
                        Start Adventure
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Arc Tracker - Moved below Crossroads */}
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
                (<motion.div
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
                        
                        <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-[26px]">
                          Unlock Your Full Potential
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          Discover why <span className="font-semibold">{result.primaryRole.title}</span> fits your unique profile
                        </p>
                      </div>
                      
                      {/* Feature list - 3 features only */}
                      <div className="space-y-3 mb-5">
                        {[
                          { icon: BookOpen, title: "Deep Dive", desc: "Full analysis" },
                          { icon: Gift, title: "Role Matches", desc: "More career paths" },
                          { icon: Target, title: "30-Day Quest", desc: "Growth challenges and more" },
                        ].map((feature, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-amber-200/50 dark:border-amber-700/50"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <feature.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-amber-900 dark:text-amber-100 text-[22px]">{feature.title}</p>
                              <p className="text-amber-600 dark:text-amber-400 text-[15px]">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* One Large CTA Button with Price */}
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-8 shadow-lg shadow-orange-500/30 transition-all flex flex-col items-center justify-center gap-1"
                        onClick={handleUpgrade}
                        disabled={isCheckingOut}
                        data-testid="button-upgrade"
                      >
                        {isCheckingOut ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-black text-[30px]">$0.02</span>
                            <span className="font-bold flex items-center gap-2 text-[18px]">
                              <Rocket className="w-5 h-5" />
                              Unlock Premium Now
                              <ArrowRight className="w-5 h-5" />
                            </span>
                            <span className="font-normal opacity-90 text-[15px]">Lifetime access. No Subscription. Ever.</span>
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
                </motion.div>)
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
