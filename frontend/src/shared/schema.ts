import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  availability: text("availability").notNull(), // online, offline, both
  bio: text("bio"),
  credits: integer("credits").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // OFFERED, WANTED
  level: text("level").notNull(), // beginner, intermediate, expert
  mode: text("mode").notNull(), // online, offline
});

export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  initiatorId: integer("initiator_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  offerSkillId: integer("offer_skill_id").notNull(),
  wantSkillId: integer("want_skill_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected, completed
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  swapId: integer("swap_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  initiatedSwaps: many(swaps, { relationName: "initiator" }),
  receivedSwaps: many(swaps, { relationName: "receiver" }),
  reviewsWritten: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  initiator: one(users, {
    fields: [swaps.initiatorId],
    references: [users.id],
    relationName: "initiator",
  }),
  receiver: one(users, {
    fields: [swaps.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  offerSkill: one(skills, {
    fields: [swaps.offerSkillId],
    references: [skills.id],
  }),
  wantSkill: one(skills, {
    fields: [swaps.wantSkillId],
    references: [skills.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
  swap: one(swaps, {
    fields: [reviews.swapId],
    references: [swaps.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, rating: true, createdAt: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true, userId: true });
export const insertSwapSchema = createInsertSchema(swaps).omit({ id: true, status: true, meetingUrl: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// API Types
export type LoginRequest = Pick<InsertUser, "username" | "password">;
export type RegisterRequest = InsertUser;
