import type { Express, Request, Response } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { traitVibes, adventureArchetypes } from "@shared/schema";

export function registerTraitRoutes(app: Express) {
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

  app.post("/api/adventure-archetype", async (req: Request, res: Response) => {
    try {
      const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = req.body;
      
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

  app.get("/api/adventure-archetypes", async (_req: Request, res: Response) => {
    try {
      const archetypes = await db.select().from(adventureArchetypes);
      res.json({ archetypes });
    } catch (error) {
      console.error("Archetypes fetch error:", error);
      res.status(500).json({ error: "Failed to fetch archetypes" });
    }
  });
}
