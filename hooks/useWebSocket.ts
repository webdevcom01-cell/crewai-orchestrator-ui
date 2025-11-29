import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket event types
export type WebSocketEventType =
  | 'agentCreated'
  | 'agentUpdated'
  | 'agentDeleted'
  | 'taskCreated'
  | 'taskUpdated'
  | 'taskDeleted'
  | 'crewCreated'
  | 'crewUpdated'
  | 'crewDeleted'
  | 'runStarted'
  | 'runUpdated'
  | 'runCompleted'
  | 'runFailed'
  | 'notification';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
}

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  workspaceId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: (workspaceId: string) => void;
  on: <T = any>(event: WebSocketEventType, callback: (data: T) => void) => void;
  off: (event: WebSocketEventType, callback?: (...args: any[]) => void) => void;
  emit: <T = any>(event: string, data: T) => void;
}

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000';

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = DEFAULT_WS_URL,
    autoConnect = true,
    workspaceId,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventHandlersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken') || '';
  }, []);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const token = getAuthToken();
    
    socketRef.current = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current.on('connect', () => {
      console.log('[WebSocket] Connected:', socketRef.current?.id);
      setIsConnected(true);
      onConnect?.();

      // Auto-join workspace if provided
      if (workspaceId) {
        socketRef.current?.emit('joinRoom', workspaceId);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      onError?.(error);
    });

    socketRef.current.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
      onError?.(new Error(error.message || 'WebSocket error'));
    });

    // Re-register all event handlers
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        socketRef.current?.on(event, handler);
      });
    });
  }, [url, getAuthToken, workspaceId, onConnect, onDisconnect, onError]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Join a workspace room
  const joinWorkspace = useCallback((wsId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', wsId);
    }
  }, []);

  // Leave a workspace room
  const leaveWorkspace = useCallback((wsId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', wsId);
    }
  }, []);

  // Subscribe to an event
  const on = useCallback(<T = any>(event: WebSocketEventType, callback: (data: T) => void) => {
    // Store handler reference
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event)?.add(callback);

    // Register with socket if connected
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from an event
  const off = useCallback((event: WebSocketEventType, callback?: (...args: any[]) => void) => {
    if (callback) {
      eventHandlersRef.current.get(event)?.delete(callback);
      socketRef.current?.off(event, callback);
    } else {
      eventHandlersRef.current.delete(event);
      socketRef.current?.off(event);
    }
  }, []);

  // Emit an event
  const emit = useCallback(<T = any>(event: string, data: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('[WebSocket] Cannot emit, not connected');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle workspace changes
  useEffect(() => {
    if (isConnected && workspaceId) {
      joinWorkspace(workspaceId);
    }
  }, [isConnected, workspaceId, joinWorkspace]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinWorkspace,
    leaveWorkspace,
    on,
    off,
    emit,
  };
}

export default useWebSocket;
