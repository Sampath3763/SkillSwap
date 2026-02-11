# SkillSwap Backend API

Express.js backend API for the SkillSwap platform.

## Tech Stack
- Node.js + Express 5
- MongoDB with native driver
- Passport.js authentication
- TypeScript

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=SkillSwap
SESSION_SECRET=your_secure_random_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Development
```bash
npm run dev
```
Server runs on http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Create skill
- `DELETE /api/skills/:id` - Delete skill

### Swaps
- `GET /api/swaps` - List user's swaps
- `POST /api/swaps` - Create swap request
- `PATCH /api/swaps/:id/status` - Update swap status
- `POST /api/swaps/:id/complete` - Mark swap completed
- `GET /api/swaps/help-wanted` - Get community requests

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:userId` - Get user's reviews

### Profile
- `GET /api/profile/:userId` - Get user profile

## Deployment

### Render
1. Connect GitHub repository
2. Select `backend` as root directory
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

### Railway
1. Deploy from GitHub
2. Root directory: `backend`
3. Add environment variables
4. Deploy

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Database Schema

### Collections
- `users` - User accounts
- `skills` - Skills offered/wanted
- `swaps` - Skill exchange sessions
- `reviews` - User reviews
- `counters` - Auto-increment IDs

## Security Features
- Password hashing with bcrypt
- Session management with connect-mongo  
- CORS configuration
- Input validation with Zod
