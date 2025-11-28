import { useContext, useCallback, useMemo } from 'react';
import { OrchestratorContext, ACTION_TYPES } from '../reducer';
import { AgentConfig } from '../types';
import { apiAgents } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { generateIdFromName, isTempId } from '../utils/helpers';

/**
 * Custom hook for agent operations
 * Encapsulates all agent-related state and actions
 */
export function useAgents() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useAgents must be used within OrchestratorContext.Provider');
  }
  
  const { state, dispatch } = context;
  const { showToast } = useToast();

  const agents = useMemo(() => state.agents, [state.agents]);
  const isLoading = state.isLoading;
  const error = state.error;

  const getAgentById = useCallback(
    (id: string): AgentConfig | undefined => {
      return agents.find(a => a.id === id);
    },
    [agents]
  );

  const getAgentName = useCallback(
    (id: string | null): string => {
      if (!id) return 'Unassigned';
      const agent = agents.find(a => a.id === id);
      return agent?.name || agent?.role || 'Unknown';
    },
    [agents]
  );

  const createAgent = useCallback(
    async (data: Omit<AgentConfig, 'id'> & { id?: string }): Promise<AgentConfig | null> => {
      try {
        const created = await apiAgents.create(data);
        dispatch({ type: ACTION_TYPES.ADD_AGENT, payload: created });
        showToast({
          type: 'success',
          title: 'Agent Created',
          message: `Agent ${created.name} created successfully.`,
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

  const updateAgent = useCallback(
    async (id: string, data: AgentConfig): Promise<AgentConfig | null> => {
      try {
        const updated = await apiAgents.update(id, data);
        dispatch({ type: ACTION_TYPES.UPDATE_AGENT, payload: updated });
        showToast({
          type: 'success',
          title: 'Agent Updated',
          message: `Agent ${updated.name} updated successfully.`,
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

  const deleteAgent = useCallback(
    async (id: string): Promise<boolean> => {
      // Skip API call for temp IDs
      if (isTempId(id, 'new_agent')) {
        return true;
      }

      try {
        await apiAgents.delete(id);
        dispatch({ type: ACTION_TYPES.DELETE_AGENT, payload: { id } });
        showToast({
          type: 'success',
          title: 'Agent Deleted',
          message: 'Agent deleted successfully.',
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

  const saveAgent = useCallback(
    async (data: AgentConfig, isNew: boolean): Promise<AgentConfig | null> => {
      const finalId = isNew ? generateIdFromName(data.name) : data.id;
      const finalData = { ...data, id: finalId };

      if (isNew) {
        return createAgent(finalData);
      } else {
        return updateAgent(data.id, finalData);
      }
    },
    [createAgent, updateAgent]
  );

  return {
    // State
    agents,
    isLoading,
    error,
    
    // Selectors
    getAgentById,
    getAgentName,
    
    // Actions
    createAgent,
    updateAgent,
    deleteAgent,
    saveAgent,
  };
}

export default useAgents;
