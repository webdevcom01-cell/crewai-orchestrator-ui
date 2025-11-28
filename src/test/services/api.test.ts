import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiAgents, apiTasks, apiFlows } from '../../../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiAgents', () => {
    describe('getAll', () => {
      it('should fetch all agents', async () => {
        const mockAgents = [
          { id: 'agent_1', name: 'Agent 1', role: 'Tester' }
        ];
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAgents),
        });

        const result = await apiAgents.getAll();
        
        expect(result).toEqual(mockAgents);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/agents'));
      });

      it('should throw error on failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Server Error',
          text: () => Promise.resolve('Internal Server Error'),
        });

        await expect(apiAgents.getAll()).rejects.toThrow();
      });
    });

    describe('create', () => {
      it('should create a new agent', async () => {
        const newAgent = { name: 'New Agent', role: 'Developer', goal: 'Code', backstory: 'Dev', tools: [], model: 'gemini-2.0-flash' };
        const createdAgent = { id: 'agent_1', ...newAgent };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createdAgent),
        });

        const result = await apiAgents.create(newAgent as any);
        
        expect(result).toEqual(createdAgent);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/agents'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    describe('update', () => {
      it('should update an existing agent', async () => {
        const agent = { id: 'agent_1', name: 'Updated Agent', role: 'Developer', goal: 'Code', backstory: 'Dev', tools: [], model: 'gemini-2.0-flash' };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(agent),
        });

        const result = await apiAgents.update('agent_1', agent as any);
        
        expect(result).toEqual(agent);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/agents/agent_1'),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    });

    describe('delete', () => {
      it('should delete an agent', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await expect(apiAgents.delete('agent_1')).resolves.not.toThrow();
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/agents/agent_1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      it('should throw error on delete failure', async () => {
        mockFetch.mockResolvedValueOnce({ 
          ok: false, 
          statusText: 'Not Found' 
        });

        await expect(apiAgents.delete('agent_1')).rejects.toThrow();
      });
    });
  });

  describe('apiTasks', () => {
    describe('getAll', () => {
      it('should fetch all tasks', async () => {
        const mockTasks = [
          { id: 'task_1', name: 'Task 1', description: 'Do something' }
        ];
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTasks),
        });

        const result = await apiTasks.getAll();
        
        expect(result).toEqual(mockTasks);
      });
    });

    describe('create', () => {
      it('should create a new task', async () => {
        const newTask = { name: 'New Task', description: 'Do something', assignedAgent: 'agent_1', expectedOutput: 'Done' };
        const createdTask = { id: 'task_1', ...newTask };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createdTask),
        });

        const result = await apiTasks.create(newTask as any);
        
        expect(result).toEqual(createdTask);
      });
    });
  });

  describe('apiFlows', () => {
    describe('getAll', () => {
      it('should fetch all flows', async () => {
        const mockFlows = [
          { id: 'flow_1', name: 'Flow 1', process: 'sequential' }
        ];
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockFlows),
        });

        const result = await apiFlows.getAll();
        
        expect(result).toEqual(mockFlows);
      });
    });

    describe('create', () => {
      it('should create a new flow', async () => {
        const newFlow = { name: 'New Flow', process: 'sequential', taskIds: ['task_1'] };
        const createdFlow = { id: 'flow_1', ...newFlow };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createdFlow),
        });

        const result = await apiFlows.create(newFlow as any);
        
        expect(result).toEqual(createdFlow);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/flows'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    describe('update', () => {
      it('should update an existing flow', async () => {
        const flow = { id: 'flow_1', name: 'Updated Flow', process: 'sequential', taskIds: ['task_1'] };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(flow),
        });

        const result = await apiFlows.update('flow_1', flow as any);
        
        expect(result).toEqual(flow);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/flows/flow_1'),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    });

    describe('delete', () => {
      it('should delete a flow', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await expect(apiFlows.delete('flow_1')).resolves.not.toThrow();
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/flows/flow_1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    describe('startRun', () => {
      it('should start a flow run', async () => {
        const mockRun = { id: 'run_1', flowId: 'flow_1', status: 'running' };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRun),
        });

        const result = await apiFlows.startRun('flow_1', { input: 'test' });
        
        expect(result).toEqual(mockRun);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/flows/flow_1/run'),
          expect.objectContaining({ method: 'POST' })
        );
      });

      it('should throw error on start failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Bad Request',
        });

        await expect(apiFlows.startRun('flow_1', {})).rejects.toThrow();
      });
    });
  });

  describe('apiTasks extended', () => {
    describe('update', () => {
      it('should update an existing task', async () => {
        const task = { id: 'task_1', name: 'Updated Task', description: 'Updated' };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(task),
        });

        const result = await apiTasks.update('task_1', task as any);
        
        expect(result).toEqual(task);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tasks/task_1'),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    });

    describe('delete', () => {
      it('should delete a task', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await expect(apiTasks.delete('task_1')).resolves.not.toThrow();
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tasks/task_1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });
});
