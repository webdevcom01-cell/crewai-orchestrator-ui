import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config, validateConfig } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { csrfTokenGenerator, csrfProtection, csrfTokenEndpoint } from './middleware/csrf.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import flowsRoutes from './routes/flows.routes.js';
import runsRoutes from './routes/runs.routes.js';
import workspacesRoutes from './routes/workspaces.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import schedulesRoutes from './routes/schedules.routes.js';
import apiKeysRoutes from './routes/api-keys.routes.js';
import billingRoutes from './routes/billing.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { webSocketService } from './services/websocket.service.js';

// Validate configuration on startup
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

const app: Express = express();
const httpServer = createServer(app);

// Initialize WebSocket
webSocketService.initializeSocket(httpServer);

// ============================================
// Security & Performance Middleware
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
  crossOriginEmbedderPolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression - Gzip responses
app.use(compression());

// Cookie parser (for CSRF)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CSRF Protection
app.use(csrfTokenGenerator); // Generate token for all requests
app.use('/api/', csrfProtection); // Validate on API routes

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenEndpoint);

// ============================================
// Request Logging
// ============================================

app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(
      `${statusColor} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
});

// ============================================
// Health Check Route
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.env,
    },
  });
});

// ============================================
// API Routes
// ============================================

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/agents', authenticate, agentsRoutes);
app.use('/api/tasks', authenticate, tasksRoutes);
app.use('/api/flows', authenticate, flowsRoutes);
app.use('/api/runs', authenticate, runsRoutes);
app.use('/api/workspaces', authenticate, workspacesRoutes);
app.use('/api/integrations', authenticate, integrationsRoutes);
app.use('/api/schedules', authenticate, schedulesRoutes);
app.use('/api/api-keys', authenticate, apiKeysRoutes);
app.use('/api/billing', billingRoutes); // Has own auth + webhook handler
app.use('/api/upload', authenticate, uploadRoutes);

// Flows-specific runs endpoint (for nested routing)
// Note: Nested routing is handled within flows.routes.ts or runs.routes.ts directly


// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

httpServer.listen(config.server.port, () => {
  console.log('');
  console.log('🚀 ════════════════════════════════════════════════════════════');
  console.log('🤖 CrewAI Orchestrator Backend Server');
  console.log('🚀 ════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`✨ Server running on: http://localhost:${config.server.port}`);
  console.log(`🔌 WebSocket enabled: ws://localhost:${config.server.port}`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`🔐 CORS Origins: ${config.security.corsOrigin.join(', ')}`);
  console.log(`⚡ Rate Limit: ${config.security.rateLimit.maxRequests} req/${config.security.rateLimit.windowMs}ms`);
  console.log('');
  console.log('📍 Available endpoints:');
  console.log(`   GET  /health                        - Server health check`);
  console.log('');
  console.log('   🤖 AI Endpoints:');
  console.log(`   GET  /api/ai/health                 - Gemini API health check`);
  console.log(`   POST /api/ai/generate-backstory     - Generate agent backstory`);
  console.log(`   POST /api/ai/simulate-run           - Simulate crew run`);
  console.log('');
  console.log('   👥 Agents CRUD:');
  console.log(`   GET  /api/agents                    - Get all agents`);
  console.log(`   POST /api/agents                    - Create agent`);
  console.log(`   PUT  /api/agents/:id                - Update agent`);
  console.log(`   DEL  /api/agents/:id                - Delete agent`);
  console.log('');
  console.log('   📋 Tasks CRUD:');
  console.log(`   GET  /api/tasks                     - Get all tasks`);
  console.log(`   POST /api/tasks                     - Create task`);
  console.log(`   PUT  /api/tasks/:id                 - Update task`);
  console.log(`   DEL  /api/tasks/:id                 - Delete task`);
  console.log('');
  console.log('   🔄 Flows CRUD:');
  console.log(`   GET  /api/flows                     - Get all flows`);
  console.log(`   POST /api/flows                     - Create flow`);
  console.log(`   PUT  /api/flows/:id                 - Update flow`);
  console.log(`   DEL  /api/flows/:id                 - Delete flow`);
  console.log('');
  console.log('   ▶️  Runs Management:');
  console.log(`   POST /api/flows/:flowId/runs        - Start new run`);
  console.log(`   GET  /api/flows/:flowId/runs        - Get flow runs`);
  console.log(`   GET  /api/runs/:id                  - Get run details`);
  console.log(`   GET  /api/runs/:id/events           - SSE stream (real-time)`);
  console.log('');
  console.log('   🔌 WebSocket Events:');
  console.log(`   - agentCreated, agentUpdated, agentDeleted`);
  console.log(`   - taskCreated, taskUpdated, taskDeleted`);
  console.log(`   - crewUpdated, runStarted, runUpdated, runCompleted, runFailed`);
  console.log('');
  console.log('🚀 ════════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  webSocketService.close();
  httpServer.close(() => {
    console.log('🛑 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  webSocketService.close();
  httpServer.close(() => {
    console.log('🛑 HTTP server closed');
    process.exit(0);
  });
});

export { webSocketService };
export default app;
