import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { apiAgents, apiTasks, apiFlows } from '../services/api';
import { AgentConfig, TaskConfig, FlowConfig } from '../types';
import { useStore } from '../store/useStore';

// ============ AGENTS HOOKS ============

export function useAgentsQuery() {
  const setAgents = useStore((state) => state.setAgents);
  
  return useQuery({
    queryKey: queryKeys.agents.lists(),
    queryFn: async () => {
      const agents = await apiAgents.getAll();
      setAgents(agents); // Sync with Zustand
      return agents;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAgentQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => apiAgents.getById(id),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const addAgent = useStore((state) => state.addAgent);
  
  return useMutation({
    mutationFn: (agent: AgentConfig) => apiAgents.create(agent),
    onMutate: async (newAgent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.lists() });
      
      // Snapshot previous value
      const previousAgents = queryClient.getQueryData<AgentConfig[]>(queryKeys.agents.lists());
      
      // Optimistically update
      queryClient.setQueryData<AgentConfig[]>(queryKeys.agents.lists(), (old) => 
        old ? [...old, newAgent] : [newAgent]
      );
      addAgent(newAgent);
      
      return { previousAgents };
    },
    onError: (err, newAgent, context) => {
      // Rollback on error
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.lists(), context.previousAgents);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  const updateAgent = useStore((state) => state.updateAgent);
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AgentConfig> }) =>
      apiAgents.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.detail(id) });
      
      const previousAgent = queryClient.getQueryData<AgentConfig>(queryKeys.agents.detail(id));
      
      // Optimistic update
      updateAgent(id, updates);
      queryClient.setQueryData<AgentConfig>(queryKeys.agents.detail(id), (old) =>
        old ? { ...old, ...updates } : old
      );
      
      return { previousAgent };
    },
    onError: (err, { id }, context) => {
      if (context?.previousAgent) {
        queryClient.setQueryData(queryKeys.agents.detail(id), context.previousAgent);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  const deleteAgent = useStore((state) => state.deleteAgent);
  
  return useMutation({
    mutationFn: (id: string) => apiAgents.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agents.lists() });
      
      const previousAgents = queryClient.getQueryData<AgentConfig[]>(queryKeys.agents.lists());
      
      deleteAgent(id);
      queryClient.setQueryData<AgentConfig[]>(queryKeys.agents.lists(), (old) =>
        old?.filter((a) => a.id !== id)
      );
      
      return { previousAgents };
    },
    onError: (err, id, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(queryKeys.agents.lists(), context.previousAgents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
  });
}

// ============ TASKS HOOKS ============

export function useTasksQuery() {
  const setTasks = useStore((state) => state.setTasks);
  
  return useQuery({
    queryKey: queryKeys.tasks.lists(),
    queryFn: async () => {
      const tasks = await apiTasks.getAll();
      setTasks(tasks);
      return tasks;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => apiTasks.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const addTask = useStore((state) => state.addTask);
  
  return useMutation({
    mutationFn: (task: TaskConfig) => apiTasks.create(task),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.lists() });
      
      const previousTasks = queryClient.getQueryData<TaskConfig[]>(queryKeys.tasks.lists());
      
      queryClient.setQueryData<TaskConfig[]>(queryKeys.tasks.lists(), (old) =>
        old ? [...old, newTask] : [newTask]
      );
      addTask(newTask);
      
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.lists(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const updateTask = useStore((state) => state.updateTask);
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TaskConfig> }) =>
      apiTasks.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });
      
      const previousTask = queryClient.getQueryData<TaskConfig>(queryKeys.tasks.detail(id));
      
      updateTask(id, updates);
      queryClient.setQueryData<TaskConfig>(queryKeys.tasks.detail(id), (old) =>
        old ? { ...old, ...updates } : old
      );
      
      return { previousTask };
    },
    onError: (err, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previousTask);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const deleteTask = useStore((state) => state.deleteTask);
  
  return useMutation({
    mutationFn: (id: string) => apiTasks.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.lists() });
      
      const previousTasks = queryClient.getQueryData<TaskConfig[]>(queryKeys.tasks.lists());
      
      deleteTask(id);
      queryClient.setQueryData<TaskConfig[]>(queryKeys.tasks.lists(), (old) =>
        old?.filter((t) => t.id !== id)
      );
      
      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.lists(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

// ============ FLOWS HOOKS ============

export function useFlowsQuery() {
  const setFlows = useStore((state) => state.setFlows);
  
  return useQuery({
    queryKey: queryKeys.flows.lists(),
    queryFn: async () => {
      const flows = await apiFlows.getAll();
      setFlows(flows);
      return flows;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFlowQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.flows.detail(id),
    queryFn: () => apiFlows.getById(id),
    enabled: !!id,
  });
}

export function useCreateFlow() {
  const queryClient = useQueryClient();
  const addFlow = useStore((state) => state.addFlow);
  
  return useMutation({
    mutationFn: (flow: FlowConfig) => apiFlows.create(flow),
    onMutate: async (newFlow) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.flows.lists() });
      
      const previousFlows = queryClient.getQueryData<FlowConfig[]>(queryKeys.flows.lists());
      
      queryClient.setQueryData<FlowConfig[]>(queryKeys.flows.lists(), (old) =>
        old ? [...old, newFlow] : [newFlow]
      );
      addFlow(newFlow);
      
      return { previousFlows };
    },
    onError: (err, newFlow, context) => {
      if (context?.previousFlows) {
        queryClient.setQueryData(queryKeys.flows.lists(), context.previousFlows);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flows.all });
    },
  });
}

export function useUpdateFlow() {
  const queryClient = useQueryClient();
  const updateFlow = useStore((state) => state.updateFlow);
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FlowConfig> }) =>
      apiFlows.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.flows.detail(id) });
      
      const previousFlow = queryClient.getQueryData<FlowConfig>(queryKeys.flows.detail(id));
      
      updateFlow(id, updates);
      queryClient.setQueryData<FlowConfig>(queryKeys.flows.detail(id), (old) =>
        old ? { ...old, ...updates } : old
      );
      
      return { previousFlow };
    },
    onError: (err, { id }, context) => {
      if (context?.previousFlow) {
        queryClient.setQueryData(queryKeys.flows.detail(id), context.previousFlow);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flows.all });
    },
  });
}

export function useDeleteFlow() {
  const queryClient = useQueryClient();
  const deleteFlow = useStore((state) => state.deleteFlow);
  
  return useMutation({
    mutationFn: (id: string) => apiFlows.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.flows.lists() });
      
      const previousFlows = queryClient.getQueryData<FlowConfig[]>(queryKeys.flows.lists());
      
      deleteFlow(id);
      queryClient.setQueryData<FlowConfig[]>(queryKeys.flows.lists(), (old) =>
        old?.filter((f) => f.id !== id)
      );
      
      return { previousFlows };
    },
    onError: (err, id, context) => {
      if (context?.previousFlows) {
        queryClient.setQueryData(queryKeys.flows.lists(), context.previousFlows);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flows.all });
    },
  });
}

// ============ PREFETCH HELPERS ============

export function usePrefetchAgents() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.agents.lists(),
      queryFn: () => apiAgents.getAll(),
    });
  };
}

export function usePrefetchTasks() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tasks.lists(),
      queryFn: () => apiTasks.getAll(),
    });
  };
}

// ============ INVALIDATION HELPERS ============

export function useInvalidateAll() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.flows.all });
  };
}
