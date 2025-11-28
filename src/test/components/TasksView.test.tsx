import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockTask, createMockAgent } from '../testUtils';
import TasksView from '../../../components/TasksView';

vi.mock('../../../services/api', () => ({
  apiTasks: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: data.id || 'new_task_id' })),
    update: vi.fn().mockImplementation((id, data) => Promise.resolve(data)),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { apiTasks } from '../../../services/api';

describe('TasksView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render tasks view component', () => {
      const { container } = renderWithProviders(<TasksView />);
      expect(container).toBeTruthy();
    });

    it('should show empty state when no tasks', () => {
      renderWithProviders(<TasksView />);
      expect(screen.getByText('No tasks in pipeline.')).toBeInTheDocument();
    });

    it('should render Task Flow heading', () => {
      renderWithProviders(<TasksView />);
      expect(screen.getByText('Task Flow')).toBeInTheDocument();
    });

    it('should render add task button', () => {
      renderWithProviders(<TasksView />);
      expect(screen.getByRole('button', { name: /Create new task/i })).toBeInTheDocument();
    });

    it('should render Sequential Pipeline subtitle', () => {
      renderWithProviders(<TasksView />);
      expect(screen.getByText('Sequential Pipeline')).toBeInTheDocument();
    });

    it('should render tasks when they exist in state', () => {
      const tasks = [
        createMockTask({ id: 'task1', description: 'First Task Description' }),
        createMockTask({ id: 'task2', description: 'Second Task Description' }),
      ];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });
      expect(screen.getByText(/First Task Description/)).toBeInTheDocument();
      expect(screen.getByText(/Second Task Description/)).toBeInTheDocument();
    });

    it('should show step numbers for tasks', () => {
      const tasks = [createMockTask({ id: 'task1' })];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show task id in list', () => {
      const tasks = [createMockTask({ id: 'my_task_id' })];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });
      expect(screen.getByText('my_task_id')).toBeInTheDocument();
    });
  });

  describe('task creation', () => {
    it('should open form when add button clicked', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Configure Task Step')).toBeInTheDocument();
    });

    it('should show task form fields', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByLabelText(/Task ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Task Name/i)).toBeInTheDocument();
    });

    it('should call API when saving new task', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      const saveButton = screen.getByRole('button', { name: /Save Task/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(apiTasks.create).toHaveBeenCalled();
      });
    });

    it('should show Save and Delete buttons in form', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByRole('button', { name: /Save Task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should show assigned agent dropdown in form', async () => {
      const agents = [createMockAgent({ id: 'agent1', name: 'Agent One' })];
      renderWithProviders(<TasksView />, {
        state: { tasks: [], agents, flows: [], runs: [], isLoading: false, error: null }
      });

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Assigned Agent')).toBeInTheDocument();
    });
  });

  describe('empty state interaction', () => {
    it('should show hint text in empty state', () => {
      renderWithProviders(<TasksView />);
      expect(screen.getByText('Click + to add first step')).toBeInTheDocument();
    });

    it('should show select task message when no task selected', () => {
      const tasks = [createMockTask({ id: 'task1' })];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });

      expect(screen.getByText('Select a task step to edit')).toBeInTheDocument();
    });

    it('should show add step hint', () => {
      const tasks = [createMockTask({ id: 'task1' })];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });

      expect(screen.getByText('or add a new step to the flow')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should show YAML preview section in form', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('TaskConfig (YAML)')).toBeInTheDocument();
    });

    it('should show Expected Output field in form', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Expected Output')).toBeInTheDocument();
    });

    it('should show Context Dependencies section in form', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Context Dependencies')).toBeInTheDocument();
    });

    it('should show isEntrypoint checkbox', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Is Entrypoint')).toBeInTheDocument();
    });

    it('should allow changing task name', async () => {
      renderWithProviders(<TasksView />);

      const addButton = screen.getByRole('button', { name: /Create new task/i });
      await userEvent.click(addButton);

      const nameInput = screen.getByLabelText(/Task Name/i);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Test Task');

      expect(nameInput).toHaveValue('New Test Task');
    });
  });

  describe('task selection', () => {
    it('should show task description in list', () => {
      const tasks = [createMockTask({ id: 'task1', description: 'Task Description Text' })];
      renderWithProviders(<TasksView />, { 
        state: { tasks, agents: [], flows: [], runs: [], isLoading: false, error: null } 
      });
      expect(screen.getByText(/Task Description Text/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible create button', () => {
      renderWithProviders(<TasksView />);
      const button = screen.getByRole('button', { name: /Create new task/i });
      expect(button).toHaveAttribute('aria-label', 'Create new task');
    });
  });
});
