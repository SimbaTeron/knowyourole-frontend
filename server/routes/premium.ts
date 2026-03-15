import type { Express, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; isPremium?: boolean };
}
import { storage } from "../storage";
import { z } from "zod";
import { db } from "../db";
import { getJobMatches, getTopJobMatch } from "../job-matching";
import { isAuthenticated } from "../replitAuth";
import { 
  sideHustles, blindspots, careerPaths, growthTips,
  strengths, communicationStyles, workEnvironments, relationshipInsights,
} from "@shared/schema";

export function registerPremiumRoutes(app: Express) {

  app.post("/api/job-matches", async (req: Request, res: Response) => {
    try {
      const { bigFive, mbti, disc, mbtiType, discStyle, limit = 5 } = req.body;
      const resolvedMbti = mbti || mbtiType;
      const resolvedDisc = disc || discStyle;
      if (!bigFive || !resolvedMbti || !resolvedDisc) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const userScores = { bigFive, mbti: resolvedMbti, disc: resolvedDisc };
      const matches = await getJobMatches(userScores, limit);
      res.json({ success: true, matches });
    } catch (error) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: "Failed to get job matches" });
    }
  });

  app.post("/api/job-match/top", async (req: Request, res: Response) => {
    try {
      const { bigFive, mbti, disc, mbtiType, discStyle } = req.body;
      const resolvedMbti = mbti || mbtiType;
      const resolvedDisc = disc || discStyle;
      if (!bigFive || !resolvedMbti || !resolvedDisc) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const topMatch = await getTopJobMatch({
        bigFive, mbti: resolvedMbti, disc: resolvedDisc
      });
      res.json({ success: true, match: topMatch });
    } catch (error) {
      console.error("Top job match error:", error);
      res.status(500).json({ error: "Failed to get top job match" });
    }
  });

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
      
      const ageTierMap: Record<string, string> = {
        "mini": "mini", "teen": "teen", "young_adult": "young_adult", "adult": "adult",
        "Ages 12 and under": "mini", "Ages 13-18": "teen", "Ages 19-25": "young_adult", "Ages 25+": "adult",
      };
      const dbAgeTier = ageTierMap[ageTier || "adult"] || "adult";
      const matchesAgeTier = (ageTiers: string | null) => !ageTiers || ageTiers.includes(dbAgeTier) || ageTiers.includes("all");

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
        .sort((a, b) => (bigFive[b.primaryTrait as keyof typeof bigFive] || 0) - (bigFive[a.primaryTrait as keyof typeof bigFive] || 0))
        .slice(0, 5);

      const allBlindspots = await db.select().from(blindspots);
      const matchedBlindspots = allBlindspots
        .filter(b => {
          const traitScore = bigFive[b.targetTrait as keyof typeof bigFive];
          if (traitScore === undefined || traitScore > b.traitMax) return false;
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
        .sort((a, b) => (bigFive[a.targetTrait as keyof typeof bigFive] || 100) - (bigFive[b.targetTrait as keyof typeof bigFive] || 100))
        .slice(0, 3);

      const allCareerPaths = await db.select().from(careerPaths);
      const seenCareerTitles = new Set<string>();
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
        .sort((a, b) => (bigFive[b.primaryTrait as keyof typeof bigFive] || 0) - (bigFive[a.primaryTrait as keyof typeof bigFive] || 0))
        .filter(c => { const key = c.title.toLowerCase().trim(); if (seenCareerTitles.has(key)) return false; seenCareerTitles.add(key); return true; })
        .slice(0, 5);

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
        .sort((a, b) => (bigFive[b.primaryTrait as keyof typeof bigFive] || 0) - (bigFive[a.primaryTrait as keyof typeof bigFive] || 0))
        .slice(0, 3);

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
          sideHustles: matchedSideHustles, blindspots: matchedBlindspots, careerPaths: matchedCareerPaths,
          growthTips: matchedGrowthTips, strengths: matchedStrengths, communicationStyles: matchedCommStyles,
          workEnvironments: matchedWorkEnvs, relationshipInsights: matchedRelInsights,
        },
        counts: {
          sideHustles: matchedSideHustles.length, blindspots: matchedBlindspots.length, careerPaths: matchedCareerPaths.length,
          growthTips: matchedGrowthTips.length, strengths: matchedStrengths.length, communicationStyles: matchedCommStyles.length,
          workEnvironments: matchedWorkEnvs.length, relationshipInsights: matchedRelInsights.length,
        },
      });
    } catch (error) {
      console.error("Premium insights fetch error:", error);
      res.status(500).json({ error: "Failed to fetch premium insights" });
    }
  });

  const saveQuizResultSchema = z.object({
    sessionId: z.string().optional(), tier: z.string(), mood: z.string().optional(),
    funMode: z.boolean().optional(), landmark: z.string().optional(),
    mbtiType: z.string(), mbtiBlend: z.string().optional(), discStyle: z.string(),
    bigFive: z.object({ O: z.number(), C: z.number(), E: z.number(), A: z.number(), N: z.number() }),
    primaryRoleTitle: z.string().optional(), secondaryRoleTitle: z.string().optional(),
    criticalThinking: z.number().optional(), firstPrinciples: z.number().optional(),
    totalQuestions: z.number().optional(), avgResponseTime: z.number().optional(),
    responses: z.any().optional(),
  });

  app.post("/api/quiz-results", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user?.id) return res.status(401).json({ error: "Authentication required" });
      const data = saveQuizResultSchema.parse(req.body);
      const result = await storage.saveQuizResult({
        userId: user.id, sessionId: data.sessionId, tier: data.tier, mood: data.mood,
        funMode: data.funMode, landmark: data.landmark, mbtiType: data.mbtiType,
        mbtiBlend: data.mbtiBlend, discStyle: data.discStyle,
        bigFiveO: data.bigFive.O, bigFiveC: data.bigFive.C, bigFiveE: data.bigFive.E,
        bigFiveA: data.bigFive.A, bigFiveN: data.bigFive.N,
        primaryRoleTitle: data.primaryRoleTitle, secondaryRoleTitle: data.secondaryRoleTitle,
        criticalThinking: data.criticalThinking, firstPrinciples: data.firstPrinciples,
        totalQuestions: data.totalQuestions, avgResponseTime: data.avgResponseTime,
        responses: data.responses,
      });
      res.json({ success: true, result });
    } catch (error) {
      console.error("Save quiz result error:", error);
      res.status(500).json({ error: "Failed to save quiz result" });
    }
  });

  app.get("/api/quiz-results", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user?.id) return res.status(401).json({ error: "Authentication required" });
      const results = await storage.getQuizResultsByUser(user.id);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Get quiz results error:", error);
      res.status(500).json({ error: "Failed to get quiz results" });
    }
  });

  app.get("/api/user/premium-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user?.id) return res.status(401).json({ error: "Authentication required" });
      const dbUser = await storage.getUser(user.id);
      res.json({ isPremium: dbUser?.isPremium || false, premiumPurchasedAt: dbUser?.premiumPurchasedAt || null });
    } catch (error) {
      console.error("Get premium status error:", error);
      res.status(500).json({ error: "Failed to get premium status" });
    }
  });
}
