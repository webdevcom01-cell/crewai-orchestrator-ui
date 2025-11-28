import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgents } from '../../../hooks/useAgents';
import { OrchestratorContext } from '../../../reducer';
import { ToastProvider } from '../../../components/ui/Toast';
import type { ReactNode } from 'react';
import { apiAgents } from '../../../services/api';

// Mock API
vi.mock('../../../services/api', () => ({
  apiAgents: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockDispatch = vi.fn();

const createMockState = (overrides: Partial<ReturnType<typeof createMockState>> = {}) => ({
  agents: [
    { id: 'agent1', name: 'Test Agent', role: 'researcher', backstory: 'A test agent', goal: 'Research', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false },
  ],
  tasks: [],
  flows: [],
  runs: [],
  selectedAgentId: undefined,
  selectedFlowId: undefined,
  selectedRunId: undefined,
  isLoading: false,
  error: null as string | null,
  ...overrides,
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

describe('useAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('state and selectors', () => {
    it('should return agents from state', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      expect(result.current.agents).toHaveLength(1);
      expect(result.current.agents[0].name).toBe('Test Agent');
    });

    it('should return isLoading from state', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper({ isLoading: true }) });
      expect(result.current.isLoading).toBe(true);
    });

    it('should return error from state', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper({ error: 'Test error' }) });
      expect(result.current.error).toBe('Test error');
    });

    it('should get agent by id', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      const agent = result.current.getAgentById('agent1');
      expect(agent?.name).toBe('Test Agent');
    });

    it('should return undefined for non-existent agent', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      const agent = result.current.getAgentById('non-existent');
      expect(agent).toBeUndefined();
    });

    it('should get agent name by id', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      expect(result.current.getAgentName('agent1')).toBe('Test Agent');
    });

    it('should return Unassigned for null id', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      expect(result.current.getAgentName(null)).toBe('Unassigned');
    });

    it('should return Unknown for non-existent agent', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      expect(result.current.getAgentName('non-existent')).toBe('Unknown');
    });
  });

  describe('createAgent', () => {
    it('should create agent successfully', async () => {
      const newAgent = { id: 'new-agent', name: 'New Agent', role: 'dev', backstory: 'New', goal: 'Dev', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false };
      vi.mocked(apiAgents.create).mockResolvedValue(newAgent);
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let created;
      await act(async () => {
        created = await result.current.createAgent(newAgent);
      });
      
      expect(created).toEqual(newAgent);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_AGENT', payload: newAgent });
    });

    it('should handle create error', async () => {
      vi.mocked(apiAgents.create).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let created;
      await act(async () => {
        created = await result.current.createAgent({ name: 'Test', role: 'dev', backstory: '', goal: '', model: '', tools: [], allowDelegation: false, verbose: false });
      });
      
      expect(created).toBeNull();
    });
  });

  describe('updateAgent', () => {
    it('should update agent successfully', async () => {
      const updatedAgent = { id: 'agent1', name: 'Updated Agent', role: 'lead', backstory: 'Updated', goal: 'Lead', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false };
      vi.mocked(apiAgents.update).mockResolvedValue(updatedAgent);
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let updated;
      await act(async () => {
        updated = await result.current.updateAgent('agent1', updatedAgent);
      });
      
      expect(updated).toEqual(updatedAgent);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'UPDATE_AGENT', payload: updatedAgent });
    });

    it('should handle update error', async () => {
      vi.mocked(apiAgents.update).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let updated;
      await act(async () => {
        updated = await result.current.updateAgent('agent1', { id: 'agent1', name: 'Test', role: 'dev', backstory: '', goal: '', model: '', tools: [], allowDelegation: false, verbose: false });
      });
      
      expect(updated).toBeNull();
    });
  });

  describe('deleteAgent', () => {
    it('should delete agent successfully', async () => {
      vi.mocked(apiAgents.delete).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let deleted;
      await act(async () => {
        deleted = await result.current.deleteAgent('agent1');
      });
      
      expect(deleted).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_AGENT', payload: { id: 'agent1' } });
    });

    it('should skip API call for temp IDs', async () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let deleted;
      await act(async () => {
        deleted = await result.current.deleteAgent('new_agent_123456');
      });
      
      expect(deleted).toBe(true);
      expect(apiAgents.delete).not.toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      vi.mocked(apiAgents.delete).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      let deleted;
      await act(async () => {
        deleted = await result.current.deleteAgent('agent1');
      });
      
      expect(deleted).toBe(false);
    });
  });

  describe('saveAgent', () => {
    it('should create new agent when isNew is true', async () => {
      const newAgent = { id: 'test_agent', name: 'Test Agent', role: 'dev', backstory: 'New', goal: 'Dev', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false };
      vi.mocked(apiAgents.create).mockResolvedValue(newAgent);
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.saveAgent(newAgent, true);
      });
      
      expect(apiAgents.create).toHaveBeenCalled();
    });

    it('should update agent when isNew is false', async () => {
      const existingAgent = { id: 'agent1', name: 'Updated', role: 'dev', backstory: 'Updated', goal: 'Dev', model: 'gpt-4', tools: [], allowDelegation: false, verbose: false };
      vi.mocked(apiAgents.update).mockResolvedValue(existingAgent);
      
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.saveAgent(existingAgent, false);
      });
      
      expect(apiAgents.update).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );
      
      expect(() => {
        renderHook(() => useAgents(), { wrapper });
      }).toThrow('useAgents must be used within OrchestratorContext.Provider');
    });
  });
});
