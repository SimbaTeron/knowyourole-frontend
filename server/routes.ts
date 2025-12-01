import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import { seedAll } from "./seedData";
import { traitVibes, traitCombinations, adventureArchetypes } from "@shared/schema";

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
  })),
  engagement: z.number(),
  wildcardBoost: z.boolean(),
  criticalWildcard: z.number().optional().default(0),
  firstPrinciplesWildcard: z.number().optional().default(0),
});

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
  
  const mbtiType = [
    mbti.E > mbti.I ? "E" : "I",
    mbti.S > mbti.N ? "S" : "N",
    mbti.T > mbti.F ? "T" : "F",
    mbti.J > mbti.P ? "J" : "P",
  ].join("");

  const discEntries = Object.entries(disc) as [string, number][];
  const primaryDisc = discEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const discStyles: Record<string, string> = {
    D: "Direct Driver",
    I: "Inspiring Influencer", 
    S: "Steady Supporter",
    C: "Careful Analyst",
  };

  const normalize = (val: number) => Math.max(0, Math.min(100, 50 + val * 10));
  const bigFiveProfile = {
    openness: normalize(bigFive.O),
    conscientiousness: normalize(bigFive.C),
    extraversion: normalize(bigFive.E),
    agreeableness: normalize(bigFive.A),
    neuroticism: normalize(bigFive.N),
  };

  let proxyNudge = "";
  if (theme === "random") {
    proxyNudge = "Openness boost detected";
    bigFiveProfile.openness = Math.min(100, bigFiveProfile.openness + 5);
  }

  if (scores.wildcardBoost) {
    proxyNudge = proxyNudge ? `${proxyNudge}, Wildcard engaged` : "Wildcard engaged";
  }

  const mbtiInfo = MBTI_LABELS[mbtiType] || MBTI_LABELS.INTP;

  const mbtiTotal = mbti.E + mbti.I + mbti.S + mbti.N + mbti.T + mbti.F + mbti.J + mbti.P;
  const discTotal = disc.D + disc.I + disc.S + disc.C;
  
  const mbtiT_pct = mbtiTotal > 0 ? (mbti.T / (mbti.T + mbti.F)) * 100 : 50;
  const mbtiN_pct = mbtiTotal > 0 ? (mbti.N / (mbti.S + mbti.N)) * 100 : 50;
  const big5O_pct = bigFiveProfile.openness;
  const discC_pct = discTotal > 0 ? (disc.C / discTotal) * 100 : 25;
  const discI_pct = discTotal > 0 ? (disc.I / discTotal) * 100 : 25;
  
  const criticalWildcardBoost = (scores.criticalWildcard || 0) * 20;
  const firstPrinciplesWildcardBoost = (scores.firstPrinciplesWildcard || 0) * 20;
  
  const criticalProxy = (mbtiT_pct + big5O_pct + discC_pct) / 3;
  const firstPrinciplesProxy = (mbtiN_pct + big5O_pct + discI_pct) / 3;
  
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
    avgResponseTime: scores.responses.reduce((a, b) => a + b.timeSpent, 0) / scores.responses.length,
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

  return httpServer;
}
