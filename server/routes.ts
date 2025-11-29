import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";

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

  return httpServer;
}
