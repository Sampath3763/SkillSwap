# SkillSwap 

### 📁 Project Structure
```
SkillSwap/
├── backend/           # 🚀 Backend API (Ready for Render/Railway)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   ├── storage.ts
│   │   ├── mongo.ts
│   │   └── shared/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/          # 🎨 React App (Ready for Vercel/Netlify)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── lib/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── .env.example
│   └── README.md
│
├── DEPLOYMENT.md      # 📖 Full deployment guide
├── QUICKSTART.md      # ⚡ Quick start guide
└── README.md          # 📄 This file
```

## Run the project

1. **Backend**
```powershell
cd backend
npm install
# Copy .env or configure manually
npm run dev
```

2. **Frontend** (in another terminal)
```powershell
cd frontend
npm install
npm run dev
```
