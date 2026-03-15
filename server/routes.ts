import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replitAuth";
import { registerAuthRoutes } from "./routes/auth";
import { registerQuizRoutes } from "./routes/quiz";
import { registerStripeRoutes } from "./routes/stripe";
import { registerFeedbackRoutes } from "./routes/feedback";
import { registerTraitRoutes } from "./routes/traits";
import { registerExportRoutes } from "./routes/export";
import { registerPremiumRoutes } from "./routes/premium";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  registerAuthRoutes(app);
  registerQuizRoutes(app);
  registerStripeRoutes(app);
  registerFeedbackRoutes(app);
  registerTraitRoutes(app);
  registerExportRoutes(app);
  registerPremiumRoutes(app);

  return httpServer;
}
