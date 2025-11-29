// WebSocket Service - Real-time communication with Socket.io
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
}

class WebSocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private workspaceSockets: Map<string, Set<string>> = new Map(); // workspaceId -> socketIds

  initializeSocket(httpServer: HttpServer) {
    return this.initialize(httpServer);
  }

  close() {
    if (this.io) {
      this.io.close();
      console.log('🔌 WebSocket server closed');
    }
  }

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 Client connected: ${socket.id} (User: ${socket.userId})`);

      // Track user socket
      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId)!.add(socket.id);
      }

      // Join workspace room
      socket.on('workspace:join', (workspaceId: string) => {
        socket.join(`workspace:${workspaceId}`);
        socket.workspaceId = workspaceId;
        
        if (!this.workspaceSockets.has(workspaceId)) {
          this.workspaceSockets.set(workspaceId, new Set());
        }
        this.workspaceSockets.get(workspaceId)!.add(socket.id);
        
        console.log(`📦 Socket ${socket.id} joined workspace: ${workspaceId}`);
      });

      // Leave workspace room
      socket.on('workspace:leave', (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
        this.workspaceSockets.get(workspaceId)?.delete(socket.id);
        console.log(`📦 Socket ${socket.id} left workspace: ${workspaceId}`);
      });

      // Subscribe to run updates
      socket.on('run:subscribe', (runId: string) => {
        socket.join(`run:${runId}`);
        console.log(`🏃 Socket ${socket.id} subscribed to run: ${runId}`);
      });

      // Unsubscribe from run updates
      socket.on('run:unsubscribe', (runId: string) => {
        socket.leave(`run:${runId}`);
        console.log(`🏃 Socket ${socket.id} unsubscribed from run: ${runId}`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
        
        // Clean up user sockets
        if (socket.userId) {
          this.userSockets.get(socket.userId)?.delete(socket.id);
          if (this.userSockets.get(socket.userId)?.size === 0) {
            this.userSockets.delete(socket.userId);
          }
        }

        // Clean up workspace sockets
        if (socket.workspaceId) {
          this.workspaceSockets.get(socket.workspaceId)?.delete(socket.id);
          if (this.workspaceSockets.get(socket.workspaceId)?.size === 0) {
            this.workspaceSockets.delete(socket.workspaceId);
          }
        }
      });
    });

    console.log('🔌 WebSocket server initialized');
    return this.io;
  }

  // ============================================
  // EMIT METHODS
  // ============================================

  // Emit to specific user
  emitToUser(userId: string, event: string, data: unknown) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && this.io) {
      socketIds.forEach(socketId => {
        this.io!.to(socketId).emit(event, data);
      });
    }
  }

  // Emit to workspace
  emitToWorkspace(workspaceId: string, event: string, data: unknown) {
    if (this.io) {
      this.io.to(`workspace:${workspaceId}`).emit(event, data);
    }
  }

  // Emit to run subscribers
  emitToRun(runId: string, event: string, data: unknown) {
    if (this.io) {
      this.io.to(`run:${runId}`).emit(event, data);
    }
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: unknown) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // ============================================
  // AGENT EVENTS
  // ============================================

  agentCreated(workspaceId: string, agent: unknown) {
    this.emitToWorkspace(workspaceId, 'agent:created', agent);
  }

  agentUpdated(workspaceId: string, agent: unknown) {
    this.emitToWorkspace(workspaceId, 'agent:updated', agent);
  }

  agentDeleted(workspaceId: string, agentId: string) {
    this.emitToWorkspace(workspaceId, 'agent:deleted', { id: agentId });
  }

  // ============================================
  // TASK EVENTS
  // ============================================

  taskCreated(workspaceId: string, task: unknown) {
    this.emitToWorkspace(workspaceId, 'task:created', task);
  }

  taskUpdated(workspaceId: string, task: unknown) {
    this.emitToWorkspace(workspaceId, 'task:updated', task);
  }

  taskDeleted(workspaceId: string, taskId: string) {
    this.emitToWorkspace(workspaceId, 'task:deleted', { id: taskId });
  }

  // ============================================
  // RUN EVENTS
  // ============================================

  runStarted(workspaceId: string, run: unknown) {
    this.emitToWorkspace(workspaceId, 'run:started', run);
  }

  runProgress(runId: string, progress: { step: number; total: number; message: string; taskId?: string }) {
    this.emitToRun(runId, 'run:progress', progress);
  }

  runTaskStarted(runId: string, taskId: string) {
    this.emitToRun(runId, 'run:task:started', { taskId, startedAt: new Date() });
  }

  runTaskCompleted(runId: string, taskId: string, output: string) {
    this.emitToRun(runId, 'run:task:completed', { taskId, output, completedAt: new Date() });
  }

  runCompleted(workspaceId: string, runId: string, result: unknown) {
    this.emitToWorkspace(workspaceId, 'run:completed', { runId, result });
    this.emitToRun(runId, 'run:completed', result);
  }

  runFailed(workspaceId: string, runId: string, error: string) {
    this.emitToWorkspace(workspaceId, 'run:failed', { runId, error });
    this.emitToRun(runId, 'run:failed', { error });
  }

  // ============================================
  // TEAM EVENTS
  // ============================================

  memberJoined(workspaceId: string, member: unknown) {
    this.emitToWorkspace(workspaceId, 'member:joined', member);
  }

  memberLeft(workspaceId: string, userId: string) {
    this.emitToWorkspace(workspaceId, 'member:left', { userId });
  }

  memberRoleChanged(workspaceId: string, userId: string, newRole: string) {
    this.emitToWorkspace(workspaceId, 'member:role:changed', { userId, role: newRole });
  }

  // ============================================
  // NOTIFICATION EVENTS
  // ============================================

  notification(userId: string, notification: { type: string; title: string; message: string; data?: unknown }) {
    this.emitToUser(userId, 'notification', notification);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getWorkspaceConnections(workspaceId: string): number {
    return this.workspaceSockets.get(workspaceId)?.size || 0;
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
export const wsService = webSocketService;
export default webSocketService;
