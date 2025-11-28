import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAgentBackstory, simulateCrewRun, checkBackendHealth } from '../../../services/gemini';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('gemini service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAgentBackstory', () => {
    it('should generate backstory successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { backstory: 'An experienced developer with expertise.' }
        }),
      });

      const result = await generateAgentBackstory('Developer', 'Build software');
      
      expect(result).toBe('An experienced developer with expertise.');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/generate-backstory'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ role: 'Developer', goal: 'Build software' }),
        })
      );
    });

    it('should return default backstory on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' }),
      });

      const result = await generateAgentBackstory('Developer', 'Build software');
      
      expect(result).toBe('Expert agent dedicated to accomplishing assigned tasks with high precision.');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateAgentBackstory('Developer', 'Build software');
      
      expect(result).toBe('Expert agent dedicated to accomplishing assigned tasks with high precision.');
    });
  });

  describe('simulateCrewRun', () => {
    const mockAgents = [
      { id: 'agent_1', name: 'Agent 1', role: 'Developer', goal: 'Code', backstory: 'Dev', tools: [], model: 'gemini-2.0-flash' }
    ];
    const mockTasks = [
      { id: 'task_1', name: 'Task 1', description: 'Do something', assignedAgent: 'agent_1', expectedOutput: 'Done' }
    ];

    it('should simulate run successfully', async () => {
      const mockLogs = [
        { type: 'task_start', message: 'Starting task' },
        { type: 'task_complete', message: 'Task completed' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { logs: mockLogs }
        }),
      });

      const result = await simulateCrewRun(mockAgents as any, mockTasks as any, 'sequential');
      
      expect(JSON.parse(result)).toEqual(mockLogs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/simulate-run'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Simulation failed' }),
      });

      await expect(simulateCrewRun(mockAgents as any, mockTasks as any, 'sequential'))
        .rejects.toThrow('Simulation failed');
    });
  });

  describe('checkBackendHealth', () => {
    it('should return true when backend is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { gemini: true }
        }),
      });

      const result = await checkBackendHealth();
      
      expect(result).toBe(true);
    });

    it('should return false when backend is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { gemini: false }
        }),
      });

      const result = await checkBackendHealth();
      
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkBackendHealth();
      
      expect(result).toBe(false);
    });
  });
});
