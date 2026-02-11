import { MongoClient, Db, Collection } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;
const MONGODB_DB = process.env.MONGODB_DB || "skillswap";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set. Did you forget to provide your Mongo connection string?");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set before creating MongoClient");
  }
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  await client.connect();
  console.log("MongoDB connected successfully");
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  const mongoClient = await getMongoClient();
  db = mongoClient.db(MONGODB_DB);
  return db;
}

export interface MongoUser {
  _id?: string;
  id: number;
  username: string;
  password: string;
  name: string;
  location: string;
  availability: string;
  bio?: string | null;
  rating: number;
  createdAt: Date;
}

export interface MongoSkill {
  _id?: string;
  id: number;
  userId: number;
  name: string;
  type: "OFFERED" | "WANTED";
  level: string;
  mode: string;
}

export interface MongoSwap {
  _id?: string;
  id: number;
  initiatorId: number;
  receiverId: number;
  offerSkillId: number;
  wantSkillId: number;
  status: string;
  meetingUrl?: string | null;
  isCommunityRequest?: boolean;
  completedByInitiator?: boolean;
  completedByReceiver?: boolean;
  createdAt: Date;
}

export interface MongoReview {
  _id?: string;
  id: number;
  swapId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string | null;
  createdAt: Date;
}

export async function getUsersCollection(): Promise<Collection<MongoUser>> {
  const database = await getDb();
  return database.collection<MongoUser>("users");
}

export async function getSkillsCollection(): Promise<Collection<MongoSkill>> {
  const database = await getDb();
  return database.collection<MongoSkill>("skills");
}

export async function getSwapsCollection(): Promise<Collection<MongoSwap>> {
  const database = await getDb();
  return database.collection<MongoSwap>("swaps");
}

export async function getReviewsCollection(): Promise<Collection<MongoReview>> {
  const database = await getDb();
  return database.collection<MongoReview>("reviews");
}
