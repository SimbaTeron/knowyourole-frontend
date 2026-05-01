import type { Express, Request, Response } from "express";
import { db } from "../db";
import { seedPremiumInsights } from "../seedData";
import { seedJobRoles } from "../seed-job-roles";
import { jobRoles } from "@shared/schema";

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/seed-premium", async (req: Request, res: Response) => {
    try {
      await seedPremiumInsights();
      res.json({ success: true, message: "Premium insights seeded successfully" });
    } catch (error) {
      console.error("Premium insights seeding error:", error);
      res.status(500).json({ error: "Failed to seed premium insights" });
    }
  });

  app.post("/api/admin/seed-job-roles", async (_req: Request, res: Response) => {
    try {
      await seedJobRoles();
      res.json({ success: true, message: "Job roles seeded successfully (150 roles)" });
    } catch (error) {
      console.error("Job roles seeding error:", error);
      res.status(500).json({ error: "Failed to seed job roles" });
    }
  });

  app.get("/api/job-roles", async (_req: Request, res: Response) => {
    try {
      const roles = await db.select().from(jobRoles);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching job roles:", error);
      res.status(500).json({ error: "Failed to fetch job roles" });
    }
  });
}
