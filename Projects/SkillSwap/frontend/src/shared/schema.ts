import { z } from "zod";

// Type definitions
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  location: string;
  availability: string;
  bio: string | null;
  credits: number;
  rating: number;
  createdAt: Date | null;
}

export interface Skill {
  id: number;
  userId: number;
  name: string;
  type: string;
  level: string;
  mode: string;
}

export interface Swap {
  id: number;
  initiatorId: number;
  receiverId: number;
  offerSkillId: number;
  wantSkillId: number;
  status: string;
  meetingUrl: string | null;
  completedByInitiator: boolean;
  completedByReceiver: boolean;
  createdAt: Date | null;
}

export interface Review {
  id: number;
  swapId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment: string | null;
  createdAt: Date | null;
}

// Zod validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().min(1),
  location: z.string().min(1),
  availability: z.enum(["online", "offline", "both"]),
  bio: z.string().optional(),
});

export const insertSkillSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["OFFERED", "WANTED"]),
  level: z.enum(["beginner", "intermediate", "expert"]),
  mode: z.enum(["online", "offline"]),
});

export const insertSwapSchema = z.object({
  initiatorId: z.number(),
  receiverId: z.number(),
  offerSkillId: z.number(),
  wantSkillId: z.number(),
});

export const insertReviewSchema = z.object({
  swapId: z.number(),
  reviewerId: z.number(),
  revieweeId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Insert types (inferred from Zod schemas)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// API Types
export type LoginRequest = Pick<InsertUser, "username" | "password">;
export type RegisterRequest = InsertUser;

