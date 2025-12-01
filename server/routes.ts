import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { sql, eq, and, gte, lte, or, desc } from "drizzle-orm";
import { db } from "./db";
import { seedAll, seedPremiumInsights } from "./seedData";
import { 
  traitVibes, traitCombinations, adventureArchetypes,
  sideHustles, blindspots, careerPaths, growthTips,
  strengths, communicationStyles, workEnvironments, relationshipInsights
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
  
  // Apply weighted proxy formula
  const criticalProxy = (mbtiT_pct * PROXY_WEIGHTS.critical.mbtiT) + 
                        (big5O_pct * PROXY_WEIGHTS.critical.big5O) + 
                        (discC_pct * PROXY_WEIGHTS.critical.discC);
  const firstPrinciplesProxy = (mbtiN_pct * PROXY_WEIGHTS.firstPrinciples.mbtiN) + 
                               (big5O_pct * PROXY_WEIGHTS.firstPrinciples.big5O) + 
                               (discI_pct * PROXY_WEIGHTS.firstPrinciples.discI);
  
  const criticalRaw = (criticalProxy * 0.8) + (criticalWildcardBoost * 0.2);
  const firstPrinciplesRaw = (firstPrinciplesProxy * 0.8) + (firstPrinciplesWildcardBoost * 0.2);
  
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
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/score", async (req: Request, res: Response) => {
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
    try {
      const { amount, sessionId } = req.body;

      if (!amount || (amount !== 333 && amount !== 3333)) {
        return res.status(400).json({ error: "Invalid donation amount. Use 333 ($3.33) or 3333 ($33.33)" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}&donation=true`;
      const cancelUrl = `${baseUrl}/checkout/cancel`;

      const stripe = await stripeService.getStripe();
      
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: amount === 333 ? 'KnowRole Donation - $3.33' : 'KnowRole Donation - $33.33',
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
      
      // Build questions data
      const questionsHeader = [
        "ID", "Prompt", "Left Option", "Right Option", "Left Description", "Right Description",
        "Left Meta", "Right Meta", "Psychology Type", "Time (s)", "Age Tier", "Version", "Paid", "Wildcard"
      ];
      
      const questionsRows = [questionsHeader];
      
      for (const q of questionsData.questions) {
        questionsRows.push([
          q.id,
          q.prompt,
          q.options[0],
          q.options[1],
          q.leftDesc,
          q.rightDesc,
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
      const { createOrGetSpreadsheet, clearAndWriteSheet, formatTimezone } = await import("./googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      // Create the comprehensive spreadsheet
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Complete Blueprint");
      
      // ========== SHEET 1: App Overview ==========
      const overviewRows = [
        ["KnowRole - Complete Application Blueprint"],
        ["Generated:", new Date().toISOString()],
        [""],
        ["=== PURPOSE ==="],
        ["KnowRole is a personality discovery application designed with an 'Everyday Compass' aesthetic."],
        ["It guides users through self-discovery using quizzes, mood assessment, and location-based personalization."],
        ["The app helps users discover their personality traits through age-tiered quizzes and provides career recommendations."],
        [""],
        ["=== CORE FEATURES ==="],
        ["1. Age-Tiered Quiz System - Mini (16Q), Teen (22Q), Young Adult (28Q), Adult (34Q)"],
        ["2. Mood Selection & Mood Mixer - Personalized journey based on emotional state"],
        ["3. Location-Based Themes - Sports team colors from user's city"],
        ["4. Interactive Game Breaks - Superpower orbs, Mystery Box, Multiple Choice breaks"],
        ["5. Comprehensive Results - MBTI, DISC, Big Five personality profiles"],
        ["6. Premium Features - 8 swipeable insight cards (career sim, side hustles, growth quests, learning styles, etc.)"],
        ["7. Sharpen Thinking Section - 60 critical thinking questions across 5 categories with performance tracking"],
        ["8. Achievement Badges - 8 badge types awarded based on quiz behavior"],
        ["9. Random Event Pop-ups - 5-10% chance per question of special events"],
        ["10. Google Sheets Integration - Auto-export quiz sessions and feedback"],
        ["11. Stripe Integration - Donation system with $3.33 and $33.33 tiers"],
        [""],
        ["=== USER JOURNEY FLOW ==="],
        ["Home (/) → Age Tier Selection"],
        ["Mood (/mood) → Select from Energized, Stuck, Reflective"],
        ["Mood Mixer (/mood-mixer) → Tap 2 of 6 mood orbs to create blend (optional)"],
        ["Location (/location) → Enter zip code for city theme colors"],
        ["Pre-Quiz (/pre-quiz) → Animated 5-step walkthrough with subtle skip option after 2 seconds"],
        ["Quiz (/quiz) → Binary swipe questions with game breaks, badges, random events"],
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
      
      // ========== SHEET 3: Database Schema ==========
      const schemaRows = [
        ["Database Schema"],
        [""],
        ["=== TABLE: users ==="],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique user identifier"],
        ["username", "text", "NOT NULL, UNIQUE", "User's username"],
        ["password", "text", "NOT NULL", "Hashed password"],
        [""],
        ["=== TABLE: feedback ==="],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique feedback identifier"],
        ["sessionId", "text", "", "Links to quiz session"],
        ["usefulApp", "text", "", "Was app useful? (yes/no/somewhat)"],
        ["resultsAccurate", "text", "", "Were results accurate?"],
        ["questionsEngaging", "text", "", "Were questions engaging?"],
        ["wouldShare", "text", "", "Would share with others?"],
        ["suggestions", "text", "", "User suggestions/comments"],
        ["mbtiType", "text", "", "User's MBTI result"],
        ["discStyle", "text", "", "User's DISC result"],
        ["primaryRole", "text", "", "Recommended career role"],
        ["tier", "text", "", "Age tier selected"],
        ["mood", "text", "", "Mood selected"],
        ["funMode", "boolean", "", "Was fun mode enabled?"],
        ["createdAt", "timestamp", "DEFAULT NOW()", "Record creation time"],
        [""],
        ["=== TABLE: trait_vibes ==="],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["trait", "text", "NOT NULL", "Big Five trait name"],
        ["quartile", "text", "NOT NULL", "Score range (low, low_mid, mid_high, high)"],
        ["scoreMin", "integer", "NOT NULL", "Minimum score for quartile"],
        ["scoreMax", "integer", "NOT NULL", "Maximum score for quartile"],
        ["vibeTitle", "text", "NOT NULL", "Friendly title for this level"],
        ["vibeDescription", "text", "NOT NULL", "Full description"],
        [""],
        ["=== TABLE: trait_combinations ==="],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["trait1", "text", "NOT NULL", "First trait in combination"],
        ["trait1Level", "text", "NOT NULL", "First trait level (high/low)"],
        ["trait2", "text", "NOT NULL", "Second trait in combination"],
        ["trait2Level", "text", "NOT NULL", "Second trait level (high/low)"],
        ["comboTitle", "text", "NOT NULL", "Combination title"],
        ["comboDescription", "text", "NOT NULL", "Combination description"],
        [""],
        ["=== TABLE: adventure_archetypes ==="],
        ["Column", "Type", "Constraints", "Description"],
        ["id", "varchar", "PRIMARY KEY, UUID", "Unique identifier"],
        ["name", "text", "NOT NULL", "Archetype name (e.g., The Inventor)"],
        ["superpower", "text", "NOT NULL", "Kid-friendly superpower description"],
        ["description", "text", "NOT NULL", "Full archetype description"],
        ["mission", "text", "NOT NULL", "Daily mission suggestion"],
        ["badgeColor", "text", "NOT NULL", "Badge display color"],
        ["traits", "text", "NOT NULL", "JSON of matching trait patterns"],
      ];
      await clearAndWriteSheet(spreadsheetId, "3. Database Schema", schemaRows);
      
      // ========== SHEET 4: Quiz Algorithm ==========
      const algorithmRows = [
        ["Quiz Scoring Algorithm"],
        [""],
        ["=== PERSONALITY FRAMEWORKS ==="],
        ["Framework", "Dimensions", "Description"],
        ["MBTI", "E/I, S/N, T/F, J/P", "Myers-Briggs Type Indicator - 16 personality types"],
        ["DISC", "D, I, S, C", "Dominance, Influence, Steadiness, Conscientiousness"],
        ["Big Five", "O, C, E, A, N", "Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism"],
        ["Critical Thinking", "1-5 scale", "Proxy from MBTI-T, Big5-O, DISC-C"],
        ["First Principles", "1-5 scale", "Proxy from MBTI-N, Big5-O, DISC-I"],
        [""],
        ["=== SCORING LOGIC ==="],
        ["Step", "Description"],
        ["1. Response Collection", "Each question maps to specific trait dimensions via optionMeta"],
        ["2. Trait Accumulation", "Left/right choices add to respective trait scores"],
        ["3. MBTI Calculation", "Compare E vs I, S vs N, T vs F, J vs P - higher wins"],
        ["4. DISC Primary", "Highest of D, I, S, C becomes primary style"],
        ["5. Big Five Normalize", "Raw scores normalized to 0-100 scale: 50 + (score * 10)"],
        ["6. Wildcard Boosts", "Game break choices add +20% to Critical/FirstPrinciples"],
        ["7. Proxy Calculations", "Critical = (MBTI-T% + Big5-O + DISC-C%) / 3"],
        ["", "FirstPrinciples = (MBTI-N% + Big5-O + DISC-I%) / 3"],
        ["8. Scale Conversion", "Percentage to 1-5 scale: Math.round(pct / 20)"],
        [""],
        ["=== QUESTION STRUCTURE ==="],
        ["Field", "Description"],
        ["id", "Unique question identifier"],
        ["prompt", "Question text shown to user"],
        ["options", "[leftOption, rightOption] - the two choices"],
        ["optionMeta", "[leftMeta, rightMeta] - trait codes (e.g., 'E', 'I', 'O+', 'C-')"],
        ["psych", "Psychology framework: mbti, disc, bigfive, critical, first_principles"],
        ["tier", "Age tier: 7-12, 13-18, 19-25, 25+"],
        ["time", "Timer duration in seconds"],
        ["wildcard", "true if this is a wildcard/break question"],
        [""],
        ["=== BREAK SEQUENCE PER TIER ==="],
        ["Tier", "Total Q", "Timer", "Flow"],
        ["Mini (12 & under)", "16", "10s", "5 binary → MC1 → 4 → Superpower → 4 → Mystery → 3 → MC2"],
        ["Teen (13-18)", "22", "10s", "7 binary → MC1 → 6 → Superpower → 5 → Mystery → 4 → MC2"],
        ["Young Adult (19-25)", "28", "9s", "8 binary → MC1 → 7 → Superpower → 7 → Mystery → 6 → MC2"],
        ["Adult (25+)", "34", "9s", "9 binary → MC1 → 9 → Superpower → 9 → Mystery → 7 → MC2"],
        [""],
        ["=== UNIQUE PATH COMBINATIONS ==="],
        ["Tier", "Binary Questions", "Paths (2^n × 15 break combinations)"],
        ["Mini", "16", "983,040 unique personality paths"],
        ["Teen", "22", "62.9 million unique paths"],
        ["Young Adult", "28", "4 billion unique paths"],
        ["Adult", "34", "257 billion unique paths"],
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
        ["MoodSelection.tsx", "/mood", "Select mood: Energized, Stuck, Reflective"],
        ["MoodMixer.tsx", "/mood-mixer", "Interactive orb selection to blend moods (optional step)"],
        ["LocationInput.tsx", "/location", "Zip code input for city theme colors"],
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
        ["PremiumCardDeck", "PremiumCardDeck.tsx", "8 swipeable premium insight cards"],
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
        "7-12": "5 → MC1 → 4 → Superpower → 4 → Mystery → 3 → MC2",
        "13-18": "7 → MC1 → 6 → Superpower → 5 → Mystery → 4 → MC2",
        "19-25": "8 → MC1 → 7 → Superpower → 7 → Mystery → 6 → MC2",
        "25+": "9 → MC1 → 9 → Superpower → 9 → Mystery → 7 → MC2"
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
      
      res.json({
        success: true,
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheetsCreated: 11,
        sheets: [
          "1. App Overview",
          "2. Technical Stack", 
          "3. Database Schema",
          "4. Quiz Algorithm",
          "5. API Endpoints",
          "6. Component Map",
          "7. Questions Database",
          "8. City Themes",
          "9. Tier Configuration",
          "10. Quiz Sessions",
          "11. Feedback Data"
        ],
        questionsExported: questionsData.questions.length,
        sessionsExported: allSessions.length,
        feedbackExported: allFeedback.length,
        cityThemesExported: colorRows.length - 1
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
