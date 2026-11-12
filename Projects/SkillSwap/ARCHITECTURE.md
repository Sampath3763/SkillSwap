# SkillSwap - Architecture & Technical Documentation

## System Overview

SkillSwap is a full-stack JavaScript application built with modern web technologies. Here's how everything works together:

```
┌─────────────────────────────────────────────────────────────┐
│                      WEB BROWSER                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │         React Frontend (Port 3000)                     ││
│  │  - Components, Pages, Styling                          ││
│  │  - React Context for State Management                  ││
│  │  - API Service for HTTP Requests                       ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
              ↕ HTTP/REST API (Port 5000)
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Routes → Controllers → Business Logic                 ││
│  │  ├── Auth Routes (signup, login)                       ││
│  │  ├── User Routes (profile, skills)                     ││
│  │  ├── Swap Routes (requests, matching, meetings)        ││
│  │  ├── Review Routes (ratings, feedback)                 ││
│  │  └── Notification Routes (alerts)                      ││
│  └────────────────────────────────────────────────────────┘│
│                         ↕                                   │
│  ┌────────────────────────────────────────────────────────┐│
│  │         Mongoose Models & Controllers                  ││
│  │  ├── User Model (profiles, skills)                     ││
│  │  ├── SkillSwapRequest Model                            ││
│  │  ├── Review Model (ratings)                            ││
│  │  └── Notification Model                                ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
              ↕ Mongoose Driver
┌─────────────────────────────────────────────────────────────┐
│              MONGODB DATABASE                               │
│  ├── Users Collection                                      │
│  ├── SkillSwapRequests Collection                          │
│  ├── Reviews Collection                                    │
│  └── Notifications Collection                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Folder Structure
```
client/src/
├── pages/              # Full page components
│   ├── SignupPage      # User registration
│   ├── LoginPage       # User login
│   ├── Dashboard       # Main dashboard
│   ├── ProfilePage     # User profile management
│   ├── SearchPage      # User search
│   ├── SwapRequestsPage   # Swap request management
│   └── PotentialMatchesPage  # Find matches
│
├── components/         # Reusable UI components
│   ├── Navigation      # Header/navbar
│   ├── SkillForm       # Add/remove skills
│   ├── SwapRequestForm # Propose swaps
│   └── NotificationPanel # Display alerts
│
├── services/           # API integration
│   └── api.js         # HTTP client & endpoints
│
├── context/           # React state management
│   └── AuthContext    # Auth & user state
│
├── App.js             # Main router
└── index.js           # React entry point
```

### Data Flow
1. **User Action** (click button, submit form)
2. **API Call** (via api.js service)
3. **Component State Update** (useState)
4. **Component Re-render** (display new data)
5. **User Sees Update** (immediate feedback)

### State Management
- **AuthContext**: Handles login state, user data, tokens
- **Component State**: Local form inputs, UI toggles
- **API Cache**: Response data stored in component state

---

## Backend Architecture

### Folder Structure
```
server/
├── models/             # Database schemas
│   ├── User.js        # User profile, skills, credits
│   ├── SkillSwapRequest.js  # Swap request details
│   ├── Review.js      # Ratings & feedback
│   └── Notification.js # User alerts
│
├── controllers/        # Business logic
│   ├── authController.js   # Auth operations
│   ├── userController.js   # Profile & skill management
│   ├── swapController.js   # Matching & swaps
│   ├── reviewController.js # Ratings & reviews
│   └── notificationController.js # Notifications
│
├── routes/             # API endpoints
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── swapRoutes.js
│   ├── reviewRoutes.js
│   └── notificationRoutes.js
│
├── middleware/         # Auth & validation
│   └── auth.js        # JWT verification, error handling
│
├── scripts/            # Utilities
│   └── seedDatabase.js # Sample data
│
└── server.js          # Express app entry point
```

### Request Flow
```
HTTP Request
    ↓
Express Middleware (CORS, bodyParser)
    ↓
Route Handler
    ↓
Controller Function
    ↓
Database Query (Mongoose)
    ↓
Response Construction
    ↓
HTTP Response (JSON)
```

### Authentication Flow
```
1. User enters email/password
2. POST /api/auth/login
3. Server hashes password & compares
4. JWT token generated
5. Token sent to client
6. Client stores token in localStorage
7. Token included in future requests
8. Server verifies token in middleware
9. Request allowed/denied based on token validity
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  location: String,
  bio: String,
  availability: String (online/offline/both),
  skillsOffered: [{
    name: String,
    level: String,
    mode: String
  }],
  skillsWanted: [{
    name: String,
    level: String,
    mode: String
  }],
  skillCredits: Number (default: 100),
  completedSwaps: Number,
  averageRating: Number,
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### SkillSwapRequest Collection
```javascript
{
  _id: ObjectId,
  initiatorId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User),
  initiatorOffersSkill: Object,
  initiatorWantsSkill: Object,
  recipientOffersSkill: Object,
  recipientWantsSkill: Object,
  status: String (pending/accepted/rejected/completed),
  message: String,
  proposedDateTime: Date,
  meetingLink: String,
  meetingLinkExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection
```javascript
{
  _id: ObjectId,
  swapRequestId: ObjectId (ref: SkillSwapRequest),
  reviewerId: ObjectId (ref: User),
  revieweeId: ObjectId (ref: User),
  rating: Number (1-5),
  feedback: String,
  skillQuality: Number,
  communication: Number,
  punctuality: Number,
  createdAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (swap_request/swap_accepted/etc),
  title: String,
  message: String,
  relatedSwapRequestId: ObjectId,
  read: Boolean (default: false),
  createdAt: Date
}
```

---

## Key Features & Implementation

### 1. User Authentication
- **Signup**: Validates input, hashes password, creates user, returns JWT
- **Login**: Verifies credentials, generates JWT token
- **Token**: JWT stored in localStorage, sent with each request
- **Verification**: Middleware checks token validity

### 2. Skill Matching Algorithm
```javascript
For each skill user wants:
  Find users who offer that skill
  Check if they want skills we offer
  Filter by location & availability
  Sort by rating & completed swaps
```

### 3. Skill Credits System
- **Initial**: 100 credits
- **Cost**: 10 credits per swap request
- **Reward**: 5 credits when swap completed
- **Purpose**: Prevent spam, encourage completion

### 4. Meeting Link Generation
- Generates unique room ID
- Uses Jitsi Meet service
- Links expire in 24 hours
- Only visible to swap participants

### 5. Notification System
- Real-time notifications for:
  - New swap requests
  - Request accepted/rejected
  - Meeting scheduled
  - Swap completed
- In-app only (no email)
- Mark as read functionality

---

## Security Implementation

### Password Security
```javascript
// During signup
const hashedPassword = await bcryptjs.hash(password, 10);
// Passwords never sent to frontend
```

### JWT Token Security
```javascript
// Token includes: userId, email, expiration
const token = jwt.sign(
  { userId, email },
  JWT_SECRET,
  { expiresIn: '30d' }
);
```

### Route Protection
```javascript
// Middleware checks token before allowing access
app.get('/api/users/profile', authMiddleware, controller);
// Without token = 401 Unauthorized
```

### Data Privacy
- Passwords never returned in API responses
- Private user data filtered in list endpoints
- Meeting links only visible to participants

---

## API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "user": { /* data */ },
  "data": [ /* array */ ]
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## Performance Considerations

### Database
- Indexes on frequently queried fields (email, userId)
- Population of references for related data
- Lean queries to reduce memory

### Frontend
- Lazy loading of pages (React Router)
- Component memoization for expensive renders
- API response caching in state

### Backend
- Connection pooling
- Efficient queries with projections
- Error handling to prevent crashes

---

## Scalability Features

### Current
- MongoDB for flexible schema
- JWT for stateless auth
- Modular controllers

### Future
- Redis for session caching
- Message queue for notifications
- CDN for static assets
- Database replication
- Microservices architecture

---

## Development Best Practices

### Code Organization
- Models handle data schemas
- Controllers handle business logic
- Routes define API endpoints
- Middleware handles cross-cutting concerns

### Error Handling
- Try/catch in all async functions
- Meaningful error messages
- Proper HTTP status codes
- Consistent error response format

### Input Validation
- Required field checks
- Format validation (email, passwords)
- Length limits
- Type checking

---

## Deployment Checklist

- ✅ Set NODE_ENV=production
- ✅ Use real MongoDB URI (Atlas)
- ✅ Set strong JWT_SECRET
- ✅ Configure CORS for production domain
- ✅ Enable HTTPS
- ✅ Set up error monitoring
- ✅ Configure rate limiting
- ✅ Enable request logging
- ✅ Backup database regularly
- ✅ Test all endpoints

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [JWT Tutorial](https://jwt.io/)
- [RESTful API Design](https://restfulapi.net/)

---

**This architecture provides a solid foundation for a scalable, maintainable skill exchange platform!**
