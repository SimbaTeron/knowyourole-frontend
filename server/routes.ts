import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { sql, eq, and, gte, lte, or, desc, ilike } from "drizzle-orm";
import { db } from "./db";
import { seedAll } from "./seedData";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  traitVibes, adventureArchetypes,
  jobRoles
} from "@shared/schema";
import {
  checkRateLimit,
  quizSubmitSchema,
  calculatePersonality,
  calculateArcEvolution,
  analyzeRoleFitFromDB,
} from "./services/scoring";
import { registerExportRoutes } from "./routes/export";
import { registerPremiumRoutes } from "./routes/premium";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
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

  // Phase 3: Arc Tracker - Get user's quiz history for personality evolution tracking
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

      // Calculate arc data - personality evolution over time
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

  // Phase 3: Dream Role Advisor - Analyze role fit
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
    if (!checkRateLimit(req, 5, 600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 donation attempts per 10 minutes." });
    }
    try {
      const { amount, sessionId } = req.body;

      if (!amount || amount < 100 || !Number.isInteger(amount)) {
        return res.status(400).json({ error: "Invalid donation amount. Minimum $1.00 (100 cents)" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&quiz_session=${sessionId || ''}&donation=true`;
      const cancelUrl = `${baseUrl}/checkout/cancel`;

      const stripe = await stripeService.getStripe();
      
      const donationAmount = (amount / 100).toFixed(2);
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `KnowRole Donation - $${donationAmount}`,
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

  // Track exported sessions to prevent duplicate Google Sheets exports
  const exportedSessions = new Set<string>();

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
      
      // Auto-export to Google Sheets (only once per session)
      if (feedbackData.sessionId && !exportedSessions.has(feedbackData.sessionId)) {
        exportedSessions.add(feedbackData.sessionId);
        try {
          const { autoExportQuizSession } = await import("./googleSheets");
          const fs = await import("fs");
          const path = await import("path");
          
          const session = await storage.getQuizSession(feedbackData.sessionId);
          if (session) {
            const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
            const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
            const questionsArray = questionsData.questions || questionsData || [];
            const questionsMap = new Map<number, any>();
            questionsArray.forEach((q: any) => questionsMap.set(q.id, q));
            
            await autoExportQuizSession(session, feedbackData, questionsMap);
          }
        } catch (exportError) {
          exportedSessions.delete(feedbackData.sessionId);
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

  // PDF Generation endpoint
  app.post("/api/generate-pdf", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 5, 3600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 PDF generations per hour." });
    }
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const { sessionId, result, mood, tier } = req.body;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const purple = rgb(0.65, 0.55, 0.98);
      const darkPurple = rgb(0.4, 0.3, 0.7);
      const darkBg = rgb(0.04, 0.04, 0.06);
      const cardBg = rgb(0.07, 0.07, 0.1);
      const lightText = rgb(0.97, 0.98, 0.99);
      const mutedText = rgb(0.58, 0.64, 0.72);
      const cyan = rgb(0.4, 0.91, 0.98);
      
      page.drawRectangle({ x: 0, y: 0, width, height, color: darkBg });
      
      let y = height - 50;
      
      page.drawRectangle({ x: 40, y: y - 70, width: width - 80, height: 80, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("KnowYouRole", { x: 55, y: y - 30, size: 32, font: helveticaBold, color: purple });
      page.drawText("Personality Discovery Report", { x: 55, y: y - 55, size: 14, font: helvetica, color: mutedText });
      
      y -= 100;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("YOUR PERSONALITY TYPE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      page.drawText(result?.mbtiType || "XXXX", { x: 55, y: y - 65, size: 48, font: helveticaBold, color: lightText });
      
      page.drawText(result?.title || "Your Unique Type", { x: 55, y: y - 95, size: 16, font: helveticaBold, color: purple });
      
      const spark = result?.spark || "Discover your unique strengths and potential!";
      const sparkLines = spark.length > 70 ? [spark.slice(0, 70), spark.slice(70)] : [spark];
      sparkLines.forEach((line: string, i: number) => {
        page.drawText(line, { x: 55, y: y - 120 - (i * 16), size: 11, font: helveticaOblique, color: mutedText });
      });
      
      page.drawText(`DISC: ${result?.discStyle || "Balanced"}`, { x: 55, y: y - 165, size: 12, font: helvetica, color: mutedText });
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("BIG FIVE PERSONALITY PROFILE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
      const traits = [
        { name: "Openness", key: "O", value: bigFive.O, desc: "Creativity & Curiosity" },
        { name: "Conscientiousness", key: "C", value: bigFive.C, desc: "Organization & Discipline" },
        { name: "Extraversion", key: "E", value: bigFive.E, desc: "Social Energy" },
        { name: "Agreeableness", key: "A", value: bigFive.A, desc: "Empathy & Cooperation" },
        { name: "Neuroticism", key: "N", value: bigFive.N, desc: "Emotional Sensitivity" },
      ];
      
      let traitY = y - 50;
      for (const trait of traits) {
        page.drawText(trait.name, { x: 55, y: traitY, size: 10, font: helveticaBold, color: lightText });
        page.drawText(trait.desc, { x: 180, y: traitY, size: 8, font: helvetica, color: mutedText });
        
        page.drawRectangle({ x: 340, y: traitY - 2, width: 160, height: 12, color: rgb(0.15, 0.15, 0.2) });
        page.drawRectangle({ x: 340, y: traitY - 2, width: Math.min(trait.value * 1.6, 160), height: 12, color: purple });
        
        page.drawText(`${trait.value}%`, { x: 510, y: traitY, size: 10, font: helveticaBold, color: lightText });
        
        traitY -= 26;
      }
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("MOOD BLEND", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      const moodText = mood || "Balanced";
      page.drawText(moodText.length > 25 ? moodText.slice(0, 25) + "..." : moodText, { x: 55, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Your emotional starting point", { x: 55, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      page.drawRectangle({ x: 40 + (width - 90) / 2 + 10, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("AGE TIER", { x: 55 + (width - 90) / 2 + 10, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      page.drawText(tier || "Adult", { x: 55 + (width - 90) / 2 + 10, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Quiz difficulty level", { x: 55 + (width - 90) / 2 + 10, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      y -= 120;
      
      page.drawRectangle({ x: 40, y: 30, width: width - 80, height: 50, color: cardBg });
      page.drawText("Generated by KnowYouRole", { x: 55, y: 55, size: 10, font: helvetica, color: mutedText });
      page.drawText("knowyourole.replit.app", { x: 55, y: 40, size: 9, font: helvetica, color: purple });
      page.drawText(`Session: ${sessionId?.slice(-8) || "N/A"}`, { x: width - 160, y: 48, size: 9, font: helvetica, color: mutedText });
      
      const pdfBytes = await pdfDoc.save();
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=KnowYouRole-Results.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
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


  registerExportRoutes(app);

  registerPremiumRoutes(app);

  return httpServer;
}
