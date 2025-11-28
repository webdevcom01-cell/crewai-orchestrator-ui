import { AgentConfig, TaskConfig } from "../types";

// Backend API base URL - configure via environment variable
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

/**
 * Generate agent backstory via backend proxy (secure - API key on server)
 */
export const generateAgentBackstory = async (role: string, goal: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/generate-backstory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, goal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate backstory');
    }

    const data = await response.json();
    return data.data.backstory || "Expert agent dedicated to accomplishing assigned tasks with high precision.";
  } catch (error) {
    console.error("Error generating backstory:", error);
    return "Expert agent dedicated to accomplishing assigned tasks with high precision.";
  }
};

/**
 * Simulate crew run via backend proxy (secure - API key on server)
 */
export const simulateCrewRun = async (
  agents: AgentConfig[], 
  tasks: TaskConfig[], 
  processType: string,
  input?: Record<string, any>
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/simulate-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        agents, 
        tasks, 
        processType,
        input 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to simulate run');
    }

    const data = await response.json();
    
    // Return logs as JSON string for compatibility with existing code
    return JSON.stringify(data.data.logs || []);
  } catch (error) {
    console.error("Error simulating run:", error);
    throw error;
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`);
    const data = await response.json();
    return data.success && data.data.gemini;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};