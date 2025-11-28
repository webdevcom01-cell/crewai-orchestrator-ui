import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../../services/gemini.service.js';
import { AIServiceError } from '../../types/index.js';

// Mock config before importing service
vi.mock('../../config/index.js', () => ({
  config: {
    gemini: {
      apiKey: 'test-key',
      timeout: 30000,
      maxBackstoryLength: 500,
      maxSimulationTokens: 8000,
    },
  },
}));

// Mock the GoogleGenerativeAI
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn(),
      }),
    })),
  };
});

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GeminiService();
  });

  describe('generateBackstory', () => {
    it('should generate backstory successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'An experienced developer with 10+ years of expertise.',
        },
      };

      // @ts-ignore - Mock implementation
      service['flashModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.generateBackstory({
        role: 'Senior Developer',
        goal: 'Write clean code',
      });

      expect(result).toBe('An experienced developer with 10+ years of expertise.');
    });

    it('should trim backstory to max length', async () => {
      const longText = 'A'.repeat(600);
      const mockResponse = {
        response: {
          text: () => longText,
        },
      };

      // @ts-ignore
      service['flashModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.generateBackstory({
        role: 'Developer',
        goal: 'Code',
      });

      expect(result.length).toBeLessThanOrEqual(503); // 500 + "..."
      expect(result.endsWith('...')).toBe(true);
    });

    it('should throw error on empty response', async () => {
      const mockResponse = {
        response: {
          text: () => '',
        },
      };

      // @ts-ignore
      service['flashModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      await expect(
        service.generateBackstory({ role: 'Developer', goal: 'Code' })
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle API errors', async () => {
      // @ts-ignore
      service['flashModel'].generateContent = vi.fn().mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        service.generateBackstory({ role: 'Developer', goal: 'Code' })
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('simulateCrewRun', () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'TestAgent',
        role: 'Developer',
        goal: 'Write code',
        backstory: 'Expert dev',
        model: 'gemini-2.5-flash',
        tools: ['FileWriteTool'],
        allowDelegation: false,
        verbose: true,
      },
    ];

    const mockTasks = [
      {
        id: 'task-1',
        name: 'Test Task',
        description: 'Write tests',
        expectedOutput: 'Test files',
        agentId: 'agent-1',
        contextTaskIds: [],
        isEntrypoint: true,
      },
    ];

    it('should simulate crew run successfully', async () => {
      const mockLogs = [
        { agent: 'System', type: 'info', content: 'Starting task' },
        { agent: 'TestAgent', type: 'thought', content: 'Analyzing requirements' },
        { agent: 'TestAgent', type: 'output', content: 'Task completed' },
      ];

      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockLogs),
        },
      };

      // @ts-ignore
      service['proModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.simulateCrewRun(
        mockAgents,
        mockTasks,
        'sequential'
      );

      expect(result.status).toBe('completed');
      expect(result.logs).toHaveLength(3);
      expect(result.logs[0]).toHaveProperty('id');
      expect(result.logs[0]).toHaveProperty('timestamp');
      expect(result.finalOutput).toBeTruthy();
    });

    it('should handle markdown code blocks in response', async () => {
      const mockLogs = [{ agent: 'System', type: 'info', content: 'Test' }];
      const mockResponse = {
        response: {
          text: () => `\`\`\`json\n${JSON.stringify(mockLogs)}\n\`\`\``,
        },
      };

      // @ts-ignore
      service['proModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.simulateCrewRun(
        mockAgents,
        mockTasks,
        'sequential'
      );

      expect(result.status).toBe('completed');
      expect(result.logs).toHaveLength(1);
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid JSON',
        },
      };

      // @ts-ignore
      service['proModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.simulateCrewRun(
        mockAgents,
        mockTasks,
        'sequential'
      );

      expect(result.status).toBe('failed');
      expect(result.error).toBeTruthy();
    });

    it('should include input parameters in prompt', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify([{ agent: 'System', type: 'info', content: 'Test' }]),
        },
      };

      const generateContentSpy = vi.fn().mockResolvedValue(mockResponse);
      // @ts-ignore
      service['proModel'].generateContent = generateContentSpy;

      await service.simulateCrewRun(
        mockAgents,
        mockTasks,
        'sequential',
        { feature: 'user-auth' }
      );

      const callArgs = generateContentSpy.mock.calls[0][0];
      expect(callArgs.contents[0].parts[0].text).toContain('user-auth');
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      const mockResponse = {
        response: {
          text: () => 'Hello!',
        },
      };

      // @ts-ignore
      service['flashModel'].generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when API fails', async () => {
      // @ts-ignore
      service['flashModel'].generateContent = vi.fn().mockRejectedValue(
        new Error('API Error')
      );

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });
});
