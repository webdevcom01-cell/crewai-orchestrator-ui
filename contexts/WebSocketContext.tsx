import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useWebSocket, WebSocketEventType, UseWebSocketReturn } from '../hooks/useWebSocket';

interface WebSocketContextValue extends UseWebSocketReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  workspaceId?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, workspaceId, autoConnect = true }: WebSocketProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const websocket = useWebSocket({
    autoConnect,
    workspaceId,
    onConnect: () => {
      console.log('[WebSocketProvider] Connected to server');
    },
    onDisconnect: () => {
      console.log('[WebSocketProvider] Disconnected from server');
    },
    onError: (error) => {
      console.error('[WebSocketProvider] Error:', error);
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to real-time server',
      });
    },
  });

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Subscribe to server notifications
  useEffect(() => {
    if (!websocket.isConnected) return;

    const handleNotification = (data: { type: string; title: string; message: string }) => {
      addNotification({
        type: data.type as Notification['type'],
        title: data.title,
        message: data.message,
      });
    };

    websocket.on('notification', handleNotification);

    return () => {
      websocket.off('notification', handleNotification);
    };
  }, [websocket.isConnected, websocket.on, websocket.off, addNotification]);

  const contextValue: WebSocketContextValue = {
    ...websocket,
    notifications,
    addNotification,
    clearNotifications,
    removeNotification,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// Hook for subscribing to specific events
export function useWebSocketEvent<T = any>(
  event: WebSocketEventType,
  callback: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { on, off, isConnected } = useWebSocketContext();

  useEffect(() => {
    if (!isConnected) return;

    on(event, callback);

    return () => {
      off(event, callback);
    };
  }, [event, isConnected, on, off, ...deps]);
}

// Hook for agents real-time updates
export function useAgentUpdates(callbacks: {
  onCreated?: (agent: any) => void;
  onUpdated?: (agent: any) => void;
  onDeleted?: (agentId: string) => void;
}) {
  const { on, off, isConnected } = useWebSocketContext();

  useEffect(() => {
    if (!isConnected) return;

    if (callbacks.onCreated) {
      on('agentCreated', callbacks.onCreated);
    }
    if (callbacks.onUpdated) {
      on('agentUpdated', callbacks.onUpdated);
    }
    if (callbacks.onDeleted) {
      on('agentDeleted', callbacks.onDeleted);
    }

    return () => {
      if (callbacks.onCreated) off('agentCreated', callbacks.onCreated);
      if (callbacks.onUpdated) off('agentUpdated', callbacks.onUpdated);
      if (callbacks.onDeleted) off('agentDeleted', callbacks.onDeleted);
    };
  }, [isConnected, on, off, callbacks]);
}

// Hook for tasks real-time updates
export function useTaskUpdates(callbacks: {
  onCreated?: (task: any) => void;
  onUpdated?: (task: any) => void;
  onDeleted?: (taskId: string) => void;
}) {
  const { on, off, isConnected } = useWebSocketContext();

  useEffect(() => {
    if (!isConnected) return;

    if (callbacks.onCreated) {
      on('taskCreated', callbacks.onCreated);
    }
    if (callbacks.onUpdated) {
      on('taskUpdated', callbacks.onUpdated);
    }
    if (callbacks.onDeleted) {
      on('taskDeleted', callbacks.onDeleted);
    }

    return () => {
      if (callbacks.onCreated) off('taskCreated', callbacks.onCreated);
      if (callbacks.onUpdated) off('taskUpdated', callbacks.onUpdated);
      if (callbacks.onDeleted) off('taskDeleted', callbacks.onDeleted);
    };
  }, [isConnected, on, off, callbacks]);
}

// Hook for run real-time updates
export function useRunUpdates(callbacks: {
  onStarted?: (run: any) => void;
  onUpdated?: (run: any) => void;
  onCompleted?: (run: any) => void;
  onFailed?: (run: any) => void;
}) {
  const { on, off, isConnected } = useWebSocketContext();

  useEffect(() => {
    if (!isConnected) return;

    if (callbacks.onStarted) {
      on('runStarted', callbacks.onStarted);
    }
    if (callbacks.onUpdated) {
      on('runUpdated', callbacks.onUpdated);
    }
    if (callbacks.onCompleted) {
      on('runCompleted', callbacks.onCompleted);
    }
    if (callbacks.onFailed) {
      on('runFailed', callbacks.onFailed);
    }

    return () => {
      if (callbacks.onStarted) off('runStarted', callbacks.onStarted);
      if (callbacks.onUpdated) off('runUpdated', callbacks.onUpdated);
      if (callbacks.onCompleted) off('runCompleted', callbacks.onCompleted);
      if (callbacks.onFailed) off('runFailed', callbacks.onFailed);
    };
  }, [isConnected, on, off, callbacks]);
}

export default WebSocketProvider;
