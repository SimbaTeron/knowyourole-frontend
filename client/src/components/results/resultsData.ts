import rolesData from "@/data/roles.json";
import type { QuizScores } from "../Quiz";
import { Sparkles, Target, Users, Heart, Brain } from "lucide-react";

export interface JobMatch {
  roleName: string;
  roleNumber: number;
  matchScore: number;
  explanation: string;
  traitHighlights: string[];
  jobCollar: string;
}

export interface APIScales {
  critical: { value: number; traits: string; quest: string };
  firstPrinciples: { value: number; traits: string; quest: string };
}

// Research norms for Big Five percentile calculations (based on population studies)
export const RESEARCH_NORMS: Record<string, { mean: number; stdDev: number }> = {
  O: { mean: 50, stdDev: 15 }, // Openness
  C: { mean: 52, stdDev: 14 }, // Conscientiousness
  E: { mean: 48, stdDev: 16 }, // Extraversion
  A: { mean: 55, stdDev: 13 }, // Agreeableness
  N: { mean: 45, stdDev: 17 }, // Neuroticism
};

// Calculate z-score and percentile for a trait
export function calculatePercentile(traitValue: number, trait: string): number {
  const norm = RESEARCH_NORMS[trait];
  if (!norm) return 50;
  
  const zScore = (traitValue - norm.mean) / norm.stdDev;
  // Standard normal CDF approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = zScore < 0 ? -1 : 1;
  const z = Math.abs(zScore) / Math.sqrt(2);
  const t = 1 / (1 + p * z);
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  const percentile = Math.round((0.5 * (1 + sign * erf)) * 100);
  
  return Math.max(1, Math.min(99, percentile));
}

// Get percentile description
export function getPercentileLabel(percentile: number): { label: string; color: string } {
  if (percentile >= 85) return { label: "Very High", color: "text-emerald-600 dark:text-emerald-400" };
  if (percentile >= 70) return { label: "High", color: "text-green-600 dark:text-green-400" };
  if (percentile >= 55) return { label: "Above Average", color: "text-blue-600 dark:text-blue-400" };
  if (percentile >= 45) return { label: "Average", color: "text-gray-600 dark:text-gray-400" };
  if (percentile >= 30) return { label: "Below Average", color: "text-amber-600 dark:text-amber-400" };
  if (percentile >= 15) return { label: "Low", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Very Low", color: "text-red-600 dark:text-red-400" };
}

// Phase 2.2: Badge interface for earned achievements
export interface EarnedBadge {
  name: string;
  type: string;
  icon: string;
  color: string;
}

export interface ResultsProps {
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
  startOnPremiumPage?: boolean;
  onRestart: () => void;
  onShare: () => void;
  onDownloadPDF?: () => void;
}

export interface ScaleData {
  value: number;
  traits: string;
  quest: string;
}

export interface PersonalityResult {
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

export function findBestRoleMatch(mbtiType: string, discStyle: string, bigFive: { O: number; C: number; E: number; A: number; N: number }): { primary: { title: string; salary: string; desc: string }; secondary: { title: string; salary: string; desc: string } } {
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

export function calculateResult(scores: QuizScores): PersonalityResult {
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

export const TRAIT_COLORS = {
  O: { bg: "bg-violet-500", text: "text-violet-600", fill: "rgba(139, 92, 246, 0.3)", border: "rgb(139, 92, 246)", ring: "ring-violet-500" },
  C: { bg: "bg-blue-500", text: "text-blue-600", fill: "rgba(59, 130, 246, 0.3)", border: "rgb(59, 130, 246)", ring: "ring-blue-500" },
  E: { bg: "bg-amber-500", text: "text-amber-600", fill: "rgba(245, 158, 11, 0.3)", border: "rgb(245, 158, 11)", ring: "ring-amber-500" },
  A: { bg: "bg-emerald-500", text: "text-emerald-600", fill: "rgba(16, 185, 129, 0.3)", border: "rgb(16, 185, 129)", ring: "ring-emerald-500" },
  N: { bg: "bg-rose-500", text: "text-rose-600", fill: "rgba(244, 63, 94, 0.3)", border: "rgb(244, 63, 94)", ring: "ring-rose-500" },
};

export const TRAIT_ICONS = {
  O: Sparkles,
  C: Target,
  E: Users,
  A: Heart,
  N: Brain,
};

export const TRAIT_LABELS = {
  O: "Openness",
  C: "Conscientiousness", 
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

export const TRAIT_QUARTILE_DESCRIPTIONS: Record<string, Record<string, { vibe: string; description: string }>> = {
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

export function getQuartileKey(value: number): string {
  if (value <= 25) return "low";
  if (value <= 50) return "lowMid";
  if (value <= 75) return "midHigh";
  return "high";
}

export const FUN_MODE_ROASTS: Record<string, string> = {
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

export const FUN_MODE_DISC: Record<string, { nickname: string; vibe: string }> = {
  "D": { nickname: "The Boss Baby", vibe: "Main character energy. You walk into rooms like you own them (you probably do)." },
  "I": { nickname: "The Hype Machine", vibe: "Your enthusiasm is contagious—and slightly exhausting. In the best way!" },
  "S": { nickname: "The Rock", vibe: "Everyone's emotional support human. You've heard 'thanks for listening' 10,000 times." },
  "C": { nickname: "The Perfectionist", vibe: "If it's not done right, it's not done. Your spreadsheets have spreadsheets." },
};

export const FUN_MODE_TITLES: Record<string, string> = {
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

export const HYBRID_TYPE_DESCRIPTIONS: Record<string, { short: string; description: string }> = {
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

export const TRAIT_QUESTS: Record<string, { high: string; low: string }> = {
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
export const COMPATIBILITY_MATRIX: Record<string, { match: string; score: number; tip: string }[]> = {
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
export const EVOLUTION_STAGES: Record<string, { current: string; growth: string; peak: string; mature: string }> = {
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
export const GROWTH_QUESTS: Record<string, { week1: string[]; week2: string[]; week3: string[]; week4: string[] }> = {
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
export function getWeakestTrait(bigFive: { O: number; C: number; E: number; A: number; N: number }): string {
  const entries = Object.entries(bigFive);
  // For Neuroticism, higher is "weaker" (more stress), so we invert
  const adjusted = entries.map(([k, v]) => [k, k === 'N' ? 100 - v : v] as [string, number]);
  return adjusted.reduce((a, b) => a[1] < b[1] ? a : b)[0];
}

// WEAKNESS BLINDSPOTS DATA - Based on MBTI and Big Five
export const WEAKNESS_BLINDSPOTS: Record<string, { title: string; blindspot: string; workaround: string; realWorld: string }[]> = {
  "INTJ": [
    { title: "Dismissing Others' Ideas", blindspot: "You might shut down suggestions before fully hearing them out.", workaround: "Ask 'What if this worked?' before critiquing.", realWorld: "Try letting a team member lead a small project their way." },
    { title: "Over-Planning", blindspot: "Waiting for the perfect plan can mean missing opportunities.", workaround: "Set a 'good enough' threshold and act.", realWorld: "Launch that project at 80% instead of waiting for 100%." },
    { title: "Emotional Blind Spot", blindspot: "You may overlook how your tone affects others emotionally.", workaround: "Pause to read the room before delivering feedback.", realWorld: "Ask 'How did that land?' after sharing a critical thought." },
  ],
  "INTP": [
    { title: "Analysis Paralysis", blindspot: "You can get lost researching when action is needed.", workaround: "Time-box your research with a hard deadline.", realWorld: "Give yourself 2 hours max to research, then decide." },
    { title: "Avoiding Emotions", blindspot: "Skipping emotional conversations damages relationships.", workaround: "Schedule regular check-ins with people who matter.", realWorld: "Ask 'How are we doing?' to one person weekly." },
    { title: "Social Energy Neglect", blindspot: "You may withdraw when connection is what you actually need.", workaround: "Set a weekly social anchor, even if small.", realWorld: "Schedule one coffee or call with a friend each week." },
  ],
  "ENTJ": [
    { title: "Steamrolling Others", blindspot: "Your drive can make others feel unheard.", workaround: "Ask for input before sharing your conclusion.", realWorld: "In your next meeting, speak last instead of first." },
    { title: "Impatience with Process", blindspot: "Rushing can create mistakes and resentment.", workaround: "Build in buffer time for others to catch up.", realWorld: "Add 20% more time to project estimates." },
    { title: "Vulnerability Avoidance", blindspot: "You may hide struggles to maintain a strong image.", workaround: "Share one challenge with someone you trust.", realWorld: "Tell a colleague about something you're still figuring out." },
  ],
  "ENTP": [
    { title: "Starting Without Finishing", blindspot: "New ideas distract you from completing current ones.", workaround: "Keep a 'parking lot' list for future ideas.", realWorld: "Finish one project before allowing yourself to start another." },
    { title: "Arguing for Sport", blindspot: "Debating can feel like attacking to others.", workaround: "State 'I'm just exploring ideas' before debating.", realWorld: "Notice when someone gets defensive and shift gears." },
    { title: "Ignoring Routine Needs", blindspot: "You may neglect basics like sleep, food, or admin tasks.", workaround: "Automate or batch boring essentials.", realWorld: "Set recurring calendar blocks for self-care and admin." },
  ],
  "INFJ": [
    { title: "Absorbing Others' Stress", blindspot: "You take on problems that aren't yours to solve.", workaround: "Ask 'Is this my problem to fix?' before diving in.", realWorld: "Practice saying 'That sounds hard' instead of 'I'll fix it'." },
    { title: "Perfectionist Standards", blindspot: "Your high bar can paralyze you and frustrate others.", workaround: "Define 'done' before starting.", realWorld: "Ship something imperfect and iterate." },
    { title: "Isolation Under Stress", blindspot: "You may withdraw when you most need support.", workaround: "Reach out before you feel ready to.", realWorld: "Text someone 'I'm having a rough day' this week." },
  ],
  "INFP": [
    { title: "Conflict Avoidance", blindspot: "Unaddressed issues build into bigger problems.", workaround: "Address small issues before they grow.", realWorld: "Practice: 'Can I share something that's been on my mind?'" },
    { title: "Dreaming Without Acting", blindspot: "Beautiful visions need ugly first steps.", workaround: "Identify the smallest possible action today.", realWorld: "Spend 10 minutes on that dream project right now." },
    { title: "Self-Criticism Spiral", blindspot: "You may be harsher on yourself than anyone else.", workaround: "Treat yourself like you'd treat a close friend.", realWorld: "Write down 3 things you did well today before bed." },
  ],
  "ENFJ": [
    { title: "People-Pleasing Burnout", blindspot: "Saying yes to everyone means neglecting yourself.", workaround: "Check your energy before agreeing to help.", realWorld: "Practice: 'Let me check my schedule and get back to you.'" },
    { title: "Taking Rejection Personally", blindspot: "Others' choices aren't about your worth.", workaround: "Separate their decision from your value.", realWorld: "When rejected, list 3 things you're proud of." },
    { title: "Overgiving Without Receiving", blindspot: "You give so much that you forget to ask for help.", workaround: "Ask for one favor this week.", realWorld: "Let someone do something nice for you without reciprocating immediately." },
  ],
  "ENFP": [
    { title: "Overcommitting", blindspot: "Enthusiasm leads to impossible schedules.", workaround: "Halve the commitments, double the impact.", realWorld: "Before saying yes, check if you can realistically deliver." },
    { title: "Avoiding Boring Tasks", blindspot: "Necessary routines get neglected.", workaround: "Pair boring tasks with something enjoyable.", realWorld: "Listen to your favorite podcast only while doing admin work." },
    { title: "Shiny Object Syndrome", blindspot: "New opportunities distract from current commitments.", workaround: "Write down why you started before switching.", realWorld: "Keep a 'why I'm doing this' note visible for each major project." },
  ],
  "ISTJ": [
    { title: "Rigidity", blindspot: "Sticking to 'how it's always done' misses better ways.", workaround: "Try one new approach monthly.", realWorld: "Ask a younger colleague how they'd approach your task." },
    { title: "Difficulty Delegating", blindspot: "Doing everything yourself limits growth.", workaround: "Delegate the how, keep the what.", realWorld: "Let someone else handle a task their way this week." },
    { title: "Underexpressing Appreciation", blindspot: "You may assume people know you value them.", workaround: "Say 'thank you' and 'good job' more often.", realWorld: "Compliment one person's work specifically today." },
  ],
  "ISFJ": [
    { title: "Difficulty Saying No", blindspot: "You exhaust yourself serving others.", workaround: "Your needs are needs too, not wants.", realWorld: "Decline one request this week without explaining why." },
    { title: "Change Resistance", blindspot: "Comfort zones can become prisons.", workaround: "Make small changes to build adaptability.", realWorld: "Take a different route or try a new restaurant." },
    { title: "Holding Grudges Quietly", blindspot: "Unexpressed hurts can simmer into resentment.", workaround: "Address frustrations before they grow.", realWorld: "Share one thing that's been bothering you with someone you trust." },
  ],
  "ESTJ": [
    { title: "Dismissing Feelings", blindspot: "Efficiency without empathy creates resentment.", workaround: "Acknowledge feelings before problem-solving.", realWorld: "Say 'That sounds frustrating' before offering solutions." },
    { title: "Control Issues", blindspot: "Micromanaging destroys trust and motivation.", workaround: "Define outcomes, not methods.", realWorld: "Assign a task with a deadline but no process instructions." },
    { title: "Ignoring Self-Care", blindspot: "Pushing through exhaustion hurts long-term performance.", workaround: "Schedule rest like you schedule work.", realWorld: "Block one hour this week purely for yourself." },
  ],
  "ESFJ": [
    { title: "Seeking Approval", blindspot: "Others' opinions shouldn't define your worth.", workaround: "Build internal validation sources.", realWorld: "Do one thing purely because YOU want to this week." },
    { title: "Avoiding Conflict", blindspot: "Keeping peace now creates war later.", workaround: "Address issues while they're small.", realWorld: "Have that conversation you've been putting off." },
    { title: "Overidentifying with Others' Moods", blindspot: "Their bad day doesn't have to become yours.", workaround: "Notice when you're absorbing others' emotions.", realWorld: "After a heavy conversation, take 5 minutes alone to reset." },
  ],
  "ISTP": [
    { title: "Emotional Distance", blindspot: "People need words, not just actions.", workaround: "Express care verbally, not just through doing.", realWorld: "Tell someone 'I appreciate you' out loud this week." },
    { title: "Impulsive Decisions", blindspot: "Acting fast sometimes means acting wrong.", workaround: "Count to 10 before major decisions.", realWorld: "Sleep on any decision over $100 or affecting others." },
    { title: "Underplanning Long-Term", blindspot: "Living in the moment may neglect future needs.", workaround: "Set one long-term goal and check progress monthly.", realWorld: "Write down where you want to be in 2 years." },
  ],
  "ISFP": [
    { title: "Avoiding Structure", blindspot: "Some structure enables more creativity.", workaround: "Create minimal frameworks that free you.", realWorld: "Schedule your creative time like an appointment." },
    { title: "Taking Criticism Hard", blindspot: "Feedback is data, not an attack.", workaround: "Ask 'What can I learn?' before reacting.", realWorld: "Request feedback proactively to reduce surprise." },
    { title: "Hiding Your Strengths", blindspot: "You may downplay talents others need to see.", workaround: "Share one accomplishment without minimizing it.", realWorld: "When someone compliments you, just say 'Thank you.'" },
  ],
  "ESTP": [
    { title: "Risk Blindness", blindspot: "Excitement can overshadow danger.", workaround: "Ask one cautious person before leaping.", realWorld: "Run your next big idea by the most skeptical person you know." },
    { title: "Impatience with Details", blindspot: "Skipping steps causes revisiting them later.", workaround: "Build in quick check moments.", realWorld: "Re-read that important email before sending." },
    { title: "Ignoring Emotional Depth", blindspot: "Surface-level interactions may miss deeper connections.", workaround: "Ask one follow-up question in every conversation.", realWorld: "When someone shares, ask 'How did that make you feel?'" },
  ],
  "ESFP": [
    { title: "Present-Focus Blindness", blindspot: "Today's fun can be tomorrow's regret.", workaround: "Ask 'How will I feel about this in a week?'", realWorld: "Before a big purchase, wait 48 hours." },
    { title: "Conflict Avoidance", blindspot: "Keeping things light means leaving issues unresolved.", workaround: "Schedule serious conversations like appointments.", realWorld: "Block 15 minutes to address something you've avoided." },
    { title: "Underestimating Preparation", blindspot: "Winging it works until it doesn't.", workaround: "Prepare for important moments, even briefly.", realWorld: "Spend 10 minutes preparing before your next big meeting or event." },
  ],
};

export const DEFAULT_BLINDSPOTS = [
  { title: "Blind to Blind Spots", blindspot: "We all have areas we can't see clearly about ourselves.", workaround: "Ask a trusted friend for honest feedback.", realWorld: "Have a 'what should I work on?' conversation with someone you trust." },
  { title: "Comfort Zone Trap", blindspot: "Staying comfortable can mean missing growth opportunities.", workaround: "Regularly try something that makes you slightly uncomfortable.", realWorld: "Sign up for one new experience this month." },
  { title: "Confirmation Bias", blindspot: "You may seek out info that confirms what you already believe.", workaround: "Actively seek opposing viewpoints.", realWorld: "Read an article or talk to someone with a different perspective this week." },
];

export function getWeaknessBlindspots(mbtiType: string) {
  return WEAKNESS_BLINDSPOTS[mbtiType] || DEFAULT_BLINDSPOTS;
}

// CAREER PATH SIMULATOR - Day-in-the-life scenarios (25+ diverse roles)
export const CAREER_SIMULATOR: Record<string, { title: string; morningRoutine: string; afternoonTasks: string; eveningReflection: string; satisfaction: string; growth: string }> = {
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
export const SIDE_HUSTLES: Record<string, { name: string; fit: string; income: string; startupCost: string; timeCommit: string }[]> = {
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
export const LEARNING_STYLES: Record<string, { style: string; description: string; bestFor: string[]; tips: string[]; resources: string[] }> = {
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
export interface AdventureArchetype {
  name: string;
  superpower: string;
  description: string;
  mission: string;
  badgeColor: string;
}

