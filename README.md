<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CrewAI Orchestrator UI

🤖 **Multi-Agent AI Orchestration Platform** - React-based dashboard for configuring, managing, and simulating CrewAI agent systems.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933)](https://nodejs.org/)

## 🌟 Features

- ✅ **Visual Agent Builder** - Create and configure AI agents with intuitive UI
- ✅ **Task Flow Designer** - Build complex task workflows with dependencies
- ✅ **Live Execution Console** - Real-time logs and monitoring
- ✅ **Python Code Generator** - Export production-ready CrewAI code
- ✅ **Secure Backend Proxy** - API keys never exposed to frontend
- ✅ **Cyberpunk UI** - Modern dark theme with 3D effects and animations
- ✅ **Fully Responsive** - Mobile-first design (360px - 4K+)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **npm** or **yarn**
- **Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/webdevcom01-cell/crewai-orchestrator-ui.git
cd crewai-orchestrator-ui

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Configuration

**1. Configure Backend (Server)**

```bash
cd server
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**2. Configure Frontend**

Frontend is already configured! Just ensure `.env.local` exists:
```bash
# Already configured in .env.local
VITE_BACKEND_URL=http://localhost:8000/api
```

### Running the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# Server starts on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend starts on http://localhost:3000
```

🎉 Open `http://localhost:3000` in your browser!

## 📁 Project Structure

```
crewai-orchestrator-ui/
├── server/                      # 🔒 Secure backend proxy
│   ├── src/
│   │   ├── config/              # Configuration & validation
│   │   ├── middleware/          # Error handling, validation
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Gemini AI integration
│   │   └── types/               # TypeScript types
│   ├── .env                     # Backend environment (add API key here)
│   └── package.json
│
├── components/                  # React components
│   ├── AgentsView.tsx           # Agent management
│   ├── TasksView.tsx            # Task flow editor
│   ├── CrewView.tsx             # Execution console
│   ├── HistoryView.tsx          # Run history
│   ├── ExportView.tsx           # Code generator
│   ├── cyberpunk/               # Cyberpunk UI kit
│   └── ui/                      # Reusable UI components
│
├── services/                    # Frontend services
│   ├── api.ts                   # REST API client
│   └── gemini.ts                # Backend proxy calls
│
├── hooks/                       # Custom React hooks
│   ├── useOrchestrator.ts       # Context access
│   ├── useAgents.ts             # Agent operations
│   ├── useTasks.ts              # Task operations
│   └── useFlowRun.ts            # Execution management
│
├── design-system/               # Design tokens & components
│   ├── tokens/                  # Colors, typography, spacing
│   ├── components/              # Reusable components
│   └── layouts/                 # Layout components
│
├── reducer.ts                   # State management (Redux-like)
├── types.ts                     # TypeScript types
├── App.tsx                      # Main app component
└── package.json
```

## 🔐 Security Architecture

### Before (❌ Insecure)
```
Frontend → Direct Gemini API Call
(API key exposed in browser)
```

### After (✅ Secure)
```
Frontend → Backend Proxy → Gemini API
           (API key safe on server)
```

**Benefits:**
- 🔒 API key never exposed to client
- ⚡ Rate limiting (100 req/15min)
- 🛡️ Request validation
- 📊 Centralized logging
- 💰 Cost control

See [SECURITY_UPDATE.md](SECURITY_UPDATE.md) for details.

## 🎨 Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript 5.8** - Full type safety
- **Vite 6** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Tailwind CSS** - Utility-first styling (classes only)

### Backend
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe backend
- **Zod** - Schema validation
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection
- **Google Gemini AI** - AI model integration

## 📡 API Reference

### Backend Endpoints

**Health Checks:**
```bash
GET  /health                     # Server health
GET  /api/ai/health              # Gemini API health
```

**AI Operations:**
```bash
POST /api/ai/generate-backstory  # Generate agent backstory
POST /api/ai/simulate-run        # Simulate crew execution
```

See [server/README.md](server/README.md) for detailed API documentation.

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:8000/health

# Gemini API health check
curl http://localhost:8000/api/ai/health

# Generate backstory
curl -X POST http://localhost:8000/api/ai/generate-backstory \
  -H "Content-Type: application/json" \
  -d '{"role":"Developer","goal":"Build apps"}'
```

## 🚢 Production Deployment

### Backend

```bash
cd server
npm run build
NODE_ENV=production npm start
```

**Production Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Secure `GEMINI_API_KEY`
- [ ] Configure production `CORS_ORIGIN`
- [ ] Enable HTTPS (reverse proxy)
- [ ] Set up monitoring
- [ ] Configure firewall

See [server/README.md](server/README.md) for deployment guide.

### Frontend

```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

**Hosting Options:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Docker

## 🎯 Usage Guide

### 1. Create Agents
- Navigate to **Agents** tab
- Click **+ New Agent**
- Configure role, goal, tools, model
- Use AI to generate backstory

### 2. Define Tasks
- Navigate to **Tasks** tab
- Click **+ New Task**
- Add description and expected output
- Assign to agent
- Set dependencies (context from previous tasks)

### 3. Configure Flow
- Navigate to **Run** tab
- Select agents and tasks for your flow
- Choose process type (sequential/hierarchical/parallel)

### 4. Execute & Monitor
- Click **Run Simulation**
- Watch real-time logs in terminal console
- See agents thinking, using tools, completing tasks

### 5. Export Code
- Navigate to **Export** tab
- View generated Python code
- Copy or download files
- Run in your CrewAI environment

## 🎨 Design System

Complete design system with:
- **Tokens**: Colors, typography, spacing, shadows
- **Components**: Buttons, cards, inputs, badges, modals
- **Layouts**: Dashboard, sidebar, page headers
- **Cyberpunk Kit**: 3D effects, animations, dot grid background

See [design-system/README.md](design-system/README.md) for details.

## 🐛 Troubleshooting

### Backend Issues

**Error: "GEMINI_API_KEY is required"**
- Add your API key to `server/.env`
- Restart backend server

**Error: "Port 8000 already in use"**
```bash
lsof -ti:8000 | xargs kill
# Or change PORT in server/.env
```

### Frontend Issues

**CORS errors**
- Ensure backend is running on port 8000
- Check `CORS_ORIGIN` in `server/.env`

**API connection failed**
- Verify backend URL in `.env.local`
- Check backend is accessible: `curl http://localhost:8000/health`

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
VITE_BACKEND_URL=http://localhost:8000/api
```

### Backend (`server/.env`)
```env
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT

## 🔗 Links

- **AI Studio**: https://ai.studio/apps/drive/12I2x0cg-ksd-QH9AwpX98aGGAWvFbpnZ
- **CrewAI**: https://github.com/joaomdmoura/crewAI
- **Gemini API**: https://makersuite.google.com/app/apikey

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [SECURITY_UPDATE.md](SECURITY_UPDATE.md) for security info
- Read [server/README.md](server/README.md) for backend docs

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**
