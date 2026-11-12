#!/bin/bash
# Start both frontend and backend

echo "🚀 SkillSwap - Starting both server and client..."
echo ""

# Start backend in background
echo "📦 Starting backend server on port 5000..."
cd server
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting React frontend on port 3000..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev

# Kill background process when frontend exits
kill $BACKEND_PID
