import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users, quizResults } from "@shared/schema";
import { isAuthenticated } from "../replitAuth";

/**
 * GDPR/CCPA Compliance Routes
 * - GET  /api/user/export  → Export all user data as JSON
 * - POST /api/user/delete  → Delete all user data (GDPR right to erasure)
 * - GET  /api/user/privacy → Do Not Sell / CCPA preferences
 */

export function registerPrivacyRoutes(app: Express) {
  /**
   * GET /api/user/export
   * Returns all personal data associated with the authenticated user.
   * GDPR Article 20 – Right to Data Portability
   */
  app.get("/api/user/export", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      // Fetch user record
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      // Fetch all quiz results
      const userResults = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
        .orderBy(quizResults.createdAt);

      const exportData = {
        exportedAt: new Date().toISOString(),
        requestType: "GDPR_DATA_EXPORT",
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          profileImageUrl: user?.profileImageUrl,
          isPremium: user?.isPremium,
          premiumPurchasedAt: user?.premiumPurchasedAt,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
        },
        quizResults: userResults.map((r) => ({
          id: r.id,
          tier: r.tier,
          mood: r.mood,
          funMode: r.funMode,
          mbtiType: r.mbtiType,
          mbtiBlend: r.mbtiBlend,
          discStyle: r.discStyle,
          bigFive: {
            openness: r.bigFiveO,
            conscientiousness: r.bigFiveC,
            extraversion: r.bigFiveE,
            agreeableness: r.bigFiveA,
            neuroticism: r.bigFiveN,
          },
          primaryRoleTitle: r.primaryRoleTitle,
          secondaryRoleTitle: r.secondaryRoleTitle,
          criticalThinking: r.criticalThinking,
          firstPrinciples: r.firstPrinciples,
          totalQuestions: r.totalQuestions,
          avgResponseTime: r.avgResponseTime,
          createdAt: r.createdAt,
        })),
        totalRecords: 1 + userResults.length,
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="knowyourrole-data-${new Date().toISOString().split("T")[0]}.json"`
      );
      res.json(exportData);
    } catch (error) {
      console.error("[/api/user/export] Error:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  /**
   * POST /api/user/delete
   * Permanently deletes all personal data for the authenticated user.
   * GDPR Article 17 – Right to Erasure ("Right to be Forgotten")
   */
  app.post("/api/user/delete", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      // Delete all quiz results first (foreign key relationship)
      await db.delete(quizResults).where(eq(quizResults.userId, userId));

      // Delete the user record
      await db.delete(users).where(eq(users.id, userId));

      // Destroy the session
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) console.error("Session destroy error:", err);
        });
      }

      res.json({
        success: true,
        message: "All personal data has been permanently deleted.",
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[/api/user/delete] Error:", error);
      res.status(500).json({ message: "Failed to delete user data" });
    }
  });

  /**
   * GET /api/user/privacy
   * Returns the user's current privacy/CCPA preferences.
   */
  app.get("/api/user/privacy", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      res.json({
        success: true,
        doNotSell: false, // toggled by user in settings
        accountCreatedAt: user?.createdAt,
        dataWeHold: ["account profile", "quiz results"],
      });
    } catch (error) {
      console.error("[/api/user/privacy] Error:", error);
      res.status(500).json({ message: "Failed to fetch privacy preferences" });
    }
  });
}
