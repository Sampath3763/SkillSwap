import { db } from "./db";
import {
  users, skills, swaps, reviews,
  type User, type InsertUser,
  type Skill, type InsertSkill,
  type Swap, type InsertSwap,
  type Review, type InsertReview
} from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Skills
  createSkill(skill: InsertSkill): Promise<Skill>;
  getSkills(params?: { userId?: number; type?: "OFFERED" | "WANTED"; search?: string }): Promise<(Skill & { user: User })[]>;
  deleteSkill(id: number): Promise<void>;
  getSkill(id: number): Promise<Skill | undefined>;

  // Swaps
  createSwap(swap: InsertSwap): Promise<Swap>;
  getSwaps(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill: Skill; wantSkill: Skill })[]>;
  getSwap(id: number): Promise<Swap | undefined>;
  updateSwapStatus(id: number, status: string, meetingUrl?: string): Promise<Swap>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviews(userId: number): Promise<(Review & { reviewer: User })[]>;

  // Session
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Skills
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getSkills(params?: { userId?: number; type?: "OFFERED" | "WANTED"; search?: string }): Promise<(Skill & { user: User })[]> {
    let query = db.select().from(skills).leftJoin(users, eq(skills.userId, users.id));
    const conditions = [];

    if (params?.userId) {
      conditions.push(eq(skills.userId, params.userId));
    }
    if (params?.type) {
      conditions.push(eq(skills.type, params.type));
    }
    if (params?.search) {
      conditions.push(sql`${skills.name} ILIKE ${`%${params.search}%`}`);
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const results = await query;
    return results.map(r => ({ ...r.skills, user: r.users! }));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Swaps
  async createSwap(swap: InsertSwap): Promise<Swap> {
    const [newSwap] = await db.insert(swaps).values(swap).returning();
    return newSwap;
  }

  async getSwaps(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill: Skill; wantSkill: Skill })[]> {
    const results = await db.select({
      swap: swaps,
      initiator: users,
      receiver: { ...users }, // aliased join workaround if needed, but simple join works if distinct
      offerSkill: skills,
      wantSkill: { ...skills }
    })
    .from(swaps)
    .leftJoin(users, eq(swaps.initiatorId, users.id))
    .leftJoin(skills, eq(swaps.offerSkillId, skills.id))
    .innerJoin(users, eq(swaps.receiverId, users.id)) // Actually complex joins in Drizzle need aliases sometimes. 
    // Let's simplify and do manual fetch or proper aliases. 
    // Wait, Drizzle `leftJoin` doesn't auto-alias well for same table twice without explicit `aliasedTable`.
    
    // Simpler approach: Fetch swaps where user is initiator OR receiver
    const userSwaps = await db.select().from(swaps).where(
      or(eq(swaps.initiatorId, userId), eq(swaps.receiverId, userId))
    ).orderBy(desc(swaps.createdAt));

    // Hydrate manually for simplicity to avoid complex alias queries in this quick setup
    const hydratedSwaps = await Promise.all(userSwaps.map(async (s) => {
      const initiator = await this.getUser(s.initiatorId);
      const receiver = await this.getUser(s.receiverId);
      const offerSkill = await this.getSkill(s.offerSkillId);
      const wantSkill = await this.getSkill(s.wantSkillId);
      return {
        ...s,
        initiator: initiator!,
        receiver: receiver!,
        offerSkill: offerSkill!,
        wantSkill: wantSkill!
      };
    }));
    
    return hydratedSwaps;
  }

  async getSwap(id: number): Promise<Swap | undefined> {
    const [swap] = await db.select().from(swaps).where(eq(swaps.id, id));
    return swap;
  }

  async updateSwapStatus(id: number, status: string, meetingUrl?: string): Promise<Swap> {
    const [updated] = await db.update(swaps)
      .set({ status, meetingUrl })
      .where(eq(swaps.id, id))
      .returning();
    return updated;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviews(userId: number): Promise<(Review & { reviewer: User })[]> {
    const results = await db.select().from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
      
    return results.map(r => ({ ...r.reviews, reviewer: r.users! }));
  }
}

export const storage = new DatabaseStorage();
