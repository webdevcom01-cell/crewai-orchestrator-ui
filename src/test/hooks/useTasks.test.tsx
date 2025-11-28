import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../../hooks/useTasks';
import { OrchestratorContext } from '../../../reducer';
import { ToastProvider } from '../../../components/ui/Toast';
import type { ReactNode } from 'react';
import { apiTasks } from '../../../services/api';

// Mock API
vi.mock('../../../services/api', () => ({
  apiTasks: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockDispatch = vi.fn();

const createMockState = () => ({
  agents: [{ id: 'agent1', name: 'Test Agent', role: 'researcher', backstory: 'test', goal: 'Research', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false }],
  tasks: [
    { id: 'task1', name: 'Test Task', description: 'A test task', agentId: 'agent1', expectedOutput: 'output', contextTaskIds: [], isEntrypoint: true },
    { id: 'task2', name: 'Second Task', description: 'Second task', agentId: 'agent1', expectedOutput: 'output2', contextTaskIds: ['task1'], isEntrypoint: false },
  ],
  flows: [],
  runs: [],
  selectedAgentId: undefined,
  selectedFlowId: undefined,
  selectedRunId: undefined,
  isLoading: false,
  error: null,
});

const createWrapper = (state = createMockState()) => {
  return ({ children }: { children: ReactNode }) => (
    <OrchestratorContext.Provider value={{ state, dispatch: mockDispatch }}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </OrchestratorContext.Provider>
  );
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('state and selectors', () => {
    it('should return tasks from state', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      expect(result.current.tasks).toHaveLength(2);
    });

    it('should return agents from state', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      expect(result.current.agents).toHaveLength(1);
    });

    it('should get task by id', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      const task = result.current.getTaskById('task1');
      expect(task?.name).toBe('Test Task');
    });

    it('should return undefined for non-existent task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      const task = result.current.getTaskById('non-existent');
      expect(task).toBeUndefined();
    });

    it('should get agent name for task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      expect(result.current.getAgentForTask('agent1')).toBe('Test Agent');
    });

    it('should return Unassigned for null agent', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      expect(result.current.getAgentForTask(null)).toBe('Unassigned');
    });

    it('should return Unknown for non-existent agent', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      expect(result.current.getAgentForTask('non-existent')).toBe('Unknown');
    });

    it('should get available context tasks', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      const available = result.current.getAvailableContextTasks('task2');
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('task1');
    });

    it('should return empty array for first task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      const available = result.current.getAvailableContextTasks('task1');
      expect(available).toHaveLength(0);
    });

    it('should generate task name from description', () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      const task = { id: 'temp-123', name: "Task", description: 'Research the topic', agentId: 'agent1', expectedOutput: '', contextTaskIds: [], isEntrypoint: true };
      const name = result.current.getTaskName(task);
      expect(name).toContain('task');
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const newTask = { id: 'new-task', name: 'New Task', name: "Task", description: 'New', agentId: 'agent1', expectedOutput: 'out', contextTaskIds: [], isEntrypoint: true };
      vi.mocked(apiTasks.create).mockResolvedValue(newTask);
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let created;
      await act(async () => {
        created = await result.current.createTask(newTask);
      });
      
      expect(created).toEqual(newTask);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_TASK', payload: newTask });
    });

    it('should handle create error', async () => {
      vi.mocked(apiTasks.create).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let created;
      await act(async () => {
        created = await result.current.createTask({ name: "Task", description: 'Test', agentId: 'agent1', expectedOutput: '', contextTaskIds: [], isEntrypoint: true });
      });
      
      expect(created).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updatedTask = { id: 'task1', name: 'Updated Task', name: "Task", description: 'Updated', agentId: 'agent1', expectedOutput: 'new output', contextTaskIds: [], isEntrypoint: true };
      vi.mocked(apiTasks.update).mockResolvedValue(updatedTask);
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let updated;
      await act(async () => {
        updated = await result.current.updateTask('task1', updatedTask);
      });
      
      expect(updated).toEqual(updatedTask);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'UPDATE_TASK', payload: updatedTask });
    });

    it('should handle update error', async () => {
      vi.mocked(apiTasks.update).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let updated;
      await act(async () => {
        updated = await result.current.updateTask('task1', { id: 'task1', name: "Task", description: 'Test', agentId: 'agent1', expectedOutput: '', contextTaskIds: [], isEntrypoint: true });
      });
      
      expect(updated).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      vi.mocked(apiTasks.delete).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let deleted;
      await act(async () => {
        deleted = await result.current.deleteTask('task1');
      });
      
      expect(deleted).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_TASK', payload: { id: 'task1' } });
    });

    it('should handle delete error', async () => {
      vi.mocked(apiTasks.delete).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      let deleted;
      await act(async () => {
        deleted = await result.current.deleteTask('task1');
      });
      
      expect(deleted).toBe(false);
    });
  });

  describe('saveTask', () => {
    it('should create new task when isNew is true', async () => {
      const newTask = { id: 'new', name: "Task", description: 'New', agentId: 'agent1', expectedOutput: '', contextTaskIds: [], isEntrypoint: true };
      vi.mocked(apiTasks.create).mockResolvedValue(newTask);
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.saveTask(newTask, true);
      });
      
      expect(apiTasks.create).toHaveBeenCalled();
    });

    it('should update task when isNew is false', async () => {
      const existingTask = { id: 'task1', name: "Task", description: 'Updated', agentId: 'agent1', expectedOutput: '', contextTaskIds: [], isEntrypoint: true };
      vi.mocked(apiTasks.update).mockResolvedValue(existingTask);
      
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.saveTask(existingTask, false);
      });
      
      expect(apiTasks.update).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );
      
      expect(() => {
        renderHook(() => useTasks(), { wrapper });
      }).toThrow('useTasks must be used within OrchestratorContext.Provider');
    });
  });
});
