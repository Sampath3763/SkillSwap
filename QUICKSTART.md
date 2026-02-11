# Quick Start Guide

## Test Separated Structure

### 1. Test Backend
```powershell
cd backend
npm install
# Copy .env from root or create new one
npm run dev
# Backend runs on http://localhost:5000
```

### 2. Test Frontend
```powershell
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

Both should work independently!

## Deploy Backend (Render)

1. Push to GitHub
2. Go to Render dashboard
3. New > Web Service
4. Connect repository
5. Settings:
   - **Name**: skillswap-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables:
   ```
   MONGODB_URI=your_connection_string
   MONGODB_DB=SkillSwap
   SESSION_SECRET=random_secure_string
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
7. Deploy!

## Deploy Frontend (Vercel)

1. Push to GitHub
2. Go to Vercel dashboard
3. Import repository
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
6. Deploy!

## Update CORS

After deploying frontend, update backend CORS:
- Add your frontend URL to `CLIENT_URL` env variable in Render
- Redeploy backend

## Verify Deployment

1. Visit your frontend URL
2. Try registering/logging in
3. Create skills and swaps
4. Test all features

## Troubleshooting

**502 Bad Gateway**: Backend not responding
- Check backend logs in Render
- Verify MongoDB connection string
- Check PORT configuration

**CORS errors**: 
- Update CLIENT_URL in backend
- Redeploy backend after changes

**Can't connect to API**:
- Verify VITE_API_URL in frontend
- Check backend is running
- Test API directly: `https://your-backend.onrender.com/api/me`

## Production Checklist

Backend:
- ✓ MongoDB connection configured
- ✓ SESSION_SECRET set to secure random string
- ✓ CLIENT_URL set to frontend domain
- ✓ All environment variables added
- ✓ CORS enabled for frontend domain

Frontend:
- ✓ VITE_API_URL set to backend domain
- ✓ Build tested locally
- ✓ All features working
- ✓ Responsive design verified
