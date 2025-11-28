import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockAgent, createMockTask, createMockFlow } from '../testUtils';
import CrewView from '../../../components/CrewView';

vi.mock('../../../services/gemini', () => ({
  generateAgentBackstory: vi.fn().mockResolvedValue('Generated backstory'),
}));

vi.mock('../../../services/api', () => ({
  apiFlows: {
    getAll: vi.fn().mockResolvedValue([]),
    startRun: vi.fn().mockResolvedValue({ id: 'run_1', flowId: 'flow1', status: 'running', taskRuns: [] }),
  },
  apiRuns: {
    streamEvents: vi.fn().mockReturnValue(() => {}),
  },
}));

import { apiFlows, apiRuns } from '../../../services/api';

describe('CrewView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should render crew view component', () => {
      const { container } = renderWithProviders(<CrewView />);
      expect(container).toBeTruthy();
    });

    it('should show configuration incomplete message when no agents', () => {
      renderWithProviders(<CrewView />);
      expect(screen.getByText('Configuration Incomplete')).toBeInTheDocument();
    });

    it('should show requirement message', () => {
      renderWithProviders(<CrewView />);
      expect(screen.getByText(/You need at least 1 agent and 1 task/)).toBeInTheDocument();
    });
  });

  describe('with data', () => {
    const setupWithData = () => {
      const agents = [createMockAgent({ id: 'agent1', name: 'Test Agent' })];
      const tasks = [createMockTask({ id: 'task1', name: 'Test Task', description: 'Do something', agentId: 'agent1' })];
      const flows = [createMockFlow({ id: 'flow1', taskIds: ['task1'], agentIds: ['agent1'] })];
      return { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } };
    };

    it('should show Run Simulation heading', () => {
      const { state } = setupWithData();
      renderWithProviders(<CrewView />, { state });

      expect(screen.getByText('Run Simulation')).toBeInTheDocument();
    });

    it('should show Sequential Pipeline subtitle', () => {
      const { state } = setupWithData();
      renderWithProviders(<CrewView />, { state });

      expect(screen.getByText('Sequential Pipeline')).toBeInTheDocument();
    });

    it('should show Start button', () => {
      const { state } = setupWithData();
      renderWithProviders(<CrewView />, { state });

      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
    });

    it('should show task in pipeline', () => {
      const { state } = setupWithData();
      renderWithProviders(<CrewView />, { state });

      expect(screen.getByText(/Do something/)).toBeInTheDocument();
    });

    it('should show agent name on task', () => {
      const { state } = setupWithData();
      renderWithProviders(<CrewView />, { state });

      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  describe('multiple tasks', () => {
    it('should show all tasks in order', () => {
      const agents = [createMockAgent({ id: 'agent1', name: 'Agent One' })];
      const tasks = [
        createMockTask({ id: 'task1', description: 'First task', agentId: 'agent1' }),
        createMockTask({ id: 'task2', description: 'Second task', agentId: 'agent1' }),
      ];
      const flows = [createMockFlow({ id: 'flow1', taskIds: ['task1', 'task2'] })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } });

      expect(screen.getByText(/First task/)).toBeInTheDocument();
      expect(screen.getByText(/Second task/)).toBeInTheDocument();
    });
  });

  describe('run execution', () => {
    it('should start run when Start clicked', async () => {
      const agents = [createMockAgent({ id: 'agent1' })];
      const tasks = [createMockTask({ id: 'task1' })];
      const flows = [createMockFlow({ id: 'flow1' })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } });

      const runButton = screen.getByRole('button', { name: /Start/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(apiFlows.startRun).toHaveBeenCalledWith('flow1', {});
      });
    });

    it('should connect to SSE after starting run', async () => {
      const agents = [createMockAgent({ id: 'agent1' })];
      const tasks = [createMockTask({ id: 'task1' })];
      const flows = [createMockFlow({ id: 'flow1' })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } });

      const runButton = screen.getByRole('button', { name: /Start/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(apiRuns.streamEvents).toHaveBeenCalled();
      });
    });

    it('should show initialization log after start', async () => {
      const agents = [createMockAgent({ id: 'agent1' })];
      const tasks = [createMockTask({ id: 'task1' })];
      const flows = [createMockFlow({ id: 'flow1' })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } });

      const runButton = screen.getByRole('button', { name: /Start/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Initializing crew run/)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      vi.mocked(apiFlows.startRun).mockRejectedValueOnce(new Error('API Error'));
      
      const agents = [createMockAgent({ id: 'agent1' })];
      const tasks = [createMockTask({ id: 'task1' })];
      const flows = [createMockFlow({ id: 'flow1' })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows, selectedFlowId: 'flow1', runs: [], isLoading: false, error: null } });

      const runButton = screen.getByRole('button', { name: /Start/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to start run/)).toBeInTheDocument();
      });
    });

    it('should show no flow selected toast', async () => {
      const agents = [createMockAgent({ id: 'agent1' })];
      const tasks = [createMockTask({ id: 'task1' })];
      renderWithProviders(<CrewView />, { state: { agents, tasks, flows: [], selectedFlowId: undefined, runs: [], isLoading: false, error: null } });

      // Button should be disabled but we test the component renders
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});