import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AgentConfig, TaskConfig, FlowConfig } from '../types';

// UI State
interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Data State
interface DataState {
  agents: AgentConfig[];
  tasks: TaskConfig[];
  flows: FlowConfig[];
  selectedAgentId: string | null;
  selectedTaskId: string | null;
  selectedFlowId: string | null;
}

// Actions
interface UIActions {
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface DataActions {
  // Agents
  setAgents: (agents: AgentConfig[]) => void;
  addAgent: (agent: AgentConfig) => void;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  deleteAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  
  // Tasks
  setTasks: (tasks: TaskConfig[]) => void;
  addTask: (task: TaskConfig) => void;
  updateTask: (id: string, updates: Partial<TaskConfig>) => void;
  deleteTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  
  // Flows
  setFlows: (flows: FlowConfig[]) => void;
  addFlow: (flow: FlowConfig) => void;
  updateFlow: (id: string, updates: Partial<FlowConfig>) => void;
  deleteFlow: (id: string) => void;
  selectFlow: (id: string | null) => void;
  
  // Bulk operations
  initData: (data: { agents: AgentConfig[]; tasks: TaskConfig[]; flows: FlowConfig[] }) => void;
  reset: () => void;
}

type StoreState = UIState & DataState & UIActions & DataActions;

const initialUIState: UIState = {
  theme: 'dark',
  sidebarOpen: true,
  activeModal: null,
  toasts: [],
};

const initialDataState: DataState = {
  agents: [],
  tasks: [],
  flows: [],
  selectedAgentId: null,
  selectedTaskId: null,
  selectedFlowId: null,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialUIState,
      ...initialDataState,

      // UI Actions
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      openModal: (modalId) => set({ activeModal: modalId }),
      
      closeModal: () => set({ activeModal: null }),
      
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        
        // Auto remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      // Agent Actions
      setAgents: (agents) => set({ agents }),
      
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent],
      })),
      
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),
      
      deleteAgent: (id) => set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
        tasks: state.tasks.map((t) =>
          t.agentId === id ? { ...t, agentId: '' } : t
        ),
        selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
      })),
      
      selectAgent: (id) => set({ selectedAgentId: id }),

      // Task Actions
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        flows: state.flows.map((f) => ({
          ...f,
          taskIds: f.taskIds.filter((tid) => tid !== id),
        })),
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
      })),
      
      selectTask: (id) => set({ selectedTaskId: id }),
      
      reorderTasks: (startIndex, endIndex) => set((state) => {
        const newTasks = [...state.tasks];
        const [removed] = newTasks.splice(startIndex, 1);
        newTasks.splice(endIndex, 0, removed);
        return { tasks: newTasks };
      }),

      // Flow Actions
      setFlows: (flows) => set({ flows }),
      
      addFlow: (flow) => set((state) => ({
        flows: [...state.flows, flow],
      })),
      
      updateFlow: (id, updates) => set((state) => ({
        flows: state.flows.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      })),
      
      deleteFlow: (id) => set((state) => ({
        flows: state.flows.filter((f) => f.id !== id),
        selectedFlowId: state.selectedFlowId === id ? null : state.selectedFlowId,
      })),
      
      selectFlow: (id) => set({ selectedFlowId: id }),

      // Bulk Actions
      initData: (data) => set({
        agents: data.agents,
        tasks: data.tasks,
        flows: data.flows,
      }),
      
      reset: () => set({
        ...initialDataState,
      }),
    }),
    {
      name: 'crewai-orchestrator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Persist data only if needed for offline
        agents: state.agents,
        tasks: state.tasks,
        flows: state.flows,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useAgents = () => useStore((state) => state.agents);
export const useTasks = () => useStore((state) => state.tasks);
export const useFlows = () => useStore((state) => state.flows);
export const useTheme = () => useStore((state) => state.theme);
export const useToasts = () => useStore((state) => state.toasts);
export const useSelectedAgent = () => {
  const agents = useStore((state) => state.agents);
  const selectedId = useStore((state) => state.selectedAgentId);
  return agents.find((a) => a.id === selectedId) || null;
};
export const useSelectedTask = () => {
  const tasks = useStore((state) => state.tasks);
  const selectedId = useStore((state) => state.selectedTaskId);
  return tasks.find((t) => t.id === selectedId) || null;
};
