import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Configure QueryClient with optimal defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Network mode
      networkMode: 'offlineFirst',
    },
  },
});

// Query Provider wrapper component
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Query Keys for type-safe cache management
export const queryKeys = {
  // Agents
  agents: {
    all: ['agents'] as const,
    lists: () => [...queryKeys.agents.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    byAgent: (agentId: string) => [...queryKeys.tasks.all, 'byAgent', agentId] as const,
  },
  
  // Flows
  flows: {
    all: ['flows'] as const,
    lists: () => [...queryKeys.flows.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.flows.lists(), filters] as const,
    details: () => [...queryKeys.flows.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.flows.details(), id] as const,
  },
  
  // Executions
  executions: {
    all: ['executions'] as const,
    history: () => [...queryKeys.executions.all, 'history'] as const,
    detail: (id: string) => [...queryKeys.executions.all, 'detail', id] as const,
    active: () => [...queryKeys.executions.all, 'active'] as const,
  },
  
  // Templates
  templates: {
    all: ['templates'] as const,
    list: (category?: string) => [...queryKeys.templates.all, 'list', category] as const,
    detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
  },
  
  // User & Team
  user: {
    current: ['user', 'current'] as const,
    settings: ['user', 'settings'] as const,
  },
  team: {
    members: ['team', 'members'] as const,
    invites: ['team', 'invites'] as const,
  },
  
  // Analytics
  analytics: {
    dashboard: ['analytics', 'dashboard'] as const,
    usage: (period: string) => ['analytics', 'usage', period] as const,
  },
  
  // Audit
  audit: {
    logs: (filters?: Record<string, unknown>) => ['audit', 'logs', filters] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
};
