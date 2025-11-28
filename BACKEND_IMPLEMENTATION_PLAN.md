# 🚀 Backend Implementacioni Plan (Bez Budžeta)

## 📊 Trenutno Stanje

### ✅ ŠTO IMAMO (Implementirano)
```
✅ Express server sa TypeScript
✅ Gemini AI integracija
✅ Rate limiting (100 req/15min)
✅ CORS zaštita
✅ Helmet security headers
✅ Request validation (Zod)
✅ Error handling
✅ Health check endpoints
✅ Compression (Gzip)
✅ 3 AI endpointa:
   - POST /api/ai/generate-backstory
   - POST /api/ai/simulate-run
   - GET /api/ai/health
```

### ❌ ŠTO NEDOSTAJE (Frontend zahteva, backend NE postoji)

**KRITIČNO - Aplikacija ne radi bez ovoga:**
```
❌ CRUD Endpoints za Agents    (GET/POST/PUT/DELETE /api/agents)
❌ CRUD Endpoints za Tasks     (GET/POST/PUT/DELETE /api/tasks)
❌ CRUD Endpoints za Flows     (GET/POST/PUT/DELETE /api/flows)
❌ Runs Management             (POST /api/flows/{id}/runs, GET /api/runs/{id})
❌ Real-time SSE Events        (GET /api/runs/{id}/events)
❌ Data Persistence            (Trenutno nema baze, sve u memoriji)
```

**ENTERPRISE Features (11 komponenti, 50+ endpointa):**
```
❌ Authentication & RBAC       (Login, Register, JWT, Permissions)
❌ Team Management            (Invite, Remove, Role Update)
❌ Version Control            (Git integration, Restore, Sync)
❌ Monitoring & Analytics     (Metrics, Charts, Error Tracking)
❌ Integrations               (Slack, Discord, Webhooks)
❌ Scheduler                  (Cron jobs, Intervals, Triggers)
❌ Marketplace                (Templates, Install, Search)
❌ API Keys                   (Generate, Revoke, Permissions)
❌ Billing                    (Stripe, Subscriptions, Usage)
❌ White Label                (Branding, Custom Domain, CSS)
❌ Model Switcher             (OpenAI, Claude, Ollama API keys)
```

---

## 🎯 PRIORITETI - Šta prvo implementirati?

### FAZA 1: OSNOVNO FUNKCIONALNO (1-2 dana) 🔴 KRITIČNO
**Cilj:** Aplikacija radi lokalno bez gašenja

```
1. ✅ File-based Persistent Storage (JSON fajlovi umesto baze)
   - agents.json
   - tasks.json  
   - flows.json
   - runs.json
   └─> Razlog: Bez budžeta, bez hostinga baze - JSON fajlovi BESPLATNI

2. ✅ CRUD API Endpoints za osnovne resurse
   GET    /api/agents
   POST   /api/agents
   PUT    /api/agents/:id
   DELETE /api/agents/:id
   
   GET    /api/tasks
   POST   /api/tasks
   PUT    /api/tasks/:id
   DELETE /api/tasks/:id
   
   GET    /api/flows
   POST   /api/flows
   PUT    /api/flows/:id
   DELETE /api/flows/:id
   
   GET    /api/flows/:id/runs
   POST   /api/flows/:id/runs
   GET    /api/runs/:id
   GET    /api/runs/:id/events (SSE)

3. ✅ In-Memory State Management
   - Active runs u memoriji
   - SSE connections
   - Real-time updates
```

**估Time:** 4-6 sati  
**Benefit:** Frontend aplikacija potpuno funkcionalna  
**Cost:** $0 (samo lokalno)

---

### FAZA 2: MINIMALNA BEZBEDNOST (1 dan) 🟡 VAŽNO
**Cilj:** Sigurno postaviti na internet

```
1. ✅ Basic Authentication (bez baze)
   - Hardcoded admin user u .env fajlu
   - JWT token generacija
   - Middleware za protected routes
   
   .env:
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD_HASH=$2b$10$... (bcrypt hash)
   JWT_SECRET=random-secret-key-here

2. ✅ Environment-based Security
   - CORS samo za production domain
   - Rate limiting pooštren (50 req/15min)
   - API key za frontend requests
   - HTTPS only u production

3. ✅ Request Validation (već imamo Zod)
   - Proširiti validaciju za sve endpoints
   - Input sanitization
   - Max payload size (10MB već postavljeno)

4. ✅ Logging & Monitoring (free tools)
   - Winston logger za file logging
   - Error tracking u .log fajlovima
   - Health check monitoring
```

**Time:** 3-4 sata  
**Benefit:** Može na internet bez straha  
**Cost:** $0

---

### FAZA 3: FREE HOSTING (1-2 sata) 🟢 DEPLOYMENT
**Cilj:** Aplikacija dostupna na internetu BESPLATNO

#### Backend Hosting Opcije (BESPLATNE):

**Option A: Railway.app** ⭐ PREPORUČENO
```
✅ Free tier: $5 kredit mesečno (DOVOLJNO za mali projekat)
✅ 512MB RAM, 1GB Storage
✅ Automatic deploys from GitHub
✅ HTTPS built-in
✅ Environment variables
✅ Logs & monitoring
✅ Custom domains (besplatno)

Setup:
1. Push code na GitHub
2. railway.app → New Project → Deploy from GitHub
3. Add env variables (GEMINI_API_KEY, JWT_SECRET, etc.)
4. Deploy! 🚀

Domain: https://your-app.up.railway.app
```

**Option B: Render.com**
```
✅ Free tier (limitirano, ali radi)
✅ 512MB RAM
✅ Automatic deploys
✅ HTTPS built-in
⚠️ Sleep after 15min inactivity (buđenje: 30s)

Setup identičan Railway-u
```

**Option C: Fly.io**
```
✅ Free tier: 3 shared-cpu VMs
✅ 256MB RAM
✅ 3GB persistent storage BESPLATNO
✅ HTTPS built-in
✅ Global CDN

Setup:
flyctl launch
flyctl deploy
```

#### Frontend Hosting (BESPLATNO):

**Vercel** ⭐ NAJBOLJE za React
```
✅ Unlimited deploys
✅ Automatic SSL
✅ Global CDN
✅ Environment variables
✅ Custom domains

Setup:
vercel login
vercel --prod
```

**Netlify** (alternativa)
```
✅ 100GB bandwidth/month
✅ Automatic deploys
✅ Forms & Functions
```

---

### FAZA 4: OPTIMIZACIJA (opciono, kasnije)

```
1. SQLite umesto JSON fajlova
   - Besplatno, file-based (sqlite.db fajl)
   - Better.sqlite3 za Node.js
   - Migracije sa JSON na SQLite
   
2. Redis za caching (FREE opcije)
   - Upstash Redis: 10K req/day free
   - Redis Cloud: 30MB free
   
3. Supabase za kompleksnije potrebe
   - 500MB PostgreSQL free
   - Real-time subscriptions
   - Authentication built-in
   - 50MB file storage
```

---

## 🏗️ Implementacioni Koraci (Detaljno)

### KORAK 1: File-Based Storage Layer (30 min)

**Kreiraj:** `server/src/storage/fileStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

export class FileStorage<T extends { id: string }> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
  }

  async getAll(): Promise<T[]> {
    if (this.cache) return this.cache;
    
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache;
    } catch (error) {
      // File doesn't exist, return empty array
      this.cache = [];
      await this.saveAll(this.cache);
      return this.cache;
    }
  }

  async getById(id: string): Promise<T | undefined> {
    const items = await this.getAll();
    return items.find(item => item.id === id);
  }

  async create(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await this.saveAll(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...updates };
    await this.saveAll(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) return false;
    
    await this.saveAll(filtered);
    return true;
  }

  private async saveAll(items: T[]): Promise<void> {
    this.cache = items;
    await fs.writeFile(
      this.filePath, 
      JSON.stringify(items, null, 2), 
      'utf-8'
    );
  }
}

// Export instances
export const agentsStorage = new FileStorage('agents.json');
export const tasksStorage = new FileStorage('tasks.json');
export const flowsStorage = new FileStorage('flows.json');
export const runsStorage = new FileStorage('runs.json');
```

**Benefiti:**
- ✅ Perzistentni podaci (preživljavaju restart)
- ✅ Jednostavan backup (copy JSON fajlove)
- ✅ Git-friendly (diff-able)
- ✅ 100% besplatno
- ✅ Bez dependency-ja (built-in fs module)

---

### KORAK 2: CRUD Routes (1 sat)

**Kreiraj:** `server/src/routes/agents.routes.ts`

```typescript
import { Router } from 'express';
import { agentsStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Validation schemas
const AgentSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(200),
  goal: z.string().min(1).max(500),
  backstory: z.string().max(1000).optional(),
  tools: z.array(z.string()).optional(),
  verbose: z.boolean().optional(),
  allowDelegation: z.boolean().optional(),
  llmConfig: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().positive(),
  }).optional(),
});

// GET /api/agents
router.get('/', async (req, res, next) => {
  try {
    const agents = await agentsStorage.getAll();
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/:id
router.get('/:id', async (req, res, next) => {
  try {
    const agent = await agentsStorage.getById(req.params.id);
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
      });
    }
    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

// POST /api/agents
router.post('/', validateRequest(AgentSchema), async (req, res, next) => {
  try {
    const agent = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await agentsStorage.create(agent);
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

// PUT /api/agents/:id
router.put('/:id', validateRequest(AgentSchema), async (req, res, next) => {
  try {
    const updated = await agentsStorage.update(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
      });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await agentsStorage.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
      });
    }
    
    res.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Identično napraviti:**
- `tasks.routes.ts`
- `flows.routes.ts`
- `runs.routes.ts`

---

### KORAK 3: Real-time SSE Events (30 min)

**Kreiraj:** `server/src/services/sse.service.ts`

```typescript
import { Response } from 'express';

interface SSEClient {
  id: string;
  runId: string;
  res: Response;
}

class SSEService {
  private clients: Map<string, SSEClient[]> = new Map();

  addClient(runId: string, res: Response): string {
    const clientId = Math.random().toString(36).substring(7);
    
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Add client
    if (!this.clients.has(runId)) {
      this.clients.set(runId, []);
    }
    
    this.clients.get(runId)!.push({ id: clientId, runId, res });
    
    // Cleanup on disconnect
    res.on('close', () => {
      this.removeClient(runId, clientId);
    });
    
    return clientId;
  }

  sendEvent(runId: string, eventType: string, data: any): void {
    const clients = this.clients.get(runId);
    if (!clients) return;
    
    const message = `data: ${JSON.stringify({ type: eventType, data })}\n\n`;
    
    clients.forEach(client => {
      client.res.write(message);
    });
  }

  removeClient(runId: string, clientId: string): void {
    const clients = this.clients.get(runId);
    if (!clients) return;
    
    const filtered = clients.filter(c => c.id !== clientId);
    
    if (filtered.length === 0) {
      this.clients.delete(runId);
    } else {
      this.clients.set(runId, filtered);
    }
  }

  closeRun(runId: string): void {
    const clients = this.clients.get(runId);
    if (!clients) return;
    
    clients.forEach(client => {
      client.res.end();
    });
    
    this.clients.delete(runId);
  }
}

export const sseService = new SSEService();
```

**Dodaj u runs.routes.ts:**

```typescript
// GET /api/runs/:id/events
router.get('/:id/events', async (req, res, next) => {
  try {
    const run = await runsStorage.getById(req.params.id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }
    
    // Setup SSE connection
    sseService.addClient(req.params.id, res);
    
    // Send initial state
    res.write(`data: ${JSON.stringify({ 
      type: 'init', 
      data: run 
    })}\n\n`);
    
  } catch (error) {
    next(error);
  }
});
```

---

### KORAK 4: Basic JWT Authentication (1 sat)

**Kreiraj:** `server/src/middleware/auth.ts`

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, { 
    expiresIn: '7d' 
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string, 
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Middleware
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Attach user to request
    (req as any).user = payload;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Simple hardcoded admin user (u produkciji koristi .env)
export const ADMIN_USER = {
  id: 'admin_001',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '', // bcrypt hash
};
```

**Dodaj u package.json:**
```bash
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

**Update .env:**
```env
# Authentication
JWT_SECRET=your-random-secret-key-min-32-chars-long
ADMIN_EMAIL=admin@crewai.local
ADMIN_PASSWORD_HASH=$2b$10$... # generisati sa bcrypt
```

**Generisi password hash:**
```bash
node -e "console.log(require('bcrypt').hashSync('your-password', 10))"
```

---

### KORAK 5: Protected Routes (15 min)

**Update server/src/index.ts:**

```typescript
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.routes.js';

// Public routes
app.use('/api/auth', authRoutes);
app.get('/health', healthHandler);

// Protected routes
app.use('/api/agents', authenticate, agentsRouter);
app.use('/api/tasks', authenticate, tasksRouter);
app.use('/api/flows', authenticate, flowsRouter);
app.use('/api/runs', authenticate, runsRouter);
app.use('/api/ai', authenticate, aiRoutes);
```

---

## 🚢 DEPLOYMENT STEPS (Railway.app)

### 1. Priprema Koda

**Kreiraj:** `Procfile` (u root direktorijumu)
```
web: cd server && npm start
```

**Update server/package.json:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "postinstall": "npm run build"
  }
}
```

### 2. Railway Setup

```bash
# 1. Push na GitHub
git add .
git commit -m "Add backend implementation"
git push origin main

# 2. Idi na railway.app
# 3. Login sa GitHub accountom
# 4. New Project → Deploy from GitHub Repo
# 5. Izaberi svoj repo
# 6. Railway će automatski detektovati Node.js projekt

# 7. Add Environment Variables (u Railway dashboard):
NODE_ENV=production
PORT=8000
GEMINI_API_KEY=your-real-api-key
JWT_SECRET=your-secret-min-32-chars
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=generated-bcrypt-hash
CORS_ORIGIN=https://your-frontend-url.vercel.app

# 8. Deploy! 🚀
```

**Railway će ti dati:**
- ✅ Public URL: `https://your-app.up.railway.app`
- ✅ Automatic SSL (HTTPS)
- ✅ Auto-deploys on git push
- ✅ Logs & metrics
- ✅ $5/month free credit (dovoljno za development)

### 3. Frontend Deployment (Vercel)

```bash
# 1. Update .env.production
echo "VITE_API_URL=https://your-app.up.railway.app/api" > .env.production

# 2. Deploy
npm install -g vercel
vercel login
vercel --prod

# 3. Vercel će ti dati URL
# https://crewai-orchestrator.vercel.app
```

### 4. Update CORS

**U Railway dashboard, update env variable:**
```
CORS_ORIGIN=https://crewai-orchestrator.vercel.app
```

**Redeploy backend.**

---

## 📋 FINAL CHECKLIST

### Pre Deploya:
- [ ] Svi JSON storage fajlovi committed u git (prazan arrays)
- [ ] .env.example updated sa svim potrebnim vars
- [ ] JWT secret min 32 karaktera
- [ ] Admin password hash generisan
- [ ] GEMINI_API_KEY validan
- [ ] Testiran lokalno (`npm run dev`)
- [ ] Build prolazi (`npm run build`)
- [ ] TypeScript errors riješeni
- [ ] CORS konfigurisan za production domain

### Posle Deploya:
- [ ] Backend health check radi (GET /health)
- [ ] Frontend se konektuje na backend
- [ ] Login radi (POST /api/auth/login)
- [ ] CRUD operacije rade (agents, tasks, flows)
- [ ] SSE events rade (runs/:id/events)
- [ ] Rate limiting aktivan (100 req/15min)
- [ ] Logs vidljivi u Railway dashboard
- [ ] HTTPS forsiran (HTTP redirects)

---

## 💰 COST BREAKDOWN (Mesečno)

| Servis | Tier | Cost |
|--------|------|------|
| **Railway.app** | Free ($5 credit) | $0 |
| **Vercel** | Hobby | $0 |
| **Gemini API** | Free tier | $0* |
| **Domain** (opciono) | Namecheap | $1-10/year |
| **TOTAL** | | **$0/month** |

*Gemini free tier: 15 requests/minute, 1500/day

### Kada Prelazi na Plaćeno?

**Railway.app:**
- $5 credit = ~750h server time/mesec
- Posle $5: $0.000231/GB-hour (~$5-10/month za malo korišćenje)

**Vercel:**
- Free: 100GB bandwidth, unlimited deploys
- Pro ($20/mo): Ako ti treba više

**Gemini API:**
- Free: 15 req/min, 1500 req/day
- Pay-as-you-go: $0.001-0.002 per request (jeftino!)

---

## 🎯 PRIORITETI IMPLEMENTACIJE

### DAN 1 (4-6h):
1. ✅ File storage layer (30min)
2. ✅ CRUD routes (agents, tasks, flows) (2h)
3. ✅ Runs management + SSE (1h)
4. ✅ Testing lokalno (30min)

**Rezultat:** Aplikacija potpuno funkcionalna lokalno

### DAN 2 (3-4h):
1. ✅ JWT authentication (1h)
2. ✅ Protected routes (30min)
3. ✅ Security hardening (1h)
4. ✅ Railway deployment (1h)

**Rezultat:** Aplikacija live na internetu, sigurna

### OPCIONO (kasnije):
- Enterprise features (11 komponenti) → Po potrebi
- SQLite migracija → Kada JSON postane spor
- Redis caching → Za performance boost
- Monitoring → Kada imaš korisnike

---

## 🔒 SECURITY BEST PRACTICES

### Must-Have (Pre Deploya):
1. ✅ HTTPS only (Railway automatski)
2. ✅ Environment variables (ne hardcode secrets)
3. ✅ Rate limiting (već implementirano)
4. ✅ Input validation (Zod schemas)
5. ✅ CORS whitelist (samo production domain)
6. ✅ JWT expiration (7 dana)
7. ✅ Helmet security headers (već implementirano)
8. ✅ Error messages ne otkrivaju detalje sistema

### Nice-to-Have:
- SQL injection protection (N/A, koristimo JSON)
- XSS protection (React automatski escapuje)
- CSRF tokens (ako dodaš cookies)
- Audit logging (za enterprise features)

---

## 📚 RESOURCES

### Free Hosting:
- Railway: https://railway.app
- Render: https://render.com
- Fly.io: https://fly.io
- Vercel: https://vercel.com

### Free Databases:
- Supabase: https://supabase.com (500MB PostgreSQL)
- PlanetScale: https://planetscale.com (5GB MySQL)
- MongoDB Atlas: https://mongodb.com/atlas (512MB)
- Railway PostgreSQL: Built-in, počinje sa $5 credit

### Free Redis:
- Upstash: https://upstash.com (10K req/day)
- Redis Cloud: https://redis.com/cloud (30MB)

### Monitoring (Free):
- Railway Logs: Built-in
- Sentry: https://sentry.io (5K events/month)
- LogRocket: https://logrocket.com (1K sessions/month)
- Better Stack: https://betterstack.com (Free tier)

---

## ❓ FAQ

**Q: Zašto JSON fajlovi umesto prave baze?**  
A: Besplatno, jednostavno, dovoljno za development i male projekte. Kasnije se lako migrira na SQLite ili PostgreSQL.

**Q: Koliko korisnika može podržati?**  
A: Sa JSON storage: 10-50 concurrent usera. Sa SQLite: 100-500. Sa PostgreSQL: 1000+.

**Q: Da li je bezbedno za production?**  
A: Za internal tool ili MVP - DA. Za high-traffic app - prelazi na pravu bazu.

**Q: Šta ako Railway prođe $5 kredit?**  
A: Pređi na Render free tier (ima sleep), ili plati $5-10/month Railway-u (i dalje jeftino).

**Q: Koliko čuva Railway logs?**  
A: 7 dana retention na free tier.

**Q: Mogu li dodati custom domain?**  
A: DA, Railway i Vercel podržavaju custom domene BESPLATNO. Samo registruj domain (namecheap.com $1-10/year).

---

## 🚀 NEXT STEPS

1. **Implementiraj FAZU 1** (File storage + CRUD) - 4h
2. **Testiraj lokalno** - 30min
3. **Implementiraj FAZU 2** (Auth + Security) - 3h
4. **Deploy na Railway** - 1h
5. **Deploy frontend na Vercel** - 30min
6. **Test production** - 1h

**TOTAL TIME: 1-2 radna dana**  
**TOTAL COST: $0 (sa free tierovima)**

---

Spremni smo! Javi šta želiš da uradimo prvo. 🚀
