import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { db } from "../db";
import { seedPremiumInsights } from "../seedData";
import { seedJobRoles } from "../seed-job-roles";
import { getJobMatches, getTopJobMatch } from "../job-matching";
import { isAuthenticated } from "../replitAuth";
import { 
  sideHustles, blindspots, careerPaths, growthTips,
  strengths, communicationStyles, workEnvironments, relationshipInsights,
  jobRoles
} from "@shared/schema";

export function registerPremiumRoutes(app: Express) {
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
        .sort((a, b) => {
          const aScore = bigFive[a.primaryTrait as keyof typeof bigFive] || 0;
          const bScore = bigFive[b.primaryTrait as keyof typeof bigFive] || 0;
          return bScore - aScore;
        })
        .filter(c => {
          const key = c.title.toLowerCase().trim();
          if (seenCareerTitles.has(key)) return false;
          seenCareerTitles.add(key);
          return true;
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

  // ============================================
  // QUIZ RESULTS - Save/Get for authenticated users
  // ============================================

  const saveQuizResultSchema = z.object({
    sessionId: z.string().optional(),
    tier: z.string(),
    mood: z.string().optional(),
    funMode: z.boolean().optional(),
    landmark: z.string().optional(),
    mbtiType: z.string(),
    mbtiBlend: z.string().optional(),
    discStyle: z.string(),
    bigFive: z.object({
      O: z.number(),
      C: z.number(),
      E: z.number(),
      A: z.number(),
      N: z.number(),
    }),
    primaryRoleTitle: z.string().optional(),
    secondaryRoleTitle: z.string().optional(),
    criticalThinking: z.number().optional(),
    firstPrinciples: z.number().optional(),
    totalQuestions: z.number().optional(),
    avgResponseTime: z.number().optional(),
    responses: z.any().optional(),
  });

  // Save quiz results to user account (requires auth)
  app.post("/api/quiz-results", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const data = saveQuizResultSchema.parse(req.body);
      
      const result = await storage.saveQuizResult({
        userId: user.id,
        sessionId: data.sessionId,
        tier: data.tier,
        mood: data.mood,
        funMode: data.funMode,
        landmark: data.landmark,
        mbtiType: data.mbtiType,
        mbtiBlend: data.mbtiBlend,
        discStyle: data.discStyle,
        bigFiveO: data.bigFive.O,
        bigFiveC: data.bigFive.C,
        bigFiveE: data.bigFive.E,
        bigFiveA: data.bigFive.A,
        bigFiveN: data.bigFive.N,
        primaryRoleTitle: data.primaryRoleTitle,
        secondaryRoleTitle: data.secondaryRoleTitle,
        criticalThinking: data.criticalThinking,
        firstPrinciples: data.firstPrinciples,
        totalQuestions: data.totalQuestions,
        avgResponseTime: data.avgResponseTime,
        responses: data.responses,
      });

      res.json({ success: true, result });
    } catch (error) {
      console.error("Save quiz result error:", error);
      res.status(500).json({ error: "Failed to save quiz result" });
    }
  });

  // Get user's quiz results history (requires auth)
  app.get("/api/quiz-results", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const results = await storage.getQuizResultsByUser(user.id);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Get quiz results error:", error);
      res.status(500).json({ error: "Failed to get quiz results" });
    }
  });

  // Get user's premium status
  app.get("/api/user/premium-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const dbUser = await storage.getUser(user.id);
      res.json({ 
        isPremium: dbUser?.isPremium || false,
        premiumPurchasedAt: dbUser?.premiumPurchasedAt || null,
      });
    } catch (error) {
      console.error("Get premium status error:", error);
      res.status(500).json({ error: "Failed to get premium status" });
    }
  });

}
