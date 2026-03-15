import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { storage } from "../storage";
import { eq, ilike } from "drizzle-orm";
import { db } from "../db";
import { jobRoles } from "@shared/schema";
import {
  checkRateLimit,
  quizSubmitSchema,
  calculatePersonality,
  analyzeRoleFitFromDB,
} from "../services/scoring";

export function registerQuizRoutes(app: Express) {
  app.get('/api/job-roles/search', async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string || '').trim();
      if (!q) {
        return res.json({ roles: [] });
      }
      const results = await db.select({ roleNumber: jobRoles.roleNumber, roleName: jobRoles.roleName })
        .from(jobRoles)
        .where(ilike(jobRoles.roleName, `${q}%`))
        .orderBy(jobRoles.roleName)
        .limit(8);
      res.json({ roles: results });
    } catch (error) {
      console.error("Job role search error:", error);
      res.status(500).json({ error: "Failed to search roles" });
    }
  });

  app.post('/api/analyze-role-fit', async (req: Request, res: Response) => {
    try {
      const { dreamRole, bigFive, mbtiType, discStyle } = req.body;
      
      if (!dreamRole || !bigFive) {
        return res.status(400).json({ error: "Dream role and personality data required" });
      }

      const [roleData] = await db.select().from(jobRoles).where(eq(jobRoles.roleName, dreamRole)).limit(1);
      if (!roleData) {
        return res.status(404).json({ error: "Role not found in database. Please select a role from the suggestions." });
      }

      const roleAnalysis = analyzeRoleFitFromDB(roleData, bigFive, mbtiType, discStyle);
      
      res.json({
        success: true,
        analysis: roleAnalysis
      });
    } catch (error) {
      console.error("Role fit analysis error:", error);
      res.status(500).json({ error: "Failed to analyze role fit" });
    }
  });

  app.post("/api/score", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 10, 3600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 10 quiz submissions per hour." });
    }
    try {
      const parsed = quizSubmitSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid quiz submission",
          details: parsed.error.issues.map(i => i.message),
        });
      }

      const result = calculatePersonality(parsed.data);

      const sessionId = result.sessionId || crypto.randomUUID();
      const session = await storage.saveQuizSession({
        id: sessionId,
        tier: parsed.data.tier,
        mood: parsed.data.mood || "neutral",
        funMode: parsed.data.funMode || false,
        theme: parsed.data.theme || "compass",
        result: {
          mbtiType: result.mbtiType,
          mbtiBlend: result.mbtiBlend || "",
          discStyle: result.discStyle,
          bigFiveProfile: {
            openness: result.bigFive?.O ?? 50,
            conscientiousness: result.bigFive?.C ?? 50,
            extraversion: result.bigFive?.E ?? 50,
            agreeableness: result.bigFive?.A ?? 50,
            neuroticism: result.bigFive?.N ?? 50,
          },
          title: result.title || "",
          spark: result.spark || "",
          proxyNudge: result.proxyNudge || "",
          engagement: result.engagement || 0,
          totalQuestions: result.totalQuestions || 0,
          avgResponseTime: result.avgResponseTime || 0,
        },
        responses: parsed.data.scores?.responses || [],
        createdAt: new Date().toISOString(),
      });

      const { sessionId: _discardedId, ...resultData } = result;
      return res.json({
        sessionId: session.id,
        ...resultData,
      });
    } catch (error) {
      console.error("Score calculation error:", error);
      return res.status(500).json({ error: "Failed to calculate personality scores" });
    }
  });

  app.get("/api/session/:id", async (req: Request, res: Response) => {
    try {
      const session = await storage.getQuizSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const result = calculatePersonality({
        scores: { responses: session.responses },
        responses: session.responses,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
      });

      const { sessionId: _sid, ...sessionResult } = result;
      return res.json({
        sessionId: session.id,
        ...sessionResult,
      });
    } catch (error) {
      console.error("Session fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/quiz/refine", async (req: Request, res: Response) => {
    try {
      const { sessionId, validationResponses } = req.body;
      
      if (!sessionId || !validationResponses) {
        return res.status(400).json({ error: "Session ID and validation responses required" });
      }

      const session = await storage.getQuizSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const bf = session.result?.bigFiveProfile;
      const currentBigFive = {
        O: bf?.openness ?? 50,
        C: bf?.conscientiousness ?? 50,
        E: bf?.extraversion ?? 50,
        A: bf?.agreeableness ?? 50,
        N: bf?.neuroticism ?? 50,
      };

      let adjustedBigFive = { ...currentBigFive };

      if (validationResponses.mbtiMatch === "partial") {
        const traits = ['O', 'C', 'E', 'A', 'N'] as const;
        for (const trait of traits) {
          if (adjustedBigFive[trait] > 60) adjustedBigFive[trait] = Math.max(50, adjustedBigFive[trait] - 5);
          else if (adjustedBigFive[trait] < 40) adjustedBigFive[trait] = Math.min(50, adjustedBigFive[trait] + 5);
        }
      } else if (validationResponses.mbtiMatch === "not_really") {
        const traits = ['O', 'C', 'E', 'A', 'N'] as const;
        for (const trait of traits) {
          if (adjustedBigFive[trait] > 55) adjustedBigFive[trait] = Math.max(45, adjustedBigFive[trait] - 10);
          else if (adjustedBigFive[trait] < 45) adjustedBigFive[trait] = Math.min(55, adjustedBigFive[trait] + 10);
        }
      }

      if (validationResponses.opennessRating) {
        const rating = validationResponses.opennessRating;
        if (rating <= 2) adjustedBigFive.O = Math.max(20, adjustedBigFive.O - 15);
        else if (rating >= 4) adjustedBigFive.O = Math.min(95, adjustedBigFive.O + 10);
      }

      session.result.bigFiveProfile = {
        openness: adjustedBigFive.O,
        conscientiousness: adjustedBigFive.C,
        extraversion: adjustedBigFive.E,
        agreeableness: adjustedBigFive.A,
        neuroticism: adjustedBigFive.N,
      };
      await storage.saveQuizSession(session);

      const result = calculatePersonality({
        scores: { responses: session.responses },
        responses: session.responses,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
      });

      return res.json({
        success: true,
        adjustedBigFive,
        updatedResult: result,
      });
    } catch (error) {
      console.error("Quiz refinement error:", error);
      return res.status(500).json({ error: "Failed to refine quiz results" });
    }
  });

  app.get("/api/badges/:sessionId", async (req: Request, res: Response) => {
    try {
      const session = await storage.getQuizSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const result = calculatePersonality({
        scores: { responses: session.responses },
        responses: session.responses,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
      });

      res.json({
        badges: result.earnedBadges || [],
        hybridTypes: result.hybridTypes || [],
      });
    } catch (error) {
      console.error("Badges fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  });
}
