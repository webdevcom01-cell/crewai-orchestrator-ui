import { AgentConfig, TaskConfig, FlowConfig, FlowRun, SSEEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = getHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  const json = await response.json();
  return json.data ? json.data : json;
}

// --- Agents ---

export const apiAgents = {
  getAll: async (): Promise<AgentConfig[]> => {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      headers: getHeaders(),
    });
    return handleResponse<AgentConfig[]>(res);
  },

  create: async (agent: Omit<AgentConfig, 'id'> & { id?: string }): Promise<AgentConfig> => {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(agent),
    });
    return handleResponse<AgentConfig>(res);
  },

  update: async (id: string, agent: AgentConfig): Promise<AgentConfig> => {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(agent),
    });
    return handleResponse<AgentConfig>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
  },
};

// --- Tasks ---

export const apiTasks = {
  getAll: async (): Promise<TaskConfig[]> => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getHeaders(),
    });
    return handleResponse<TaskConfig[]>(res);
  },

  create: async (task: Omit<TaskConfig, 'id'> & { id?: string }): Promise<TaskConfig> => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse<TaskConfig>(res);
  },

  update: async (id: string, task: TaskConfig): Promise<TaskConfig> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse<TaskConfig>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
  },
};

// --- Flows ---

export const apiFlows = {
  getAll: async (): Promise<FlowConfig[]> => {
    const res = await fetch(`${API_BASE_URL}/flows`, {
      headers: getHeaders(),
    });
    return handleResponse<FlowConfig[]>(res);
  },

  create: async (flow: Omit<FlowConfig, 'id'> & { id?: string }): Promise<FlowConfig> => {
    const res = await fetch(`${API_BASE_URL}/flows`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(flow),
    });
    return handleResponse<FlowConfig>(res);
  },

  update: async (id: string, flow: FlowConfig): Promise<FlowConfig> => {
    const res = await fetch(`${API_BASE_URL}/flows/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(flow),
    });
    return handleResponse<FlowConfig>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/flows/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
  },

  getRuns: async (flowId: string): Promise<FlowRun[]> => {
    const res = await fetch(`${API_BASE_URL}/flows/${flowId}/runs`, {
      headers: getHeaders(),
    });
    return handleResponse<FlowRun[]>(res);
  },

  startRun: async (flowId: string, input: Record<string, any>): Promise<FlowRun> => {
    const res = await fetch(`${API_BASE_URL}/flows/${flowId}/runs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ input }),
    });
    return handleResponse<FlowRun>(res);
  },
};

// --- Runs ---

export const apiRuns = {
  get: async (runId: string): Promise<FlowRun> => {
    const res = await fetch(`${API_BASE_URL}/runs/${runId}`, {
      headers: getHeaders(),
    });
    return handleResponse<FlowRun>(res);
  },

  streamEvents: (runId: string, onEvent: (event: SSEEvent) => void): (() => void) => {
    const eventSource = new EventSource(`${API_BASE_URL}/runs/${runId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },
};

// --- Workspaces ---

export const apiWorkspaces = {
  get: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}`);
    return handleResponse(res);
  },

  getMembers: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}/members`);
    return handleResponse(res);
  },

  inviteMember: async (id: string, email: string, role: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    return handleResponse(res);
  },

  getAnalytics: async (id: string, period: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}/analytics?period=${period}`);
    return handleResponse(res);
  },

  getSubscription: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}/subscription`);
    return handleResponse(res);
  },

  getUsage: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/workspaces/${id}/usage`);
    return handleResponse(res);
  },
};

// --- Integrations ---

export const apiIntegrations = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/integrations`);
    return handleResponse(res);
  },

  create: async (data: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/integrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/integrations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(res.statusText);
  },
};

// --- Schedules ---

export const apiSchedules = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/schedules`);
    return handleResponse(res);
  },

  create: async (data: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: any) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(res.statusText);
  },
};

// --- API Keys ---

export const apiApiKeys = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api-keys`);
    return handleResponse(res);
  },

  create: async (name: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api-keys/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(res.statusText);
  },
};
