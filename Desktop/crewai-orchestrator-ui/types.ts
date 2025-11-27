export interface Agent {
  id: string;
  role: string;
  goal: string;
  backstory: string;
  allowDelegation: boolean;
  verbose: boolean;
  tools: string[]; // Simplified for UI
  model: string;
}

export interface Task {
  id: string;
  description: string;
  expectedOutput: string;
  agentId: string | null;
  asyncExecution: boolean;
}

export interface CrewConfig {
  process: 'sequential' | 'hierarchical';
  verbose: boolean;
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
  'SerperDevTool',
  'ScrapeWebsiteTool',
  'Calculator',
  'FileReadTool',
  'FileWriteTool',
  'PGSearchTool',
  'VisionTool',
];