import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockAgent } from '../testUtils';
import AgentsView from '../../../components/AgentsView';

// Mock the API
vi.mock('../../../services/api', () => ({
  apiAgents: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: data.id || 'new_agent_id' })),
    update: vi.fn().mockImplementation((id, data) => Promise.resolve(data)),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { apiAgents } from '../../../services/api';

// Mock gemini service
vi.mock('../../../services/gemini', () => ({
  generateAgentBackstory: vi.fn().mockResolvedValue('Generated backstory'),
}));

describe('AgentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render agents view heading', () => {
      renderWithProviders(<AgentsView />);
      expect(screen.getByText('Agents')).toBeInTheDocument();
    });

    it('should show empty state message when no agent selected', () => {
      renderWithProviders(<AgentsView />);
      expect(screen.getByText('Select an agent to edit')).toBeInTheDocument();
    });

    it('should show hint text in empty state', () => {
      renderWithProviders(<AgentsView />);
      expect(screen.getByText('or create a new one')).toBeInTheDocument();
    });

    it('should show "No agents defined yet" when no agents', () => {
      renderWithProviders(<AgentsView />);
      expect(screen.getByText('No agents defined yet.')).toBeInTheDocument();
    });

    it('should render create button with correct aria-label', () => {
      renderWithProviders(<AgentsView />);
      expect(screen.getByRole('button', { name: /Create new agent/i })).toBeInTheDocument();
    });

    it('should render agent list when agents exist', () => {
      const mockAgent = createMockAgent({ name: 'Test Agent', role: 'Tester' });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });

    it('should render multiple agents', () => {
      const agents = [
        createMockAgent({ id: 'agent1', name: 'Agent One' }),
        createMockAgent({ id: 'agent2', name: 'Agent Two' }),
      ];
      renderWithProviders(<AgentsView />, {
        state: { agents, tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });
      expect(screen.getByText('Agent One')).toBeInTheDocument();
      expect(screen.getByText('Agent Two')).toBeInTheDocument();
    });

    it('should show agent role in list', () => {
      const mockAgent = createMockAgent({ name: 'My Agent', role: 'Research Specialist' });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });
      expect(screen.getByText('Research Specialist')).toBeInTheDocument();
    });
  });

  describe('agent creation', () => {
    it('should have create button that is clickable', async () => {
      renderWithProviders(<AgentsView />);

      const createButton = screen.getByRole('button', { name: /Create new agent/i });
      expect(createButton).toBeEnabled();
    });
  });

  describe('agent editing', () => {
    it('should show agent form when agent is clicked', async () => {
      const mockAgent = createMockAgent({ id: 'agent1', name: 'Clickable Agent' });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });

      const agentCard = screen.getByText('Clickable Agent');
      await userEvent.click(agentCard);

      await waitFor(() => {
        expect(screen.getByText('Configure Agent')).toBeInTheDocument();
      });
    });

    it('should populate form with agent data', async () => {
      const mockAgent = createMockAgent({ 
        id: 'agent1', 
        name: 'My Agent',
        role: 'Test Role',
      });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });

      const agentCard = screen.getByText('My Agent');
      await userEvent.click(agentCard);

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Agent')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
      });
    });
  });

  describe('agent deletion', () => {
    it('should open delete modal when delete clicked', async () => {
      const mockAgent = createMockAgent({ id: 'agent1', name: 'ToDelete Agent' });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });

      await userEvent.click(screen.getByText('ToDelete Agent'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete$/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      expect(screen.getByText(/Are you sure you want to delete this agent/)).toBeInTheDocument();
    });

    it('should have delete modal with cancel and confirm buttons', async () => {
      const mockAgent = createMockAgent({ id: 'agent1', name: 'ModalTest Agent' });
      renderWithProviders(<AgentsView />, {
        state: { agents: [mockAgent], tasks: [], flows: [], runs: [], isLoading: false, error: null },
      });

      await userEvent.click(screen.getByText('ModalTest Agent'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete$/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      // Modal should have both Cancel and Delete Agent buttons
      const buttons = screen.getAllByRole('button');
      const cancelBtn = buttons.find(b => b.textContent === 'Cancel');
      const deleteBtn = buttons.find(b => b.textContent === 'Delete Agent');
      
      expect(cancelBtn).toBeInTheDocument();
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible create button', () => {
      renderWithProviders(<AgentsView />);
      const button = screen.getByRole('button', { name: /Create new agent/i });
      expect(button).toHaveAttribute('aria-label', 'Create new agent');
    });
  });
});
