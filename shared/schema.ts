import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id"),
  usefulApp: text("useful_app"),
  resultsAccurate: text("results_accurate"),
  questionsEngaging: text("questions_engaging"),
  wouldShare: text("would_share"),
  suggestions: text("suggestions"),
  mbtiType: text("mbti_type"),
  discStyle: text("disc_style"),
  primaryRole: text("primary_role"),
  tier: text("tier"),
  mood: text("mood"),
  funMode: boolean("fun_mode"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Big Five Trait Vibes - quartile-based personality descriptions
export const traitVibes = pgTable("trait_vibes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trait: text("trait").notNull(), // openness, conscientiousness, extraversion, agreeableness, neuroticism
  quartile: text("quartile").notNull(), // low, low_mid, mid_high, high
  scoreMin: integer("score_min").notNull(), // 0, 26, 51, 76
  scoreMax: integer("score_max").notNull(), // 25, 50, 75, 100
  vibeTitle: text("vibe_title").notNull(), // "The steady traditionalist", etc.
  vibeDescription: text("vibe_description").notNull(), // Full description
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTraitVibeSchema = createInsertSchema(traitVibes).omit({
  id: true,
  createdAt: true,
});

export type InsertTraitVibe = z.infer<typeof insertTraitVibeSchema>;
export type TraitVibe = typeof traitVibes.$inferSelect;

// Trait Combinations - multi-trait personality blends
export const traitCombinations = pgTable("trait_combinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trait1: text("trait_1").notNull(),
  trait1Level: text("trait_1_level").notNull(), // high, low
  trait2: text("trait_2").notNull(),
  trait2Level: text("trait_2_level").notNull(), // high, low
  comboTitle: text("combo_title").notNull(), // "The Creative Spark"
  comboDescription: text("combo_description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTraitCombinationSchema = createInsertSchema(traitCombinations).omit({
  id: true,
  createdAt: true,
});

export type InsertTraitCombination = z.infer<typeof insertTraitCombinationSchema>;
export type TraitCombination = typeof traitCombinations.$inferSelect;

// Adventure Archetypes - for Mini Explorer (ages 12 & under)
export const adventureArchetypes = pgTable("adventure_archetypes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "The Inventor", "The Storyteller", etc.
  superpower: text("superpower").notNull(), // "You turn ideas into amazing things!"
  description: text("description").notNull(), // Longer description
  mission: text("mission").notNull(), // "Build something with cardboard today"
  badgeColor: text("badge_color").notNull(), // Color for the badge icon
  traits: text("traits").notNull(), // JSON string of trait patterns that match this archetype
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdventureArchetypeSchema = createInsertSchema(adventureArchetypes).omit({
  id: true,
  createdAt: true,
});

export type InsertAdventureArchetype = z.infer<typeof insertAdventureArchetypeSchema>;
export type AdventureArchetype = typeof adventureArchetypes.$inferSelect;
