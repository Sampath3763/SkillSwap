import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import dns from 'dns';
import crypto from 'crypto';
import util from 'util';

// Set reliable DNS servers for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server override failed, using system default:', e.message);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sampath3763:Sampath0510@cluster0.tozszet.mongodb.net/SkillSwap?appName=Cluster0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'skillswap_secret_key_12345';

const scryptAsync = util.promisify(crypto.scrypt);

// Helper for scrypt password hashing & checking
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  if (!stored) return false;
  // If stored in scrypt format: <hash>.<salt>
  if (stored.includes('.')) {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
  }
  // Plain text fallback
  return supplied === stored;
}

// Next sequence generator using counters collection
async function getNextSequence(name) {
  const db = mongoose.connection.db;
  const res = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return res.value ? res.value.seq : res.seq;
}

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Session configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Middleware to resolve user identity from Clerk header or session
app.use(async (req, res, next) => {
  try {
    const clerkId = req.headers['x-clerk-user-id'];
    if (clerkId && (!req.session.userId || req.session.clerkId !== clerkId)) {
      const db = mongoose.connection.db;
      if (db) {
        const user = await db.collection('users').findOne({ clerkId });
        if (user) {
          req.session.userId = user.id;
          req.session.clerkId = clerkId;
        }
      }
    }
  } catch (e) {
    console.error('Clerk session resolution error:', e);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ==========================================
// SkillSwap Platform API (Used by Frontend)
// ==========================================

// Clerk User Sync
app.post('/api/user/sync', async (req, res) => {
  try {
    const { clerkId, email, name, username, imageUrl } = req.body;
    if (!clerkId) {
      return res.status(400).json({ message: 'clerkId is required' });
    }

    const db = mongoose.connection.db;
    let user = await db.collection('users').findOne({ clerkId });

    // Try linking with existing demo user by username or email if not linked yet
    if (!user && (username || email)) {
      const query = [];
      if (username) query.push({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } });
      if (email) query.push({ email: email.toLowerCase() });
      user = await db.collection('users').findOne({ $or: query });
      if (user) {
        await db.collection('users').updateOne({ _id: user._id }, { $set: { clerkId } });
        user.clerkId = clerkId;
      }
    }

    if (user) {
      req.session.userId = user.id;
      req.session.clerkId = clerkId;
      const { password: _, ...userWithoutPassword } = user;
      const needsOnboarding = !user.location || !user.availability;
      return res.json({ user: userWithoutPassword, needsOnboarding });
    }

    // New user not yet registered in MongoDB
    return res.json({
      user: null,
      needsOnboarding: true,
      profile: { clerkId, email, name, username, imageUrl }
    });
  } catch (err) {
    console.error('Clerk sync error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clerk User Onboarding (Additional Details: Name, Location, Availability, Bio)
app.post('/api/user/onboarding', async (req, res) => {
  try {
    const { clerkId, name, location, availability, bio, username } = req.body;
    const resolvedClerkId = clerkId || req.headers['x-clerk-user-id'];

    if (!resolvedClerkId || !name || !location || !availability) {
      return res.status(400).json({ message: 'Name, location, and availability are required' });
    }

    const db = mongoose.connection.db;
    let user = await db.collection('users').findOne({ clerkId: resolvedClerkId });

    if (user) {
      // Update existing record
      await db.collection('users').updateOne(
        { id: user.id },
        {
          $set: {
            name: name.trim(),
            location: location.trim(),
            availability,
            bio: bio || null,
          }
        }
      );
      user = await db.collection('users').findOne({ id: user.id });
    } else {
      // Create new user in MongoDB
      const newId = await getNextSequence('users');
      const preferredUsername = (username || name || `user_${newId}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      const newUser = {
        id: newId,
        clerkId: resolvedClerkId,
        username: preferredUsername,
        name: name.trim(),
        location: location.trim(),
        availability,
        bio: bio || null,
        credits: 5,
        rating: 5,
        createdAt: new Date(),
      };

      await db.collection('users').insertOne(newUser);
      user = newUser;
    }

    req.session.userId = user.id;
    req.session.clerkId = resolvedClerkId;

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, needsOnboarding: false });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 1. Auth: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Auth: Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name, location, availability, bio } = req.body;
    if (!username || !password || !name || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = mongoose.connection.db;
    const existing = await db.collection('users').findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);
    const newId = await getNextSequence('users');

    const newUser = {
      id: newId,
      username: username.trim(),
      password: hashedPassword,
      name: name.trim(),
      location: location.trim(),
      availability: availability || 'both',
      bio: bio || null,
      credits: 5,
      rating: 5,
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(newUser);
    req.session.userId = newId;

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Auth: Current User (me)
app.get('/api/user', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ id: req.session.userId });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Auth: Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).send();
  });
});

// 5. Skills: List
app.get('/api/skills', async (req, res) => {
  try {
    const { userId, type, search } = req.query;
    const db = mongoose.connection.db;

    const query = {};
    if (userId) query.userId = parseInt(userId);
    if (type) query.type = type;
    if (search) query.name = { $regex: new RegExp(search, 'i') };

    const skills = await db.collection('skills').find(query).toArray();
    
    // Attach user information to each skill
    const userIds = [...new Set(skills.map((s) => s.userId).filter(Boolean))];
    const users = await db
      .collection('users')
      .find({ id: { $in: userIds } }, { projection: { password: 0 } })
      .toArray();

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = skills.map((s) => ({
      ...s,
      user: userMap.get(s.userId) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Skills list error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. Skills: Create
app.post('/api/skills', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, type, level, mode } = req.body;
    if (!name || !type || !level || !mode) {
      return res.status(400).json({ message: 'All skill fields are required' });
    }

    const newId = await getNextSequence('skills');
    const newSkill = {
      id: newId,
      userId: req.session.userId,
      name: name.trim(),
      type,
      level,
      mode,
    };

    const db = mongoose.connection.db;
    await db.collection('skills').insertOne(newSkill);
    res.status(201).json(newSkill);
  } catch (err) {
    console.error('Skill create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 7. Skills: Delete
app.delete('/api/skills/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const skillId = parseInt(req.params.id);
    const db = mongoose.connection.db;
    const result = await db.collection('skills').deleteOne({
      id: skillId,
      userId: req.session.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Skill delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 8. Swaps: List
app.get('/api/swaps', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUserId = req.session.userId;
    const db = mongoose.connection.db;

    const swaps = await db
      .collection('swaps')
      .find({
        $or: [{ initiatorId: currentUserId }, { receiverId: currentUserId }],
      })
      .toArray();

    // Populate initiator, receiver, offerSkill, wantSkill
    const userIds = [...new Set(swaps.flatMap((s) => [s.initiatorId, s.receiverId]).filter(Boolean))];
    const skillIds = [...new Set(swaps.flatMap((s) => [s.offerSkillId, s.wantSkillId]).filter(Boolean))];

    const users = await db
      .collection('users')
      .find({ id: { $in: userIds } }, { projection: { password: 0 } })
      .toArray();
    const skills = await db.collection('skills').find({ id: { $in: skillIds } }).toArray();

    const userMap = new Map(users.map((u) => [u.id, u]));
    const skillMap = new Map(skills.map((s) => [s.id, s]));

    const result = swaps.map((s) => ({
      ...s,
      initiator: userMap.get(s.initiatorId) || null,
      receiver: userMap.get(s.receiverId) || null,
      offerSkill: skillMap.get(s.offerSkillId) || null,
      wantSkill: skillMap.get(s.wantSkillId) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Swaps list error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 9. Swaps: Help-wanted (Community requests)
app.get('/api/swaps/help-wanted', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const swaps = await db
      .collection('swaps')
      .find({
        $or: [{ isCommunityRequest: true }, { status: 'pending' }],
      })
      .toArray();

    const userIds = [...new Set(swaps.flatMap((s) => [s.initiatorId, s.receiverId]).filter(Boolean))];
    const skillIds = [...new Set(swaps.flatMap((s) => [s.offerSkillId, s.wantSkillId]).filter(Boolean))];

    const users = await db
      .collection('users')
      .find({ id: { $in: userIds } }, { projection: { password: 0 } })
      .toArray();
    const skills = await db.collection('skills').find({ id: { $in: skillIds } }).toArray();

    const userMap = new Map(users.map((u) => [u.id, u]));
    const skillMap = new Map(skills.map((s) => [s.id, s]));

    const result = swaps.map((s) => ({
      ...s,
      initiator: userMap.get(s.initiatorId) || null,
      receiver: userMap.get(s.receiverId) || null,
      offerSkill: skillMap.get(s.offerSkillId) || null,
      wantSkill: skillMap.get(s.wantSkillId) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Help-wanted swaps error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 10. Swaps: Create
app.post('/api/swaps', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { initiatorId, receiverId, offerSkillId, wantSkillId } = req.body;
    const newId = await getNextSequence('swaps');

    const newSwap = {
      id: newId,
      initiatorId: initiatorId || req.session.userId,
      receiverId,
      offerSkillId,
      wantSkillId,
      status: 'pending',
      meetingUrl: null,
      completedByInitiator: false,
      completedByReceiver: false,
      isCommunityRequest: false,
      createdAt: new Date(),
    };

    const db = mongoose.connection.db;
    await db.collection('swaps').insertOne(newSwap);
    res.status(201).json(newSwap);
  } catch (err) {
    console.error('Swap create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 11. Swaps: Update Status (accept, reject, completed)
app.patch('/api/swaps/:id/status', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const swapId = parseInt(req.params.id);
    const { status } = req.body;
    const db = mongoose.connection.db;

    const swap = await db.collection('swaps').findOne({ id: swapId });
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const updateFields = { status };
    if (status === 'accepted') {
      updateFields.meetingUrl = `https://meet.jit.si/SkillSwap-${swap.id}-${Date.now()}`;
    }

    if (status === 'completed') {
      updateFields.completedByInitiator = true;
      updateFields.completedByReceiver = true;
      // Transfer credits
      await db.collection('users').updateOne({ id: swap.initiatorId }, { $inc: { credits: 1 } });
      await db.collection('users').updateOne({ id: swap.receiverId }, { $inc: { credits: 1 } });
    }

    await db.collection('swaps').updateOne({ id: swapId }, { $set: updateFields });
    const updated = await db.collection('swaps').findOne({ id: swapId });
    res.json(updated);
  } catch (err) {
    console.error('Swap status update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 12. Swaps: Mark complete by user
app.post('/api/swaps/:id/complete', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const swapId = parseInt(req.params.id);
    const currentUserId = req.session.userId;
    const db = mongoose.connection.db;

    const swap = await db.collection('swaps').findOne({ id: swapId });
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const isInitiator = swap.initiatorId === currentUserId;
    const isReceiver = swap.receiverId === currentUserId;

    if (!isInitiator && !isReceiver) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateFields = {};
    if (isInitiator) updateFields.completedByInitiator = true;
    if (isReceiver) updateFields.completedByReceiver = true;

    const willBothBeCompleted =
      (isInitiator && swap.completedByReceiver) || (isReceiver && swap.completedByInitiator);

    if (willBothBeCompleted) {
      updateFields.status = 'completed';
      await db.collection('users').updateOne({ id: swap.initiatorId }, { $inc: { credits: 1 } });
      await db.collection('users').updateOne({ id: swap.receiverId }, { $inc: { credits: 1 } });
    }

    await db.collection('swaps').updateOne({ id: swapId }, { $set: updateFields });
    const updated = await db.collection('swaps').findOne({ id: swapId });
    res.json(updated);
  } catch (err) {
    console.error('Swap complete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 13. Reviews: Create
app.post('/api/reviews', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { swapId, revieweeId, rating, comment } = req.body;
    const newId = await getNextSequence('reviews');

    const newReview = {
      id: newId,
      swapId,
      reviewerId: req.session.userId,
      revieweeId,
      rating: Number(rating),
      comment: comment || null,
      createdAt: new Date(),
    };

    const db = mongoose.connection.db;
    await db.collection('reviews').insertOne(newReview);

    // Update user average rating
    const userReviews = await db.collection('reviews').find({ revieweeId }).toArray();
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    await db.collection('users').updateOne({ id: revieweeId }, { $set: { rating: Number(avg.toFixed(1)) } });

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Review create error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 14. Reviews: User Reviews
app.get('/api/users/:id/reviews', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const db = mongoose.connection.db;

    const reviews = await db.collection('reviews').find({ revieweeId: userId }).toArray();
    const reviewerIds = [...new Set(reviews.map((r) => r.reviewerId))];
    const reviewers = await db
      .collection('users')
      .find({ id: { $in: reviewerIds } }, { projection: { password: 0 } })
      .toArray();

    const reviewerMap = new Map(reviewers.map((u) => [u.id, u]));
    const result = reviews.map((r) => ({
      ...r,
      reviewer: reviewerMap.get(r.reviewerId) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('User reviews error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 15. User Profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const db = mongoose.connection.db;

    const user = await db.collection('users').findOne({ id: userId }, { projection: { password: 0 } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skills = await db.collection('skills').find({ userId }).toArray();
    const reviewsReceived = await db.collection('reviews').find({ revieweeId: userId }).toArray();

    res.json({
      ...user,
      skills,
      reviewsReceived,
    });
  } catch (err) {
    console.error('User detail error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 404 Handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Start server and connect to MongoDB Atlas
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✓ Successfully connected to MongoDB Atlas');
    console.log(`✓ Database: ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`✓ SkillSwap API Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB Atlas connection failed:', err.message);
  });

export default app;
