// Task Repository - Database operations for tasks
import { prisma } from './database.service.js';
import type { Task, Prisma } from '@prisma/client';

export interface CreateTaskInput {
  workspaceId: string;
  createdById: string;
  agentId?: string;
  description: string;
  expectedOutput: string;
  context?: string;
  priority?: number;
  async?: boolean;
  humanInput?: boolean;
}

export interface UpdateTaskInput {
  agentId?: string;
  description?: string;
  expectedOutput?: string;
  context?: string;
  priority?: number;
  async?: boolean;
  humanInput?: boolean;
}

export const taskRepository = {
  // Find task by ID
  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
    });
  },

  // Find all tasks in workspace
  async findByWorkspace(workspaceId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { workspaceId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  // Find tasks by agent
  async findByAgent(agentId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { agentId },
      orderBy: { priority: 'asc' },
    });
  },

  // Create new task
  async create(data: CreateTaskInput): Promise<Task> {
    return prisma.task.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        agentId: data.agentId,
        description: data.description,
        expectedOutput: data.expectedOutput,
        context: data.context,
        priority: data.priority ?? 0,
        async: data.async ?? false,
        humanInput: data.humanInput ?? false,
      },
    });
  },

  // Update task
  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
    });
  },

  // Delete task
  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  },

  // Get task with agent
  async findWithAgent(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        agent: true,
      },
    });
  },

  // Count tasks in workspace
  async countByWorkspace(workspaceId: string): Promise<number> {
    return prisma.task.count({
      where: { workspaceId },
    });
  },

  // Bulk create tasks
  async createMany(tasks: CreateTaskInput[]): Promise<number> {
    const result = await prisma.task.createMany({
      data: tasks.map(task => ({
        workspaceId: task.workspaceId,
        createdById: task.createdById,
        agentId: task.agentId,
        description: task.description,
        expectedOutput: task.expectedOutput,
        context: task.context,
        priority: task.priority ?? 0,
        async: task.async ?? false,
        humanInput: task.humanInput ?? false,
      })),
    });
    return result.count;
  },

  // Reorder tasks
  async reorder(taskIds: string[]): Promise<void> {
    const updates = taskIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { priority: index },
      })
    );
    await prisma.$transaction(updates);
  },
};

export default taskRepository;
