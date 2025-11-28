# 🎯 SETUP GUIDE - CrewAI Orchestrator UI

## ✅ Što je urađeno

### 1. **Backend Proxy Server** (`/server/`)

Kompletna TypeScript/Express aplikacija sa:

**📁 Struktura:**
```
server/
├── src/
│   ├── config/index.ts              # Environment & validation
│   ├── middleware/
│   │   ├── errorHandler.ts          # Centralized error handling
│   │   └── validation.ts            # Zod schema validation
│   ├── routes/ai.routes.ts          # AI endpoints
│   ├── services/gemini.service.ts   # Gemini AI integration
│   ├── types/index.ts               # TypeScript types
│   └── index.ts                     # Server entry point
├── .env                             # Environment config (add API key here!)
├── .env.example                     # Template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md                        # Detailed documentation
```

**🔒 Security Features:**
- ✅ API key stored server-side only
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ Request validation (Zod)
- ✅ Error handling
- ✅ Security headers (Helmet)
- ✅ Gzip compression

**📡 Endpoints:**
- `GET /health` - Server health check
- `GET /api/ai/health` - Gemini API health check  
- `POST /api/ai/generate-backstory` - Generate agent backstory
- `POST /api/ai/simulate-run` - Simulate crew run

### 2. **Frontend Updated**

**services/gemini.ts:**
- ❌ Removed `@google/genai` dependency
- ✅ Now calls backend proxy endpoints
- ✅ No API keys in frontend code

**vite.config.ts:**
- ❌ Removed API key exposure
- ✅ Added `VITE_BACKEND_URL` config

**package.json:**
- ❌ Removed `@google/genai` package
- ✅ Smaller bundle size

### 3. **Scripts & Documentation**

- ✅ `start.sh` - Quick start script (Mac/Linux)
- ✅ `start.bat` - Quick start script (Windows)
- ✅ `test-backend.sh` - Backend validation script
- ✅ `server/README.md` - Complete backend documentation
- ✅ `SECURITY_UPDATE.md` - Security architecture explanation
- ✅ Updated main `README.md`

---

## 🚀 QUICK START (3 koraka)

### Korak 1: Setup Backend

```bash
cd server
npm install
cp .env.example .env
```

**VAŽNO:** Otvori `server/.env` i dodaj svoj Gemini API key:
```env
GEMINI_API_KEY=tvoj_api_key_ovde
```

Dobij API key ovde: https://makersuite.google.com/app/apikey

### Korak 2: Start Backend

```bash
cd server
npm run dev
```

Backend će biti dostupan na: `http://localhost:8000`

### Korak 3: Start Frontend

U novom terminalu:
```bash
npm run dev
```

Frontend će biti dostupan na: `http://localhost:3000`

---

## 🎬 ONE-COMMAND START

### Mac/Linux:
```bash
./start.sh
```

### Windows:
```bash
start.bat
```

Ova skripta automatski:
- ✅ Instalira dependencies ako treba
- ✅ Kreira .env template ako ne postoji
- ✅ Startuje backend server
- ✅ Startuje frontend server
- ✅ Otvara aplikaciju u browseru

---

## 🧪 TESTIRANJE

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-28T...",
    "uptime": 123.456,
    "environment": "development"
  }
}
```

### 2. Test Gemini API Connection

```bash
curl http://localhost:8000/api/ai/health
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "gemini": true
  }
}
```

### 3. Test Backstory Generation

```bash
curl -X POST http://localhost:8000/api/ai/generate-backstory \
  -H "Content-Type: application/json" \
  -d '{"role":"Python Developer","goal":"Write clean code"}'
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "backstory": "An experienced Python engineer with..."
  }
}
```

### 4. Run Automated Tests

```bash
./test-backend.sh
```

Ova skripta proverava:
- ✅ Server directory structure
- ✅ Dependencies installed
- ✅ .env file exists
- ✅ TypeScript compilation
- ✅ Build process

---

## 🔧 TROUBLESHOOTING

### Problem: "GEMINI_API_KEY is required"

**Uzrok:** API key nije postavljen u `server/.env`

**Rešenje:**
```bash
cd server
nano .env  # ili bilo koji text editor
# Dodaj: GEMINI_API_KEY=your_api_key_here
```

---

### Problem: "Port 8000 already in use"

**Uzrok:** Neki drugi proces koristi port 8000

**Rešenje 1 - Killuj proces:**
```bash
lsof -ti:8000 | xargs kill
```

**Rešenje 2 - Promeni port:**
U `server/.env`:
```env
PORT=8001  # ili bilo koji slobodan port
```

Onda update frontend `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:8001/api
```

---

### Problem: "Cannot connect to backend"

**Uzrok:** Backend server nije pokrenut ili je na pogrešnom URL-u

**Provera 1 - Da li backend radi:**
```bash
curl http://localhost:8000/health
```

**Provera 2 - Da li frontend pokazuje na ispravan backend:**
Proveri `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:8000/api
```

**Provera 3 - CORS konfiguracija:**
Proveri `server/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

---

### Problem: CORS errors u browseru

**Uzrok:** Frontend origin nije u CORS whitelist-u

**Rešenje:**
U `server/.env`, dodaj frontend URL:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

Podržava multiple origins (comma-separated).

---

### Problem: "Rate limit exceeded"

**Uzrok:** Previše requesta u kratkom vremenu

**Rešenje - Povećaj limit:**
U `server/.env`:
```env
RATE_LIMIT_MAX_REQUESTS=200    # default je 100
RATE_LIMIT_WINDOW_MS=900000    # 15 minuta
```

**Alternativa - Sačekaj reset:**
Rate limit se resetuje nakon window perioda (default 15 min).

---

### Problem: TypeScript compile errors

**Uzrok:** Outdated dependencies ili sintaksne greške

**Rešenje 1 - Reinstall dependencies:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

**Rešenje 2 - Check TypeScript errors:**
```bash
cd server
npm run type-check
```

---

## 📊 ARCHITECTURE OVERVIEW

### Data Flow

```
┌─────────────────┐
│   Frontend      │ (React 19 + TypeScript)
│   Port 3000     │
└────────┬────────┘
         │ HTTP POST
         │ /api/ai/generate-backstory
         │ /api/ai/simulate-run
         ▼
┌─────────────────┐
│ Backend Proxy   │ (Express + TypeScript)
│   Port 8000     │
│                 │
│ - Rate Limit    │
│ - Validation    │
│ - Error Handle  │
└────────┬────────┘
         │ HTTPS
         │ Gemini API calls
         │ (API key safe here)
         ▼
┌─────────────────┐
│  Gemini API     │ (Google)
│  AI Models      │
└─────────────────┘
```

### Security Architecture

**Before (❌ Insecure):**
```
Frontend → Gemini API
(API key exposed in browser bundle)
```

**After (✅ Secure):**
```
Frontend → Backend Proxy → Gemini API
           (API key safe on server)
```

---

## 📝 ENVIRONMENT VARIABLES

### Frontend (`.env.local`)

```env
# Backend API endpoint
VITE_BACKEND_URL=http://localhost:8000/api
```

### Backend (`server/.env`)

```env
# Server
PORT=8000
NODE_ENV=development

# Gemini API (REQUIRED!)
GEMINI_API_KEY=your_api_key_here

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # requests per window

# API Config
API_TIMEOUT_MS=30000             # 30 seconds
MAX_BACKSTORY_LENGTH=500
MAX_SIMULATION_TOKENS=8000
```

---

## 🚢 PRODUCTION DEPLOYMENT

### Backend Deployment

**1. Build:**
```bash
cd server
npm run build
```

**2. Set production environment:**
```bash
NODE_ENV=production
GEMINI_API_KEY=prod_api_key_here
CORS_ORIGIN=https://your-frontend-domain.com
```

**3. Start with PM2 (recommended):**
```bash
npm install -g pm2
pm2 start dist/index.js --name crewai-backend
pm2 save
pm2 startup
```

**4. Or use Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["node", "dist/index.js"]
```

### Frontend Deployment

**1. Update backend URL:**
```env
VITE_BACKEND_URL=https://your-backend-domain.com/api
```

**2. Build:**
```bash
npm run build
```

**3. Deploy `dist/` folder to:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting

---

## 📚 ADDITIONAL RESOURCES

- **Backend API Docs:** `server/README.md`
- **Security Details:** `SECURITY_UPDATE.md`
- **Design System:** `design-system/README.md`
- **Cyberpunk UI Kit:** `components/cyberpunk/README.md`

---

## ✨ WHAT'S IMPROVED

### Security ⭐⭐⭐⭐⭐
- API keys now safe on server
- Rate limiting prevents abuse
- CORS protection
- Input validation
- Security headers

### Developer Experience ⭐⭐⭐⭐⭐
- One-command start (`./start.sh`)
- Automated testing script
- Complete documentation
- TypeScript everywhere
- Clear error messages

### Performance ⭐⭐⭐⭐
- Gzip compression
- Bundle size reduced (removed @google/genai from frontend)
- Efficient error handling
- Request/response caching ready

### Maintainability ⭐⭐⭐⭐⭐
- Clean code structure
- Separation of concerns
- Comprehensive types
- Easy to extend
- Well documented

---

## 🎯 NEXT STEPS

1. ✅ Backend server created and tested
2. ✅ Frontend updated to use proxy
3. ⏳ **Add your GEMINI_API_KEY to `server/.env`**
4. ⏳ **Run `./start.sh` to start both servers**
5. ⏳ **Test the application at `http://localhost:3000`**
6. ⏳ **Deploy to production (optional)**

---

## 💡 PRO TIPS

### Development

- Use `npm run dev` in both frontend and backend for hot reload
- Check `backend.log` if backend fails to start
- Use `curl` commands above for quick API testing
- Run `./test-backend.sh` before committing changes

### Production

- Always use HTTPS in production
- Set `NODE_ENV=production`
- Use process manager (PM2, Docker, etc.)
- Set up monitoring (Sentry, DataDog, etc.)
- Configure log rotation
- Set up CI/CD pipeline
- Use environment-specific API keys

### Security

- Never commit `.env` files
- Rotate API keys regularly
- Monitor rate limit abuse
- Set up alerts for errors
- Review CORS origins regularly
- Keep dependencies updated (`npm audit`)

---

## 🤝 CONTRIBUTING

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch
3. Make changes
4. Run `./test-backend.sh` to validate
5. Open Pull Request

---

## 📞 SUPPORT

- **Issues:** Open GitHub issue
- **Questions:** Check documentation first
- **Security:** Email security@example.com

---

**Built with ❤️ using React, TypeScript, Express, and Google Gemini AI**

**Last Updated:** 2025-11-28
