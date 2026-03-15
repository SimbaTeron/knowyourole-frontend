import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { calculateArcEvolution } from "../services/scoring";

export function registerAuthRoutes(app: Express) {
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/user/quiz-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const results = await storage.getQuizResultsByUser(userId);
      
      if (!results || results.length === 0) {
        return res.json({ 
          success: true, 
          results: [],
          arcData: null,
          message: "No quiz history found" 
        });
      }

      const arcData = results.length >= 2 ? calculateArcEvolution(results) : null;
      
      res.json({
        success: true,
        results: results.map(r => ({
          id: r.id,
          createdAt: r.createdAt,
          mbtiType: r.mbtiType,
          discStyle: r.discStyle,
          bigFive: {
            O: r.bigFiveO,
            C: r.bigFiveC,
            E: r.bigFiveE,
            A: r.bigFiveA,
            N: r.bigFiveN
          },
          primaryRole: r.primaryRoleTitle,
          criticalThinking: r.criticalThinking,
          firstPrinciples: r.firstPrinciples
        })),
        arcData,
      });
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Failed to fetch quiz history" });
    }
  });
}
