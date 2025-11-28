import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrchestratorContext } from '../../reducer';
import { OrchestratorState } from '../../types';
import { ToastProvider } from '../../components/ui/Toast';
import { vi } from 'vitest';

// Mock initial state
export const mockInitialState: OrchestratorState = {
  agents: [],
  tasks: [],
  flows: [],
  runs: [],
  selectedAgentId: undefined,
  selectedFlowId: undefined,
  selectedRunId: undefined,
  isLoading: false,
  error: null,
};

// Mock dispatch function
export const mockDispatch = vi.fn();

// Wrapper with all providers
interface WrapperProps {
  children: React.ReactNode;
  state?: Partial<OrchestratorState>;
}

const AllTheProviders: React.FC<WrapperProps> = ({ children, state = {} }) => {
  const contextValue = {
    state: { ...mockInitialState, ...state },
    dispatch: mockDispatch,
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <OrchestratorContext.Provider value={contextValue}>
          {children}
        </OrchestratorContext.Provider>
      </ToastProvider>
    </BrowserRouter>
  );
};

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { state?: Partial<OrchestratorState> }
) {
  const { state, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders state={state}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Mock data generators
export const createMockAgent = (overrides = {}) => ({
  id: 'test-agent-1',
  name: 'Test Agent',
  role: 'Test Role',
  goal: 'Test goal',
  backstory: 'Test backstory',
  model: 'gemini-2.5-flash',
  tools: ['SerperApiTool'],
  allowDelegation: false,
  verbose: true,
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  id: 'test-task-1',
  name: 'Test Task',
  description: 'Test description',
  expectedOutput: 'Test output',
  agentId: 'test-agent-1',
  contextTaskIds: [],
  isEntrypoint: true,
  ...overrides,
});

export const createMockFlow = (overrides = {}) => ({
  id: 'test-flow-1',
  name: 'Test Flow',
  description: 'Test flow description',
  process: 'sequential' as const,
  agentIds: ['test-agent-1'],
  taskIds: ['test-task-1'],
  ...overrides,
});

export const createMockRun = (overrides = {}) => ({
  id: 'test-run-1',
  flowId: 'test-flow-1',
  status: 'pending' as const,
  currentTaskId: null,
  taskRuns: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
