import {
  type User,
  type InsertUser,
  type Skill,
  type InsertSkill,
  type Swap,
  type InsertSwap,
  type Review,
  type InsertReview,
} from "./shared/schema.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import {
  getMongoClient,
  getUsersCollection,
  getSkillsCollection,
  getSwapsCollection,
  getReviewsCollection,
  type MongoUser,
  type MongoSkill,
  type MongoSwap,
  type MongoReview,
} from "./mongo";

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Skills
  createSkill(skill: InsertSkill): Promise<Skill>;
  getSkills(params?: { userId?: number; type?: "OFFERED" | "WANTED"; search?: string; excludeCompletedFor?: number }): Promise<(Skill & { user: User })[]>;
  deleteSkill(id: number): Promise<void>;
  getSkill(id: number): Promise<Skill | undefined>;

  // Swaps
  createSwap(swap: InsertSwap): Promise<Swap>;
  getSwaps(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill: Skill; wantSkill: Skill })[]>;
  getSwap(id: number): Promise<Swap | undefined>;
  getHelpWantedRequests(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill?: Skill; wantSkill: Skill })[]>;
  updateSwapStatus(id: number, status: string, meetingUrl?: string): Promise<Swap>;
  rejectOtherPendingSwaps(acceptedSwapId: number, initiatorId: number, wantSkillId: number): Promise<void>;
  acceptOtherCommunityRequests(acceptedSwapId: number, receiverId: number, wantSkillId: number, meetingUrl: string): Promise<void>;
  markSwapCompleted(swapId: number, userId: number): Promise<Swap | null>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviews(userId: number): Promise<(Review & { reviewer: User })[]>;
  updateUserRating(userId: number): Promise<void>;

  // Session
  sessionStore: session.Store;
}

async function getNextId(collectionName: string): Promise<number> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || "SkillSwap");
  const counters = db.collection("counters");
  
  const result = await counters.findOneAndUpdate(
    { _id: collectionName },
    { 
      $inc: { seq: 1 },
      $setOnInsert: { _id: collectionName }
    },
    { upsert: true, returnDocument: "after" }
  );
  
  if (!result || typeof result.seq !== 'number') {
    throw new Error(`Failed to generate ID for ${collectionName}`);
  }
  
  return result.seq as number;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI must be set for Mongo session store");
    }

    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const usersCol = await getUsersCollection();
    const user = await usersCol.findOne({ id } as Partial<MongoUser>);
    return user as unknown as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersCol = await getUsersCollection();
    const user = await usersCol.findOne({ username } as Partial<MongoUser>);
    return user as unknown as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const usersCol = await getUsersCollection();
    const id = await getNextId("users");
    const doc: MongoUser = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      location: insertUser.location,
      availability: insertUser.availability,
      bio: insertUser.bio ?? null,
      rating: 5,
      createdAt: new Date(),
    };
    await usersCol.insertOne(doc);
    return doc as unknown as User;
  }

  // Skills
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const skillsCol = await getSkillsCollection();
    const id = await getNextId("skills");
    const doc: MongoSkill = {
      id,
      userId: (skill as any).userId,
      name: skill.name,
      type: skill.type as "OFFERED" | "WANTED",
      level: skill.level,
      mode: skill.mode,
    };
    await skillsCol.insertOne(doc);
    return doc as unknown as Skill;
  }

  async getSkills(params?: { userId?: number; type?: "OFFERED" | "WANTED"; search?: string; excludeCompletedFor?: number }): Promise<(Skill & { user: User })[]> {
    const skillsCol = await getSkillsCollection();
    const usersCol = await getUsersCollection();
    const swapsCol = await getSwapsCollection();

    const filter: any = {};
    if (params?.userId) filter.userId = params.userId;
    if (params?.type) filter.type = params.type;
    if (params?.search) filter.name = { $regex: params.search, $options: "i" };

    let skillsList = await skillsCol.find(filter).toArray();

    // If excludeCompletedFor is provided, filter out skills where user has completed sessions
    if (params?.excludeCompletedFor) {
      const completedSwaps = await swapsCol.find({
        $or: [
          { initiatorId: params.excludeCompletedFor },
          { receiverId: params.excludeCompletedFor }
        ],
        status: 'completed'
      } as any).toArray();

      // Create a set of completed combinations: userId-skillId
      const completedCombos = new Set<string>();
      completedSwaps.forEach(swap => {
        const otherUserId = swap.initiatorId === params.excludeCompletedFor ? swap.receiverId : swap.initiatorId;
        completedCombos.add(`${otherUserId}-${swap.wantSkillId}`);
      });

      // Filter out skills that have been completed
      skillsList = skillsList.filter(skill => 
        !completedCombos.has(`${skill.userId}-${skill.id}`)
      );
    }

    const userIds = [...new Set(skillsList.map((s) => s.userId))];
    const usersList = await usersCol
      .find({ id: { $in: userIds } } as Partial<MongoUser>)
      .toArray();
    const usersById = new Map<number, MongoUser>();
    usersList.forEach((u) => usersById.set(u.id, u));

    return skillsList.map((s) => ({
      ...(s as unknown as Skill),
      user: usersById.get(s.userId) as unknown as User,
    }));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const skillsCol = await getSkillsCollection();
    const skill = await skillsCol.findOne({ id } as Partial<MongoSkill>);
    return skill as unknown as Skill | undefined;
  }

  async deleteSkill(id: number): Promise<void> {
    const skillsCol = await getSkillsCollection();
    await skillsCol.deleteOne({ id } as Partial<MongoSkill>);
  }

  // Swaps
  async createSwap(swap: InsertSwap): Promise<Swap> {
    const swapsCol = await getSwapsCollection();
    const id = await getNextId("swaps");
    const isCommunityRequest = !(swap as any).offerSkillId;
    const doc: MongoSwap = {
      id,
      initiatorId: swap.initiatorId,
      receiverId: swap.receiverId,
      offerSkillId: (swap as any).offerSkillId || 0,
      wantSkillId: swap.wantSkillId,
      status: (swap as any).status ?? "pending",
      meetingUrl: (swap as any).meetingUrl ?? null,
      isCommunityRequest,
      completedByInitiator: false,
      completedByReceiver: false,
      createdAt: new Date(),
    };
    await swapsCol.insertOne(doc);
    return doc as unknown as Swap;
  }

  async getSwaps(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill: Skill; wantSkill: Skill })[]> {
    const swapsCol = await getSwapsCollection();
    const swapsList = await swapsCol
      .find({ $or: [{ initiatorId: userId }, { receiverId: userId }] } as any)
      .sort({ createdAt: -1 })
      .toArray();

    const userIds = new Set<number>();
    const skillIds = new Set<number>();
    swapsList.forEach((s) => {
      userIds.add(s.initiatorId);
      userIds.add(s.receiverId);
      skillIds.add(s.offerSkillId);
      skillIds.add(s.wantSkillId);
    });

    const usersCol = await getUsersCollection();
    const skillsCol = await getSkillsCollection();

    const [usersList, skillsList] = await Promise.all([
      usersCol
        .find({ id: { $in: Array.from(userIds) } } as any)
        .toArray(),
      skillsCol
        .find({ id: { $in: Array.from(skillIds) } } as any)
        .toArray(),
    ]);

    const usersById = new Map<number, MongoUser>();
    usersList.forEach((u) => usersById.set(u.id, u));

    const skillsById = new Map<number, MongoSkill>();
    skillsList.forEach((s) => skillsById.set(s.id, s));

    return swapsList
      .filter((s) => {
        // Filter out swaps with missing related data
        const hasInitiator = usersById.has(s.initiatorId);
        const hasReceiver = usersById.has(s.receiverId);
        const hasWantSkill = skillsById.has(s.wantSkillId);
        // For community requests, offerSkillId can be 0 or missing
        const isCommunityRequest = !s.offerSkillId || s.offerSkillId === 0;
        const hasOfferSkill = isCommunityRequest || skillsById.has(s.offerSkillId);
        return hasInitiator && hasReceiver && hasOfferSkill && hasWantSkill;
      })
      .map((s) => ({
        ...(s as unknown as Swap),
        initiator: usersById.get(s.initiatorId) as unknown as User,
        receiver: usersById.get(s.receiverId) as unknown as User,
        offerSkill: skillsById.get(s.offerSkillId) as unknown as Skill,
        wantSkill: skillsById.get(s.wantSkillId) as unknown as Skill,
      }));
  }

  async getSwap(id: number): Promise<Swap | undefined> {
    const swapsCol = await getSwapsCollection();
    const swap = await swapsCol.findOne({ id } as Partial<MongoSwap>);
    return swap as unknown as Swap | undefined;
  }

  async getHelpWantedRequests(userId: number): Promise<(Swap & { initiator: User; receiver: User; offerSkill?: Skill; wantSkill: Skill })[]> {
    // Get skills user offers
    const userSkills = await this.getSkills({ userId, type: 'OFFERED' });
    const skillIds = userSkills.map(s => s.id);
    
    console.log(`[getHelpWantedRequests] User ${userId} offers skill IDs:`, skillIds);
    
    if (skillIds.length === 0) return [];
    
    // Find community requests (no offerSkillId or offerSkillId = 0) for these skills
    // Exclude requests initiated by the current user
    const swapsCol = await getSwapsCollection();
    const requests = await swapsCol.find({
      wantSkillId: { $in: skillIds },
      $or: [
        { offerSkillId: { $exists: false } },
        { offerSkillId: 0 }
      ],
      status: 'pending',
      initiatorId: { $ne: userId }  // Don't show user their own requests
    } as any).sort({ createdAt: -1 }).toArray();
    
    console.log(`[getHelpWantedRequests] Found ${requests.length} matching requests:`, requests.map(r => ({ id: r.id, initiatorId: r.initiatorId, wantSkillId: r.wantSkillId, offerSkillId: r.offerSkillId })));
    
    const userIds = new Set<number>();
    const wantSkillIds = new Set<number>();
    requests.forEach((r) => {
      userIds.add(r.initiatorId);
      userIds.add(r.receiverId);
      wantSkillIds.add(r.wantSkillId);
    });

    const usersCol = await getUsersCollection();
    const skillsCol = await getSkillsCollection();

    const [usersList, skillsList] = await Promise.all([
      usersCol.find({ id: { $in: Array.from(userIds) } } as any).toArray(),
      skillsCol.find({ id: { $in: Array.from(wantSkillIds) } } as any).toArray(),
    ]);

    const usersById = new Map<number, MongoUser>();
    usersList.forEach((u) => usersById.set(u.id, u));

    const skillsById = new Map<number, MongoSkill>();
    skillsList.forEach((s) => skillsById.set(s.id, s));

    return requests
      .filter((r) => {
        const hasInitiator = usersById.has(r.initiatorId);
        const hasReceiver = usersById.has(r.receiverId);
        const hasWantSkill = skillsById.has(r.wantSkillId);
        return hasInitiator && hasReceiver && hasWantSkill;
      })
      .map((r) => ({
        ...(r as unknown as Swap),
        initiator: usersById.get(r.initiatorId) as unknown as User,
        receiver: usersById.get(r.receiverId) as unknown as User,
        wantSkill: skillsById.get(r.wantSkillId) as unknown as Skill,
      }));
  }

  async updateSwapStatus(id: number, status: string, meetingUrl?: string): Promise<Swap> {
    const swapsCol = await getSwapsCollection();
    const result = await swapsCol.findOneAndUpdate(
      { id: id },
      { $set: { status: status, meetingUrl: meetingUrl || null } },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new Error("Swap not found");
    }
    return result as unknown as Swap;
  }

  async rejectOtherPendingSwaps(acceptedSwapId: number, initiatorId: number, wantSkillId: number): Promise<void> {
    const swapsCol = await getSwapsCollection();
    // Reject all other pending swaps from the same initiator for the same skill
    await swapsCol.updateMany(
      {
        id: { $ne: acceptedSwapId },
        initiatorId: initiatorId,
        wantSkillId: wantSkillId,
        status: "pending"
      },
      { $set: { status: "rejected" } }
    );
  }

  async acceptOtherCommunityRequests(acceptedSwapId: number, receiverId: number, wantSkillId: number, meetingUrl: string): Promise<void> {
    const swapsCol = await getSwapsCollection();
    // Accept all other pending community requests for the same skill to the same mentor
    // This allows multiple learners to join the same session
    await swapsCol.updateMany(
      {
        id: { $ne: acceptedSwapId },
        receiverId: receiverId,
        wantSkillId: wantSkillId,
        status: "pending",
        $or: [
          { offerSkillId: { $exists: false } },
          { offerSkillId: 0 }
        ]
      } as any,
      { $set: { status: "accepted", meetingUrl: meetingUrl } }
    );
  }

  async markSwapCompleted(swapId: number, userId: number): Promise<Swap | null> {
    const swapsCol = await getSwapsCollection();
    const swap = await swapsCol.findOne({ id: swapId } as any);
    
    if (!swap) return null;
    
    // Determine if user is initiator or receiver
    const isInitiator = swap.initiatorId === userId;
    const isReceiver = swap.receiverId === userId;
    
    if (!isInitiator && !isReceiver) return null;
    
    // Mark as completed by this user
    const updateField = isInitiator ? "completedByInitiator" : "completedByReceiver";
    const otherField = isInitiator ? "completedByReceiver" : "completedByInitiator";
    
    await swapsCol.updateOne(
      { id: swapId } as any,
      { $set: { [updateField]: true } }
    );
    
    // Check if both have marked as completed
    const updatedSwap = await swapsCol.findOne({ id: swapId } as any);
    if (updatedSwap && updatedSwap[updateField] && updatedSwap[otherField]) {
      // Both confirmed - mark status as completed
      await swapsCol.updateOne(
        { id: swapId } as any,
        { $set: { status: "completed" } }
      );
    }
    
    return await swapsCol.findOne({ id: swapId } as any) as unknown as Swap;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const reviewsCol = await getReviewsCollection();
    const id = await getNextId("reviews");
    const doc: MongoReview = {
      id,
      swapId: review.swapId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: new Date(),
    };
    await reviewsCol.insertOne(doc);
    
    // Update the reviewee's rating after adding the review
    await this.updateUserRating(review.revieweeId);
    
    return doc as unknown as Review;
  }

  async getReviews(userId: number): Promise<(Review & { reviewer: User })[]> {
    const reviewsCol = await getReviewsCollection();
    const usersCol = await getUsersCollection();

    const reviewsList = await reviewsCol
      .find({ revieweeId: userId } as any)
      .sort({ createdAt: -1 })
      .toArray();

    const reviewerIds = [...new Set(reviewsList.map((r) => r.reviewerId))];
    const reviewers = await usersCol
      .find({ id: { $in: reviewerIds } } as any)
      .toArray();
    const reviewersById = new Map<number, MongoUser>();
    reviewers.forEach((u) => reviewersById.set(u.id, u));

    return reviewsList.map((r) => ({
      ...(r as unknown as Review),
      reviewer: reviewersById.get(r.reviewerId) as unknown as User,
    }));
  }

  async updateUserRating(userId: number): Promise<void> {
    const reviewsCol = await getReviewsCollection();
    const usersCol = await getUsersCollection();
    
    // Get all reviews for this user
    const reviews = await reviewsCol.find({ revieweeId: userId } as any).toArray();
    
    let newRating = 5; // Default rating
    if (reviews.length > 0) {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      newRating = Math.round(totalRating / reviews.length);
    }
    
    // Update user's rating
    await usersCol.updateOne(
      { id: userId } as any,
      { $set: { rating: newRating } }
    );
  }
}

export const storage = new DatabaseStorage();
