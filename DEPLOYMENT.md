# SkillSwap - Deployment Structure

This repository has been reorganized for separate frontend and backend deployment.

## Project Structure

```
SkillSwap/
├── backend/          # Express API server
├── frontend/         # React + Vite application
├── shared/           # Shared TypeScript types/schemas
└── README.md         # This file
```

## Backend Deployment

### Local Development
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Production Build
```bash
cd backend
npm install
npm run build
npm start
```

### Environment Variables
Create a `.env` file in the `backend` directory:
```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=SkillSwap
SESSION_SECRET=your_secure_random_secret
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment Platforms
- **Render**: Connect GitHub repo, select `backend` folder
- **Railway**: Deploy from `backend` directory
- **Heroku**: Use `cd backend && npm install && npm start`
- **DigitalOcean App Platform**: Select `backend` as source directory

## Frontend Deployment

### Local Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm install
npm run build
# Output will be in frontend/dist/
```

### Environment Variables
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=https://your-backend-api.com
```

### Deployment Platforms
- **Vercel**: 
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  
- **Netlify**:
  - Base Directory: `frontend`
  - Build Command: `npm run build`
  - Publish Directory: `frontend/dist`

- **Cloudflare Pages**:
  - Build Command: `cd frontend && npm install && npm run build`
  - Build Output Directory: `frontend/dist`

## CORS Configuration

Update `backend/src/index.ts` with your production frontend URL:
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Database Setup

1. Create a MongoDB Atlas cluster (or use your own MongoDB instance)
2. Get the connection string
3. Add connection string to backend `.env` file
4. Database collections will be created automatically on first run

## Shared Types

The `shared/` folder contains TypeScript types and Zod schemas used by both frontend and backend. When deploying:

- **Backend**: Already includes shared types (copied during deployment)
- **Frontend**: API types are inferred from backend responses

## Deployment Checklist

### Backend
- [ ] Set all environment variables
- [ ] Configure MongoDB connection
- [ ] Set SESSION_SECRET to a secure random string
- [ ] Set CLIENT_URL to your frontend domain
- [ ] Enable CORS for your frontend domain
- [ ] Test API endpoints

### Frontend
- [ ] Set VITE_API_URL to your backend API domain
- [ ] Update proxy settings if needed
- [ ] Build and test production bundle
- [ ] Verify API calls work with backend

## Recommended Stack

**Backend**: Render or Railway (auto-deploys from GitHub)
**Frontend**: Vercel or Netlify (auto-deploys from GitHub)
**Database**: MongoDB Atlas (free tier available)

## Quick Start Scripts

### Deploy Backend to Render
1. Push to GitHub
2. Connect repository on Render
3. Service: `backend` directory
4. Build: `npm install`
5. Start: `npm start`

### Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

## Support

For issues, check the individual `backend/` and `frontend/` directories for specific configuration files.
