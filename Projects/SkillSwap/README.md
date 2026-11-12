# SkillSwap 🤝

**A Non-Monetary Local Skill Exchange Platform**

SkillSwap is a community-driven platform where users trade skills instead of money. "I'll teach you Python in exchange for resume review" - that's the power of SkillSwap!

## Features ✨

### Core Features
- **User Authentication**: Email/password signup and login with JWT tokens
- **Skill Management**: Add, edit, and manage skills you offer and want to learn
- **Smart Matching**: Automatically find users whose skills complement yours
- **Swap Requests**: Propose and manage skill exchange requests with status tracking
- **Virtual Meetings**: Generate unique meeting links for online skill sessions (Jitsi integration)
- **Reputation System**: Rate and review completed swaps to build trust
- **Skill Credits**: Earn credits by completing swaps and maintain account health
- **Real-time Notifications**: Get notified when swap requests are received or accepted
- **Search & Filter**: Find users by skill, location, and expertise level

### Tech Stack
- **Frontend**: React 18 with modern routing and state management
- **Backend**: Node.js + Express with RESTful API
- **Database**: MongoDB (or compatible MongoDB Atlas)
- **Authentication**: JWT tokens
- **Video Integration**: Jitsi Meet for virtual meetings
- **Deployment**: Ready for Replit, Heroku, or any Node.js hosting

---

## Quick Start 🚀

### Prerequisites
- Node.js 14+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

#### 2. Setup Backend Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and configure:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Start the server:
```bash
npm start
```

You should see: `✓ Server running on port 5000`

#### 3. Setup Frontend

In a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React app:
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## Sample Test Users 👥

### User 1: Alice (Python Developer)
- **Email**: alice@example.com
- **Password**: password123
- **Location**: San Francisco, CA
- **Skills Offered**: Python Programming (Expert), Web Development (Intermediate)
- **Skills Wanted**: Spanish Language, Graphic Design

### User 2: Bob (Designer)
- **Email**: bob@example.com
- **Password**: password123
- **Location**: San Francisco, CA
- **Skills Offered**: Graphic Design (Expert), UX Design (Expert)
- **Skills Wanted**: Python Programming, Photography

### User 3: Carol (Marketing)
- **Email**: carol@example.com
- **Password**: password123
- **Location**: San Francisco, CA
- **Skills Offered**: Social Media Marketing (Expert), Content Writing (Intermediate)
- **Skills Wanted**: Video Editing, Web Development

---

## Create Sample Users

To add the sample users to your database automatically:

```bash
cd server
node scripts/seedDatabase.js
```

### Manual Creation
1. Sign up through the UI at http://localhost:3000/signup
2. Use the sample credentials above
3. Add skills via the Profile page
4. Start creating swap requests!

---

## API Endpoints 📚

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### User Management
- `GET /api/users/profile` - Get your profile
- `PUT /api/users/profile` - Update profile info
- `POST /api/users/skills` - Add a new skill
- `DELETE /api/users/skills` - Remove a skill
- `GET /api/users/search?skillName=Python&location=SF` - Search users
- `GET /api/users/:userId` - Get another user's profile

### Skill Swaps
- `POST /api/swaps/request` - Create swap request
- `POST /api/swaps/request/respond` - Accept/reject swap request
- `GET /api/swaps/requests` - Get all swap requests
- `GET /api/swaps/matches` - Get potential matches
- `POST /api/swaps/complete` - Mark swap as completed
- `POST /api/swaps/meeting-link` - Generate meeting link

### Reviews & Reputation
- `POST /api/reviews/submit` - Submit review after completed swap
- `GET /api/reviews/user/:userId` - Get reviews for a user
- `GET /api/reviews/swap/:swapRequestId` - Get reviews for a swap

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

---

## Project Structure 📁

```
skillswap/
├── server/                    # Express backend
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── SkillSwapRequest.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── swapController.js
│   │   ├── reviewController.js
│   │   └── notificationController.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── swapRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/          # Auth & error handling
│   ├── server.js            # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navigation.js
│   │   │   ├── SkillForm.js
│   │   │   ├── SwapRequestForm.js
│   │   │   └── NotificationPanel.js
│   │   ├── pages/          # Page components
│   │   │   ├── SignupPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── SearchPage.js
│   │   │   ├── SwapRequestsPage.js
│   │   │   └── PotentialMatchesPage.js
│   │   ├── services/       # API client
│   │   │   └── api.js
│   │   ├── context/        # React context
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## Key Features Explained 🔍

### Skill Credits System
- Every user starts with 100 skill credits
- Creating a swap request costs 10 credits
- Completing a swap awards 5 credits to each user
- Helps prevent spam and encourages completing swaps

### Reputation & Ratings
- After a swap is marked complete, users can rate each other (1-5 stars)
- Average rating is displayed on user profiles
- Low-rated users may have reduced visibility
- Ratings factor into search results

### Matching Algorithm
The system matches users by:
1. Finding users who offer skills you want
2. Checking if they want skills you offer
3. Considering location and availability preferences
4. Ranking by reputation and availability

### Virtual Meetings
- When a swap is accepted, users can generate a meeting link
- Links are unique and expire in 24 hours
- Uses Jitsi Meet for secure, no-signup video calls
- Meeting links are only visible to the swap participants

### Notifications
Users are notified when:
- They receive a swap request
- A swap request is accepted/rejected
- A meeting is scheduled
- A swap is completed

---

## Troubleshooting 🔧

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas cloud database

### CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**:
- Check `.env` CORS_ORIGIN matches your frontend URL
- Make sure backend is running on the correct port

### JWT Token Expired
**Solution**:
- Clear browser localStorage
- Login again to get a new token
- Tokens expire in 30 days by default

### React Port Already in Use
```
Something is already running on port 3000
```
**Solution**:
```bash
# Kill the process or use a different port
set PORT=3001 && npm start
```

---

## Deployment 🌐

### Deploy to Heroku

**Backend:**
```bash
cd server
heroku login
heroku create skillswap-api
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your_secret_key
git push heroku main
```

**Frontend (on Vercel/Netlify):**
```bash
cd client
npm run build
# Then deploy the `build` folder to Vercel or Netlify
```

### Deploy to Replit

1. Create new Replit project from GitHub
2. Set up MongoDB Atlas (free tier)
3. Create `.env` file with your MongoDB URI
4. Run both frontend and backend using Replit's multi-pane feature

---

## Environment Variables 🔐

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillswap
JWT_SECRET=your-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
JITSI_DOMAIN=meet.jitsi.is
```

### Client (.env)
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

---

## Security Features 🔒

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ Input validation on all endpoints
- ✅ Protected API routes requiring authentication
- ✅ Meeting links only visible to swap participants
- ✅ User data privacy (passwords not exposed)

---

## Future Enhancements 🚀

- [ ] In-app messaging/chat system
- [ ] Calendar integration for scheduling swaps
- [ ] Payment integration for premium features
- [ ] Mobile app (React Native)
- [ ] AI-powered skill matching
- [ ] Group skill swaps
- [ ] Skill verification system
- [ ] Advanced reporting & analytics
- [ ] Multi-language support

---

## Contributing 🤝

Contributions welcome! Please:
1. Fork the repository
2. Create a branch for your feature
3. Make your changes
4. Submit a pull request

---

## License 📄

MIT License - see LICENSE file for details

---

## Support & Contact 💬

- GitHub Issues: Report bugs and feature requests
- Email: hello@skillswap.com
- Twitter: @SkillSwapApp

---

## Running Tests 🧪

```bash
cd server
npm test

cd ../client
npm test
```

---

## Performance Tips ⚡

- Use MongoDB indexes for faster queries
- Enable gzip compression on server
- Lazy load components in React
- Use .env variables to disable logging in production
- Set up CDN for static assets

---

**Built with ❤️ for the community**
