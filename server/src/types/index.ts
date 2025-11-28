import { z } from 'zod';

// ============================================
// Request Validation Schemas
// ============================================

export const generateBackstorySchema = z.object({
  role: z.string().min(1, 'Role is required').max(200, 'Role too long'),
  goal: z.string().min(1, 'Goal is required').max(1000, 'Goal too long'),
});

export const agentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  goal: z.string(),
  backstory: z.string(),
  model: z.string(),
  tools: z.array(z.string()),
  allowDelegation: z.boolean(),
  verbose: z.boolean(),
});

export const taskConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  expectedOutput: z.string(),
  agentId: z.string(),
  contextTaskIds: z.array(z.string()),
  isEntrypoint: z.boolean(),
});

export const simulateRunSchema = z.object({
  agents: z.array(agentConfigSchema).min(1, 'At least one agent is required'),
  tasks: z.array(taskConfigSchema).min(1, 'At least one task is required'),
  processType: z.enum(['sequential', 'hierarchical', 'parallel']),
  input: z.record(z.any()).optional(),
});

// ============================================
// TypeScript Types
// ============================================

export type GenerateBackstoryRequest = z.infer<typeof generateBackstorySchema>;
export type AgentConfig = z.infer<typeof agentConfigSchema>;
export type TaskConfig = z.infer<typeof taskConfigSchema>;
export type SimulateRunRequest = z.infer<typeof simulateRunSchema>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: 'thought' | 'action' | 'output' | 'error' | 'info';
  content: string;
}

export interface SimulationResult {
  runId: string;
  status: 'completed' | 'failed';
  logs: LogEntry[];
  finalOutput?: string;
  error?: string;
  duration: number;
}

// Error types
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AIServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}
