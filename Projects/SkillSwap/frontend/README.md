# SkillSwap Frontend

React + TypeScript frontend for the SkillSwap platform.

## Tech Stack
- React 18
- TypeScript
- Vite 7
- TanStack Query (React Query)
- Wouter (routing)
- Tailwind CSS
- Radix UI components
- shadcn/ui

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_API_URL=http://localhost:5000
```

### Development
```bash
npm run dev
```
App runs on http://localhost:3000

### Production Build
```bash
npm run build
```
Output in `dist/` folder

## Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/         # shadcn/ui components
│   └── ...         # App-specific components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configs
├── pages/          # Route pages
└── main.tsx        # Entry point
```

## Features
- Authentication (login/register)
- Skill management
- Swap requests
- Community mentorship
- Real-time meetings (Jitsi)
- User reviews & ratings
- Dark/Light theme toggle
- Responsive design

## Deployment

### Vercel
```bash
vercel --prod
```
Or connect GitHub repository:
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Netlify
1. Connect GitHub repository
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`

### Cloudflare Pages
1. Connect GitHub repository
2. Build command: `cd frontend && npm install && npm run build`
3. Build output: `frontend/dist`

### Environment Variables
Add to your deployment platform:
```
VITE_API_URL=https://your-backend-api.com
```

## API Integration
The app uses TanStack Query for data fetching. API base URL is configured via proxy in development and environment variable in production.

### Development Proxy
Vite dev server proxies `/api` requests to backend (configured in `vite.config.ts`)

### Production
Set `VITE_API_URL` to your deployed backend URL

## Theming
Uses CSS variables for theming. Toggle between light/dark mode with the theme switcher in the navbar.

## Components
All UI components are built with:
- Radix UI primitives
- Tailwind CSS styling
- TypeScript types
- Accessible by default

## Code Style
- TypeScript strict mode
- ESLint + Prettier (optional)
- Component-based architecture
- Custom hooks for logic separation
