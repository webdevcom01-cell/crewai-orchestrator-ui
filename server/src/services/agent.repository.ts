// Agent Repository - Database operations for AI agents
import { prisma } from './database.service.js';
import type { Agent, Prisma } from '@prisma/client';

export interface CreateAgentInput {
  workspaceId: string;
  createdById: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
}

export interface UpdateAgentInput {
  name?: string;
  role?: string;
  goal?: string;
  backstory?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  isActive?: boolean;
}

export const agentRepository = {
  // Find agent by ID
  async findById(id: string): Promise<Agent | null> {
    return prisma.agent.findUnique({
      where: { id },
    });
  },

  // Find all agents in workspace
  async findByWorkspace(workspaceId: string): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Find active agents in workspace
  async findActiveByWorkspace(workspaceId: string): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: { 
        workspaceId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Create new agent
  async create(data: CreateAgentInput): Promise<Agent> {
    return prisma.agent.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        name: data.name,
        role: data.role,
        goal: data.goal,
        backstory: data.backstory,
        model: data.model ?? 'gemini-1.5-flash',
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 4096,
        tools: data.tools ?? [],
      },
    });
  },

  // Update agent
  async update(id: string, data: UpdateAgentInput): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data,
    });
  },

  // Delete agent
  async delete(id: string): Promise<void> {
    await prisma.agent.delete({
      where: { id },
    });
  },

  // Soft delete (deactivate)
  async deactivate(id: string): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data: { isActive: false },
    });
  },

  // Get agent with tasks
  async findWithTasks(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
  },

  // Count agents in workspace
  async countByWorkspace(workspaceId: string): Promise<number> {
    return prisma.agent.count({
      where: { workspaceId },
    });
  },

  // Bulk create agents
  async createMany(agents: CreateAgentInput[]): Promise<number> {
    const result = await prisma.agent.createMany({
      data: agents.map(agent => ({
        workspaceId: agent.workspaceId,
        createdById: agent.createdById,
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
        backstory: agent.backstory,
        model: agent.model ?? 'gemini-1.5-flash',
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 4096,
        tools: agent.tools ?? [],
      })),
    });
    return result.count;
  },
};

export default agentRepository;
