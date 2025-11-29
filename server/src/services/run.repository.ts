// Run Repository - Database operations for workflow runs
import { prisma } from './database.service.js';
import type { Run, RunTask, Prisma } from '@prisma/client';

export interface CreateRunInput {
  workspaceId: string;
  crewId: string;
  userId: string;
}

export interface UpdateRunInput {
  status?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  output?: string;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

export const runRepository = {
  // Find run by ID
  async findById(id: string): Promise<Run | null> {
    return prisma.run.findUnique({
      where: { id },
    });
  },

  // Find runs by workspace
  async findByWorkspace(
    workspaceId: string, 
    options?: { limit?: number; offset?: number; status?: string }
  ) {
    return prisma.run.findMany({
      where: { 
        workspaceId,
        ...(options?.status && { status: options.status }),
      },
      include: {
        crew: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        runTasks: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  },

  // Find runs by crew
  async findByCrew(crewId: string, limit: number = 10) {
    return prisma.run.findMany({
      where: { crewId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Create new run
  async create(data: CreateRunInput): Promise<Run> {
    return prisma.run.create({
      data: {
        workspaceId: data.workspaceId,
        crewId: data.crewId,
        userId: data.userId,
        status: 'pending',
      },
    });
  },

  // Start run
  async start(id: string): Promise<Run> {
    return prisma.run.update({
      where: { id },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });
  },

  // Complete run
  async complete(id: string, output: string, tokensUsed: number = 0): Promise<Run> {
    const run = await prisma.run.findUnique({ where: { id } });
    const duration = run?.startedAt 
      ? Math.floor((Date.now() - run.startedAt.getTime()) / 1000) 
      : 0;

    return prisma.run.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        duration,
        output,
        tokensUsed,
      },
    });
  },

  // Fail run
  async fail(id: string, error: string): Promise<Run> {
    const run = await prisma.run.findUnique({ where: { id } });
    const duration = run?.startedAt 
      ? Math.floor((Date.now() - run.startedAt.getTime()) / 1000) 
      : 0;

    return prisma.run.update({
      where: { id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        duration,
        error,
      },
    });
  },

  // Cancel run
  async cancel(id: string): Promise<Run> {
    return prisma.run.update({
      where: { id },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });
  },

  // Update run
  async update(id: string, data: UpdateRunInput): Promise<Run> {
    return prisma.run.update({
      where: { id },
      data,
    });
  },

  // Delete run
  async delete(id: string): Promise<void> {
    await prisma.run.delete({
      where: { id },
    });
  },

  // Get run with full details
  async findWithDetails(id: string) {
    return prisma.run.findUnique({
      where: { id },
      include: {
        crew: {
          include: {
            agents: {
              include: { agent: true },
            },
            tasks: {
              include: { task: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        runTasks: {
          include: {
            task: true,
          },
        },
      },
    });
  },

  // Get run statistics for workspace
  async getStats(workspaceId: string) {
    const [total, completed, failed, running] = await Promise.all([
      prisma.run.count({ where: { workspaceId } }),
      prisma.run.count({ where: { workspaceId, status: 'completed' } }),
      prisma.run.count({ where: { workspaceId, status: 'failed' } }),
      prisma.run.count({ where: { workspaceId, status: 'running' } }),
    ]);

    const tokenUsage = await prisma.run.aggregate({
      where: { workspaceId },
      _sum: { tokensUsed: true },
      _avg: { duration: true },
    });

    return {
      total,
      completed,
      failed,
      running,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      totalTokens: tokenUsage._sum.tokensUsed ?? 0,
      avgDuration: tokenUsage._avg.duration ?? 0,
    };
  },

  // Create run task
  async createRunTask(runId: string, taskId: string): Promise<RunTask> {
    return prisma.runTask.create({
      data: {
        runId,
        taskId,
        status: 'pending',
      },
    });
  },

  // Update run task
  async updateRunTask(
    id: string, 
    data: { status?: string; output?: string; startedAt?: Date; completedAt?: Date }
  ): Promise<RunTask> {
    return prisma.runTask.update({
      where: { id },
      data,
    });
  },
};

export default runRepository;
