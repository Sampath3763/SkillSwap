@echo off
REM Start both frontend and backend on Windows

echo 🚀 SkillSwap - Starting both server and client...
echo.

REM Start backend in separate window
echo 📦 Starting backend server on port 5000...
start cmd /k cd server && npm install && npm start

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo ⚛️  Starting React frontend on port 3000...
cd frontend
npm install
npm run dev
