# CrewAI Orchestrator Backend Server

Backend proxy server za CrewAI Orchestrator UI aplikaciju. Štiti Gemini API ključ i obezbeđuje sigurne AI pozive.

## 🚀 Features

- ✅ **Secure API Key Management** - API ključ nikad ne ide u frontend
- ✅ **Authentication** - JWT based auth sa bcrypt hashing-om
- ✅ **Data Persistence** - File-based JSON storage (besplatno)
- ✅ **Real-time Updates** - Server-Sent Events (SSE) za live monitoring
- ✅ **Rate Limiting** - Zaštita od abuse-a (100 req/15min default)
- ✅ **Request Validation** - Zod schema validacija svih request-ova
- ✅ **Error Handling** - Centralizovan error handling sa detaljnim porukama
- ✅ **CORS Protection** - Konfigurisani allowed origins
- ✅ **Compression** - Gzip kompresija response-ova
- ✅ **Security Headers** - Helmet.js za security headers
- ✅ **TypeScript** - Full type safety
- ✅ **Health Checks** - Server i Gemini API health endpoints

## 📋 Prerequisites

- Node.js 18+ (preporučeno 20+)
- npm ili yarn
- Gemini API key ([dobavi ovde](https://makersuite.google.com/app/apikey))

## 🛠️ Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

1. **Kopiraj environment template:**
```bash
cp .env.example .env
```

2. **Konfiguriši `.env` fajl:**
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Google Gemini API
GEMINI_API_KEY=your_actual_api_key_here

# Authentication
JWT_SECRET=your-random-secret-key-min-32-chars-long
ADMIN_EMAIL=admin@crewai.local
ADMIN_PASSWORD_HASH=$2b$10$... # bcrypt hash (default: admin123)

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# API Configuration
API_TIMEOUT_MS=30000                # 30 seconds
MAX_BACKSTORY_LENGTH=500
MAX_SIMULATION_TOKENS=8000
```

## 🏃 Running

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

## 📡 API Endpoints

### Health Checks

**Server Health:**
```bash
GET /health
```
Response:
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

**Gemini API Health:**
```bash
GET /api/ai/health
```
Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "gemini": true
  }
}
```

### Authentication

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@crewai.local",
  "password": "admin123"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### AI Endpoints (Protected)

**Generate Agent Backstory:**
```bash
POST /api/ai/generate-backstory
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Senior Python Developer",
  "goal": "Write clean, testable, production-ready Python code"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "backstory": "An experienced Python engineer with 10+ years..."
  }
}
```

**Simulate Crew Run:**
```bash
POST /api/ai/simulate-run
Content-Type: application/json

{
  "agents": [...],  // AgentConfig[]
  "tasks": [...],   // TaskConfig[]
  "processType": "sequential",
  "input": { "feature": "user authentication" }
}
```
Response:
```json
{
  "success": true,
  "data": {
    "runId": "uuid-v4",
    "status": "completed",
    "logs": [
      {
        "id": "log-uuid",
        "timestamp": "2025-11-28T...",
        "agent": "ResearchAgent",
        "type": "thought",
        "content": "Analyzing requirements..."
      }
    ],
    "finalOutput": "Implementation complete...",
    "duration": 5432
  }
}
```

## 🔒 Security Features

### Rate Limiting
- **Window:** 15 minutes (configurable)
- **Max Requests:** 100 per window (configurable)
- **Response:** 429 Too Many Requests when exceeded

### CORS Protection
- Konfigurisani allowed origins (default: `http://localhost:3000`)
- Multiple origins podržani (comma-separated u .env)

### Input Validation
- Zod schema validacija svih request body-ja
- Type-safe request handling
- Detaljne validation error poruke

### Security Headers
- Helmet.js middleware za security headers
- Content Security Policy
- XSS Protection
- Frameguard

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── index.ts              # Configuration & validation
│   ├── middleware/
│   │   ├── errorHandler.ts       # Error handling middleware
│   │   └── validation.ts         # Request validation middleware
│   ├── routes/
│   │   └── ai.routes.ts          # AI endpoints
│   ├── services/
│   │   └── gemini.service.ts     # Gemini AI service
│   ├── types/
│   │   └── index.ts              # TypeScript types & schemas
│   └── index.ts                  # App entry point
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Generate backstory
curl -X POST http://localhost:8000/api/ai/generate-backstory \
  -H "Content-Type: application/json" \
  -d '{"role":"Developer","goal":"Build apps"}'

# Gemini health
curl http://localhost:8000/api/ai/health
```

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY is required"
- Proveri da je `.env` fajl kreiran
- Proveri da je `GEMINI_API_KEY` postavljen u `.env`
- Restart server nakon promene `.env` fajla

### Error: "Port 8000 already in use"
- Promeni `PORT` u `.env` fajlu
- Ili killuj postojeći proces: `lsof -ti:8000 | xargs kill`

### CORS errors u browseru
- Proveri da je frontend origin dodao u `CORS_ORIGIN`
- Format: `http://localhost:3000` (bez trailing slash)
- Multiple origins: `http://localhost:3000,http://localhost:5173`

### Rate limit exceeded
- Smanji broj request-ova ili povećaj `RATE_LIMIT_MAX_REQUESTS`
- Rate limit se resetuje nakon `RATE_LIMIT_WINDOW_MS` millisekundi

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `8000` | No |
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `GEMINI_API_KEY` | Google Gemini API key | - | **Yes** |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` (15min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `API_TIMEOUT_MS` | API timeout in ms | `30000` (30s) | No |
| `MAX_BACKSTORY_LENGTH` | Max backstory characters | `500` | No |
| `MAX_SIMULATION_TOKENS` | Max AI output tokens | `8000` | No |

## 🚀 Production Deployment

### Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use process manager (PM2, Docker, etc.)
- [ ] Set secure `GEMINI_API_KEY`
- [ ] Configure production `CORS_ORIGIN`
- [ ] Enable HTTPS (reverse proxy)
- [ ] Set up monitoring (logs, errors)
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable error tracking (Sentry, etc.)

### PM2 Deployment
```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name crewai-backend
pm2 save
pm2 startup
```

### Docker Deployment
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

## 🔗 Integration with Frontend

Update frontend `services/api.ts`:
```typescript
// Before (insecure)
const API_BASE_URL = 'direct-gemini-call'; // ❌ API key exposed

// After (secure)
const API_BASE_URL = 'http://localhost:8000/api'; // ✅ Backend proxy
```

Update `services/gemini.ts`:
```typescript
// Replace direct Gemini calls with backend proxy calls
export const generateAgentBackstory = async (role: string, goal: string) => {
  const response = await fetch(`${API_BASE_URL}/ai/generate-backstory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, goal })
  });
  return response.json();
};
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📞 Support

Za pitanja i bug reports, otvori issue na GitHub-u.
