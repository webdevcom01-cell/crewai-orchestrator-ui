import { useContext, useCallback, useMemo } from 'react';
import { OrchestratorContext, ACTION_TYPES } from '../reducer';
import { TaskConfig } from '../types';
import { apiTasks } from '../services/api';
import { useToast } from '../components/ui/Toast';

/**
 * Custom hook for task operations
 * Encapsulates all task-related state and actions
 */
export function useTasks() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useTasks must be used within OrchestratorContext.Provider');
  }
  
  const { state, dispatch } = context;
  const { showToast } = useToast();

  const tasks = useMemo(() => state.tasks, [state.tasks]);
  const agents = useMemo(() => state.agents, [state.agents]);
  const isLoading = state.isLoading;
  const error = state.error;

  const getTaskById = useCallback(
    (id: string): TaskConfig | undefined => {
      return tasks.find(t => t.id === id);
    },
    [tasks]
  );

  const getTaskName = useCallback(
    (task: TaskConfig): string => {
      if (task.id && !task.id.includes('-')) {
        return task.id;
      }
      const desc = (task.description || 'task').toLowerCase();
      const words = desc.split(' ').slice(0, 2).filter(w => w.length > 2);
      return words.join('_') + '_task';
    },
    []
  );

  const getAgentForTask = useCallback(
    (agentId: string | null): string => {
      if (!agentId) return 'Unassigned';
      const agent = agents.find(a => a.id === agentId);
      return agent?.name || agent?.role || 'Unknown';
    },
    [agents]
  );

  const getAvailableContextTasks = useCallback(
    (currentTaskId: string): TaskConfig[] => {
      const currentIndex = tasks.findIndex(t => t.id === currentTaskId);
      if (currentIndex <= 0) return [];
      return tasks.slice(0, currentIndex);
    },
    [tasks]
  );

  const createTask = useCallback(
    async (data: Omit<TaskConfig, 'id'> & { id?: string }): Promise<TaskConfig | null> => {
      try {
        const created = await apiTasks.create(data);
        dispatch({ type: ACTION_TYPES.ADD_TASK, payload: created });
        showToast({
          type: 'success',
          title: 'Task Created',
          message: 'Task created successfully.',
        });
        return created;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        showToast({ type: 'error', title: 'Create Failed', message });
        return null;
      }
    },
    [dispatch, showToast]
  );

  const updateTask = useCallback(
    async (id: string, data: TaskConfig): Promise<TaskConfig | null> => {
      try {
        const updated = await apiTasks.update(id, data);
        dispatch({ type: ACTION_TYPES.UPDATE_TASK, payload: updated });
        showToast({
          type: 'success',
          title: 'Task Updated',
          message: 'Task updated successfully.',
        });
        return updated;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        showToast({ type: 'error', title: 'Update Failed', message });
        return null;
      }
    },
    [dispatch, showToast]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await apiTasks.delete(id);
        dispatch({ type: ACTION_TYPES.DELETE_TASK, payload: { id } });
        showToast({
          type: 'success',
          title: 'Task Deleted',
          message: 'Task deleted successfully.',
        });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        showToast({ type: 'error', title: 'Delete Failed', message });
        return false;
      }
    },
    [dispatch, showToast]
  );

  const saveTask = useCallback(
    async (data: TaskConfig, isNew: boolean): Promise<TaskConfig | null> => {
      if (isNew) {
        return createTask(data);
      } else {
        return updateTask(data.id, data);
      }
    },
    [createTask, updateTask]
  );

  const reorderTasks = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= tasks.length) return;

      // Note: This is local-only reordering
      // TODO: Implement API call for persistent reordering
      console.warn('Task reordering is not currently persisted.');
    },
    [tasks.length]
  );

  return {
    // State
    tasks,
    agents,
    isLoading,
    error,
    
    // Selectors
    getTaskById,
    getTaskName,
    getAgentForTask,
    getAvailableContextTasks,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    saveTask,
    reorderTasks,
  };
}

export default useTasks;
