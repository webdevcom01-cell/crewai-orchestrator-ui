import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlowRun } from '../../../hooks/useFlowRun';
import { OrchestratorContext } from '../../../reducer';
import { ToastProvider } from '../../../components/ui/Toast';
import type { ReactNode } from 'react';

// Mock API
vi.mock('../../../services/api', () => ({
  apiFlows: {
    startRun: vi.fn(),
  },
  apiRuns: {
    streamEvents: vi.fn(() => vi.fn()),
  },
}));

import { apiFlows, apiRuns } from '../../../services/api';

const mockDispatch = vi.fn();

const createMockState = () => ({
  agents: [],
  tasks: [],
  flows: [
    { id: 'flow1', name: 'Test Flow', description: 'A test flow', taskIds: ['task1'] },
  ],
  runs: [],
  selectedAgentId: undefined,
  selectedFlowId: 'flow1',
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

describe('useFlowRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.logs).toEqual([]);
      expect(result.current.currentRunId).toBeNull();
    });

    it('should return flows from state', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      expect(result.current.flows).toHaveLength(1);
    });

    it('should return current flow', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      expect(result.current.currentFlow?.name).toBe('Test Flow');
    });

    it('should return selectedFlowId', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      expect(result.current.selectedFlowId).toBe('flow1');
    });
  });

  describe('addLog', () => {
    it('should add log entry', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      act(() => {
        result.current.addLog('Agent1', 'info', 'Test message');
      });
      
      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0].agent).toBe('Agent1');
      expect(result.current.logs[0].type).toBe('info');
      expect(result.current.logs[0].content).toBe('Test message');
    });

    it('should add multiple logs', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      act(() => {
        result.current.addLog('Agent1', 'info', 'First');
        result.current.addLog('Agent2', 'success', 'Second');
      });
      
      expect(result.current.logs).toHaveLength(2);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      act(() => {
        result.current.addLog('Agent1', 'info', 'Test');
        result.current.addLog('Agent2', 'info', 'Test2');
      });
      
      expect(result.current.logs).toHaveLength(2);
      
      act(() => {
        result.current.clearLogs();
      });
      
      expect(result.current.logs).toHaveLength(0);
    });
  });

  describe('startRun', () => {
    it('should start a run successfully', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      vi.mocked(apiRuns.streamEvents).mockReturnValue(vi.fn());
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      let run;
      await act(async () => {
        run = await result.current.startRun('flow1');
      });
      
      expect(run).toEqual(mockRun);
      expect(result.current.isRunning).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_RUN', payload: mockRun });
    });

    it('should handle start error', async () => {
      vi.mocked(apiFlows.startRun).mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      let run;
      await act(async () => {
        run = await result.current.startRun('flow1');
      });
      
      expect(run).toBeNull();
      expect(result.current.isRunning).toBe(false);
    });

    it('should not start if already running', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      vi.mocked(apiRuns.streamEvents).mockReturnValue(vi.fn());
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      // Start first run
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Try to start second run
      let secondRun;
      await act(async () => {
        secondRun = await result.current.startRun('flow1');
      });
      
      expect(secondRun).toBeNull();
      expect(apiFlows.startRun).toHaveBeenCalledTimes(1);
    });

    it('should pass input to API', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      vi.mocked(apiRuns.streamEvents).mockReturnValue(vi.fn());
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      const input = { feature: 'test feature' };
      await act(async () => {
        await result.current.startRun('flow1', input);
      });
      
      expect(apiFlows.startRun).toHaveBeenCalledWith('flow1', input);
    });
  });

  describe('SSE event handling', () => {
    it('should handle run_completed event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      expect(result.current.isRunning).toBe(true);
      
      // Simulate run_completed event
      act(() => {
        eventCallback({ type: 'run_completed', message: 'Done!' });
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_RUN_STATUS',
        payload: { runId: 'run1', status: 'completed' },
      });
    });

    it('should handle run_failed event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate run_failed event
      act(() => {
        eventCallback({ type: 'run_failed', error: 'Something went wrong' });
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_RUN_STATUS',
        payload: { runId: 'run1', status: 'failed' },
      });
    });

    it('should handle task_completed event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate task_completed event
      act(() => {
        eventCallback({ type: 'task_completed', agent: 'TestAgent', output: 'Task output' });
      });
      
      expect(result.current.logs.some(l => l.type === 'success')).toBe(true);
    });

    it('should handle error event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate error event
      act(() => {
        eventCallback({ type: 'error', message: 'Error occurred', agent: 'System' });
      });
      
      expect(result.current.logs.some(l => l.type === 'error')).toBe(true);
    });

    it('should handle thought event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate thought event
      act(() => {
        eventCallback({ type: 'thought', message: 'Thinking...', agent: 'DevAgent' });
      });
      
      expect(result.current.logs.some(l => l.type === 'thought')).toBe(true);
      expect(result.current.logs.some(l => l.agent === 'DevAgent')).toBe(true);
    });

    it('should handle status completed from event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate status: completed
      act(() => {
        eventCallback({ status: 'completed', message: 'All done' });
      });
      
      expect(result.current.isRunning).toBe(false);
    });

    it('should handle status failed from event', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      
      let eventCallback: (event: any) => void = () => {};
      vi.mocked(apiRuns.streamEvents).mockImplementation((_runId, callback) => {
        eventCallback = callback;
        return vi.fn();
      });
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      // Simulate status: failed
      act(() => {
        eventCallback({ status: 'failed', error: 'Failed!' });
      });
      
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('stopRun', () => {
    it('should stop running flow', async () => {
      const mockRun = { id: 'run1', flowId: 'flow1', status: 'running', taskRuns: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      vi.mocked(apiFlows.startRun).mockResolvedValue(mockRun);
      const mockUnsubscribe = vi.fn();
      vi.mocked(apiRuns.streamEvents).mockReturnValue(mockUnsubscribe);
      
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.startRun('flow1');
      });
      
      act(() => {
        result.current.stopRun();
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('selectFlow', () => {
    it('should dispatch SET_SELECTED_FLOW', () => {
      const { result } = renderHook(() => useFlowRun(), { wrapper: createWrapper() });
      
      act(() => {
        result.current.selectFlow('flow2');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_SELECTED_FLOW', payload: 'flow2' });
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );
      
      expect(() => {
        renderHook(() => useFlowRun(), { wrapper });
      }).toThrow('useFlowRun must be used within OrchestratorContext.Provider');
    });
  });
});
