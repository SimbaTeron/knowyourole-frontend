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

// Research Norms - for z-score normalization (Section 1.3)
export const researchNorms = pgTable("research_norms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trait: text("trait").notNull(), // e.g., "openness", "E", "D"
  framework: text("framework").notNull(), // "bigFive", "mbti", "disc"
  populationMean: integer("population_mean").notNull(), // e.g., 50
  standardDeviation: integer("standard_deviation").notNull(), // e.g., 15
  source: text("source"), // Research source citation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResearchNormsSchema = createInsertSchema(researchNorms).omit({
  id: true,
  createdAt: true,
});

export type InsertResearchNorms = z.infer<typeof insertResearchNormsSchema>;
export type ResearchNorms = typeof researchNorms.$inferSelect;

// Achievement Badges (Section 2.2)
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  badgeName: text("badge_name").notNull(), // "Trailblazer", "Deep Thinker"
  badgeType: text("badge_type").notNull(), // "trait", "speed", "streak", "explorer"
  badgeIcon: text("badge_icon").notNull(), // Icon identifier
  badgeColor: text("badge_color").notNull(), // Color class
  threshold: text("threshold"), // JSON of threshold criteria
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  unlockedAt: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// Quiz Events for Random Pop-ups (Section 2.3)
export const quizEvents = pgTable("quiz_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(), // "wheel_spin", "bonus_question", "trait_reveal"
  eventName: text("event_name").notNull(),
  effect: text("effect").notNull(), // JSON: { reverseTrait: "E", boost: 10 }
  probability: integer("probability").notNull(), // 5-10% chance
  locationTheme: text("location_theme"), // Optional: tied to city themes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizEventSchema = createInsertSchema(quizEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertQuizEvent = z.infer<typeof insertQuizEventSchema>;
export type QuizEvent = typeof quizEvents.$inferSelect;

// Story Nodes for Branching Narratives (Section 2.4)
export const storyNodes = pgTable("story_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mbtiType: text("mbti_type").notNull(), // Which MBTI type this story is for
  nodeIndex: integer("node_index").notNull(), // Position in story
  storyText: text("story_text").notNull(), // The narrative text
  choiceA: text("choice_a"), // First choice
  choiceB: text("choice_b"), // Second choice
  choiceAEffect: text("choice_a_effect"), // JSON: trait adjustments
  choiceBEffect: text("choice_b_effect"), // JSON: trait adjustments
  nextNodeA: integer("next_node_a"), // Next node if choice A
  nextNodeB: integer("next_node_b"), // Next node if choice B
  isEnding: boolean("is_ending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStoryNodeSchema = createInsertSchema(storyNodes).omit({
  id: true,
  createdAt: true,
});

export type InsertStoryNode = z.infer<typeof insertStoryNodeSchema>;
export type StoryNode = typeof storyNodes.$inferSelect;

// Mini Games for Feedback Loop (Section 2.5)
export const miniGames = pgTable("mini_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameType: text("game_type").notNull(), // "match", "sort", "puzzle"
  gameName: text("game_name").notNull(),
  traitTarget: text("trait_target").notNull(), // Which trait it measures
  instructions: text("instructions").notNull(),
  gameData: text("game_data").notNull(), // JSON with game-specific data
  pointsReward: integer("points_reward").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMiniGameSchema = createInsertSchema(miniGames).omit({
  id: true,
  createdAt: true,
});

export type InsertMiniGame = z.infer<typeof insertMiniGameSchema>;
export type MiniGame = typeof miniGames.$inferSelect;

// Badge Definitions - templates for achievable badges
export const badgeDefinitions = pgTable("badge_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(), // "trait", "speed", "streak", "explorer", "special"
  thresholdType: text("threshold_type").notNull(), // "score_above", "score_below", "speed_fast", "combo"
  thresholdValue: text("threshold_value").notNull(), // JSON criteria
  rarity: text("rarity").notNull().default("common"), // "common", "rare", "epic", "legendary"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitions).omit({
  id: true,
  createdAt: true,
});

export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;

// Slider Responses - detailed tracking for slider question responses
export const sliderResponses = pgTable("slider_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  questionId: integer("question_id").notNull(),
  sliderValue: integer("slider_value").notNull(), // -2 to +2
  responseTimeMs: integer("response_time_ms").notNull(),
  framework: text("framework").notNull(), // MBTI, DISC, Big5
  trait: text("trait").notNull(), // Which trait was measured
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSliderResponseSchema = createInsertSchema(sliderResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertSliderResponse = z.infer<typeof insertSliderResponseSchema>;
export type SliderResponse = typeof sliderResponses.$inferSelect;
