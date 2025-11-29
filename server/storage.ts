import { type User, type InsertUser } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizSessions: Map<string, QuizSession>;

  constructor() {
    this.users = new Map();
    this.quizSessions = new Map();
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
}

export const storage = new MemStorage();
