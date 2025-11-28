export type ProcessType = 'sequential' | 'hierarchical' | 'parallel';

export interface AgentConfig {
  id: string;              // "dev_agent"
  name: string;            // "Dev Agent"
  role: string;
  goal: string;
  backstory: string;
  model: string;           // "gpt-4o", "claude-3-opus"...
  tools: string[];         // IDs tool-ova iz tvog registry-ja
  allowDelegation: boolean;
  verbose: boolean;
}

export interface TaskConfig {
  id: string;              // "research_task"
  name: string;
  description: string;
  expectedOutput: string;
  agentId: string;         // referenca na AgentConfig.id
  contextTaskIds: string[];// prethodni koraci
  isEntrypoint: boolean;
}

export interface FlowConfig {
  id: string;
  name: string;
  description: string;
  process: ProcessType;
  agentIds: string[];
  taskIds: string[];
}

export interface OrchestratorState {
  agents: AgentConfig[];
  tasks: TaskConfig[];
  flows: FlowConfig[];
  runs: FlowRun[];
  selectedAgentId?: string;
  selectedFlowId?: string;
  selectedRunId?: string;
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'thought';
}

export const AVAILABLE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-pro-preview',
  'gpt-4o',
  'gpt-4-turbo',
  'claude-3-5-sonnet',
  'ollama/llama3',
  'ollama/mistral',
];

export const AVAILABLE_TOOLS = [
  'SerperApiTool',
  'SerperDevTool',
  'ScrapeWebsiteTool',
  'Calculator',
  'FileReadTool',
  'FileWriteTool',
  'PGSearchTool',
  'VisionTool',
  'WebsiteSearchTool',
  'PDFSearchTool',
];

export type FlowRunStatus = 'pending' | 'running' | 'completed' | 'failed';

// SSE Event types for streaming run updates
export interface SSEEvent {
  type: 'task_started' | 'task_completed' | 'run_completed' | 'run_failed' | 'log' | 'error' | 'thought' | 'info' | 'success';
  taskId?: string;
  message?: string;
  output?: string;
  agent?: string;
  status?: FlowRunStatus;
  error?: string;
  timestamp?: string;
}

export interface TaskRunInfo {
  taskId: string;
  status: FlowRunStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  outputSummary?: string | null;   // sažetak outputa za UI
  errorMessage?: string | null;
}

export interface FlowRun {
  id: string;               // UUID run-a
  flowId: string;           // referenca na FlowConfig.id
  status: FlowRunStatus;
  currentTaskId?: string | null;
  taskRuns: TaskRunInfo[];  // po jedan entry po TaskConfig
  createdAt: string;
  updatedAt: string;
  input?: Record<string, any>;   // npr. { feature: "..." }
  finalOutput?: string | null;          // šta vrati crew/flow
}