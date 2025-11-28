import { useState, useCallback, useContext, useRef } from 'react';
import { OrchestratorContext, ACTION_TYPES } from '../reducer';
import { FlowRun, SSEEvent } from '../types';
import { apiFlows, apiRuns } from '../services/api';
import { useToast } from '../components/ui/Toast';

export interface LogEntry {
  agent: string;
  type: 'info' | 'success' | 'error' | 'thought';
  content: string;
  timestamp: Date;
}

/**
 * Custom hook for flow run operations
 * Manages SSE streaming and run state
 */
export function useFlowRun() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useFlowRun must be used within OrchestratorContext.Provider');
  }
  
  const { state, dispatch } = context;
  const { showToast } = useToast();
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const flows = state.flows;
  const selectedFlowId = state.selectedFlowId;
  const currentFlow = flows.find(f => f.id === selectedFlowId);

  const addLog = useCallback((agent: string, type: LogEntry['type'], content: string) => {
    setLogs(prev => [...prev, { agent, type, content, timestamp: new Date() }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const startRun = useCallback(
    async (flowId: string, input: Record<string, unknown> = {}): Promise<FlowRun | null> => {
      if (isRunning) {
        showToast({
          type: 'error',
          title: 'Run in Progress',
          message: 'Please wait for the current run to complete.',
        });
        return null;
      }

      setIsRunning(true);
      clearLogs();
      addLog('System', 'info', 'Initializing flow run...');

      try {
        const run = await apiFlows.startRun(flowId, input);
        setCurrentRunId(run.id);
        addLog('System', 'info', `Run started with ID: ${run.id}`);
        
        dispatch({ type: ACTION_TYPES.START_RUN, payload: run });

        // Connect to SSE stream
        const unsubscribe = apiRuns.streamEvents(run.id, (event: SSEEvent) => {
          let logType: LogEntry['type'] = 'info';
          if (event.type === 'error') logType = 'error';
          if (event.type === 'task_completed') logType = 'success';
          if (event.type === 'thought') logType = 'thought';

          const content = event.message || event.output || JSON.stringify(event);
          const agentName = event.agent || 'System';
          
          addLog(agentName, logType, content);

          // Handle completion
          if (event.type === 'run_completed' || event.status === 'completed') {
            setIsRunning(false);
            unsubscribeRef.current?.();
            dispatch({
              type: ACTION_TYPES.UPDATE_RUN_STATUS,
              payload: { runId: run.id, status: 'completed' },
            });
            showToast({
              type: 'success',
              title: 'Run Completed',
              message: 'Flow run finished successfully.',
            });
          }

          // Handle failure
          if (event.type === 'run_failed' || event.status === 'failed') {
            setIsRunning(false);
            unsubscribeRef.current?.();
            dispatch({
              type: ACTION_TYPES.UPDATE_RUN_STATUS,
              payload: { runId: run.id, status: 'failed' },
            });
            showToast({
              type: 'error',
              title: 'Run Failed',
              message: event.error || 'Flow run encountered an error.',
            });
          }
        });

        unsubscribeRef.current = unsubscribe;
        return run;
      } catch (error) {
        setIsRunning(false);
        const message = error instanceof Error ? error.message : 'Failed to start run';
        addLog('System', 'error', message);
        showToast({ type: 'error', title: 'Start Failed', message });
        return null;
      }
    },
    [isRunning, dispatch, showToast, addLog, clearLogs]
  );

  const stopRun = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsRunning(false);
    addLog('System', 'info', 'Run stopped by user.');
    
    if (currentRunId) {
      dispatch({
        type: ACTION_TYPES.UPDATE_RUN_STATUS,
        payload: { runId: currentRunId, status: 'failed' },
      });
    }
  }, [currentRunId, dispatch, addLog]);

  const selectFlow = useCallback(
    (flowId: string) => {
      dispatch({ type: ACTION_TYPES.SET_SELECTED_FLOW, payload: flowId });
    },
    [dispatch]
  );

  return {
    // State
    isRunning,
    logs,
    currentRunId,
    flows,
    currentFlow,
    selectedFlowId,
    
    // Actions
    startRun,
    stopRun,
    clearLogs,
    selectFlow,
    addLog,
  };
}

export default useFlowRun;
