import type { Request } from "express";
import { z } from "zod";

export const quizScoresSchema = z.object({
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
    sliderValue: z.number().optional(),
    responseType: z.enum(["binary", "slider"]).optional(),
  })),
  swipeTimes: z.array(z.number()).optional().default([]),
  averageSwipeTime: z.number().optional().default(0),
  currentDifficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  engagement: z.number(),
  wildcardBoost: z.boolean(),
  criticalWildcard: z.number().optional().default(0),
  firstPrinciplesWildcard: z.number().optional().default(0),
  hybridTypes: z.array(z.string()).optional().default([]),
  moodBoosts: z.object({
    critical: z.number(),
    firstPrinciples: z.number(),
  }).optional().default({ critical: 0, firstPrinciples: 0 }),
});

export const RESEARCH_NORMS = {
  bigFive: {
    openness: { mean: 50, std: 15 },
    conscientiousness: { mean: 50, std: 15 },
    extraversion: { mean: 50, std: 15 },
    agreeableness: { mean: 50, std: 15 },
    neuroticism: { mean: 50, std: 15 },
  },
  mbti: {
    EI: { mean: 0, std: 5 },
    SN: { mean: 0, std: 5 },
    TF: { mean: 0, std: 5 },
    JP: { mean: 0, std: 5 },
  },
};

export function zNormalize(rawScore: number, mean: number, std: number): number {
  const zScore = (rawScore - mean) / std;
  return Math.max(0, Math.min(100, 50 + zScore * 15));
}

export const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
         req.socket.remoteAddress || 'unknown';
}

export function checkRateLimit(req: Request, limit: number, windowMs: number): boolean {
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

export interface ResponseItem {
  questionId: number;
  choice: 0 | 1;
  sliderValue?: number;
  psych?: string;
}

export function calculateCronbachAlpha(responses: ResponseItem[], traitGroup: string): number {
  const traitResponses = responses.filter(r => r.psych?.includes(traitGroup));
  
  if (traitResponses.length < 2) return 1;
  
  const n = traitResponses.length;
  
  const items = traitResponses.map(r => r.sliderValue !== undefined ? r.sliderValue : r.choice);
  
  const totalScores = items;
  const totalMean = totalScores.reduce((a, b) => a + b, 0) / n;
  const totalVariance = totalScores.reduce((sum, val) => sum + Math.pow(val - totalMean, 2), 0) / (n - 1) || 1;
  
  const itemVariances = items.map(item => {
    const mean = (item + (n > 1 ? items.reduce((a, b) => a + b, 0) / n : item)) / 2;
    return Math.pow(item - mean, 2);
  });
  const sumItemVariance = itemVariances.reduce((a, b) => a + b, 0) / (n - 1) || 1;
  
  const alpha = (n / (n - 1)) * (1 - sumItemVariance / totalVariance);
  
  return Math.max(0, Math.min(1, alpha));
}

export function calculateTraitConsistency(responses: ResponseItem[]): { 
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
  
  const validAlphas = Object.values(alphas).filter(a => a > 0 && a <= 1);
  const overallAlpha = validAlphas.length > 0 
    ? validAlphas.reduce((a, b) => a + b, 0) / validAlphas.length 
    : 0.7;
  
  return { alphas, lowConsistencyFlags, overallAlpha };
}

export const HYBRID_THRESHOLD = 1.5;

export const BADGE_DEFINITIONS = [
  { name: "Trailblazer", type: "trait", condition: (scores: any) => scores.bigFive.O > 80, icon: "compass", color: "terracotta" },
  { name: "Deep Thinker", type: "trait", condition: (scores: any) => scores.bigFive.C > 80, icon: "brain", color: "sage-green" },
  { name: "Social Butterfly", type: "trait", condition: (scores: any) => scores.bigFive.E > 80, icon: "users", color: "dusty-blue" },
  { name: "Peacemaker", type: "trait", condition: (scores: any) => scores.bigFive.A > 80, icon: "heart", color: "soft-cream" },
  { name: "Speedster", type: "speed", condition: (scores: any) => scores.averageSwipeTime && scores.averageSwipeTime < 3, icon: "zap", color: "amber" },
  { name: "Thoughtful Observer", type: "speed", condition: (scores: any) => scores.averageSwipeTime && scores.averageSwipeTime > 7, icon: "eye", color: "violet" },
  { name: "Balanced Mind", type: "special", condition: (scores: any) => scores.hybridTypes && scores.hybridTypes.length > 0, icon: "scale", color: "teal" },
  { name: "Quiz Master", type: "streak", condition: (scores: any) => scores.engagement > 20, icon: "trophy", color: "gold" },
];

export const quizSubmitSchema = z.object({
  tier: z.string(),
  mood: z.string(),
  funMode: z.boolean(),
  landmark: z.string().optional(),
  theme: z.string(),
  scores: quizScoresSchema,
});

export type QuizSubmit = z.infer<typeof quizSubmitSchema>;
