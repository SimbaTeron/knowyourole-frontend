import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { sql, eq, and, gte, lte, or, desc } from "drizzle-orm";
import { db } from "./db";
import { seedAll, seedPremiumInsights } from "./seedData";
import { seedJobRoles } from "./seed-job-roles";
import { getJobMatches, getTopJobMatch } from "./job-matching";
import { 
  traitVibes, traitCombinations, adventureArchetypes,
  sideHustles, blindspots, careerPaths, growthTips,
  strengths, communicationStyles, workEnvironments, relationshipInsights,
  jobRoles
} from "@shared/schema";

const quizScoresSchema = z.object({
  mbti: z.object({
    E: z.number(), I: z.number(),
    S: z.number(), N: z.number(),
    T: z.number(), F: z.number(),
    J: z.number(), P: z.number(),
  }),
  disc: z.object({
    D: z.number(), I: z.number(), S: z.number(), C: z.number(),
  }),
  bigFive: z.object({
    O: z.number(), C: z.number(), E: z.number(), A: z.number(), N: z.number(),
  }),
  responses: z.array(z.object({
    questionId: z.number(),
    choice: z.union([z.literal(0), z.literal(1)]),
    timeSpent: z.number(),
    swipeDirection: z.enum(["left", "right"]),
    sliderValue: z.number().optional(), // Phase 1.1
    responseType: z.enum(["binary", "slider"]).optional(), // Phase 1.1
  })),
  swipeTimes: z.array(z.number()).optional().default([]), // Phase 2.1
  averageSwipeTime: z.number().optional().default(0), // Phase 2.1
  currentDifficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"), // Phase 2.1
  engagement: z.number(),
  wildcardBoost: z.boolean(),
  criticalWildcard: z.number().optional().default(0),
  firstPrinciplesWildcard: z.number().optional().default(0),
  hybridTypes: z.array(z.string()).optional().default([]), // Phase 1.4
  moodBoosts: z.object({
    critical: z.number(),
    firstPrinciples: z.number(),
  }).optional().default({ critical: 0, firstPrinciples: 0 }), // Mood-based proxy boosts
});

// Phase 1.3: Research-based population norms for z-score normalization
const RESEARCH_NORMS = {
  bigFive: {
    openness: { mean: 50, std: 15 },
    conscientiousness: { mean: 50, std: 15 },
    extraversion: { mean: 50, std: 15 },
    agreeableness: { mean: 50, std: 15 },
    neuroticism: { mean: 50, std: 15 },
  },
  mbti: {
    EI: { mean: 0, std: 5 }, // Balanced at 0
    SN: { mean: 0, std: 5 },
    TF: { mean: 0, std: 5 },
    JP: { mean: 0, std: 5 },
  },
};

// Phase 1.3: Z-score normalization function
function zNormalize(rawScore: number, mean: number, std: number): number {
  const zScore = (rawScore - mean) / std;
  // Convert to 0-100 scale: 50 is average, each std dev is 15 points
  return Math.max(0, Math.min(100, 50 + zScore * 15));
}

// Rate limiting tracker (IP-based abuse prevention)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
         req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(req: Request, limit: number, windowMs: number): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count < limit) {
    record.count++;
    return true;
  }
  
  return false;
}

// Phase 3.1: Cronbach's alpha calculation for internal consistency
interface ResponseItem {
  questionId: number;
  choice: 0 | 1;
  sliderValue?: number;
  psych?: string;
}

function calculateCronbachAlpha(responses: ResponseItem[], traitGroup: string): number {
  // Filter responses for this trait group
  const traitResponses = responses.filter(r => r.psych?.includes(traitGroup));
  
  if (traitResponses.length < 2) return 1; // Not enough items to calculate
  
  const n = traitResponses.length;
  
  // Get item scores (use sliderValue if available, otherwise binary choice as 0/1)
  const items = traitResponses.map(r => r.sliderValue !== undefined ? r.sliderValue : r.choice);
  
  // Calculate variance of total score
  const totalScores = items;
  const totalMean = totalScores.reduce((a, b) => a + b, 0) / n;
  const totalVariance = totalScores.reduce((sum, val) => sum + Math.pow(val - totalMean, 2), 0) / (n - 1) || 1;
  
  // Calculate sum of item variances (simplified - treating each as independent)
  const itemVariances = items.map(item => {
    const mean = (item + (n > 1 ? items.reduce((a, b) => a + b, 0) / n : item)) / 2;
    return Math.pow(item - mean, 2);
  });
  const sumItemVariance = itemVariances.reduce((a, b) => a + b, 0) / (n - 1) || 1;
  
  // Cronbach's alpha formula: α = (n / (n-1)) * (1 - Σσi² / σt²)
  const alpha = (n / (n - 1)) * (1 - sumItemVariance / totalVariance);
  
  return Math.max(0, Math.min(1, alpha));
}

// Phase 3.1: Calculate internal consistency for all trait groups
function calculateTraitConsistency(responses: ResponseItem[]): { 
  alphas: Record<string, number>; 
  lowConsistencyFlags: string[];
  overallAlpha: number;
} {
  const traitGroups = ['MBTI', 'DISC', 'Big5', 'Critical', 'FirstPrinciples'];
  const alphas: Record<string, number> = {};
  const lowConsistencyFlags: string[] = [];
  const ALPHA_THRESHOLD = 0.7;
  
  for (const trait of traitGroups) {
    const alpha = calculateCronbachAlpha(responses, trait);
    alphas[trait] = Math.round(alpha * 100) / 100;
    
    if (alpha < ALPHA_THRESHOLD) {
      lowConsistencyFlags.push(trait);
    }
  }
  
  // Calculate overall alpha
  const validAlphas = Object.values(alphas).filter(a => a > 0 && a <= 1);
  const overallAlpha = validAlphas.length > 0 
    ? validAlphas.reduce((a, b) => a + b, 0) / validAlphas.length 
    : 0.7;
  
  return { alphas, lowConsistencyFlags, overallAlpha };
}

// Phase 1.4: Hybrid type detection thresholds
const HYBRID_THRESHOLD = 1.5; // If difference is less than this, consider hybrid

// Phase 2.2: Badge definitions for achievement system
const BADGE_DEFINITIONS = [
  { name: "Trailblazer", type: "trait", condition: (scores: any) => scores.bigFive.O > 80, icon: "compass", color: "terracotta" },
  { name: "Deep Thinker", type: "trait", condition: (scores: any) => scores.bigFive.C > 80, icon: "brain", color: "sage-green" },
  { name: "Social Butterfly", type: "trait", condition: (scores: any) => scores.bigFive.E > 80, icon: "users", color: "dusty-blue" },
  { name: "Peacemaker", type: "trait", condition: (scores: any) => scores.bigFive.A > 80, icon: "heart", color: "soft-cream" },
  { name: "Speedster", type: "speed", condition: (scores: any) => scores.averageSwipeTime && scores.averageSwipeTime < 3, icon: "zap", color: "amber" },
  { name: "Thoughtful Observer", type: "speed", condition: (scores: any) => scores.averageSwipeTime && scores.averageSwipeTime > 7, icon: "eye", color: "violet" },
  { name: "Balanced Mind", type: "special", condition: (scores: any) => scores.hybridTypes && scores.hybridTypes.length > 0, icon: "scale", color: "teal" },
  { name: "Quiz Master", type: "streak", condition: (scores: any) => scores.engagement > 20, icon: "trophy", color: "gold" },
];

const quizSubmitSchema = z.object({
  tier: z.string(),
  mood: z.string(),
  funMode: z.boolean(),
  landmark: z.string().optional(),
  theme: z.string(),
  scores: quizScoresSchema,
});

type QuizSubmit = z.infer<typeof quizSubmitSchema>;

const MBTI_LABELS: Record<string, { title: string; spark: string }> = {
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

function calculatePersonality(scores: QuizSubmit["scores"], theme: string) {
  const { mbti, disc, bigFive } = scores;
  
  // Phase 1.4: Detect hybrid types for close scores
  const hybridTypes: string[] = [];
  
  // Check MBTI pairs for hybrids
  if (Math.abs(mbti.E - mbti.I) < HYBRID_THRESHOLD) hybridTypes.push("Ambivert");
  if (Math.abs(mbti.S - mbti.N) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Sensing");
  if (Math.abs(mbti.T - mbti.F) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Thinking");
  if (Math.abs(mbti.J - mbti.P) < HYBRID_THRESHOLD) hybridTypes.push("Ambi-Judging");
  
  // Build MBTI type with hybrid notation
  const mbtiLetter = (a: string, b: string, scoreA: number, scoreB: number) => {
    if (Math.abs(scoreA - scoreB) < HYBRID_THRESHOLD) return "X"; // Hybrid
    return scoreA > scoreB ? a : b;
  };
  
  const mbtiType = [
    mbtiLetter("E", "I", mbti.E, mbti.I),
    mbtiLetter("S", "N", mbti.S, mbti.N),
    mbtiLetter("T", "F", mbti.T, mbti.F),
    mbtiLetter("J", "P", mbti.J, mbti.P),
  ].join("");
  
  // Clean MBTI for lookup (replace X with dominant)
  const cleanMbti = mbtiType
    .replace(/X/g, (_, i) => {
      const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
      const idx = mbtiType.indexOf("X");
      const pair = pairs[idx];
      return mbti[pair[0] as keyof typeof mbti] >= mbti[pair[1] as keyof typeof mbti] ? pair[0] : pair[1];
    });

  const discEntries = Object.entries(disc) as [string, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const discStyles: Record<string, string> = {
    D: "Direct Driver",
    I: "Inspiring Influencer", 
    S: "Steady Supporter",
    C: "Careful Analyst",
  };

  // Phase 1.3: Z-score normalization instead of simple linear
  const rawBigFive = {
    openness: bigFive.O,
    conscientiousness: bigFive.C,
    extraversion: bigFive.E,
    agreeableness: bigFive.A,
    neuroticism: bigFive.N,
  };
  
  const bigFiveProfile = {
    openness: zNormalize(rawBigFive.openness, RESEARCH_NORMS.bigFive.openness.mean / 10, RESEARCH_NORMS.bigFive.openness.std / 10),
    conscientiousness: zNormalize(rawBigFive.conscientiousness, RESEARCH_NORMS.bigFive.conscientiousness.mean / 10, RESEARCH_NORMS.bigFive.conscientiousness.std / 10),
    extraversion: zNormalize(rawBigFive.extraversion, RESEARCH_NORMS.bigFive.extraversion.mean / 10, RESEARCH_NORMS.bigFive.extraversion.std / 10),
    agreeableness: zNormalize(rawBigFive.agreeableness, RESEARCH_NORMS.bigFive.agreeableness.mean / 10, RESEARCH_NORMS.bigFive.agreeableness.std / 10),
    neuroticism: zNormalize(rawBigFive.neuroticism, RESEARCH_NORMS.bigFive.neuroticism.mean / 10, RESEARCH_NORMS.bigFive.neuroticism.std / 10),
  };

  let proxyNudge = "";
  if (theme === "random") {
    proxyNudge = "Openness boost detected";
    bigFiveProfile.openness = Math.min(100, bigFiveProfile.openness + 5);
  }

  if (scores.wildcardBoost) {
    proxyNudge = proxyNudge ? `${proxyNudge}, Wildcard engaged` : "Wildcard engaged";
  }

  const mbtiInfo = MBTI_LABELS[cleanMbti] || MBTI_LABELS[mbtiType.replace(/X/g, "I")] || MBTI_LABELS.INTP;

  const mbtiTotal = mbti.E + mbti.I + mbti.S + mbti.N + mbti.T + mbti.F + mbti.J + mbti.P;
  const discTotal = disc.D + disc.I + disc.S + disc.C;
  
  // Phase 1.3: Weighted proxy calculations based on research correlations
  const PROXY_WEIGHTS = {
    critical: { mbtiT: 0.4, big5O: 0.4, discC: 0.2 },
    firstPrinciples: { mbtiN: 0.4, big5O: 0.4, discI: 0.2 },
  };
  
  const mbtiT_pct = mbtiTotal > 0 ? (mbti.T / (mbti.T + mbti.F)) * 100 : 50;
  const mbtiN_pct = mbtiTotal > 0 ? (mbti.N / (mbti.S + mbti.N)) * 100 : 50;
  const big5O_pct = bigFiveProfile.openness;
  const discC_pct = discTotal > 0 ? (disc.C / discTotal) * 100 : 25;
  const discI_pct = discTotal > 0 ? (disc.I / discTotal) * 100 : 25;
  
  const criticalWildcardBoost = (scores.criticalWildcard || 0) * 20;
  const firstPrinciplesWildcardBoost = (scores.firstPrinciplesWildcard || 0) * 20;
  
  // Mood-based proxy boosts (passed from quiz)
  const moodBoosts = scores.moodBoosts || { critical: 0, firstPrinciples: 0 };
  
  // Apply weighted proxy formula
  const criticalProxy = (mbtiT_pct * PROXY_WEIGHTS.critical.mbtiT) + 
                        (big5O_pct * PROXY_WEIGHTS.critical.big5O) + 
                        (discC_pct * PROXY_WEIGHTS.critical.discC);
  const firstPrinciplesProxy = (mbtiN_pct * PROXY_WEIGHTS.firstPrinciples.mbtiN) + 
                               (big5O_pct * PROXY_WEIGHTS.firstPrinciples.big5O) + 
                               (discI_pct * PROXY_WEIGHTS.firstPrinciples.discI);
  
  // Apply mood boosts to raw scores
  const criticalRaw = (criticalProxy * 0.8) + (criticalWildcardBoost * 0.2) + moodBoosts.critical;
  const firstPrinciplesRaw = (firstPrinciplesProxy * 0.8) + (firstPrinciplesWildcardBoost * 0.2) + moodBoosts.firstPrinciples;
  
  const toScale = (pct: number) => Math.max(1, Math.min(5, Math.round(pct / 20)));
  
  const criticalScale = toScale(criticalRaw);
  const firstPrinciplesScale = toScale(firstPrinciplesRaw);

  const CRITICAL_QUESTS = [
    "Question one 'obvious' fact today",
    "Debate 1 belief you hold",
    "Ask 'why' three times in a row",
    "Find the flaw in a popular argument",
    "Play devil's advocate once today",
  ];
  
  const FIRST_PRINCIPLES_QUESTS = [
    "Break a problem into its atoms",
    "Rebuild one idea from scratch",
    "Ask 'what if we started over?'",
    "Strip away assumptions on 1 topic",
    "Define the core truth beneath",
  ];

  // Phase 2.2: Calculate earned badges
  const badgeCheckData = {
    bigFive: bigFiveProfile,
    averageSwipeTime: scores.averageSwipeTime,
    hybridTypes,
    engagement: scores.engagement,
  };
  const earnedBadges = BADGE_DEFINITIONS
    .filter(badge => badge.condition(badgeCheckData))
    .map(badge => ({
      name: badge.name,
      type: badge.type,
      icon: badge.icon,
      color: badge.color,
    }));

  // Phase 3.1: Calculate internal consistency (Cronbach's alpha)
  const responsesWithPsych: ResponseItem[] = scores.responses.map((r: any) => ({
    questionId: r.questionId,
    choice: r.choice,
    sliderValue: r.sliderValue,
    psych: r.psych || 'Unknown',
  }));
  
  const consistency = calculateTraitConsistency(responsesWithPsych);
  const consistencyWarning = consistency.lowConsistencyFlags.length > 0 
    ? `Balanced View - Retake for clarity on: ${consistency.lowConsistencyFlags.join(', ')}`
    : null;

  return {
    mbtiType,
    mbtiBlend: `${mbtiType}-${primaryDisc}`,
    discStyle: discStyles[primaryDisc] || "Balanced",
    bigFiveProfile,
    title: mbtiInfo.title,
    spark: mbtiInfo.spark,
    proxyNudge,
    engagement: scores.engagement,
    totalQuestions: scores.responses.length,
    avgResponseTime: scores.responses.reduce((a, b) => a + b.timeSpent, 0) / (scores.responses.length || 1),
    criticalScale,
    firstPrinciplesScale,
    criticalQuest: CRITICAL_QUESTS[criticalScale - 1],
    firstPrinciplesQuest: FIRST_PRINCIPLES_QUESTS[firstPrinciplesScale - 1],
    scales: {
      critical: {
        value: criticalScale,
        traits: "T/O dissects sharply",
        quest: CRITICAL_QUESTS[criticalScale - 1],
      },
      firstPrinciples: {
        value: firstPrinciplesScale,
        traits: "N/O rebuilds from ground up",
        quest: FIRST_PRINCIPLES_QUESTS[firstPrinciplesScale - 1],
      },
    },
    // Phase 1.4 & 2.2: New fields
    hybridTypes,
    earnedBadges,
    swipeAnalytics: {
      averageTime: scores.averageSwipeTime || 0,
      difficulty: scores.currentDifficulty || "medium",
      fastCount: scores.swipeTimes?.filter((t: number) => t < 2).length || 0,
      slowCount: scores.swipeTimes?.filter((t: number) => t > 6).length || 0,
    },
    // Phase 3.1: Internal consistency metrics
    consistency: {
      alphas: consistency.alphas,
      overallAlpha: consistency.overallAlpha,
      lowConsistencyFlags: consistency.lowConsistencyFlags,
      warning: consistencyWarning,
    },
    // Phase 3.1: Weighted proxy percentages for transparency
    proxyBreakdown: {
      critical: {
        mbtiT: Math.round(mbtiT_pct),
        big5O: Math.round(big5O_pct),
        discC: Math.round(discC_pct),
        weighted: Math.round(criticalProxy),
        final: Math.round(Math.max(0, Math.min(100, criticalRaw))),
      },
      firstPrinciples: {
        mbtiN: Math.round(mbtiN_pct),
        big5O: Math.round(big5O_pct),
        discI: Math.round(discI_pct),
        weighted: Math.round(firstPrinciplesProxy),
        final: Math.round(Math.max(0, Math.min(100, firstPrinciplesRaw))),
      },
    },
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/score", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 10, 3600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 10 quiz submissions per hour." });
    }
    try {
      const parsed = quizSubmitSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid quiz data",
          details: parsed.error.errors,
        });
      }

      const data = parsed.data;
      const result = calculatePersonality(data.scores, data.theme);
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      await storage.saveQuizSession({
        id: sessionId,
        tier: data.tier,
        mood: data.mood,
        funMode: data.funMode,
        landmark: data.landmark,
        theme: data.theme,
        result,
        responses: data.scores.responses,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        sessionId,
        result,
      });
    } catch (error) {
      console.error("Score calculation error:", error);
      return res.status(500).json({ error: "Failed to calculate score" });
    }
  });

  app.get("/api/session/:id", async (req: Request, res: Response) => {
    try {
      const session = await storage.getQuizSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      return res.json(session);
    } catch (error) {
      console.error("Session fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Phase 1.5: Refine endpoint for recalculating results based on user feedback
  const refineSchema = z.object({
    sessionId: z.string(),
    adjustments: z.object({
      openness: z.number().min(-20).max(20).optional(),
      conscientiousness: z.number().min(-20).max(20).optional(),
      extraversion: z.number().min(-20).max(20).optional(),
      agreeableness: z.number().min(-20).max(20).optional(),
      neuroticism: z.number().min(-20).max(20).optional(),
    }).optional(),
    traitFeedback: z.array(z.object({
      trait: z.string(),
      accuracy: z.number().min(1).max(5), // 1-5 rating
    })).optional(),
  });

  app.post("/api/quiz/refine", async (req: Request, res: Response) => {
    try {
      const parsed = refineSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid refine data",
          details: parsed.error.errors,
        });
      }

      const { sessionId, adjustments, traitFeedback } = parsed.data;
      const session = await storage.getQuizSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Apply adjustments to Big Five profile
      const refinedProfile = { ...session.result.bigFiveProfile };
      
      if (adjustments) {
        if (adjustments.openness) refinedProfile.openness = Math.max(0, Math.min(100, refinedProfile.openness + adjustments.openness));
        if (adjustments.conscientiousness) refinedProfile.conscientiousness = Math.max(0, Math.min(100, refinedProfile.conscientiousness + adjustments.conscientiousness));
        if (adjustments.extraversion) refinedProfile.extraversion = Math.max(0, Math.min(100, refinedProfile.extraversion + adjustments.extraversion));
        if (adjustments.agreeableness) refinedProfile.agreeableness = Math.max(0, Math.min(100, refinedProfile.agreeableness + adjustments.agreeableness));
        if (adjustments.neuroticism) refinedProfile.neuroticism = Math.max(0, Math.min(100, refinedProfile.neuroticism + adjustments.neuroticism));
      }

      // Calculate confidence scores based on trait feedback
      const confidenceScores: Record<string, number> = {};
      if (traitFeedback) {
        traitFeedback.forEach(fb => {
          confidenceScores[fb.trait] = fb.accuracy / 5; // Normalize to 0-1
        });
      }

      // Update session with refined results
      const refinedResult = {
        ...session.result,
        bigFiveProfile: refinedProfile,
        refinedAt: new Date().toISOString(),
        confidenceScores,
        refinementCount: ((session.result as any).refinementCount || 0) + 1,
      };

      // Save updated session
      await storage.saveQuizSession({
        ...session,
        result: refinedResult,
      });

      return res.json({
        success: true,
        refinedProfile,
        confidenceScores,
        message: "Results refined based on your feedback",
      });
    } catch (error) {
      console.error("Refine error:", error);
      return res.status(500).json({ error: "Failed to refine results" });
    }
  });

  // Phase 2.2: Get badges for a session
  app.get("/api/badges/:sessionId", async (req: Request, res: Response) => {
    try {
      const session = await storage.getQuizSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const result = session.result as any;
      return res.json({
        badges: result.earnedBadges || [],
        hybridTypes: result.hybridTypes || [],
      });
    } catch (error) {
      console.error("Badges fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/stripe/config", async (_req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe config error:", error);
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  app.get("/api/stripe/products", async (_req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY p.id
      `);
      
      const productsMap = new Map();
      for (const row of result.rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
          });
        }
      }

      res.json({ products: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/stripe/checkout", async (req: Request, res: Response) => {
    try {
      const { priceId, email, sessionId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}`;
      const cancelUrl = `${baseUrl}/checkout/cancel`;

      const checkoutSession = await stripeService.createOneTimeCheckoutSession(
        undefined,
        priceId,
        successUrl,
        cancelUrl,
        email
      );

      res.json({ url: checkoutSession.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/stripe/checkout/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await stripeService.getCheckoutSession(sessionId);
      
      res.json({
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
      });
    } catch (error) {
      console.error("Checkout session fetch error:", error);
      res.status(500).json({ error: "Failed to fetch checkout session" });
    }
  });

  // Donation endpoint with dynamic pricing
  app.post("/api/stripe/donate", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 5, 600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 donation attempts per 10 minutes." });
    }
    try {
      const { amount, sessionId } = req.body;

      if (!amount || amount < 100 || !Number.isInteger(amount)) {
        return res.status(400).json({ error: "Invalid donation amount. Minimum $1.00 (100 cents)" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}&donation=true`;
      const cancelUrl = `${baseUrl}/checkout/cancel`;

      const stripe = await stripeService.getStripe();
      
      const donationAmount = (amount / 100).toFixed(2);
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `KnowRole Donation - $${donationAmount}`,
              description: 'Thank you for supporting KnowRole development!',
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ url: checkoutSession.url });
    } catch (error) {
      console.error("Donation checkout error:", error);
      res.status(500).json({ error: "Failed to create donation checkout" });
    }
  });

  // Feedback submission endpoint
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = {
        sessionId: req.body.sessionId || null,
        usefulApp: req.body.usefulApp || null,
        resultsAccurate: req.body.resultsAccurate || null,
        questionsEngaging: req.body.questionsEngaging || null,
        wouldShare: req.body.wouldShare || null,
        suggestions: req.body.suggestions || null,
        mbtiType: req.body.mbtiType || null,
        discStyle: req.body.discStyle || null,
        primaryRole: req.body.primaryRole || null,
        tier: req.body.tier || null,
        mood: req.body.mood || null,
        funMode: req.body.funMode ?? null,
      };

      const saved = await storage.saveFeedback(feedbackData);
      console.log("Feedback saved:", saved.id);
      
      // Auto-export to Google Sheets
      if (feedbackData.sessionId) {
        try {
          const { autoExportQuizSession } = await import("./googleSheets");
          const fs = await import("fs");
          const path = await import("path");
          
          const session = await storage.getQuizSession(feedbackData.sessionId);
          if (session) {
            // Build questions map for response formatting
            const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
            const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
            const questionsArray = questionsData.questions || questionsData || [];
            const questionsMap = new Map<number, any>();
            questionsArray.forEach((q: any) => questionsMap.set(q.id, q));
            
            await autoExportQuizSession(session, feedbackData, questionsMap);
          }
        } catch (exportError) {
          console.error("Auto-export failed (non-blocking):", exportError);
        }
      }
      
      res.json({ success: true, id: saved.id });
    } catch (error) {
      console.error("Feedback save error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Get all feedback (owner access for Google Sheets export)
  app.get("/api/feedback", async (_req: Request, res: Response) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json({ feedback: allFeedback });
    } catch (error) {
      console.error("Feedback fetch error:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // PDF Generation endpoint
  app.post("/api/generate-pdf", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 5, 3600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 PDF generations per hour." });
    }
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const { sessionId, result, mood, tier } = req.body;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const purple = rgb(0.65, 0.55, 0.98);
      const darkPurple = rgb(0.4, 0.3, 0.7);
      const darkBg = rgb(0.04, 0.04, 0.06);
      const cardBg = rgb(0.07, 0.07, 0.1);
      const lightText = rgb(0.97, 0.98, 0.99);
      const mutedText = rgb(0.58, 0.64, 0.72);
      const cyan = rgb(0.4, 0.91, 0.98);
      
      page.drawRectangle({ x: 0, y: 0, width, height, color: darkBg });
      
      let y = height - 50;
      
      page.drawRectangle({ x: 40, y: y - 70, width: width - 80, height: 80, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("KnowYouRole", { x: 55, y: y - 30, size: 32, font: helveticaBold, color: purple });
      page.drawText("Personality Discovery Report", { x: 55, y: y - 55, size: 14, font: helvetica, color: mutedText });
      
      y -= 100;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("YOUR PERSONALITY TYPE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      page.drawText(result?.mbtiType || "XXXX", { x: 55, y: y - 65, size: 48, font: helveticaBold, color: lightText });
      
      page.drawText(result?.title || "Your Unique Type", { x: 55, y: y - 95, size: 16, font: helveticaBold, color: purple });
      
      const spark = result?.spark || "Discover your unique strengths and potential!";
      const sparkLines = spark.length > 70 ? [spark.slice(0, 70), spark.slice(70)] : [spark];
      sparkLines.forEach((line: string, i: number) => {
        page.drawText(line, { x: 55, y: y - 120 - (i * 16), size: 11, font: helveticaOblique, color: mutedText });
      });
      
      page.drawText(`DISC: ${result?.discStyle || "Balanced"}`, { x: 55, y: y - 165, size: 12, font: helvetica, color: mutedText });
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("BIG FIVE PERSONALITY PROFILE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
      const traits = [
        { name: "Openness", key: "O", value: bigFive.O, desc: "Creativity & Curiosity" },
        { name: "Conscientiousness", key: "C", value: bigFive.C, desc: "Organization & Discipline" },
        { name: "Extraversion", key: "E", value: bigFive.E, desc: "Social Energy" },
        { name: "Agreeableness", key: "A", value: bigFive.A, desc: "Empathy & Cooperation" },
        { name: "Neuroticism", key: "N", value: bigFive.N, desc: "Emotional Sensitivity" },
      ];
      
      let traitY = y - 50;
      for (const trait of traits) {
        page.drawText(trait.name, { x: 55, y: traitY, size: 10, font: helveticaBold, color: lightText });
        page.drawText(trait.desc, { x: 180, y: traitY, size: 8, font: helvetica, color: mutedText });
        
        page.drawRectangle({ x: 340, y: traitY - 2, width: 160, height: 12, color: rgb(0.15, 0.15, 0.2) });
        page.drawRectangle({ x: 340, y: traitY - 2, width: Math.min(trait.value * 1.6, 160), height: 12, color: purple });
        
        page.drawText(`${trait.value}%`, { x: 510, y: traitY, size: 10, font: helveticaBold, color: lightText });
        
        traitY -= 26;
      }
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("MOOD BLEND", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      const moodText = mood || "Balanced";
      page.drawText(moodText.length > 25 ? moodText.slice(0, 25) + "..." : moodText, { x: 55, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Your emotional starting point", { x: 55, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      page.drawRectangle({ x: 40 + (width - 90) / 2 + 10, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("AGE TIER", { x: 55 + (width - 90) / 2 + 10, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      page.drawText(tier || "Adult", { x: 55 + (width - 90) / 2 + 10, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Quiz difficulty level", { x: 55 + (width - 90) / 2 + 10, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      y -= 120;
      
      page.drawRectangle({ x: 40, y: 30, width: width - 80, height: 50, color: cardBg });
      page.drawText("Generated by KnowYouRole", { x: 55, y: 55, size: 10, font: helvetica, color: mutedText });
      page.drawText("knowyourole.replit.app", { x: 55, y: 40, size: 9, font: helvetica, color: purple });
      page.drawText(`Session: ${sessionId?.slice(-8) || "N/A"}`, { x: width - 160, y: 48, size: 9, font: helvetica, color: mutedText });
      
      const pdfBytes = await pdfDoc.save();
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=KnowYouRole-Results.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Seed database with trait vibes and archetypes
  app.post("/api/admin/seed", async (_req: Request, res: Response) => {
    try {
      await seedAll();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // Get trait vibe for a specific trait and score
  app.get("/api/trait-vibe/:trait/:score", async (req: Request, res: Response) => {
    try {
      const { trait, score } = req.params;
      const scoreNum = parseInt(score);
      
      const vibes = await db.select().from(traitVibes)
        .where(
          and(
            eq(traitVibes.trait, trait.toLowerCase()),
            lte(traitVibes.scoreMin, scoreNum),
            gte(traitVibes.scoreMax, scoreNum)
          )
        );
      
      if (vibes.length === 0) {
        return res.status(404).json({ error: "Trait vibe not found" });
      }
      
      res.json(vibes[0]);
    } catch (error) {
      console.error("Trait vibe fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trait vibe" });
    }
  });

  // Get all trait vibes for Big Five profile
  app.post("/api/trait-vibes", async (req: Request, res: Response) => {
    try {
      const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = req.body;
      
      const getVibe = async (trait: string, score: number) => {
        const vibes = await db.select().from(traitVibes)
          .where(
            and(
              eq(traitVibes.trait, trait),
              lte(traitVibes.scoreMin, score),
              gte(traitVibes.scoreMax, score)
            )
          );
        return vibes[0] || null;
      };

      const vibes = {
        openness: await getVibe("openness", openness),
        conscientiousness: await getVibe("conscientiousness", conscientiousness),
        extraversion: await getVibe("extraversion", extraversion),
        agreeableness: await getVibe("agreeableness", agreeableness),
        neuroticism: await getVibe("neuroticism", neuroticism),
      };

      res.json(vibes);
    } catch (error) {
      console.error("Trait vibes fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trait vibes" });
    }
  });

  // Get adventure archetype for Mini Explorer based on Big Five profile
  app.post("/api/adventure-archetype", async (req: Request, res: Response) => {
    try {
      const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = req.body;
      
      // Get all archetypes
      const archetypes = await db.select().from(adventureArchetypes);
      
      if (archetypes.length === 0) {
        return res.json({ 
          name: "The Explorer",
          superpower: "You discover what others miss!",
          description: "You're always curious and asking 'why?' You love learning new things and going on adventures.",
          mission: "Find something you've never noticed before today!",
          badgeColor: "#10B981",
        });
      }

      // Score each archetype based on trait matching
      const getLevel = (score: number): string => {
        if (score >= 76) return "high";
        if (score >= 51) return "mid_high";
        if (score >= 26) return "low_mid";
        return "low";
      };

      const userTraits = {
        openness: getLevel(openness),
        conscientiousness: getLevel(conscientiousness),
        extraversion: getLevel(extraversion),
        agreeableness: getLevel(agreeableness),
        neuroticism: getLevel(neuroticism),
      };

      let bestMatch = archetypes[0];
      let bestScore = 0;

      for (const archetype of archetypes) {
        const traits = JSON.parse(archetype.traits);
        let score = 0;
        
        for (const [trait, level] of Object.entries(traits)) {
          const userLevel = userTraits[trait as keyof typeof userTraits];
          if (userLevel === level) score += 2;
          else if (
            (level === "high" && userLevel === "mid_high") ||
            (level === "mid_high" && (userLevel === "high" || userLevel === "mid")) ||
            (level === "low" && userLevel === "low_mid")
          ) score += 1;
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = archetype;
        }
      }

      res.json({
        name: bestMatch.name,
        superpower: bestMatch.superpower,
        description: bestMatch.description,
        mission: bestMatch.mission,
        badgeColor: bestMatch.badgeColor,
      });
    } catch (error) {
      console.error("Adventure archetype fetch error:", error);
      res.status(500).json({ error: "Failed to fetch adventure archetype" });
    }
  });

  // Get all adventure archetypes
  app.get("/api/adventure-archetypes", async (_req: Request, res: Response) => {
    try {
      const archetypes = await db.select().from(adventureArchetypes);
      res.json({ archetypes });
    } catch (error) {
      console.error("Archetypes fetch error:", error);
      res.status(500).json({ error: "Failed to fetch archetypes" });
    }
  });

  // Google Sheets Export - Export all quiz sessions with feedback to Google Sheets
  app.post("/api/export/sheets/sessions", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet, formatTimezone } = await import("./googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      // Get all quiz sessions and feedback
      const allSessions = await storage.getAllQuizSessions();
      const allFeedback = await storage.getAllFeedback();
      
      // Create feedback lookup by sessionId
      const feedbackMap = new Map<string, any>();
      allFeedback.forEach(f => {
        if (f.sessionId) feedbackMap.set(f.sessionId, f);
      });
      
      // Read questions database
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      const questionsMap = new Map<number, any>();
      questionsData.questions.forEach((q: any) => questionsMap.set(q.id, q));
      
      // Create spreadsheet
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Quiz Data");
      
      // Build sessions data with all info in one row
      const sessionsHeader = [
        "Timestamp (Local)", "Session ID", "Age Tier", "Mood", "Fun Mode", "Theme",
        "MBTI Type", "MBTI Blend", "DISC Style", "Title", "Spark",
        "Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism",
        "Total Questions", "Avg Response Time (s)", "Engagement Score",
        "Useful App?", "Results Accurate?", "Questions Engaging?", "Would Share?", "Suggestions",
        "All Responses (Q#:Choice)"
      ];
      
      const sessionsRows = [sessionsHeader];
      
      for (const session of allSessions) {
        const feedback = feedbackMap.get(session.id);
        const responses = session.responses || [];
        const responsesStr = responses
          .map((r: any) => {
            const q = questionsMap.get(r.questionId);
            const choiceText = q?.options?.[r.choice] ?? String(r.choice);
            return `Q${r.questionId}:${choiceText}`;
          })
          .join("; ");
        
        const result = session.result || {};
        const bigFive = result.bigFiveProfile || {};
        
        sessionsRows.push([
          formatTimezone(session.createdAt),
          session.id || "",
          session.tier || "",
          session.mood || "",
          session.funMode ? "Yes" : "No",
          session.theme || "",
          result.mbtiType || "",
          result.mbtiBlend || "",
          result.discStyle || "",
          result.title || "",
          result.spark || "",
          bigFive.openness ?? "",
          bigFive.conscientiousness ?? "",
          bigFive.extraversion ?? "",
          bigFive.agreeableness ?? "",
          bigFive.neuroticism ?? "",
          result.totalQuestions ?? "",
          result.avgResponseTime?.toFixed(2) || "",
          result.engagement ?? "",
          feedback?.usefulApp || "",
          feedback?.resultsAccurate || "",
          feedback?.questionsEngaging || "",
          feedback?.wouldShare || "",
          feedback?.suggestions || "",
          responsesStr
        ]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "Quiz Sessions", sessionsRows);
      
      res.json({ 
        success: true, 
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sessionsExported: allSessions.length
      });
    } catch (error) {
      console.error("Google Sheets export error:", error);
      res.status(500).json({ error: "Failed to export to Google Sheets" });
    }
  });

  // Google Sheets Export - Export questions database
  app.post("/api/export/sheets/questions", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet } = await import("./googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      // Read questions database
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      
      // Create spreadsheet
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Questions Database");
      
      // Build questions data with ALL details
      const questionsHeader = [
        "ID", "Prompt", "Left Option", "Right Option", "Left Description", "Right Description",
        "Left Meta", "Right Meta", "Psychology Type", "Response Type", "Time (s)", "Age Tier", 
        "Version", "Paid", "Wildcard", "Is 2x", "Boost Range Min", "Boost Range Max", "Notes"
      ];
      
      const questionsRows = [questionsHeader];
      
      for (const q of questionsData.questions) {
        const boostRange = q.boostRange || [0.7, 0.9];
        questionsRows.push([
          q.id,
          q.prompt,
          q.options?.[0] || "",
          q.options?.[1] || "",
          q.leftDesc || "",
          q.rightDesc || "",
          q.optionMeta?.[0] || "",
          q.optionMeta?.[1] || "",
          q.psych || "",
          q.responseType || "binary",
          q.time || "",
          q.tier || "",
          q.version || "",
          q.paid ? "Yes" : "No",
          q.wildcard ? "Yes" : "No",
          q.is2x ? "Yes" : "No",
          boostRange[0],
          boostRange[1],
          q.notes || ""
        ]);
      }
      
      // Add summary sheet
      const summaryRows = [
        ["KnowRole Questions Database Summary"],
        [""],
        ["Total Questions", questionsData.questions.length],
        ["Binary Questions", questionsData.questions.filter((q: any) => !q.responseType || q.responseType === "binary").length],
        ["Slider Questions", questionsData.questions.filter((q: any) => q.responseType === "slider").length],
        [""],
        ["By Psychology Type:"],
        ["MBTI", questionsData.questions.filter((q: any) => q.psych?.startsWith("MBTI")).length],
        ["DISC", questionsData.questions.filter((q: any) => q.psych?.startsWith("DISC")).length],
        ["Big Five", questionsData.questions.filter((q: any) => q.psych?.startsWith("Big5")).length],
        ["Critical Thinking", questionsData.questions.filter((q: any) => q.psych === "Critical").length],
        ["First Principles", questionsData.questions.filter((q: any) => q.psych === "FirstPrinciples").length],
        [""],
        ["By Age Tier:"],
        ["All Tiers", questionsData.questions.filter((q: any) => q.tier === "all").length],
        ["Mini (7-12)", questionsData.questions.filter((q: any) => q.tier === "7-12").length],
        ["Teen (13-18)", questionsData.questions.filter((q: any) => q.tier === "13-18").length],
        ["Young Adult (19-25)", questionsData.questions.filter((q: any) => q.tier === "19-25").length],
        ["Adult (25+)", questionsData.questions.filter((q: any) => q.tier === "25+").length],
        [""],
        ["Timer Configuration:"],
        ["Mini (7-12)", `${questionsData.tierConfig["7-12"]?.maxTime || 12}s base, ${questionsData.tierConfig["7-12"]?.baseCount || 16} questions`],
        ["Teen (13-18)", `${questionsData.tierConfig["13-18"]?.maxTime || 12}s base, ${questionsData.tierConfig["13-18"]?.baseCount || 22} questions`],
        ["Young Adult (19-25)", `${questionsData.tierConfig["19-25"]?.maxTime || 12}s base, ${questionsData.tierConfig["19-25"]?.baseCount || 28} questions`],
        ["Adult (25+)", `${questionsData.tierConfig["25+"]?.maxTime || 12}s base, ${questionsData.tierConfig["25+"]?.baseCount || 34} questions`],
        ["Slider Bonus", "+3 seconds"],
        ["Badge Bonus", "+2 seconds"],
        [""],
        ["Export Date", new Date().toISOString()]
      ];
      
      await clearAndWriteSheet(spreadsheetId, "Summary", summaryRows);
      
      await clearAndWriteSheet(spreadsheetId, "Questions", questionsRows);
      
      res.json({ 
        success: true, 
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        questionsExported: questionsData.questions.length
      });
    } catch (error) {
      console.error("Google Sheets questions export error:", error);
      res.status(500).json({ error: "Failed to export questions to Google Sheets" });
    }
  });

  // Google Sheets Export - Export color schemes/city themes
  app.post("/api/export/sheets/colors", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet } = await import("./googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      // Read city themes
      const themesPath = path.join(process.cwd(), "client/src/data/cityThemes.ts");
      const themesContent = fs.readFileSync(themesPath, "utf-8");
      
      // Parse the cityThemes object from the TypeScript file
      const cityThemesMatch = themesContent.match(/export const cityThemes[^=]*=\s*(\{[\s\S]*?\n\};)/);
      const zipMappingMatch = themesContent.match(/export const zipCodeToCity[^=]*=\s*(\{[\s\S]*?\n\};)/);
      
      // Create spreadsheet
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Color Schemes");
      
      // Extract city theme data using regex
      const cityThemePattern = /"([^"]+)":\s*\{\s*city:\s*"([^"]+)",\s*(?:state:\s*"([^"]*)",\s*)?country:\s*"([^"]+)",\s*team:\s*"([^"]+)",\s*sport:\s*"([^"]+)",\s*colors:\s*\{\s*primary:\s*"([^"]+)",\s*secondary:\s*"([^"]+)",\s*accent:\s*"([^"]+)"\s*\},\s*textOnPrimary:\s*"([^"]+)",\s*textOnSecondary:\s*"([^"]+)"/g;
      
      const colorHeader = [
        "City Key", "City Name", "State", "Country", "Team", "Sport", 
        "Primary Color (HEX)", "Secondary Color (HEX)", "Accent Color (HEX)",
        "Text on Primary", "Text on Secondary"
      ];
      
      const colorRows = [colorHeader];
      let match;
      
      while ((match = cityThemePattern.exec(themesContent)) !== null) {
        colorRows.push([
          match[1],  // key
          match[2],  // city
          match[3] || "",  // state
          match[4],  // country
          match[5],  // team
          match[6],  // sport
          match[7],  // primary
          match[8],  // secondary
          match[9],  // accent
          match[10], // textOnPrimary
          match[11]  // textOnSecondary
        ]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "City Color Schemes", colorRows);
      
      // Also add tier configuration
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      
      const tierHeader = ["Age Tier", "Base Question Count", "Max Time (seconds)", "Swipe Style"];
      const tierRows = [tierHeader];
      
      for (const [tier, config] of Object.entries(questionsData.tierConfig)) {
        const cfg = config as { baseCount: number; maxTime: number; swipeStyle: string };
        tierRows.push([
          tier,
          cfg.baseCount.toString(),
          cfg.maxTime.toString(),
          cfg.swipeStyle
        ]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "Tier Configuration", tierRows);
      
      res.json({ 
        success: true, 
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        colorSchemesExported: colorRows.length - 1,
        tierConfigsExported: tierRows.length - 1
      });
    } catch (error) {
      console.error("Google Sheets color schemes export error:", error);
      res.status(500).json({ error: "Failed to export color schemes to Google Sheets" });
    }
  });

  // Comprehensive Full Data Export - Everything needed to understand and rebuild the app
  app.post("/api/export/sheets/full", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet, formatTimezone, getPSTTimestamp } = await import("./googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      // Create the comprehensive spreadsheet
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Blueprint");
      
      // ========== SHEET 1: App Overview ==========
      const overviewRows = [
        ["KnowRole - Complete Application Blueprint"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["=== PURPOSE ==="],
        ["KnowRole is a personality discovery application designed with an 'Everyday Compass' aesthetic."],
        ["It guides users through self-discovery using quizzes, mood assessment, and location-based personalization."],
        ["The app helps users discover their personality traits through age-tiered quizzes and provides career recommendations."],
        [""],
        ["=== CORE FEATURES ==="],
        ["1. Age-Tiered Quiz System - Mini (25Q), Teen (30Q), Young Adult (35Q), Adult (40Q)"],
        ["2. Mood Mixer - Interactive cauldron where users tap 2 of 6 mood orbs to create blend, mood boosts applied to Big Five traits"],
        ["3. Interactive Game Breaks - Superpower orbs, Mystery Box, Multiple Choice breaks"],
        ["4. Comprehensive Results - MBTI, DISC, Big Five personality profiles with percentile comparisons"],
        ["5. Premium Features - 6 swipeable insight cards (Career Compass, Relationship Dynamics, Growth Tips, Side Hustles, Learning Style, Strengths)"],
        ["6. Sharpen Thinking Section - ADAPTIVE: prioritizes weak proxies (critical vs firstPrinciples), tracks progress in localStorage"],
        ["7. Achievement Badges - 8 badge types awarded based on quiz behavior"],
        ["8. Random Event Pop-ups - 8-15% chance per question with engagement-based dynamic calculation"],
        ["9. Google Sheets Integration - Auto-export quiz sessions and feedback"],
        ["10. Stripe Integration - Donation system with $3.33 and $33.33 tiers"],
        ["11. Mid-Quiz Recaps - Every 10 questions shows Spin Wheel checkpoint with 2 accurate insights"],
        ["12. PDF Download - Share results as printable PDF via browser print dialog"],
        ["13. Percentile Comparisons - Big Five scores compared to population norms using z-scores"],
        ["14. IRT Adaptive Branching - Detects ambiguous traits (<15% difference) and prioritizes targeted questions"],
        ["15. Dynamic Question Wording - Questions adjusted based on mood tone (introspective, energetic, analytical)"],
        [""],
        ["=== USER JOURNEY FLOW ==="],
        ["Home (/) → Age Tier Selection"],
        ["Mood Mixer (/mood-mixer) → Tap 2 of 6 mood orbs (Happy, Calm, Curious, Determined, Creative, Social) to create blend"],
        ["Location (/location) → Enter zip code for regional career insights"],
        ["Pre-Quiz (/pre-quiz) → Animated 5-step walkthrough with subtle skip option after 2 seconds"],
        ["Quiz (/quiz) → Binary swipe questions with game breaks, badges, random events, spin wheel checkpoints"],
        ["Results (/results) → Personality profile, premium insights, Sharpen Thinking section"],
        [""],
        ["=== QUIZ MECHANICS (DECEMBER 2025 UPDATE) ==="],
        ["Popup Queue System - Badge overlays and random events display sequentially, never overlap"],
        ["Timer Pause Logic - Timer pauses during any popup (badge overlay, random event, timeout quip)"],
        ["Interactive Blocking - Answer buttons disabled during popup displays"],
        ["Weighted Scoring (-2 to +2) - Slider questions use 5-point scale for nuanced responses"],
        ["Dynamic Difficulty - Swipe time tracking adjusts question difficulty"],
        ["Skip Instructions - Subtle gray button appears after 2 seconds on pre-quiz page"],
        [""],
        ["=== SHARPEN THINKING FEATURE ==="],
        ["60 Critical Thinking Questions - Divided into 5 categories (12 questions each)"],
        ["Categories: Logic Puzzles, Pattern Recognition, Cause & Effect, Perspective Taking, Problem Solving"],
        ["5-Question Sequential Challenges - Answer 5 random questions per session"],
        ["Performance Tracking - Best score persisted in localStorage ('knowrole-thinking-best-score')"],
        ["Question Pool Tracking - Prevents repeat questions using localStorage"],
        ["Scoring: 10 points correct, -5 points wrong, displayed as X/50 format"],
        [""],
        ["=== BUSINESS MODEL ==="],
        ["Free tier: Basic personality results with 4-5 sentence summary"],
        ["Premium tier: Currently free ('Just Kidding' interstitial reveals premium is free for testing)"],
        ["Donation options: $3.33 or $33.33 via Stripe"],
        ["Future: AI-driven personality analysis, personalized growth features"],
      ];
      await clearAndWriteSheet(spreadsheetId, "1. App Overview", overviewRows);
      
      // ========== SHEET 2: Technical Architecture ==========
      const techRows = [
        ["KnowRole Technical Architecture"],
        [""],
        ["=== TECH STACK ==="],
        ["Category", "Technology", "Purpose"],
        ["Frontend Framework", "React 18+", "UI library for building components"],
        ["Language", "TypeScript", "Type-safe JavaScript for frontend and backend"],
        ["Build Tool", "Vite", "Fast development server and build tool"],
        ["Routing", "wouter", "Lightweight client-side routing"],
        ["UI Components", "shadcn/ui", "Component library built on Radix UI"],
        ["State Management", "TanStack Query", "Server state management and caching"],
        ["Styling", "Tailwind CSS", "Utility-first CSS framework"],
        ["Animations", "Framer Motion", "Animation library for React"],
        ["Forms", "React Hook Form + Zod", "Form management with validation"],
        ["Icons", "Lucide React", "Icon library"],
        ["Backend", "Express.js", "Node.js web server framework"],
        ["Runtime", "Node.js", "JavaScript runtime"],
        ["Database ORM", "Drizzle ORM", "Type-safe database ORM"],
        ["Database", "PostgreSQL (Neon)", "Cloud-hosted PostgreSQL database"],
        ["Payments", "Stripe", "Payment processing"],
        ["Data Export", "Google Sheets API", "Spreadsheet integration"],
        [""],
        ["=== FILE STRUCTURE ==="],
        ["Path", "Purpose"],
        ["client/src/pages/", "Page components (Home, Mood, Quiz, Results, etc.)"],
        ["client/src/components/", "Reusable UI components"],
        ["client/src/data/", "Static data files (questions.json, cityThemes.ts)"],
        ["client/src/lib/", "Utility functions and helpers"],
        ["client/src/hooks/", "Custom React hooks"],
        ["server/", "Backend Express server"],
        ["server/routes.ts", "API endpoint definitions"],
        ["server/storage.ts", "Data storage interface"],
        ["server/googleSheets.ts", "Google Sheets integration"],
        ["shared/schema.ts", "Database schema and types"],
        [""],
        ["=== ENVIRONMENT VARIABLES ==="],
        ["Variable", "Purpose"],
        ["DATABASE_URL", "PostgreSQL connection string"],
        ["SESSION_SECRET", "Express session encryption"],
        ["STRIPE_SECRET_KEY", "Stripe API key (via Replit integration)"],
        ["Google Sheets", "OAuth via Replit connector (no env var needed)"],
      ];
      await clearAndWriteSheet(spreadsheetId, "2. Technical Stack", techRows);
      
      // ========== SHEET 3: Database Schema (COMPREHENSIVE - ALL 18 TABLES) ==========
      const schemaRows = [
        ["Database Schema - Complete Reference (18 Tables)"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SECTION 1: CORE TABLES                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["=== TABLE: users ==="],
        ["Purpose: User authentication (minimal - most users are anonymous)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique user identifier"],
        ["username", "text", "NOT NULL, UNIQUE", "User's username"],
        ["password", "text", "NOT NULL", "Hashed password"],
        [""],
        ["=== TABLE: feedback ==="],
        ["Purpose: Collects user feedback after quiz completion, triggers Google Sheets export"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique feedback identifier"],
        ["sessionId", "text", "", "Links to quiz session for correlation"],
        ["usefulApp", "text", "", "Was app useful? (yes/no/somewhat)"],
        ["resultsAccurate", "text", "", "Were results accurate? (yes/no/somewhat)"],
        ["questionsEngaging", "text", "", "Were questions engaging? (yes/no/somewhat)"],
        ["wouldShare", "text", "", "Would share with others? (yes/no)"],
        ["suggestions", "text", "", "User suggestions/comments (max 2000 chars)"],
        ["mbtiType", "text", "", "User's MBTI result (e.g., INTJ, ENFP)"],
        ["discStyle", "text", "", "User's DISC result (D, I, S, or C)"],
        ["primaryRole", "text", "", "Recommended career role title"],
        ["tier", "text", "", "Age tier selected (7-12, 13-18, 19-25, 25+)"],
        ["mood", "text", "", "Mood selected (energized, stuck, reflective)"],
        ["funMode", "boolean", "", "Was fun mode enabled?"],
        ["createdAt", "timestamp", "DEFAULT NOW()", "Record creation time"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SECTION 2: PERSONALITY TRAIT TABLES                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["=== TABLE: trait_vibes ==="],
        ["Purpose: Quartile-based personality descriptions for Big Five traits"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["trait", "text", "NOT NULL", "Big Five trait: openness, conscientiousness, extraversion, agreeableness, neuroticism"],
        ["quartile", "text", "NOT NULL", "Score range: low (0-25), low_mid (26-50), mid_high (51-75), high (76-100)"],
        ["scoreMin", "integer", "NOT NULL", "Minimum score for this quartile"],
        ["scoreMax", "integer", "NOT NULL", "Maximum score for this quartile"],
        ["vibeTitle", "text", "NOT NULL", "Friendly title (e.g., 'The Steady Traditionalist')"],
        ["vibeDescription", "text", "NOT NULL", "Full description of personality at this level"],
        [""],
        ["=== TABLE: trait_combinations ==="],
        ["Purpose: Multi-trait personality blends (e.g., High O + Low C)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["trait1", "text", "NOT NULL", "First trait in combination"],
        ["trait1Level", "text", "NOT NULL", "First trait level: high or low"],
        ["trait2", "text", "NOT NULL", "Second trait in combination"],
        ["trait2Level", "text", "NOT NULL", "Second trait level: high or low"],
        ["comboTitle", "text", "NOT NULL", "Combination title (e.g., 'The Creative Spark')"],
        ["comboDescription", "text", "NOT NULL", "Description of this trait combination"],
        [""],
        ["=== TABLE: adventure_archetypes ==="],
        ["Purpose: Kid-friendly archetypes for Mini Explorer tier (ages 12 & under)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["name", "text", "NOT NULL", "Archetype name (e.g., 'The Inventor', 'The Storyteller')"],
        ["superpower", "text", "NOT NULL", "Kid-friendly superpower description"],
        ["description", "text", "NOT NULL", "Full archetype description"],
        ["mission", "text", "NOT NULL", "Daily mission suggestion (e.g., 'Build something with cardboard today')"],
        ["badgeColor", "text", "NOT NULL", "Badge display color for UI"],
        ["traits", "text", "NOT NULL", "JSON of matching trait patterns"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SECTION 3: ALGORITHM SUPPORT TABLES                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["=== TABLE: research_norms ==="],
        ["Purpose: Population statistics for z-score normalization of personality scores"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["trait", "text", "NOT NULL", "Trait name (e.g., 'openness', 'E', 'D')"],
        ["framework", "text", "NOT NULL", "Framework: 'bigFive', 'mbti', or 'disc'"],
        ["populationMean", "integer", "NOT NULL", "Population mean (typically 50)"],
        ["standardDeviation", "integer", "NOT NULL", "Standard deviation (typically 15)"],
        ["source", "text", "", "Research source citation"],
        ["createdAt", "timestamp", "DEFAULT NOW()", "Record creation time"],
        [""],
        ["=== TABLE: badges ==="],
        ["Purpose: Achievement badges earned by users during quiz"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["sessionId", "text", "NOT NULL", "Links to quiz session"],
        ["badgeName", "text", "NOT NULL", "Badge name (e.g., 'Trailblazer', 'Deep Thinker')"],
        ["badgeType", "text", "NOT NULL", "Type: 'trait', 'speed', 'streak', 'explorer', 'special'"],
        ["badgeIcon", "text", "NOT NULL", "Lucide icon name"],
        ["badgeColor", "text", "NOT NULL", "Tailwind color class"],
        ["threshold", "text", "", "JSON of threshold criteria that triggered this badge"],
        ["unlockedAt", "timestamp", "DEFAULT NOW()", "When badge was earned"],
        [""],
        ["=== TABLE: badge_definitions ==="],
        ["Purpose: Templates for achievable badges (configuration table)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["name", "text", "NOT NULL", "Badge name"],
        ["description", "text", "NOT NULL", "What the badge represents"],
        ["icon", "text", "NOT NULL", "Lucide icon name"],
        ["color", "text", "NOT NULL", "Color class"],
        ["category", "text", "NOT NULL", "Category: trait, speed, streak, explorer, special"],
        ["thresholdType", "text", "NOT NULL", "Type: score_above, score_below, speed_fast, combo"],
        ["thresholdValue", "text", "NOT NULL", "JSON criteria for earning this badge"],
        ["rarity", "text", "DEFAULT 'common'", "Rarity: common, rare, epic, legendary"],
        [""],
        ["=== TABLE: slider_responses ==="],
        ["Purpose: Detailed tracking for slider question responses (weighted scoring)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["sessionId", "text", "NOT NULL", "Links to quiz session"],
        ["questionId", "integer", "NOT NULL", "Which question was answered"],
        ["sliderValue", "integer", "NOT NULL", "Value from -2 to +2"],
        ["responseTimeMs", "integer", "NOT NULL", "How long user took to respond"],
        ["framework", "text", "NOT NULL", "MBTI, DISC, or bigFive"],
        ["trait", "text", "NOT NULL", "Which trait dimension was measured"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SECTION 4: INTERACTIVE FEATURE TABLES                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["=== TABLE: quiz_events ==="],
        ["Purpose: Random pop-up events during quiz (5-10% chance per question)"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["eventType", "text", "NOT NULL", "Type: wheel_spin, bonus_question, trait_reveal"],
        ["eventName", "text", "NOT NULL", "Display name for the event"],
        ["effect", "text", "NOT NULL", "JSON: { reverseTrait: 'E', boost: 10 }"],
        ["probability", "integer", "NOT NULL", "Chance percentage (5-10)"],
        ["locationTheme", "text", "", "Optional: tied to specific city themes"],
        [""],
        ["=== TABLE: story_nodes ==="],
        ["Purpose: Branching narrative content for story-based experiences"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["mbtiType", "text", "NOT NULL", "Which MBTI type this story is for"],
        ["nodeIndex", "integer", "NOT NULL", "Position in the story sequence"],
        ["storyText", "text", "NOT NULL", "The narrative text shown to user"],
        ["choiceA", "text", "", "First choice text"],
        ["choiceB", "text", "", "Second choice text"],
        ["choiceAEffect", "text", "", "JSON: trait adjustments if choice A selected"],
        ["choiceBEffect", "text", "", "JSON: trait adjustments if choice B selected"],
        ["nextNodeA", "integer", "", "Next node index if choice A"],
        ["nextNodeB", "integer", "", "Next node index if choice B"],
        ["isEnding", "boolean", "DEFAULT false", "Is this an ending node?"],
        [""],
        ["=== TABLE: mini_games ==="],
        ["Purpose: Interactive game definitions for feedback loop"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["gameType", "text", "NOT NULL", "Type: match, sort, puzzle"],
        ["gameName", "text", "NOT NULL", "Display name"],
        ["traitTarget", "text", "NOT NULL", "Which trait this measures"],
        ["instructions", "text", "NOT NULL", "How to play"],
        ["gameData", "text", "NOT NULL", "JSON with game-specific configuration"],
        ["pointsReward", "integer", "DEFAULT 10", "Points earned for completion"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SECTION 5: PREMIUM INSIGHTS TABLES (8 Categories)               ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["=== TABLE: side_hustles ==="],
        ["Purpose: Side gig recommendations matched to personality traits"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Side hustle name (e.g., 'Freelance Writing')"],
        ["description", "text", "NOT NULL", "What this side hustle involves"],
        ["incomeRange", "text", "NOT NULL", "Expected income (e.g., '$500-2K/mo')"],
        ["timeCommitment", "text", "NOT NULL", "Hours required (e.g., '5-10 hrs/week')"],
        ["difficulty", "text", "NOT NULL", "beginner, intermediate, or advanced"],
        ["primaryTrait", "text", "NOT NULL", "Big Five trait: O, C, E, A, or N"],
        ["primaryTraitMin", "integer", "NOT NULL", "Minimum score required (0-100)"],
        ["secondaryTrait", "text", "", "Optional second trait"],
        ["secondaryTraitMin", "integer", "", "Minimum for second trait"],
        ["mbtiPreference", "text", "", "E/I, N/S, T/F, or J/P preference"],
        ["discPreference", "text", "", "D, I, S, or C preference"],
        ["ageTiers", "text", "DEFAULT 'teen,young_adult,adult'", "Comma-separated age tiers"],
        ["tags", "text", "NOT NULL", "Comma-separated tags (e.g., 'creative,digital,flexible')"],
        [""],
        ["=== TABLE: blindspots ==="],
        ["Purpose: Growth areas based on low trait scores"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Blindspot name"],
        ["description", "text", "NOT NULL", "What this blindspot means"],
        ["actionTip", "text", "NOT NULL", "Specific action to address it"],
        ["targetTrait", "text", "NOT NULL", "The low trait this addresses"],
        ["traitMax", "integer", "NOT NULL", "Maximum score to show this (e.g., 40)"],
        ["secondaryCondition", "text", "", "JSON for additional conditions"],
        ["severity", "text", "DEFAULT 'moderate'", "mild, moderate, or significant"],
        ["ageTiers", "text", "DEFAULT 'teen,young_adult,adult'", "Applicable age tiers"],
        [""],
        ["=== TABLE: career_paths ==="],
        ["Purpose: Extended career recommendations beyond primary/secondary roles"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Career title"],
        ["description", "text", "NOT NULL", "What this career involves"],
        ["salaryRange", "text", "NOT NULL", "Expected salary (e.g., '$60K-90K')"],
        ["growthOutlook", "text", "NOT NULL", "High, Moderate, or Stable"],
        ["educationReq", "text", "NOT NULL", "None, Certificate, or Degree"],
        ["primaryTrait", "text", "NOT NULL", "Main Big Five trait required"],
        ["primaryTraitMin", "integer", "NOT NULL", "Minimum score required"],
        ["secondaryTrait", "text", "", "Optional secondary trait"],
        ["secondaryTraitMin", "integer", "", "Minimum for secondary"],
        ["mbtiTypes", "text", "", "Comma-separated MBTI types (e.g., 'INTJ,INTP,ENTJ')"],
        ["discStyles", "text", "", "Comma-separated DISC styles"],
        ["industry", "text", "NOT NULL", "Tech, Healthcare, Creative, etc."],
        ["ageTiers", "text", "DEFAULT 'young_adult,adult'", "Applicable age tiers"],
        [""],
        ["=== TABLE: growth_tips ==="],
        ["Purpose: Personalized improvement suggestions"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Tip title"],
        ["description", "text", "NOT NULL", "Detailed explanation"],
        ["actionSteps", "text", "NOT NULL", "JSON array of specific steps"],
        ["timeframe", "text", "NOT NULL", "Daily, Weekly, or 30-day"],
        ["targetTrait", "text", "NOT NULL", "Which trait to improve"],
        ["traitDirection", "text", "NOT NULL", "strengthen or balance"],
        ["traitMin", "integer", "", "Show if trait above this"],
        ["traitMax", "integer", "", "Show if trait below this"],
        ["difficulty", "text", "DEFAULT 'easy'", "easy, medium, hard"],
        ["ageTiers", "text", "DEFAULT 'all'", "Applicable age tiers"],
        [""],
        ["=== TABLE: strengths ==="],
        ["Purpose: Personalized strength descriptions based on high traits"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Strength name"],
        ["description", "text", "NOT NULL", "What this strength means"],
        ["howToLeverage", "text", "NOT NULL", "How to use this strength"],
        ["primaryTrait", "text", "NOT NULL", "Main trait for this strength"],
        ["primaryTraitMin", "integer", "NOT NULL", "Minimum score required"],
        ["secondaryTrait", "text", "", "Optional second trait"],
        ["secondaryTraitMin", "integer", "", "Minimum for second trait"],
        ["combinationType", "text", "", "both_high, contrast, etc."],
        ["ageTiers", "text", "DEFAULT 'all'", "Applicable age tiers"],
        [""],
        ["=== TABLE: communication_styles ==="],
        ["Purpose: How user communicates based on traits"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Style name"],
        ["description", "text", "NOT NULL", "Style description"],
        ["tipsForOthers", "text", "NOT NULL", "How others should communicate with them"],
        ["tipsForSelf", "text", "NOT NULL", "How to improve communication"],
        ["discStyle", "text", "", "D, I, S, or C"],
        ["extraversionMin", "integer", "", "Min extraversion score"],
        ["extraversionMax", "integer", "", "Max extraversion score"],
        ["agreeablenessMin", "integer", "", "Min agreeableness score"],
        ["agreeablenessMax", "integer", "", "Max agreeableness score"],
        ["ageTiers", "text", "DEFAULT 'all'", "Applicable age tiers"],
        [""],
        ["=== TABLE: work_environments ==="],
        ["Purpose: Ideal work settings based on traits"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Environment name"],
        ["description", "text", "NOT NULL", "Environment description"],
        ["idealFor", "text", "NOT NULL", "Who thrives here"],
        ["challenges", "text", "NOT NULL", "Potential challenges"],
        ["opennessMin/Max", "integer", "", "Openness score range"],
        ["conscientiousnessMin/Max", "integer", "", "Conscientiousness range"],
        ["extraversionMin/Max", "integer", "", "Extraversion range"],
        ["discStyles", "text", "", "Comma-separated DISC styles"],
        ["ageTiers", "text", "DEFAULT 'young_adult,adult'", "Applicable age tiers"],
        [""],
        ["=== TABLE: relationship_insights ==="],
        ["Purpose: How traits affect relationships"],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["title", "text", "NOT NULL", "Insight title"],
        ["description", "text", "NOT NULL", "Detailed insight"],
        ["strengthsInRelationships", "text", "NOT NULL", "Relationship strengths"],
        ["growthAreas", "text", "NOT NULL", "Areas to improve"],
        ["compatibilityNotes", "text", "NOT NULL", "Compatibility guidance"],
        ["primaryTrait", "text", "NOT NULL", "Main trait for matching"],
        ["primaryTraitMin/Max", "integer", "", "Score range for primary trait"],
        ["agreeablenessMin/Max", "integer", "", "Agreeableness range"],
        ["neuroticismMin/Max", "integer", "", "Neuroticism range"],
        ["ageTiers", "text", "DEFAULT 'teen,young_adult,adult'", "Applicable age tiers"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  TABLE SUMMARY                                                    ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Category", "Tables", "Count"],
        ["Core Tables", "users, feedback", "2"],
        ["Personality Trait Tables", "trait_vibes, trait_combinations, adventure_archetypes", "3"],
        ["Algorithm Support", "research_norms, badges, badge_definitions, slider_responses", "4"],
        ["Interactive Features", "quiz_events, story_nodes, mini_games", "3"],
        ["Premium Insights", "side_hustles, blindspots, career_paths, growth_tips, strengths, communication_styles, work_environments, relationship_insights", "8"],
        ["TOTAL", "", "18 tables"],
      ];
      await clearAndWriteSheet(spreadsheetId, "3. Database Schema", schemaRows);
      
      // ========== SHEET 4: Quiz Algorithm (COMPREHENSIVE) ==========
      const algorithmRows = [
        ["Quiz Scoring Algorithm - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PERSONALITY FRAMEWORKS                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Framework", "Dimensions", "Description", "Output Format"],
        ["MBTI", "E/I, S/N, T/F, J/P", "Myers-Briggs Type Indicator", "4-letter code (e.g., INTJ)"],
        ["DISC", "D, I, S, C", "Dominance, Influence, Steadiness, Conscientiousness", "Primary style letter"],
        ["Big Five", "O, C, E, A, N", "Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism", "0-100 scores"],
        ["Critical Thinking", "Derived", "Proxy from MBTI-T, Big5-O, DISC-C", "1-5 scale"],
        ["First Principles", "Derived", "Proxy from MBTI-N, Big5-O, DISC-I", "1-5 scale"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SCORING PIPELINE (10 Steps)                                     ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Step", "Process", "Technical Details"],
        ["1. Response Collection", "Each question maps to trait dimensions via optionMeta", "optionMeta: ['E', 'I'] means left→Extraversion, right→Introversion"],
        ["2. Weighted Scoring", "Binary: 0/1, Slider: -2 to +2 scale", "Slider values: Strongly Disagree (-2), Disagree (-1), Neutral (0), Agree (+1), Strongly Agree (+2)"],
        ["3. Trait Accumulation", "Sum scores for each trait dimension", "Separate totals for E, I, S, N, T, F, J, P, D, I, S, C, O, Co, Ex, A, N"],
        ["4. MBTI Calculation", "Compare opposing dimensions", "E vs I: if E > I → 'E', else 'I'. Same for S/N, T/F, J/P"],
        ["5. DISC Primary", "Highest of D, I, S, C wins", "Secondary style = second highest"],
        ["6. Big Five Raw", "Calculate raw Big Five scores", "Each trait starts at 0, incremented by question responses"],
        ["7. Z-Score Normalization", "Normalize against population research norms", "z = (raw - populationMean) / standardDeviation"],
        ["8. Percentile Conversion", "Convert z-scores to 0-100 scale", "normalized = 50 + (z * 15), clamped to 0-100"],
        ["9. Proxy Calculations", "Calculate Critical Thinking & First Principles", "See formulas below"],
        ["10. Variable Boosts", "Apply random 10-30% boosts from game breaks", "Boosts applied to Critical/FirstPrinciples scores"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  Z-SCORE NORMALIZATION (December 2025)                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Compare individual scores against research-based population norms"],
        [""],
        ["Formula:", "z-score = (rawScore - populationMean) / standardDeviation"],
        ["Then:", "normalizedScore = 50 + (z-score * 15)"],
        ["Clamping:", "Final score clamped to 0-100 range"],
        [""],
        ["Research Norms (stored in research_norms table):"],
        ["Trait", "Mean", "StdDev", "Source"],
        ["Openness", "50", "15", "Costa & McCrae (1992)"],
        ["Conscientiousness", "50", "15", "Costa & McCrae (1992)"],
        ["Extraversion", "50", "15", "Costa & McCrae (1992)"],
        ["Agreeableness", "50", "15", "Costa & McCrae (1992)"],
        ["Neuroticism", "50", "15", "Costa & McCrae (1992)"],
        [""],
        ["Example Calculation:"],
        ["User raw Openness score: 65"],
        ["z = (65 - 50) / 15 = 1.0"],
        ["normalized = 50 + (1.0 * 15) = 65 (above average)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  HYBRID TYPE DETECTION                                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["When opposing dimensions are within 20% threshold, hybrid types are assigned:"],
        [""],
        ["Hybrid Type", "Condition", "Meaning"],
        ["Ambivert", "E/I difference ≤ 20%", "Balanced between extraversion and introversion"],
        ["Intuitive-Sensing Blend", "S/N difference ≤ 20%", "Uses both concrete and abstract thinking"],
        ["Thinking-Feeling Balance", "T/F difference ≤ 20%", "Balances logic with emotional consideration"],
        ["Flexer", "J/P difference ≤ 20%", "Adapts between structured and spontaneous approaches"],
        [""],
        ["Big Five Balanced Traits (if score is 45-55):"],
        ["Trait", "Balanced Description"],
        ["Openness", "Balanced: Open to new ideas while valuing tradition"],
        ["Conscientiousness", "Balanced: Organized but flexible"],
        ["Extraversion", "Balanced: Comfortable alone and in groups"],
        ["Agreeableness", "Balanced: Cooperative but assertive when needed"],
        ["Neuroticism", "Balanced: Emotionally stable with normal stress response"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PROXY SCORE CALCULATIONS                                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Critical Thinking Score:"],
        ["Formula:", "(MBTI_T_percentage + Big5_Openness + DISC_C_percentage) / 3"],
        ["Components:", "T = Thinking preference, O = Openness to ideas, C = Conscientiousness (detail-oriented)"],
        ["Output:", "Percentage converted to 1-5 scale: Math.round(pct / 20)"],
        [""],
        ["First Principles Score:"],
        ["Formula:", "(MBTI_N_percentage + Big5_Openness + DISC_I_percentage) / 3"],
        ["Components:", "N = Intuition (abstract thinking), O = Openness, I = Influence (persuasion ability)"],
        ["Output:", "Percentage converted to 1-5 scale: Math.round(pct / 20)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  VARIABLE BOOSTS SYSTEM (10-30%)                                 ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Game breaks can apply random boosts to scores:"],
        [""],
        ["Boost Type", "Range", "Applied To"],
        ["Superpower Selection", "10-30%", "Critical Thinking OR First Principles (based on choice)"],
        ["Mystery Box", "10-30%", "Random Big Five trait"],
        ["Multiple Choice", "10-20%", "Trait matching the MC answer category"],
        [""],
        ["Boost Calculation:", "baseScore * (1 + randomBoost)"],
        ["Random Generation:", "Math.random() * 0.2 + 0.1 (gives 10-30%)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  ACHIEVEMENT BADGE SYSTEM                                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["8 Badge Types awarded based on quiz behavior:"],
        [""],
        ["Badge Name", "Trigger Condition", "Icon", "Rarity"],
        ["Speed Demon", "Average response time < 2 seconds", "Zap", "Rare"],
        ["Thoughtful Analyst", "Average response time > 6 seconds", "Brain", "Common"],
        ["Balanced Explorer", "All Big Five scores within 40-60 range", "Scale", "Epic"],
        ["Pattern Seeker", "High consistency in responses (>80%)", "Grid", "Rare"],
        ["Risk Taker", "Quick decisions on high-stakes questions", "Target", "Common"],
        ["Consistent Completer", "Finished quiz without timeouts", "Check", "Common"],
        ["Early Bird", "Completed quiz before 10 AM local time", "Sun", "Rare"],
        ["Night Owl", "Completed quiz after 10 PM local time", "Moon", "Rare"],
        [""],
        ["Badge Display:", "Shown as overlay during quiz (after question 1)"],
        ["Queue System:", "Badges display first, random events queued with 300ms delay"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  RANDOM EVENT SYSTEM                                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["5-10% chance per question of special pop-up events:"],
        [""],
        ["Event Name", "Effect", "Duration"],
        ["Surprise Insight", "Shows personality hint preview", "3 seconds"],
        ["Lightning Round", "Next question has bonus time (+3s)", "3 seconds"],
        ["Wild Card", "Option to skip question without penalty", "3 seconds"],
        ["Reflection Pause", "Breathing moment with calming visual", "3 seconds"],
        ["Streak Bonus", "Double points for correct next answer", "3 seconds"],
        ["Mystery Modifier", "Hidden boost applied to random trait", "3 seconds"],
        ["Time Warp", "Extra seconds added to current timer", "3 seconds"],
        ["Power-Up", "Confidence boost message", "3 seconds"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  QUESTION STRUCTURE                                              ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Field", "Type", "Description", "Example"],
        ["id", "number", "Unique question identifier", "1, 2, 3..."],
        ["prompt", "string", "Question text shown to user", "'I prefer working in teams'"],
        ["options", "string[]", "[leftOption, rightOption]", "['Agree', 'Disagree']"],
        ["optionMeta", "string[]", "[leftMeta, rightMeta] - trait codes", "['E', 'I'] or ['O+', 'C-']"],
        ["psych", "string", "Psychology framework", "'mbti', 'disc', 'bigfive'"],
        ["tier", "string", "Age tier code", "'7-12', '13-18', '19-25', '25+'"],
        ["time", "number", "Timer duration in seconds", "9 or 10"],
        ["wildcard", "boolean", "Is this a game break question?", "true/false"],
        ["version", "number", "Question version for A/B testing", "1"],
        ["paid", "boolean", "Premium question?", "false"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  TIER CONFIGURATION                                              ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Tier", "Display Name", "Questions", "Timer", "Break Flow"],
        ["7-12", "Mini Explorer (12 & under)", "25", "12s", "6 → MC1 → 6 → Superpower → 6 → Mystery → 7 → MC2 (MC breaks get 20s timer, 1s fade-in)"],
        ["13-18", "Teen (Ages 13-18)", "30", "12s", "8 → MC1 → 7 → Superpower → 7 → Mystery → 8 → MC2 (MC breaks get 20s timer, 1s fade-in)"],
        ["19-25", "Young Adult (Ages 19-25)", "35", "12s", "9 → MC1 → 9 → Superpower → 9 → Mystery → 8 → MC2 (MC breaks get 20s timer, 1s fade-in)"],
        ["25+", "Adult (Ages 25+)", "40", "12s", "10 → MC1 → 10 → Superpower → 10 → Mystery → 10 → MC2 (MC breaks get 20s timer, 1s fade-in)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  UNIQUE PATH COMBINATIONS                                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Tier", "Binary Questions", "Unique Paths (2^n × 15 break combos)"],
        ["Mini", "25", "503 million unique personality paths"],
        ["Teen", "30", "16 billion unique paths"],
        ["Young Adult", "35", "515 billion unique paths"],
        ["Adult", "40", "16 trillion unique paths"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  DYNAMIC DIFFICULTY SCALING                                      ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Swipe time tracking adjusts question difficulty:"],
        [""],
        ["Average Response Time", "Difficulty Level", "Question Type"],
        ["< 2 seconds", "Hard", "More nuanced, abstract questions"],
        ["2-4 seconds", "Medium", "Standard difficulty questions"],
        ["> 4 seconds", "Easy", "More concrete, straightforward questions"],
        [""],
        ["Implementation:", "Quiz.tsx tracks swipeTimes array, calculates running average"],
        ["Adaptation:", "Difficulty state updated every 5 questions"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  FRAMEWORK QUOTA BALANCING                                       ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Questions shuffled to maintain target distribution:"],
        [""],
        ["Framework", "Target %", "Purpose"],
        ["MBTI", "30%", "Personality type classification"],
        ["DISC", "30%", "Behavioral style assessment"],
        ["Big Five", "40%", "Trait-based personality measurement"],
        [""],
        ["Ensures balanced trait measurement regardless of total question count."],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  MOOD MIXER INTEGRATION (December 2025)                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Users select 2 of 6 mood orbs to create a blend. Effects adjust question wording and trait boosts:"],
        [""],
        ["Mood Orb", "Effect", "Question Wording"],
        ["Happy", "+5% Extraversion", "More upbeat phrasing"],
        ["Calm", "+5% Agreeableness", "Reflective tone"],
        ["Curious", "+5% Openness", "Exploratory language"],
        ["Determined", "+5% Conscientiousness", "Goal-oriented phrasing"],
        ["Creative", "+5% Openness, +3% Neuroticism", "Imaginative prompts"],
        ["Social", "+5% Extraversion, +3% Agreeableness", "Collaborative framing"],
        [""],
        ["Implementation: getMoodEffects() applies boosts, adjustQuestionWording() modifies prompts"],
        ["Applied both client-side (Big Five scores) and server-side (proxy calculations)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SPIN WHEEL CHECKPOINTS                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Every 10 questions, users see a Spin Wheel that cycles through insights:"],
        [""],
        ["Phase", "Behavior", "Duration"],
        ["1. Cycling", "Rapidly cycles through random insights", "~2 seconds"],
        ["2. Slowing", "Gradually slows like a spin wheel", "~2 seconds"],
        ["3. Settled", "Lands on 2 accurate insights based on answers so far", "~1 second"],
        ["4. Button Active", "Keep Going button becomes clickable", "User-controlled"],
        [""],
        ["Component: RecapSpinWheel in Quiz.tsx"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  RANDOM EVENT CAP (15% Maximum)                                  ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Random events capped at 15% with dynamic calculation:"],
        [""],
        ["Component", "Value", "Formula"],
        ["Base chance", "8%", "Fixed minimum"],
        ["Engagement boost", "0-4%", "Based on response time consistency"],
        ["Maximum cap", "15%", "Hard limit to prevent event fatigue"],
        [""],
        ["Formula: Math.min(0.08 + engagementBoost, 0.15)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PERCENTILE COMPARISONS                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Big Five scores displayed with population percentile comparisons:"],
        [""],
        ["Step", "Calculation", "Example"],
        ["1. Z-Score", "(rawScore - 50) / 15", "(65 - 50) / 15 = 1.0"],
        ["2. Percentile", "50 + (z * 34.13)", "50 + (1.0 * 34.13) = 84th percentile"],
        ["3. Display", "'Higher than X% of people'", "'Higher than 84% of people'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  ADAPTIVE SHARPEN THINKING                                       ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Sharpen Thinking section prioritizes weak proxy categories:"],
        [""],
        ["Priority Logic", "Implementation"],
        ["If Critical < FirstPrinciples", "Select more Logic Puzzles and Cause & Effect questions"],
        ["If FirstPrinciples < Critical", "Select more Pattern Recognition and Perspective Taking questions"],
        [""],
        ["Progress Tracking:"],
        ["- localStorage key: 'knowrole-category-progress'"],
        ["- Tracks accuracy by category (e.g., { 'Logic Puzzles': { correct: 3, total: 5 } })"],
        ["- Prioritizes categories with lower accuracy"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  IRT ADAPTIVE BRANCHING                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Mid-quiz detection of ambiguous traits to prioritize targeted questions:"],
        [""],
        ["Trait Type", "Ambiguity Threshold", "Action"],
        ["MBTI (E/I, S/N, T/F, J/P)", "<15% difference", "Prioritize questions for that dimension"],
        ["Big Five (O, C, E, A, N)", "Score between 40-60", "Add questions targeting that trait"],
        [""],
        ["Implementation: detectAmbiguousTraits() function in Quiz.tsx"],
        ["Runs after each answer to dynamically adjust question priority"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  DYNAMIC QUESTION WORDING                                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Questions adjusted based on mood tone from Mood Mixer selection:"],
        [""],
        ["Mood Tone", "Example Prefix", "Effect"],
        ["Introspective", "'When you pause to reflect...'", "Deeper, reflective phrasing"],
        ["Energetic", "'Right now...'", "Action-oriented, present-tense"],
        ["Analytical", "'Thinking it through...'", "Logical, step-by-step framing"],
        ["Neutral", "(No prefix)", "Standard question text"],
        [""],
        ["Implementation: adjustQuestionWording() function in Quiz.tsx"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PDF DOWNLOAD FEATURE                                            ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Results can be saved as PDF via browser print dialog:"],
        [""],
        ["Feature", "Implementation"],
        ["Save PDF button", "Opens new window with styled HTML summary"],
        ["Content", "MBTI type, DISC style, Big Five percentages"],
        ["Styling", "Terracotta/sage theme, clean layout, footer with date"],
        ["Method", "window.open() + document.write() + window.print()"],
      ];
      await clearAndWriteSheet(spreadsheetId, "4. Quiz Algorithm", algorithmRows);
      
      // ========== SHEET 5: API Endpoints ==========
      const apiRows = [
        ["API Endpoints"],
        [""],
        ["=== QUIZ & RESULTS ==="],
        ["Method", "Endpoint", "Description"],
        ["GET", "/api/questions/:tier", "Get questions for specific age tier"],
        ["POST", "/api/quiz/submit", "Submit quiz answers and calculate results"],
        ["GET", "/api/quiz/session/:id", "Get specific quiz session data"],
        ["GET", "/api/quiz/sessions", "Get all quiz sessions (admin)"],
        [""],
        ["=== PERSONALITY DATA ==="],
        ["Method", "Endpoint", "Description"],
        ["GET", "/api/trait-vibes", "Get all Big Five trait descriptions"],
        ["GET", "/api/trait-vibes/:trait/:score", "Get specific trait vibe for score"],
        ["GET", "/api/trait-combinations", "Get all trait combinations"],
        ["GET", "/api/adventure-archetypes", "Get all kid archetypes"],
        ["GET", "/api/adventure-archetype", "Get matching archetype for traits"],
        [""],
        ["=== FEEDBACK ==="],
        ["Method", "Endpoint", "Description"],
        ["POST", "/api/feedback", "Submit user feedback (triggers auto-export)"],
        ["GET", "/api/feedback", "Get all feedback (admin)"],
        [""],
        ["=== PAYMENTS (Stripe) ==="],
        ["Method", "Endpoint", "Description"],
        ["GET", "/api/stripe/publishable-key", "Get Stripe publishable key"],
        ["POST", "/api/stripe/create-checkout", "Create Stripe checkout session"],
        ["POST", "/api/stripe/webhook", "Handle Stripe webhooks"],
        [""],
        ["=== DATA EXPORT ==="],
        ["Method", "Endpoint", "Description"],
        ["POST", "/api/export/sheets/sessions", "Export all sessions to Google Sheets"],
        ["POST", "/api/export/sheets/questions", "Export questions database to Sheets"],
        ["POST", "/api/export/sheets/colors", "Export city themes to Sheets"],
        ["POST", "/api/export/sheets/full", "Export complete app blueprint (this file)"],
        [""],
        ["=== ADMIN ==="],
        ["Method", "Endpoint", "Description"],
        ["POST", "/api/seed", "Seed database with initial data"],
      ];
      await clearAndWriteSheet(spreadsheetId, "5. API Endpoints", apiRows);
      
      // ========== SHEET 6: Component Map ==========
      const componentRows = [
        ["Frontend Component Structure"],
        [""],
        ["=== PAGES (client/src/pages/) ==="],
        ["Component", "Route", "Description"],
        ["Home.tsx", "/", "Landing page with age tier selection buttons"],
        ["MoodMixer.tsx", "/mood-mixer", "Interactive cauldron with 6 mood orbs to create blend"],
        ["LocationInput.tsx", "/location", "Zip code input for regional career insights"],
        ["PreQuizDemo.tsx", "/pre-quiz", "5-step animated walkthrough with Skip Instructions button (appears after 2s)"],
        ["Quiz.tsx", "/quiz", "Main quiz with swipe cards, popup queue system, timer pause logic"],
        ["Results.tsx", "/results", "Personality results, premium cards, Sharpen Thinking section"],
        ["Feedback.tsx", "/feedback", "5-question feedback form with standardized legend styling"],
        [""],
        ["=== KEY COMPONENTS ==="],
        ["Component", "File", "Description"],
        ["AgeTierSelector", "AgeTierSelector.tsx", "Large buttons for age selection"],
        ["MoodSelector", "MoodSelector.tsx", "Mood option cards"],
        ["QuizCard", "Quiz.tsx", "Swipeable question card with popup queue system"],
        ["QuizGames", "QuizGames.tsx", "Game break components (Superpower, Mystery, MC)"],
        ["PathCanvas", "PathCanvas.tsx", "Animated SVG paths for decoration"],
        ["StepIndicator", "StepIndicator.tsx", "Progress dots showing journey steps"],
        ["PremiumCardDeck", "PremiumCardDeck.tsx", "7 swipeable premium insight cards (always starts at card 1)"],
        ["BigFiveCards", "BigFiveCards.tsx", "Clickable trait cards with quartile descriptions"],
        ["DonationModal", "DonationModal.tsx", "Stripe payment modal ($3.33 / $33.33)"],
        ["ThemeToggle", "ThemeToggle.tsx", "Light/dark mode toggle"],
        ["SharpenThinking", "Results.tsx (embedded)", "60 critical thinking questions with 5-question challenges"],
        [""],
        ["=== DATA FILES ==="],
        ["File", "Contents"],
        ["client/src/data/questions.json", "Main quiz questions with tier configuration"],
        ["client/src/data/thinkingQuestions.ts", "60 critical thinking questions across 5 categories"],
        ["client/src/data/cityThemes.ts", "City-to-sports-team color mappings"],
        [""],
        ["=== UI PATTERNS ==="],
        ["Pattern", "Description"],
        ["Swipe Cards", "Framer Motion drag gestures for quiz and premium cards"],
        ["Diagonal Offset", "Answer boxes positioned diagonally with directional arrows"],
        ["Orb Selection", "Floating animated orbs for mood mixer and superpower games"],
        ["Flip Cards", "Card flip animation for blindspots reveal"],
        ["Progress Ring", "Circular timer countdown when <3s remaining"],
        ["Auto-hide Hint", "Tap or swipe hint disappears after first interaction"],
        ["Popup Queue", "Badge overlays show first, random events queued with 300ms delay"],
        ["Skip Button", "Subtle gray 'Skip Instructions' appears after 2s on pre-quiz"],
        [""],
        ["=== QUIZ POPUP SYSTEM ==="],
        ["State Variable", "Purpose"],
        ["showBadgeOverlay", "Controls visibility of badge/2X question overlays"],
        ["currentRandomEvent", "Currently displayed random event popup"],
        ["pendingRandomEvent", "Queued random event waiting for badge overlay to close"],
        ["isAnyPopupActive", "Computed: true if any popup is showing (badge OR random event)"],
        ["Timer Pause", "Timer useEffect checks isAnyPopupActive before counting"],
        ["Interactive Blocking", "All buttons/sliders check isAnyPopupActive for disabled state"],
        [""],
        ["=== SHARPEN THINKING SECTION ==="],
        ["Feature", "Description"],
        ["60 Questions", "12 questions per category × 5 categories"],
        ["Categories", "Logic Puzzles, Pattern Recognition, Cause & Effect, Perspective Taking, Problem Solving"],
        ["Challenge Mode", "5 random questions per session, non-repeating"],
        ["Scoring", "+10 correct, -5 wrong, displayed as X/50"],
        ["localStorage Keys", "'knowrole-thinking-best-score', 'knowrole-thinking-used-questions'"],
        ["Progress Tracking", "Best score persisted and displayed during challenges"],
      ];
      await clearAndWriteSheet(spreadsheetId, "6. Component Map", componentRows);
      
      // ========== SHEET 7: Questions Database ==========
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      
      const questionsHeader = [
        "ID", "Prompt", "Left Option", "Right Option", "Left Meta", "Right Meta",
        "Psychology Type", "Timer (s)", "Age Tier", "Version", "Paid", "Wildcard"
      ];
      
      const questionsRows = [questionsHeader];
      for (const q of questionsData.questions) {
        questionsRows.push([
          q.id,
          q.prompt,
          q.options[0],
          q.options[1],
          q.optionMeta[0],
          q.optionMeta[1],
          q.psych,
          q.time,
          q.tier,
          q.version,
          q.paid ? "Yes" : "No",
          q.wildcard ? "Yes" : "No"
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "7. Questions Database", questionsRows);
      
      // ========== SHEET 8: City Themes ==========
      const themesPath = path.join(process.cwd(), "client/src/data/cityThemes.ts");
      const themesContent = fs.readFileSync(themesPath, "utf-8");
      
      const cityThemePattern = /"([^"]+)":\s*\{\s*city:\s*"([^"]+)",\s*(?:state:\s*"([^"]*)",\s*)?country:\s*"([^"]+)",\s*team:\s*"([^"]+)",\s*sport:\s*"([^"]+)",\s*colors:\s*\{\s*primary:\s*"([^"]+)",\s*secondary:\s*"([^"]+)",\s*accent:\s*"([^"]+)"\s*\},\s*textOnPrimary:\s*"([^"]+)",\s*textOnSecondary:\s*"([^"]+)"/g;
      
      const colorHeader = [
        "City Key", "City Name", "State", "Country", "Team", "Sport", 
        "Primary (HEX)", "Secondary (HEX)", "Accent (HEX)", "Text on Primary", "Text on Secondary"
      ];
      
      const colorRows = [colorHeader];
      let match;
      while ((match = cityThemePattern.exec(themesContent)) !== null) {
        colorRows.push([match[1], match[2], match[3] || "", match[4], match[5], match[6],
          match[7], match[8], match[9], match[10], match[11]]);
      }
      await clearAndWriteSheet(spreadsheetId, "8. City Themes", colorRows);
      
      // ========== SHEET 9: Tier Configuration ==========
      const tierHeader = ["Age Tier", "Display Name", "Questions", "Timer (s)", "Swipe Style", "Break Flow"];
      const tierRows = [tierHeader];
      
      const tierDisplayNames: Record<string, string> = {
        "7-12": "Mini Explorer (Ages 12 & under)",
        "13-18": "Teen (Ages 13-18)",
        "19-25": "Young Adult (Ages 19-25)",
        "25+": "Adult (Ages 25+)"
      };
      
      const breakFlows: Record<string, string> = {
        "7-12": "6 → MC1 → 6 → Superpower → 6 → Mystery → 7 → MC2 (25 total, MC breaks get 20s timer, 1s fade-in)",
        "13-18": "8 → MC1 → 7 → Superpower → 7 → Mystery → 8 → MC2 (30 total, MC breaks get 20s timer, 1s fade-in)",
        "19-25": "9 → MC1 → 9 → Superpower → 9 → Mystery → 8 → MC2 (35 total, MC breaks get 20s timer, 1s fade-in)",
        "25+": "10 → MC1 → 10 → Superpower → 10 → Mystery → 10 → MC2 (40 total, MC breaks get 20s timer, 1s fade-in)"
      };
      
      for (const [tier, config] of Object.entries(questionsData.tierConfig)) {
        const cfg = config as { baseCount: number; maxTime: number; swipeStyle: string };
        tierRows.push([
          tier,
          tierDisplayNames[tier] || tier,
          cfg.baseCount.toString(),
          cfg.maxTime.toString(),
          cfg.swipeStyle,
          breakFlows[tier] || ""
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "9. Tier Configuration", tierRows);
      
      // ========== SHEET 10: Quiz Sessions ==========
      const allSessions = await storage.getAllQuizSessions();
      const allFeedback = await storage.getAllFeedback();
      
      const feedbackMap = new Map<string, any>();
      allFeedback.forEach(f => {
        if (f.sessionId) feedbackMap.set(f.sessionId, f);
      });
      
      const questionsMap = new Map<number, any>();
      questionsData.questions.forEach((q: any) => questionsMap.set(q.id, q));
      
      const sessionsHeader = [
        "Timestamp", "Session ID", "Age Tier", "Mood", "Fun Mode", "Theme",
        "MBTI Type", "DISC Style", "Primary Role", "Openness", "Conscientiousness", 
        "Extraversion", "Agreeableness", "Neuroticism", "Engagement Score",
        "Useful?", "Accurate?", "Engaging?", "Would Share?", "Suggestions"
      ];
      
      const sessionsRows = [sessionsHeader];
      for (const session of allSessions) {
        const feedback = feedbackMap.get(session.id);
        const result = (session.result || {}) as any;
        const bigFive = result.bigFiveProfile || {};
        
        sessionsRows.push([
          formatTimezone(session.createdAt),
          session.id || "",
          session.tier || "",
          session.mood || "",
          session.funMode ? "Yes" : "No",
          session.theme || "",
          result.mbtiType || "",
          result.discStyle || "",
          result.primaryRole?.title || "",
          bigFive.openness ?? "",
          bigFive.conscientiousness ?? "",
          bigFive.extraversion ?? "",
          bigFive.agreeableness ?? "",
          bigFive.neuroticism ?? "",
          result.engagement ?? "",
          feedback?.usefulApp || "",
          feedback?.resultsAccurate || "",
          feedback?.questionsEngaging || "",
          feedback?.wouldShare || "",
          feedback?.suggestions || ""
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "10. Quiz Sessions", sessionsRows);
      
      // ========== SHEET 11: Feedback Data ==========
      const feedbackHeader = [
        "Timestamp", "Session ID", "MBTI Type", "DISC Style", "Primary Role",
        "Age Tier", "Mood", "Fun Mode", "Useful App?", "Results Accurate?",
        "Questions Engaging?", "Would Share?", "Suggestions"
      ];
      
      const feedbackRows = [feedbackHeader];
      for (const f of allFeedback) {
        feedbackRows.push([
          f.createdAt ? formatTimezone(f.createdAt.toISOString()) : "",
          f.sessionId || "",
          f.mbtiType || "",
          f.discStyle || "",
          f.primaryRole || "",
          f.tier || "",
          f.mood || "",
          f.funMode ? "Yes" : "No",
          f.usefulApp || "",
          f.resultsAccurate || "",
          f.questionsEngaging || "",
          f.wouldShare || "",
          f.suggestions || ""
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "11. Feedback Data", feedbackRows);
      
      // ========== SHEET 12: Premium Insights System ==========
      const premiumInsightsRows = [
        ["Premium Insights System - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  OVERVIEW                                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["The Premium Insights System provides 6 categories of personalized insights"],
        ["based on the user's personality traits (Big Five, MBTI, DISC)."],
        [""],
        ["Access: Free during testing ('Just Kidding' interstitial reveals premium is free)"],
        ["Display: 6 swipeable cards in PremiumCardDeck.tsx component"],
        ["Matching: Server-side trait matching via /api/premium-insights endpoint"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  6 PREMIUM INSIGHT CATEGORIES (PremiumCardDeck.tsx)              ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["#", "Category", "Database Table", "Icon", "Description"],
        ["1", "Career Compass", "career_paths", "Compass", "Career recommendations with salary data and growth outlook"],
        ["2", "Relationship Dynamics", "relationship_insights", "Heart", "How traits affect relationships and compatibility"],
        ["3", "Growth Tips", "growth_tips", "TrendingUp", "Personalized improvement suggestions and action steps"],
        ["4", "Side Hustles", "side_hustles", "DollarSign", "Income opportunities matched to personality"],
        ["5", "Learning Style", "communication_styles", "BookOpen", "How you learn and communicate best"],
        ["6", "Strengths", "strengths", "Star", "High-trait strength descriptions and how to leverage them"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  TRAIT MATCHING ALGORITHM                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Each insight category uses trait-based matching:"],
        [""],
        ["Step", "Process"],
        ["1", "Receive user's Big Five scores (O, C, E, A, N) from 0-100"],
        ["2", "Receive optional MBTI type (e.g., 'INTJ') and DISC style (e.g., 'D')"],
        ["3", "Query each premium table for matching records"],
        ["4", "Filter by primaryTrait >= primaryTraitMin threshold"],
        ["5", "Apply secondaryTrait filter if specified"],
        ["6", "Check MBTI/DISC preferences if specified"],
        ["7", "Filter by ageTiers (mini, teen, young_adult, adult, all)"],
        ["8", "Sort by trait match strength, return top 3-5 results per category"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 1: SIDE HUSTLES                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Recommend income opportunities that match personality"],
        [""],
        ["Matching Criteria:"],
        ["- primaryTrait: User's Big Five score must be >= primaryTraitMin"],
        ["- secondaryTrait: Optional second trait requirement"],
        ["- mbtiPreference: E/I, N/S, T/F, or J/P preference"],
        ["- discPreference: D, I, S, or C requirement"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Freelance Writing'"],
        ["description", "'Create content for blogs, websites, and businesses'"],
        ["incomeRange", "'$500-2K/mo'"],
        ["timeCommitment", "'5-10 hrs/week'"],
        ["difficulty", "'beginner'"],
        ["tags", "'creative,digital,flexible'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 2: BLINDSPOTS                                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Identify growth areas based on LOW trait scores"],
        [""],
        ["Matching Criteria:"],
        ["- targetTrait: User's score must be <= traitMax"],
        ["- severity: mild, moderate, or significant"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Tendency to Avoid Conflict'"],
        ["description", "'You may avoid difficult conversations'"],
        ["actionTip", "'Practice expressing disagreement in low-stakes situations'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 3: CAREER PATHS                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Extended career recommendations beyond primary/secondary roles"],
        [""],
        ["Matching Criteria:"],
        ["- primaryTrait >= primaryTraitMin"],
        ["- mbtiTypes: Comma-separated list (e.g., 'INTJ,INTP,ENTJ')"],
        ["- discStyles: Comma-separated list"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Data Scientist'"],
        ["salaryRange", "'$90K-150K'"],
        ["growthOutlook", "'High'"],
        ["educationReq", "'Degree'"],
        ["industry", "'Tech'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 4: GROWTH TIPS                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Personalized improvement suggestions"],
        [""],
        ["Matching Criteria:"],
        ["- targetTrait: Which trait to improve"],
        ["- traitDirection: 'strengthen' or 'balance'"],
        ["- traitMin/traitMax: Score range for showing this tip"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Build Consistency Habits'"],
        ["actionSteps", "['Set daily reminders', 'Track progress', 'Celebrate small wins']"],
        ["timeframe", "'30-day'"],
        ["difficulty", "'medium'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 5: STRENGTHS                                            ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Highlight strengths based on HIGH trait scores"],
        [""],
        ["Matching Criteria:"],
        ["- primaryTrait >= primaryTraitMin"],
        ["- combinationType: 'both_high', 'contrast', etc."],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Creative Problem Solver'"],
        ["howToLeverage", "'Apply creative thinking to work challenges'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 6: COMMUNICATION STYLES                                 ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: How user communicates based on traits"],
        [""],
        ["Matching Criteria:"],
        ["- discStyle: D, I, S, or C"],
        ["- extraversionMin/Max: E score range"],
        ["- agreeablenessMin/Max: A score range"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Direct Communicator'"],
        ["tipsForOthers", "'Be direct and get to the point quickly'"],
        ["tipsForSelf", "'Allow others time to process before expecting responses'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 7: WORK ENVIRONMENTS                                    ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: Ideal work settings based on traits"],
        [""],
        ["Matching Criteria:"],
        ["- opennessMin/Max, conscientiousnessMin/Max, extraversionMin/Max"],
        ["- discStyles: Comma-separated list"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'Remote/Flexible'"],
        ["idealFor", "'Independent thinkers who value autonomy'"],
        ["challenges", "'May feel isolated, requires self-discipline'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CATEGORY 8: RELATIONSHIP INSIGHTS                                ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Purpose: How traits affect relationships"],
        [""],
        ["Matching Criteria:"],
        ["- primaryTrait with Min/Max range"],
        ["- agreeablenessMin/Max, neuroticismMin/Max"],
        [""],
        ["Output Fields:"],
        ["Field", "Example"],
        ["title", "'The Supportive Partner'"],
        ["strengthsInRelationships", "'Empathetic, good listener, reliable'"],
        ["growthAreas", "'May avoid expressing own needs'"],
        ["compatibilityNotes", "'Works well with assertive personalities'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  FRONTEND DISPLAY (PremiumCardDeck.tsx)                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Component", "Description"],
        ["PremiumCardDeck", "Main container with 6 swipeable cards"],
        ["Card Animation", "Framer Motion drag gestures for swipe left/right"],
        ["Card Stack", "Cards stacked with z-index, front card is interactive"],
        ["Progress Dots", "6 dots showing current position in deck"],
        ["Card Content", "Icon, title, description, and action items"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  API ENDPOINT                                                     ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Endpoint: POST /api/premium-insights"],
        [""],
        ["Request Body:"],
        ["{ bigFive: { O: 75, C: 60, E: 45, A: 80, N: 30 }, mbtiType: 'INFJ', discStyle: 'S', ageTier: 'adult' }"],
        [""],
        ["Response:"],
        ["{ sideHustles: [...], blindspots: [...], careerPaths: [...], growthTips: [...], strengths: [...], communicationStyles: [...], workEnvironments: [...], relationshipInsights: [...] }"],
      ];
      await clearAndWriteSheet(spreadsheetId, "12. Premium Insights", premiumInsightsRows);
      
      // ========== SHEET 13: Sharpen Thinking Section ==========
      const thinkingRows = [
        ["Sharpen Thinking Section - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  OVERVIEW                                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["The Sharpen Thinking section provides critical thinking practice"],
        ["with 60 questions across 5 categories. Users complete 5-question"],
        ["challenges with performance-based scoring."],
        [""],
        ["Location: Embedded in Results.tsx after Premium Card Deck"],
        ["Purpose: Extend engagement beyond quiz results"],
        ["Data File: client/src/data/thinkingQuestions.ts"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  5 QUESTION CATEGORIES (12 questions each)                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["#", "Category", "Icon", "Description", "Question Count"],
        ["1", "Logic Puzzles", "Brain", "Deductive reasoning and logical analysis", "12"],
        ["2", "Pattern Recognition", "Grid", "Identifying sequences and patterns", "12"],
        ["3", "Cause & Effect", "ArrowRight", "Understanding causation and consequences", "12"],
        ["4", "Perspective Taking", "Users", "Seeing situations from different viewpoints", "12"],
        ["5", "Problem Solving", "Lightbulb", "Creative solutions to practical problems", "12"],
        ["", "", "", "TOTAL", "60 questions"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  CHALLENGE MECHANICS                                              ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Feature", "Description"],
        ["Questions Per Challenge", "5 random questions per session"],
        ["Category Mix", "Questions drawn from all 5 categories"],
        ["Non-Repeating", "Used questions tracked to prevent repeats"],
        ["Random Selection", "Fisher-Yates shuffle for fair randomization"],
        ["Sequential Flow", "Answer one question at a time"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  SCORING SYSTEM                                                   ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Action", "Points", "Notes"],
        ["Correct Answer", "+10", "Added immediately upon correct selection"],
        ["Wrong Answer", "-5", "Subtracted immediately upon wrong selection"],
        ["Maximum Score", "50", "5 questions × 10 points each"],
        ["Minimum Score", "-25", "5 questions × -5 points each (all wrong)"],
        ["Display Format", "X/50", "Current score shown during challenge"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  LOCALSTORAGE PERSISTENCE                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Key", "Value Type", "Purpose"],
        ["'knowrole-thinking-best-score'", "number", "Highest score achieved across all challenges"],
        ["'knowrole-thinking-used-questions'", "number[]", "Array of question IDs already answered"],
        [""],
        ["Persistence Logic:"],
        ["- Best score saved when challenge completes if higher than previous best"],
        ["- Used questions accumulate across sessions"],
        ["- Pool resets when all 60 questions have been used"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  QUESTION STRUCTURE                                               ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Field", "Type", "Description"],
        ["id", "number", "Unique question identifier (1-60)"],
        ["category", "string", "One of 5 categories above"],
        ["question", "string", "The question text"],
        ["options", "string[]", "4 answer choices"],
        ["correctIndex", "number", "Index of correct answer (0-3)"],
        ["explanation", "string", "Why the answer is correct (shown after answering)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  UI COMPONENTS                                                    ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Component", "Description"],
        ["Start Challenge Button", "Begins new 5-question challenge"],
        ["Question Card", "Displays current question with 4 options"],
        ["Option Buttons", "Clickable answer choices with hover states"],
        ["Feedback Display", "Correct/Wrong indicator after selection"],
        ["Explanation", "Shows why answer is correct"],
        ["Progress", "Shows question X of 5"],
        ["Score Display", "Current score during challenge"],
        ["Best Score Badge", "Shows all-time best score"],
        ["Completion Summary", "Final score with comparison to best"],
      ];
      await clearAndWriteSheet(spreadsheetId, "13. Sharpen Thinking", thinkingRows);
      
      // ========== SHEET 14: Badge System ==========
      const badgeRows = [
        ["Badge System - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  OVERVIEW                                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Badges are awarded during the quiz based on user behavior and trait scores."],
        ["They appear as overlays AFTER QUESTION 10 (not in first 10 questions)."],
        ["Timer pauses during badge display. Auto-dismiss after 5 seconds."],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  8 BADGE DEFINITIONS                                              ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Badge Name", "Type", "Trigger Condition", "Icon", "Color"],
        ["Trailblazer", "trait", "Openness > 80", "compass", "terracotta"],
        ["Deep Thinker", "trait", "Conscientiousness > 80", "brain", "sage-green"],
        ["Social Butterfly", "trait", "Extraversion > 80", "users", "dusty-blue"],
        ["Peacemaker", "trait", "Agreeableness > 80", "heart", "soft-cream"],
        ["Speedster", "speed", "Average swipe time < 3 seconds", "zap", "amber"],
        ["Thoughtful Observer", "speed", "Average swipe time > 7 seconds", "eye", "violet"],
        ["Balanced Mind", "special", "Has hybrid personality types", "scale", "teal"],
        ["Quiz Master", "streak", "Engagement score > 20", "trophy", "gold"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  DISPLAY MECHANICS                                                ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Feature", "Description"],
        ["Display Start", "Badges only appear after question 10 (currentIndex >= 10)"],
        ["Timer Pause", "Quiz timer pauses during badge overlay"],
        ["Manual Dismiss", "Continue button appears after 1.5 seconds"],
        ["Auto Dismiss", "Badge auto-closes after 5 seconds if not dismissed"],
        ["Extra Time", "+2 seconds added to timer after badge closes"],
        ["Queue System", "Badges display before random events (never overlap)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  IMPLEMENTATION                                                   ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Location", "File/Component"],
        ["Badge Definitions", "server/routes.ts - BADGE_DEFINITIONS array"],
        ["Badge Calculation", "server/routes.ts - calculateResults function"],
        ["Badge Display", "client/src/components/Quiz.tsx - showBadgeOverlay state"],
        ["Badge Overlay UI", "Quiz.tsx - motion.div with badge icon and name"],
      ];
      await clearAndWriteSheet(spreadsheetId, "14. Badge System", badgeRows);
      
      // ========== SHEET 15: Mood Effects System ==========
      const moodRows = [
        ["Mood Effects System - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  OVERVIEW                                                         ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Users select 2 of 6 mood orbs in the Mood Alchemy Lab to create a blend."],
        ["Each orb applies trait boosts to Big Five scores and affects question wording."],
        ["Mood blend is stored in sessionStorage and applied during quiz scoring."],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  6 MOOD ORBS                                                      ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Orb Name", "Color", "Trait Boosts", "Question Tone"],
        ["Happy", "Yellow (#FFD93D)", "+3% Extraversion, +3% Agreeableness", "Optimistic"],
        ["Calm", "Blue (#6BB3D9)", "-5% Neuroticism, +3% Conscientiousness", "Peaceful"],
        ["Curious", "Purple (#9B7EDE)", "+8% Openness, +5% First Principles", "Inquisitive"],
        ["Determined", "Orange (#FF8C42)", "+8% Conscientiousness, +5% Critical Thinking", "Focused"],
        ["Creative", "Pink (#FF6B9D)", "+10% Openness, +8% First Principles", "Imaginative"],
        ["Social", "Green (#7BC67B)", "+10% Extraversion, +5% Agreeableness", "Warm"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  MOOD BLEND COMBINATIONS                                          ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["When two orbs are combined, their effects merge. Examples:"],
        [""],
        ["Blend Key (alphabetical)", "Title", "Combined Effect"],
        ["calm+curious", "Thoughtful Explorer", "Openness +8%, Neuroticism -5%"],
        ["creative+determined", "Visionary Builder", "Openness +10%, Conscientiousness +8%"],
        ["happy+social", "Life of the Party", "Extraversion +13%, Agreeableness +8%"],
        ["calm+determined", "Steady Achiever", "Conscientiousness +11%, Neuroticism -5%"],
        ["curious+social", "Connector", "Openness +8%, Extraversion +10%"],
        [""],
        ["Note: Blend keys MUST be alphabetically sorted (e.g., 'calm+curious' not 'curious+calm')"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PROXY SCORE BOOSTS                                               ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Mood orbs also affect Critical Thinking and First Principles proxy scores:"],
        [""],
        ["Orb", "Critical Thinking Boost", "First Principles Boost"],
        ["Curious", "+0%", "+5%"],
        ["Determined", "+5%", "+0%"],
        ["Creative", "+0%", "+8%"],
        [""],
        ["These boosts are passed via moodBoosts object in quiz scores."],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  QUESTION WORDING ADJUSTMENTS                                     ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Mood affects how questions are worded via adjustQuestionWording():"],
        [""],
        ["Tone", "Prefix Examples"],
        ["Introspective", "'When you pause to reflect...' 'Deep down...'"],
        ["Energetic", "'Right now...' 'In this moment...'"],
        ["Analytical", "'Thinking it through...' 'Logically...'"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  IMPLEMENTATION FILES                                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["File", "Purpose"],
        ["MoodAlchemyLab.tsx", "Interactive orb selection UI with drag-to-center"],
        ["Quiz.tsx - getMoodEffects()", "Calculates trait boosts from mood blend"],
        ["Quiz.tsx - adjustQuestionWording()", "Modifies question text based on mood"],
        ["server/routes.ts", "Applies moodBoosts to proxy calculations"],
        ["sessionStorage", "Stores mood blend (knowrole-mood-blend)"],
      ];
      await clearAndWriteSheet(spreadsheetId, "15. Mood Effects", moodRows);
      
      // ========== SHEET 16: Results Page Layout ==========
      const resultsRows = [
        ["Results Page Layout - Complete Reference"],
        ["Generated:", getPSTTimestamp()],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  RESULTS PAGE SECTIONS (top to bottom)                           ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["#", "Section", "Component", "Description"],
        ["1", "Header", "Results.tsx", "Celebration animation, 'Your Results Are In!' title"],
        ["2", "MBTI Type Card", "Results.tsx", "4-letter type (e.g., INTJ) with description and traits"],
        ["3", "DISC Profile", "Results.tsx", "Primary DISC style with explanation"],
        ["4", "Big Five Radar", "Results.tsx", "340px radar chart with O/C/E/A/N axes, percentile comparisons"],
        ["5", "Hybrid Types", "Results.tsx", "If applicable: Ambivert, Thinking-Feeling Balance, etc."],
        ["6", "Primary Role", "Results.tsx", "Career recommendation with salary data (premium)"],
        ["7", "Secondary Roles", "Results.tsx", "2-3 alternative career suggestions"],
        ["8", "Crossroads Adventure", "CrossroadsAdventure.tsx", "Interactive scenario-based exploration"],
        ["9", "Premium Card Deck", "PremiumCardDeck.tsx", "6 swipeable insight cards"],
        ["10", "Sharpen Thinking", "SharpenThinking.tsx", "5-question critical thinking challenge"],
        ["11", "Feedback Form", "Results.tsx", "5 questions + suggestions textarea"],
        ["12", "Action Buttons", "Results.tsx", "Download PDF, Share, Start Over"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  BIG FIVE RADAR CHART                                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Feature", "Description"],
        ["Size", "340px diameter"],
        ["Axes", "Single-letter labels: O, C, E, A, N"],
        ["Colors", "Each trait has unique color from design palette"],
        ["Percentiles", "Shows 'Higher than X% of people' for each trait"],
        ["Z-Score Calculation", "percentile = 50 + (z * 34.13)"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  PREMIUM CARD DECK (6 Cards)                                      ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Card #", "Title", "Content Source"],
        ["1", "Career Compass", "career_paths table - salary, growth, education"],
        ["2", "Relationship Dynamics", "relationship_insights table - compatibility"],
        ["3", "Growth Tips", "growth_tips table - action steps, timeframe"],
        ["4", "Side Hustles", "side_hustles table - income, time commitment"],
        ["5", "Learning Style", "communication_styles table - how you learn"],
        ["6", "Strengths", "strengths table - how to leverage"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  JUST KIDDING INTERSTITIAL                                        ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Before premium insights, users see 'Unlock Premium' button."],
        ["Clicking reveals playful 'Just Kidding!' overlay with:"],
        ["- 'Premium is Free (For Now)' message"],
        ["- 'Proceed to Results' button"],
        ["- Two donation tier options: $3.33 and $33.33"],
        [""],
        ["╔══════════════════════════════════════════════════════════════════╗"],
        ["║  FEEDBACK FORM FIELDS                                             ║"],
        ["╚══════════════════════════════════════════════════════════════════╝"],
        [""],
        ["Question", "Options"],
        ["Was this app useful?", "Yes / Somewhat / No"],
        ["Were results accurate?", "Yes / Somewhat / No"],
        ["Were questions engaging?", "Yes / Somewhat / No"],
        ["Would you share with others?", "Yes / No"],
        ["Suggestions (optional)", "Free text, max 2000 chars"],
        [""],
        ["On submit: Auto-exports quiz session to Google Sheets."],
      ];
      await clearAndWriteSheet(spreadsheetId, "16. Results Layout", resultsRows);
      
      res.json({
        success: true,
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheetsCreated: 16,
        sheets: [
          "1. App Overview",
          "2. Technical Stack", 
          "3. Database Schema (18 Tables)",
          "4. Quiz Algorithm (Complete)",
          "5. API Endpoints",
          "6. Component Map",
          "7. Questions Database",
          "8. City Themes",
          "9. Tier Configuration",
          "10. Quiz Sessions",
          "11. Feedback Data",
          "12. Premium Insights",
          "13. Sharpen Thinking",
          "14. Badge System",
          "15. Mood Effects",
          "16. Results Layout"
        ],
        questionsExported: questionsData.questions.length,
        sessionsExported: allSessions.length,
        feedbackExported: allFeedback.length,
        cityThemesExported: colorRows.length - 1,
        premiumCategories: 6,
        thinkingQuestions: 60
      });
    } catch (error) {
      console.error("Full data export error:", error);
      res.status(500).json({ error: "Failed to export complete blueprint to Google Sheets" });
    }
  });

  // ========================================
  // PREMIUM INSIGHTS API ENDPOINTS
  // ========================================

  // Admin route to seed premium insights data
  app.post("/api/admin/seed-premium", async (req: Request, res: Response) => {
    try {
      await seedPremiumInsights();
      res.json({ success: true, message: "Premium insights seeded successfully" });
    } catch (error) {
      console.error("Premium insights seeding error:", error);
      res.status(500).json({ error: "Failed to seed premium insights" });
    }
  });

  // Admin route to seed job roles database (150 roles with 13 trait dimensions)
  app.post("/api/admin/seed-job-roles", async (_req: Request, res: Response) => {
    try {
      await seedJobRoles();
      res.json({ success: true, message: "Job roles seeded successfully (150 roles)" });
    } catch (error) {
      console.error("Job roles seeding error:", error);
      res.status(500).json({ error: "Failed to seed job roles" });
    }
  });

  // Get all job roles from database
  app.get("/api/job-roles", async (_req: Request, res: Response) => {
    try {
      const roles = await db.select().from(jobRoles);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching job roles:", error);
      res.status(500).json({ error: "Failed to fetch job roles" });
    }
  });

  // Get personalized job matches based on personality scores
  const jobMatchSchema = z.object({
    mbti: z.object({
      E: z.number(), I: z.number(),
      S: z.number(), N: z.number(),
      T: z.number(), F: z.number(),
      J: z.number(), P: z.number(),
    }),
    disc: z.object({
      D: z.number(), I: z.number(), S: z.number(), C: z.number(),
    }),
    bigFive: z.object({
      O: z.number(), C: z.number(), E: z.number(), A: z.number(), N: z.number(),
    }),
    limit: z.number().optional().default(3),
    diversityBoost: z.boolean().optional().default(true),
  });

  app.post("/api/job-matches", async (req: Request, res: Response) => {
    try {
      const data = jobMatchSchema.parse(req.body);
      const { mbti, disc, bigFive, limit, diversityBoost } = data;
      
      const matches = await getJobMatches({ mbti, disc, bigFive }, limit, diversityBoost);
      
      res.json({
        success: true,
        matches: matches.map(m => ({
          roleName: m.role.roleName,
          roleNumber: m.role.roleNumber,
          matchScore: m.matchScore,
          explanation: m.explanation,
          traitHighlights: m.traitHighlights,
          jobCollar: m.role.jobCollar,
        })),
      });
    } catch (error) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: "Failed to get job matches" });
    }
  });

  // Get single top job match (for basic results display)
  app.post("/api/job-match/top", async (req: Request, res: Response) => {
    try {
      const data = jobMatchSchema.omit({ limit: true, diversityBoost: true }).parse(req.body);
      const { mbti, disc, bigFive } = data;
      
      const match = await getTopJobMatch({ mbti, disc, bigFive });
      
      if (!match) {
        return res.status(404).json({ error: "No job match found" });
      }
      
      res.json({
        success: true,
        match: {
          roleName: match.role.roleName,
          roleNumber: match.role.roleNumber,
          matchScore: match.matchScore,
          explanation: match.explanation,
          traitHighlights: match.traitHighlights,
          jobCollar: match.role.jobCollar,
        },
      });
    } catch (error) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: "Failed to get job match" });
    }
  });

  // Get personalized premium insights based on personality traits
  const premiumInsightsSchema = z.object({
    bigFive: z.object({
      O: z.number(),
      C: z.number(),
      E: z.number(),
      A: z.number(),
      N: z.number(),
    }),
    mbtiType: z.string().optional(),
    discStyle: z.string().optional(),
    ageTier: z.string().optional(),
  });

  app.post("/api/premium-insights", async (req: Request, res: Response) => {
    try {
      const data = premiumInsightsSchema.parse(req.body);
      const { bigFive, mbtiType, discStyle, ageTier } = data;
      
      // Map age tier to database format
      const ageTierMap: Record<string, string> = {
        "mini": "mini",
        "teen": "teen",
        "young_adult": "young_adult",
        "adult": "adult",
        "Ages 12 and under": "mini",
        "Ages 13-18": "teen",
        "Ages 19-25": "young_adult",
        "Ages 25+": "adult",
      };
      const dbAgeTier = ageTierMap[ageTier || "adult"] || "adult";

      // Helper function to check if age tier matches
      const matchesAgeTier = (ageTiers: string | null) => {
        if (!ageTiers) return true;
        return ageTiers.includes(dbAgeTier) || ageTiers.includes("all");
      };

      // 1. SIDE HUSTLES - Match by primary trait and age tier
      const topTrait = Object.entries(bigFive).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const allSideHustles = await db.select().from(sideHustles);
      const matchedSideHustles = allSideHustles
        .filter(h => {
          const traitScore = bigFive[h.primaryTrait as keyof typeof bigFive];
          if (traitScore === undefined || traitScore < h.primaryTraitMin) return false;
          if (h.secondaryTrait && h.secondaryTraitMin) {
            const secScore = bigFive[h.secondaryTrait as keyof typeof bigFive];
            if (secScore === undefined || secScore < h.secondaryTraitMin) return false;
          }
          if (h.mbtiPreference && mbtiType && !mbtiType.includes(h.mbtiPreference)) return false;
          if (h.discPreference && discStyle && h.discPreference !== discStyle) return false;
          return matchesAgeTier(h.ageTiers);
        })
        .sort((a, b) => {
          // Prioritize primary trait matches
          const aScore = bigFive[a.primaryTrait as keyof typeof bigFive] || 0;
          const bScore = bigFive[b.primaryTrait as keyof typeof bigFive] || 0;
          return bScore - aScore;
        })
        .slice(0, 5);

      // 2. BLINDSPOTS - Match by low traits
      const allBlindspots = await db.select().from(blindspots);
      const matchedBlindspots = allBlindspots
        .filter(b => {
          const traitScore = bigFive[b.targetTrait as keyof typeof bigFive];
          if (traitScore === undefined) return false;
          // Check if trait is below threshold
          if (traitScore > b.traitMax) return false;
          // Check secondary conditions if present
          if (b.secondaryCondition) {
            try {
              const cond = JSON.parse(b.secondaryCondition);
              for (const [key, val] of Object.entries(cond)) {
                const traitKey = key.replace("min", "").replace("max", "").toUpperCase() as keyof typeof bigFive;
                const score = bigFive[traitKey];
                if (key.startsWith("min") && score < (val as number)) return false;
                if (key.startsWith("max") && score > (val as number)) return false;
              }
            } catch (e) {}
          }
          return matchesAgeTier(b.ageTiers);
        })
        .sort((a, b) => {
          // Prioritize more severe blindspots for lower scores
          const aScore = bigFive[a.targetTrait as keyof typeof bigFive] || 100;
          const bScore = bigFive[b.targetTrait as keyof typeof bigFive] || 100;
          return aScore - bScore;
        })
        .slice(0, 3);

      // 3. CAREER PATHS - Match by traits and MBTI/DISC
      const allCareerPaths = await db.select().from(careerPaths);
      const matchedCareerPaths = allCareerPaths
        .filter(c => {
          const traitScore = bigFive[c.primaryTrait as keyof typeof bigFive];
          if (traitScore === undefined || traitScore < c.primaryTraitMin) return false;
          if (c.secondaryTrait && c.secondaryTraitMin) {
            const secScore = bigFive[c.secondaryTrait as keyof typeof bigFive];
            if (secScore === undefined || secScore < c.secondaryTraitMin) return false;
          }
          if (c.mbtiTypes && mbtiType && !c.mbtiTypes.split(",").includes(mbtiType)) return false;
          if (c.discStyles && discStyle && !c.discStyles.split(",").includes(discStyle)) return false;
          return matchesAgeTier(c.ageTiers);
        })
        .sort((a, b) => {
          const aScore = bigFive[a.primaryTrait as keyof typeof bigFive] || 0;
          const bScore = bigFive[b.primaryTrait as keyof typeof bigFive] || 0;
          return bScore - aScore;
        })
        .slice(0, 5);

      // 4. GROWTH TIPS - Match by trait direction
      const allGrowthTips = await db.select().from(growthTips);
      const matchedGrowthTips = allGrowthTips
        .filter(g => {
          const traitScore = bigFive[g.targetTrait as keyof typeof bigFive];
          if (traitScore === undefined) return false;
          if (g.traitMin !== null && traitScore < g.traitMin) return false;
          if (g.traitMax !== null && traitScore > g.traitMax) return false;
          return matchesAgeTier(g.ageTiers);
        })
        .slice(0, 3);

      // 5. STRENGTHS - Match by high traits
      const allStrengths = await db.select().from(strengths);
      const matchedStrengths = allStrengths
        .filter(s => {
          const traitScore = bigFive[s.primaryTrait as keyof typeof bigFive];
          if (traitScore === undefined || traitScore < s.primaryTraitMin) return false;
          if (s.secondaryTrait && s.secondaryTraitMin) {
            const secScore = bigFive[s.secondaryTrait as keyof typeof bigFive];
            if (secScore === undefined || secScore < s.secondaryTraitMin) return false;
          }
          return matchesAgeTier(s.ageTiers);
        })
        .sort((a, b) => {
          const aScore = bigFive[a.primaryTrait as keyof typeof bigFive] || 0;
          const bScore = bigFive[b.primaryTrait as keyof typeof bigFive] || 0;
          return bScore - aScore;
        })
        .slice(0, 3);

      // 6. COMMUNICATION STYLES - Match by DISC and traits
      const allCommStyles = await db.select().from(communicationStyles);
      const matchedCommStyles = allCommStyles
        .filter(c => {
          if (c.discStyle && discStyle && c.discStyle !== discStyle) return false;
          if (c.extraversionMin !== null && bigFive.E < c.extraversionMin) return false;
          if (c.extraversionMax !== null && bigFive.E > c.extraversionMax) return false;
          if (c.agreeablenessMin !== null && bigFive.A < c.agreeablenessMin) return false;
          if (c.agreeablenessMax !== null && bigFive.A > c.agreeablenessMax) return false;
          return matchesAgeTier(c.ageTiers);
        })
        .slice(0, 2);

      // 7. WORK ENVIRONMENTS - Match by trait ranges
      const allWorkEnvs = await db.select().from(workEnvironments);
      const matchedWorkEnvs = allWorkEnvs
        .filter(w => {
          if (w.opennessMin !== null && bigFive.O < w.opennessMin) return false;
          if (w.opennessMax !== null && bigFive.O > w.opennessMax) return false;
          if (w.conscientiousnessMin !== null && bigFive.C < w.conscientiousnessMin) return false;
          if (w.conscientiousnessMax !== null && bigFive.C > w.conscientiousnessMax) return false;
          if (w.extraversionMin !== null && bigFive.E < w.extraversionMin) return false;
          if (w.extraversionMax !== null && bigFive.E > w.extraversionMax) return false;
          if (w.discStyles && discStyle && !w.discStyles.split(",").includes(discStyle)) return false;
          return matchesAgeTier(w.ageTiers);
        })
        .slice(0, 3);

      // 8. RELATIONSHIP INSIGHTS - Match by trait ranges
      const allRelInsights = await db.select().from(relationshipInsights);
      const matchedRelInsights = allRelInsights
        .filter(r => {
          const traitScore = bigFive[r.primaryTrait as keyof typeof bigFive];
          if (traitScore === undefined) return false;
          if (r.primaryTraitMin !== null && traitScore < r.primaryTraitMin) return false;
          if (r.primaryTraitMax !== null && traitScore > r.primaryTraitMax) return false;
          if (r.agreeablenessMin !== null && bigFive.A < r.agreeablenessMin) return false;
          if (r.agreeablenessMax !== null && bigFive.A > r.agreeablenessMax) return false;
          if (r.neuroticismMin !== null && bigFive.N < r.neuroticismMin) return false;
          if (r.neuroticismMax !== null && bigFive.N > r.neuroticismMax) return false;
          return matchesAgeTier(r.ageTiers);
        })
        .slice(0, 2);

      res.json({
        success: true,
        insights: {
          sideHustles: matchedSideHustles,
          blindspots: matchedBlindspots,
          careerPaths: matchedCareerPaths,
          growthTips: matchedGrowthTips,
          strengths: matchedStrengths,
          communicationStyles: matchedCommStyles,
          workEnvironments: matchedWorkEnvs,
          relationshipInsights: matchedRelInsights,
        },
        counts: {
          sideHustles: matchedSideHustles.length,
          blindspots: matchedBlindspots.length,
          careerPaths: matchedCareerPaths.length,
          growthTips: matchedGrowthTips.length,
          strengths: matchedStrengths.length,
          communicationStyles: matchedCommStyles.length,
          workEnvironments: matchedWorkEnvs.length,
          relationshipInsights: matchedRelInsights.length,
        },
      });
    } catch (error) {
      console.error("Premium insights fetch error:", error);
      res.status(500).json({ error: "Failed to fetch premium insights" });
    }
  });

  return httpServer;
}
