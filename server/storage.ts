import { 
  type User, 
  type UpsertUser,
  type InsertFeedback, 
  type Feedback,
  type InsertQuizResult,
  type QuizResult,
  users,
  quizResults 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface QuizSession {
  id: string;
  tier: string;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  result: {
    mbtiType: string;
    mbtiBlend: string;
    discStyle: string;
    bigFiveProfile: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    title: string;
    spark: string;
    proxyNudge: string;
    engagement: number;
    totalQuestions: number;
    avgResponseTime: number;
  };
  responses: Array<{
    questionId: number;
    choice: 0 | 1;
    timeSpent: number;
    swipeDirection: "left" | "right";
  }>;
  createdAt: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPremium(userId: string, isPremium: boolean): Promise<User | undefined>;
  saveQuizSession(session: QuizSession): Promise<QuizSession>;
  getQuizSession(id: string): Promise<QuizSession | undefined>;
  getAllQuizSessions(): Promise<QuizSession[]>;
  saveFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResultsByUser(userId: string): Promise<QuizResult[]>;
  getQuizResultById(id: string): Promise<QuizResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  private quizSessions: Map<string, QuizSession>;
  private feedbackEntries: Map<string, Feedback>;

  constructor() {
    this.quizSessions = new Map();
    this.feedbackEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async saveQuizSession(session: QuizSession): Promise<QuizSession> {
    this.quizSessions.set(session.id, session);
    return session;
  }

  async getQuizSession(id: string): Promise<QuizSession | undefined> {
    return this.quizSessions.get(id);
  }

  async getAllQuizSessions(): Promise<QuizSession[]> {
    return Array.from(this.quizSessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      sessionId: insertFeedback.sessionId ?? null,
      usefulApp: insertFeedback.usefulApp ?? null,
      resultsAccurate: insertFeedback.resultsAccurate ?? null,
      questionsEngaging: insertFeedback.questionsEngaging ?? null,
      wouldShare: insertFeedback.wouldShare ?? null,
      suggestions: insertFeedback.suggestions ?? null,
      mbtiType: insertFeedback.mbtiType ?? null,
      discStyle: insertFeedback.discStyle ?? null,
      primaryRole: insertFeedback.primaryRole ?? null,
      tier: insertFeedback.tier ?? null,
      mood: insertFeedback.mood ?? null,
      funMode: insertFeedback.funMode ?? null,
      id,
      createdAt: new Date(),
    };
    this.feedbackEntries.set(id, feedback);
    return feedback;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbackEntries.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserPremium(userId: string, isPremium: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isPremium,
        premiumPurchasedAt: isPremium ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async saveQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [quizResult] = await db
      .insert(quizResults)
      .values(result)
      .returning();
    return quizResult;
  }

  async getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(quizResults.createdAt);
  }

  async getQuizResultById(id: string): Promise<QuizResult | undefined> {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, id));
    return result;
  }
}

export const storage = new DatabaseStorage();
