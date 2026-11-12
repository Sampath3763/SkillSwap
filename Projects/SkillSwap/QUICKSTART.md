# SkillSwap - Quick Start Guide 🚀

## Option 1: Simple Setup (Recommended for Development)

### Step 1: Install Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env and ensure MongoDB connection
npm start
```

Server should be running at `http://localhost:5000`

### Step 2: Install Frontend (in new terminal)
```bash
cd client
npm install
cp .env.example .env
npm start
```

Frontend will open at `http://localhost:3000`

---

## Option 2: One-Command Setup (Windows)

```bash
start.bat
```

This starts both backend and frontend in separate windows.

---

## Option 3: One-Command Setup (Mac/Linux)

```bash
chmod +x start.sh
./start.sh
```

---

## Option 4: Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# MongoDB: localhost:27017
```

---

## Database Setup

### Local MongoDB
```bash
# On Windows
mongod

# On Mac (with Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

## Seed Sample Data

```bash
cd server
node scripts/seedDatabase.js
```

Login with sample users:
- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123
- david@example.com / password123
- emma@example.com / password123

---

## Troubleshooting

### Port 3000 or 5000 already in use?

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

### MongoDB connection refused?
- Ensure MongoDB is installed and running
- Or use MongoDB Atlas instead (cloud)

### Dependencies missing?
```bash
cd server && npm install
cd ../client && npm install
```

---

## Environment Variables Needed

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Start the application
2. 📝 Sign up / Login with sample credentials
3. 👥 Add skills to your profile
4. 🔍 Search and find skill matches
5. 🤝 Create swap requests
6. ⭐ Rate and review swaps

---

## Support

- Check README.md for detailed documentation
- Run `npm start` for logs/errors
- Check browser console for frontend errors (F12)

**Happy Skill Swapping! 🎉**
