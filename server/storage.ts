import { type User, type InsertUser, type InsertFeedback, type Feedback } from "@shared/schema";
import { randomUUID } from "crypto";

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
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveQuizSession(session: QuizSession): Promise<QuizSession>;
  getQuizSession(id: string): Promise<QuizSession | undefined>;
  getAllQuizSessions(): Promise<QuizSession[]>;
  saveFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizSessions: Map<string, QuizSession>;
  private feedbackEntries: Map<string, Feedback>;

  constructor() {
    this.users = new Map();
    this.quizSessions = new Map();
    this.feedbackEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
      ...insertFeedback,
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
}

export const storage = new MemStorage();
