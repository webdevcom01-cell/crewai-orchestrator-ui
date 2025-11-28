import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentForm from '../../../components/AgentForm';
import { AVAILABLE_MODELS, AVAILABLE_TOOLS } from '../../../types';

// Mock gemini service
vi.mock('../../../services/gemini', () => ({
  generateAgentBackstory: vi.fn(),
}));

import { generateAgentBackstory } from '../../../services/gemini';

const createMockAgent = (overrides = {}) => ({
  id: 'test_agent',
  name: 'Test Agent',
  role: 'Test Role',
  goal: 'Test Goal',
  backstory: 'Test backstory',
  model: 'gpt-4o',
  tools: ['SerperDevTool'],
  allowDelegation: false,
  verbose: true,
  ...overrides,
});

describe('AgentForm', () => {
  const mockOnSave = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form with initial data', () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test_agent')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Goal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test backstory')).toBeInTheDocument();
    });

    it('should render all available models in select', () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const select = screen.getByRole('combobox');
      AVAILABLE_MODELS.forEach(model => {
        expect(select).toContainHTML(model);
      });
    });

    it('should render all available tools', () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      AVAILABLE_TOOLS.forEach(tool => {
        expect(screen.getByRole('button', { name: tool })).toBeInTheDocument();
      });
    });

    it('should show selected tools count', () => {
      const agent = createMockAgent({ tools: ['SerperDevTool', 'FileReadTool'] });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('should display YAML preview', () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      expect(screen.getByText(/AgentConfig \(YAML\)/)).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update name field', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const nameInput = screen.getByDisplayValue('Test Agent');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Agent Name');

      expect(screen.getByDisplayValue('New Agent Name')).toBeInTheDocument();
    });

    it('should sanitize ID field input', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const idInput = screen.getByDisplayValue('test_agent');
      await userEvent.clear(idInput);
      await userEvent.type(idInput, 'New-Agent@ID');

      // Should be sanitized to lowercase with underscores
      expect(screen.getByDisplayValue('new_agent_id')).toBeInTheDocument();
    });

    it('should update role field', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const roleInput = screen.getByDisplayValue('Test Role');
      await userEvent.clear(roleInput);
      await userEvent.type(roleInput, 'Senior Analyst');

      expect(screen.getByDisplayValue('Senior Analyst')).toBeInTheDocument();
    });

    it('should update goal textarea', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const goalTextarea = screen.getByDisplayValue('Test Goal');
      await userEvent.clear(goalTextarea);
      await userEvent.type(goalTextarea, 'New goal');

      expect(screen.getByDisplayValue('New goal')).toBeInTheDocument();
    });

    it('should update backstory textarea', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const backstoryTextarea = screen.getByDisplayValue('Test backstory');
      await userEvent.clear(backstoryTextarea);
      await userEvent.type(backstoryTextarea, 'New backstory');

      expect(screen.getByDisplayValue('New backstory')).toBeInTheDocument();
    });

    it('should change model selection', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'claude-3-5-sonnet');

      expect(select).toHaveValue('claude-3-5-sonnet');
    });

    it('should toggle tool selection', async () => {
      const agent = createMockAgent({ tools: [] });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const toolButton = screen.getByRole('button', { name: 'FileReadTool' });
      await userEvent.click(toolButton);

      // Tool should now be selected (has emerald color class)
      expect(toolButton).toHaveClass('bg-emerald-500/20');
    });

    it('should deselect tool when clicking again', async () => {
      const agent = createMockAgent({ tools: ['FileReadTool'] });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const toolButton = screen.getByRole('button', { name: 'FileReadTool' });
      expect(toolButton).toHaveClass('bg-emerald-500/20');
      
      await userEvent.click(toolButton);

      expect(toolButton).not.toHaveClass('bg-emerald-500/20');
    });

    it('should toggle allowDelegation checkbox', async () => {
      const agent = createMockAgent({ allowDelegation: false });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const checkbox = screen.getByRole('checkbox', { name: /Allow Delegation/i });
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should toggle verbose checkbox', async () => {
      const agent = createMockAgent({ verbose: false });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const checkbox = screen.getByRole('checkbox', { name: /Verbose Logging/i });
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('actions', () => {
    it('should call onSave when Save button clicked', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const saveButton = screen.getByRole('button', { name: /Save Agent/i });
      await userEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(agent);
    });

    it('should call onDelete when Delete button clicked', async () => {
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await userEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('test_agent');
    });
  });

  describe('AI backstory generation', () => {
    it('should generate backstory when button clicked', async () => {
      vi.mocked(generateAgentBackstory).mockResolvedValue('AI generated backstory');
      
      const agent = createMockAgent({ backstory: '' });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
      await userEvent.click(generateButton);

      await waitFor(() => {
        expect(generateAgentBackstory).toHaveBeenCalledWith('Test Role', 'Test Goal');
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('AI generated backstory')).toBeInTheDocument();
      });
    });

    it('should disable generate button when role is empty', () => {
      const agent = createMockAgent({ role: '', goal: 'Some goal' });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
      expect(generateButton).toBeDisabled();
    });

    it('should disable generate button when goal is empty', () => {
      const agent = createMockAgent({ role: 'Some role', goal: '' });
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
      expect(generateButton).toBeDisabled();
    });

    it('should show loading state during generation', async () => {
      vi.mocked(generateAgentBackstory).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('Generated'), 100))
      );
      
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
      await userEvent.click(generateButton);

      expect(screen.getByText('Generating...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
      });
    });

    it('should handle generation error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(generateAgentBackstory).mockRejectedValue(new Error('API Error'));
      
      const agent = createMockAgent();
      render(<AgentForm initialData={agent} onSave={mockOnSave} onDelete={mockOnDelete} />);

      const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
      await userEvent.click(generateButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to generate backstory', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('form reset on initialData change', () => {
    it('should reset form when initialData changes', () => {
      const agent1 = createMockAgent({ name: 'Agent 1' });
      const agent2 = createMockAgent({ id: 'agent_2', name: 'Agent 2' });

      const { rerender } = render(
        <AgentForm initialData={agent1} onSave={mockOnSave} onDelete={mockOnDelete} />
      );

      expect(screen.getByDisplayValue('Agent 1')).toBeInTheDocument();

      rerender(<AgentForm initialData={agent2} onSave={mockOnSave} onDelete={mockOnDelete} />);

      expect(screen.getByDisplayValue('Agent 2')).toBeInTheDocument();
    });
  });
});
