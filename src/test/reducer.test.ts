import { describe, it, expect } from 'vitest';
import { orchestratorReducer, initialOrchestratorState, ACTION_TYPES } from '../../reducer';
import { createMockAgent, createMockTask, createMockFlow, createMockRun } from './testUtils';

describe('orchestratorReducer', () => {
  describe('INIT_DATA', () => {
    it('should initialize state with data', () => {
      const agents = [createMockAgent()];
      const tasks = [createMockTask()];
      const flows = [createMockFlow()];

      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.INIT_DATA,
        payload: { agents, tasks, flows },
      });

      expect(newState.agents).toEqual(agents);
      expect(newState.tasks).toEqual(tasks);
      expect(newState.flows).toEqual(flows);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(null);
    });
  });

  describe('SET_LOADING', () => {
    it('should set loading state to true', () => {
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.SET_LOADING,
        payload: true,
      });

      expect(newState.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const state = { ...initialOrchestratorState, isLoading: true };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.SET_LOADING,
        payload: false,
      });

      expect(newState.isLoading).toBe(false);
    });
  });

  describe('SET_ERROR', () => {
    it('should set error message', () => {
      const errorMessage = 'Test error';
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });

      expect(newState.error).toBe(errorMessage);
      expect(newState.isLoading).toBe(false);
    });

    it('should clear error when null', () => {
      const state = { ...initialOrchestratorState, error: 'Previous error' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.SET_ERROR,
        payload: null,
      });

      expect(newState.error).toBe(null);
    });
  });

  describe('ADD_AGENT', () => {
    it('should add agent to state', () => {
      const agent = createMockAgent();
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.ADD_AGENT,
        payload: agent,
      });

      expect(newState.agents).toHaveLength(1);
      expect(newState.agents[0]).toEqual(agent);
    });

    it('should add multiple agents', () => {
      const agent1 = createMockAgent({ id: 'agent-1' });
      const agent2 = createMockAgent({ id: 'agent-2' });

      let state = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.ADD_AGENT,
        payload: agent1,
      });

      state = orchestratorReducer(state, {
        type: ACTION_TYPES.ADD_AGENT,
        payload: agent2,
      });

      expect(state.agents).toHaveLength(2);
    });
  });

  describe('UPDATE_AGENT', () => {
    it('should update existing agent', () => {
      const agent = createMockAgent();
      const state = { ...initialOrchestratorState, agents: [agent] };

      const updatedAgent = { ...agent, name: 'Updated Name' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_AGENT,
        payload: updatedAgent,
      });

      expect(newState.agents[0].name).toBe('Updated Name');
    });

    it('should not modify other agents', () => {
      const agent1 = createMockAgent({ id: 'agent-1' });
      const agent2 = createMockAgent({ id: 'agent-2' });
      const state = { ...initialOrchestratorState, agents: [agent1, agent2] };

      const updatedAgent = { ...agent1, name: 'Updated' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_AGENT,
        payload: updatedAgent,
      });

      expect(newState.agents[0].name).toBe('Updated');
      expect(newState.agents[1].name).toBe(agent2.name);
    });
  });

  describe('DELETE_AGENT', () => {
    it('should remove agent from state', () => {
      const agent = createMockAgent();
      const state = { ...initialOrchestratorState, agents: [agent] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.DELETE_AGENT,
        payload: { id: agent.id },
      });

      expect(newState.agents).toHaveLength(0);
    });

    it('should unassign agent from tasks', () => {
      const agent = createMockAgent({ id: 'agent-1' });
      const task = createMockTask({ agentId: 'agent-1' });
      const state = { ...initialOrchestratorState, agents: [agent], tasks: [task] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.DELETE_AGENT,
        payload: { id: 'agent-1' },
      });

      expect(newState.tasks[0].agentId).toBe('');
    });
  });

  describe('ADD_TASK', () => {
    it('should add task to state', () => {
      const task = createMockTask();
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.ADD_TASK,
        payload: task,
      });

      expect(newState.tasks).toHaveLength(1);
      expect(newState.tasks[0]).toEqual(task);
    });
  });

  describe('DELETE_TASK', () => {
    it('should remove task from state', () => {
      const task = createMockTask();
      const state = { ...initialOrchestratorState, tasks: [task] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.DELETE_TASK,
        payload: { id: task.id },
      });

      expect(newState.tasks).toHaveLength(0);
    });

    it('should remove task from contextTaskIds of other tasks', () => {
      const task1 = createMockTask({ id: 'task-1' });
      const task2 = createMockTask({ id: 'task-2', contextTaskIds: ['task-1'] });
      const state = { ...initialOrchestratorState, tasks: [task1, task2] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.DELETE_TASK,
        payload: { id: 'task-1' },
      });

      expect(newState.tasks).toHaveLength(1);
      expect(newState.tasks[0].contextTaskIds).toEqual([]);
    });
  });

  describe('START_RUN', () => {
    it('should add run and set as selected', () => {
      const run = createMockRun();
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.START_RUN,
        payload: run,
      });

      expect(newState.runs).toHaveLength(1);
      expect(newState.selectedRunId).toBe(run.id);
    });
  });

  describe('UPDATE_RUN_STATUS', () => {
    it('should update run status', () => {
      const run = createMockRun({ status: 'pending' });
      const state = { ...initialOrchestratorState, runs: [run] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_RUN_STATUS,
        payload: { runId: run.id, status: 'completed' },
      });

      expect(newState.runs[0].status).toBe('completed');
    });
  });

  describe('SET_SELECTED_AGENT', () => {
    it('should set selected agent ID', () => {
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.SET_SELECTED_AGENT,
        payload: 'agent-123',
      });

      expect(newState.selectedAgentId).toBe('agent-123');
    });

    it('should clear selected agent when undefined', () => {
      const state = { ...initialOrchestratorState, selectedAgentId: 'agent-123' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.SET_SELECTED_AGENT,
        payload: undefined,
      });

      expect(newState.selectedAgentId).toBeUndefined();
    });
  });

  describe('UPDATE_TASK', () => {
    it('should update existing task', () => {
      const task = createMockTask();
      const state = { ...initialOrchestratorState, tasks: [task] };

      const updatedTask = { ...task, description: 'Updated description' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_TASK,
        payload: updatedTask,
      });

      expect(newState.tasks[0].description).toBe('Updated description');
    });
  });

  describe('ADD_FLOW', () => {
    it('should add flow to state', () => {
      const flow = createMockFlow();
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.ADD_FLOW,
        payload: flow,
      });

      expect(newState.flows).toHaveLength(1);
      expect(newState.flows[0]).toEqual(flow);
    });
  });

  describe('UPDATE_FLOW', () => {
    it('should update existing flow', () => {
      const flow = createMockFlow();
      const state = { ...initialOrchestratorState, flows: [flow] };

      const updatedFlow = { ...flow, name: 'Updated Flow' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_FLOW,
        payload: updatedFlow,
      });

      expect(newState.flows[0].name).toBe('Updated Flow');
    });
  });

  describe('DELETE_FLOW', () => {
    it('should remove flow from state', () => {
      const flow = createMockFlow();
      const state = { ...initialOrchestratorState, flows: [flow] };

      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.DELETE_FLOW,
        payload: { id: flow.id },
      });

      expect(newState.flows).toHaveLength(0);
    });
  });

  describe('SET_SELECTED_FLOW', () => {
    it('should set selected flow ID', () => {
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.SET_SELECTED_FLOW,
        payload: 'flow-123',
      });

      expect(newState.selectedFlowId).toBe('flow-123');
    });
  });

  describe('SET_SELECTED_RUN', () => {
    it('should set selected run ID', () => {
      const newState = orchestratorReducer(initialOrchestratorState, {
        type: ACTION_TYPES.SET_SELECTED_RUN,
        payload: 'run-123',
      });

      expect(newState.selectedRunId).toBe('run-123');
    });
  });

  describe('UPDATE_TASK_RUN', () => {
    it('should add new task run to existing run', () => {
      const run = createMockRun();
      const state = { ...initialOrchestratorState, runs: [run] };

      const taskRun = { taskId: 'task-1', status: 'completed' as const, output: 'Done' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_TASK_RUN,
        payload: { runId: run.id, taskRun },
      });

      expect(newState.runs[0].taskRuns).toHaveLength(1);
      expect(newState.runs[0].taskRuns[0].taskId).toBe('task-1');
    });

    it('should update existing task run', () => {
      const run = createMockRun({ taskRuns: [{ taskId: 'task-1', status: 'running' as const }] });
      const state = { ...initialOrchestratorState, runs: [run] };

      const taskRun = { taskId: 'task-1', status: 'completed' as const, output: 'Done' };
      const newState = orchestratorReducer(state, {
        type: ACTION_TYPES.UPDATE_TASK_RUN,
        payload: { runId: run.id, taskRun },
      });

      expect(newState.runs[0].taskRuns).toHaveLength(1);
      expect(newState.runs[0].taskRuns[0].status).toBe('completed');
    });
  });

  describe('default case', () => {
    it('should return state for unknown action', () => {
      const state = { ...initialOrchestratorState, isLoading: true };
      const newState = orchestratorReducer(state, { type: 'UNKNOWN_ACTION' } as any);

      expect(newState).toEqual(state);
    });
  });
});
