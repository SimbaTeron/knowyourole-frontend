import type { Express, Request, Response } from "express";
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

      const session = await storage.createQuizSession({
        uniqueId: result.sessionId,
        scores: parsed.data.scores,
        responses: parsed.data.responses,
        tier: parsed.data.tier,
        mood: parsed.data.mood || "neutral",
        duration: parsed.data.duration || null,
        mbtiType: result.mbtiType,
        discStyle: result.discStyle,
        bigFive: result.bigFive,
        traitConsistency: result.traitConsistency,
        hybridTypes: result.hybridTypes,
        criticalThinking: result.criticalThinking,
        firstPrinciples: result.firstPrinciples,
      });

      return res.json({
        sessionId: session.uniqueId,
        ...result,
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
        scores: session.scores as any,
        responses: session.responses as any,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
        duration: session.duration || undefined,
      });

      return res.json({
        sessionId: session.uniqueId,
        ...result,
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

      const currentBigFive = {
        O: typeof session.bigFive === 'object' && session.bigFive !== null ? (session.bigFive as any).O || 50 : 50,
        C: typeof session.bigFive === 'object' && session.bigFive !== null ? (session.bigFive as any).C || 50 : 50,
        E: typeof session.bigFive === 'object' && session.bigFive !== null ? (session.bigFive as any).E || 50 : 50,
        A: typeof session.bigFive === 'object' && session.bigFive !== null ? (session.bigFive as any).A || 50 : 50,
        N: typeof session.bigFive === 'object' && session.bigFive !== null ? (session.bigFive as any).N || 50 : 50,
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

      await storage.updateQuizSession(sessionId, {
        bigFive: adjustedBigFive,
      });

      const result = calculatePersonality({
        scores: session.scores as any,
        responses: session.responses as any,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
        duration: session.duration || undefined,
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
        scores: session.scores as any,
        responses: session.responses as any,
        tier: session.tier,
        mood: session.mood,
        sliderResponses: [],
        wildcardResponses: [],
        duration: session.duration || undefined,
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
