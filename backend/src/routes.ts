import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "./shared/routes.js";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { insertUserSchema } from "./shared/schema.js";
import session from "express-session";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(session({
    store: storage.sessionStore,
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") === "production",
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // API Routes

  // Auth
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const existing = await storage.getUserByUsername(req.body.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
      
      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.user) return res.json(null);
    res.json(req.user);
  });

  // Skills
  app.get(api.skills.list.path, async (req, res) => {
    const params: any = {};
    if (req.query.userId) params.userId = Number(req.query.userId);
    if (req.query.type) params.type = req.query.type;
    if (req.query.search) params.search = req.query.search as string;

    const skills = await storage.getSkills(params);
    res.json(skills);
  });

  app.post(api.skills.create.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    try {
      const skill = await storage.createSkill({
        ...req.body,
        userId: (req.user as any).id,
      });
      res.status(201).json(skill);
    } catch (err) {
      res.status(400).send();
    }
  });

  app.delete(api.skills.delete.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    const skill = await storage.getSkill(Number(req.params.id));
    if (!skill) return res.status(404).send();
    if (skill.userId !== (req.user as any).id) return res.status(401).send();

    await storage.deleteSkill(skill.id);
    res.status(204).send();
  });

  // Swaps
  app.get(api.swaps.list.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    const swaps = await storage.getSwaps((req.user as any).id);
    res.json(swaps);
  });

  // Get community help requests for skills user offers
  app.get("/api/swaps/help-wanted", async (req, res) => {
    if (!req.user) return res.status(401).send();
    try {
      const userId = (req.user as any).id;
      console.log(`[Help Wanted] Fetching for user ${userId}`);
      const helpRequests = await storage.getHelpWantedRequests(userId);
      console.log(`[Help Wanted] Found ${helpRequests.length} requests:`, helpRequests.map(r => ({ id: r.id, initiator: r.initiatorId, wantSkill: r.wantSkillId })));
      res.json(helpRequests);
    } catch (err) {
      console.error('[Help Wanted] Error:', err);
      res.status(500).send();
    }
  });

  app.post(api.swaps.create.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    try {
      const userId = (req.user as any).id;
      const isCommunityRequest = !req.body.offerSkillId;
      
      // For regular swaps, validate user has required skills
      if (!isCommunityRequest) {
        const userSkills = await storage.getSkills({ userId });
        const hasOffered = userSkills.some(s => s.type === "OFFERED");
        const hasWanted = userSkills.some(s => s.type === "WANTED");
        
        if (!hasOffered || !hasWanted) {
          return res.status(400).json({ 
            message: "You must add at least one skill you offer and one skill you want before requesting swaps." 
          });
        }
      }
      
      const swap = await storage.createSwap({
        ...req.body,
        initiatorId: userId,
        status: "pending"
      });
      res.status(201).json(swap);
    } catch (err) {
      res.status(400).send();
    }
  });

  app.patch(api.swaps.updateStatus.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    const swap = await storage.getSwap(Number(req.params.id));
    if (!swap) return res.status(404).send();

    // Logic: Only receiver can accept/reject. 
    // Only accepted swaps can be completed (by either? usually both confirm, but keep simple: either).
    const userId = (req.user as any).id;
    const { status } = req.body;

    if (status === "accepted" || status === "rejected") {
      if (swap.receiverId !== userId) return res.status(401).send();
    }
    
    // Meeting URL generation
    let meetingUrl = undefined;
    if (status === "accepted") {
      meetingUrl = `https://meet.jit.si/SkillSwap-${swap.id}-${Date.now()}`;
      
      // Check if this is a community request (no skill exchange)
      const isCommunityRequest = !swap.offerSkillId || swap.offerSkillId === 0;
      
      if (isCommunityRequest) {
        // For community requests: accept all other pending requests for the same skill
        // Multiple learners can join the same mentoring session
        await storage.acceptOtherCommunityRequests(swap.id, swap.receiverId, swap.wantSkillId, meetingUrl);
        console.log(`[Accept] Auto-accepted other community requests for skill ${swap.wantSkillId} with same meeting URL`);
      } else {
        // For regular swaps: reject other pending requests from same initiator
        // This ensures only one person can accept a specific skill exchange request
        await storage.rejectOtherPendingSwaps(swap.id, swap.initiatorId, swap.wantSkillId);
      }
    }

    const updated = await storage.updateSwapStatus(swap.id, status, meetingUrl);
    res.json(updated);
  });

  // Mark swap as completed by current user
  app.post("/api/swaps/:id/complete", async (req, res) => {
    if (!req.user) return res.status(401).send();
    const userId = (req.user as any).id;
    const swapId = Number(req.params.id);
    
    try {
      const updated = await storage.markSwapCompleted(swapId, userId);
      if (!updated) {
        return res.status(404).json({ message: "Swap not found or unauthorized" });
      }
      res.json(updated);
    } catch (err) {
      console.error('[Complete Swap] Error:', err);
      res.status(500).json({ message: "Failed to mark swap as completed" });
    }
  });

  // Reviews
  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    try {
      const review = await storage.createReview({
        ...req.body,
        reviewerId: (req.user as any).id,
      });
      res.status(201).json(review);
    } catch (err) {
      res.status(400).send();
    }
  });

  app.get(api.reviews.getUserReviews.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.id));
    res.json(reviews);
  });

  // Users
  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).send();

    const skills = await storage.getSkills({ userId: user.id });
    const reviewsReceived = await storage.getReviews(user.id);
    
    res.json({ ...user, skills, reviewsReceived });
  });

  return httpServer;
}
