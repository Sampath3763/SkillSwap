# Structure Verification Script

Write-Host "`n=== SkillSwap Deployment Structure Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check backend structure
Write-Host "📁 Backend Structure:" -ForegroundColor Yellow
if (Test-Path "backend/package.json") { Write-Host "  ✓ package.json" -ForegroundColor Green } else { Write-Host "  ✗ package.json missing" -ForegroundColor Red }
if (Test-Path "backend/tsconfig.json") { Write-Host "  ✓ tsconfig.json" -ForegroundColor Green } else { Write-Host "  ✗ tsconfig.json missing" -ForegroundColor Red }
if (Test-Path "backend/src/index.ts") { Write-Host "  ✓ src/index.ts" -ForegroundColor Green } else { Write-Host "  ✗ src/index.ts missing" -ForegroundColor Red }
if (Test-Path "backend/src/routes.ts") { Write-Host "  ✓ src/routes.ts" -ForegroundColor Green } else { Write-Host "  ✗ src/routes.ts missing" -ForegroundColor Red }
if (Test-Path "backend/src/storage.ts") { Write-Host "  ✓ src/storage.ts" -ForegroundColor Green } else { Write-Host "  ✗ src/storage.ts missing" -ForegroundColor Red }
if (Test-Path "backend/src/mongo.ts") { Write-Host "  ✓ src/mongo.ts" -ForegroundColor Green } else { Write-Host "  ✗ src/mongo.ts missing" -ForegroundColor Red }
if (Test-Path "backend/src/shared") { Write-Host "  ✓ src/shared/" -ForegroundColor Green } else { Write-Host "  ✗ src/shared/ missing" -ForegroundColor Red }
if (Test-Path "backend/.env.example") { Write-Host "  ✓ .env.example" -ForegroundColor Green } else { Write-Host "  ✗ .env.example missing" -ForegroundColor Red }
Write-Host ""

# Check frontend structure
Write-Host "📁 Frontend Structure:" -ForegroundColor Yellow
if (Test-Path "frontend/package.json") { Write-Host "  ✓ package.json" -ForegroundColor Green } else { Write-Host "  ✗ package.json missing" -ForegroundColor Red }
if (Test-Path "frontend/tsconfig.json") { Write-Host "  ✓ tsconfig.json" -ForegroundColor Green } else { Write-Host "  ✗ tsconfig.json missing" -ForegroundColor Red }
if (Test-Path "frontend/vite.config.ts") { Write-Host "  ✓ vite.config.ts" -ForegroundColor Green } else { Write-Host "  ✗ vite.config.ts missing" -ForegroundColor Red }
if (Test-Path "frontend/index.html") { Write-Host "  ✓ index.html" -ForegroundColor Green } else { Write-Host "  ✗ index.html missing" -ForegroundColor Red }
if (Test-Path "frontend/src/main.tsx") { Write-Host "  ✓ src/main.tsx" -ForegroundColor Green } else { Write-Host "  ✗ src/main.tsx missing" -ForegroundColor Red }
if (Test-Path "frontend/src/App.tsx") { Write-Host "  ✓ src/App.tsx" -ForegroundColor Green } else { Write-Host "  ✗ src/App.tsx missing" -ForegroundColor Red }
if (Test-Path "frontend/src/components") { Write-Host "  ✓ src/components/" -ForegroundColor Green } else { Write-Host "  ✗ src/components/ missing" -ForegroundColor Red }
if (Test-Path "frontend/src/shared") { Write-Host "  ✓ src/shared/" -ForegroundColor Green } else { Write-Host "  ✗ src/shared/ missing" -ForegroundColor Red }
if (Test-Path "frontend/.env.example") { Write-Host "  ✓ .env.example" -ForegroundColor Green } else { Write-Host "  ✗ .env.example missing" -ForegroundColor Red }
Write-Host ""

# Check documentation
Write-Host "📚 Documentation:" -ForegroundColor Yellow
if (Test-Path "README.md") { Write-Host "  ✓ README.md" -ForegroundColor Green } else { Write-Host "  ✗ README.md missing" -ForegroundColor Red }
if (Test-Path "DEPLOYMENT.md") { Write-Host "  ✓ DEPLOYMENT.md" -ForegroundColor Green } else { Write-Host "  ✗ DEPLOYMENT.md missing" -ForegroundColor Red }
if (Test-Path "QUICKSTART.md") { Write-Host "  ✓ QUICKSTART.md" -ForegroundColor Green } else { Write-Host "  ✗ QUICKSTART.md missing" -ForegroundColor Red }
if (Test-Path "backend/README.md") { Write-Host "  ✓ backend/README.md" -ForegroundColor Green } else { Write-Host "  ✗ backend/README.md missing" -ForegroundColor Red }
if (Test-Path "frontend/README.md") { Write-Host "  ✓ frontend/README.md" -ForegroundColor Green } else { Write-Host "  ✗ frontend/README.md missing" -ForegroundColor Red }
Write-Host ""

Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test backend: cd backend && npm install && npm run dev" -ForegroundColor White
Write-Host "2. Test frontend: cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "3. Read QUICKSTART.md for deployment instructions" -ForegroundColor White
Write-Host ""
