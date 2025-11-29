// Workspace Repository - Database operations for workspaces
import { prisma } from './database.service.js';
import type { Workspace, WorkspaceMember, Prisma } from '@prisma/client';

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const workspaceRepository = {
  // Find workspace by ID
  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  },

  // Find workspace by slug
  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  },

  // Create new workspace with owner
  async create(data: CreateWorkspaceInput): Promise<Workspace> {
    return prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        members: {
          create: {
            userId: data.ownerId,
            role: 'owner',
          },
        },
      },
    });
  },

  // Update workspace
  async update(id: string, data: UpdateWorkspaceInput): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  },

  // Delete workspace
  async delete(id: string): Promise<void> {
    await prisma.workspace.delete({
      where: { id },
    });
  },

  // Get workspace with all relations
  async findWithDetails(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        agents: true,
        tasks: true,
        crews: true,
        integrations: true,
        schedules: true,
      },
    });
  },

  // Get workspaces for user
  async findByUserId(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: { userId },
        },
      },
    });
  },

  // Add member to workspace
  async addMember(
    workspaceId: string,
    userId: string,
    role: string = 'member',
    invitedBy?: string
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
        invitedBy,
      },
    });
  },

  // Remove member from workspace
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  },

  // Update member role
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: string
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      data: { role },
    });
  },

  // Get workspace members
  async getMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            lastLoginAt: true,
          },
        },
      },
    });
  },

  // Check if user is member
  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
    return !!member;
  },

  // Get member role
  async getMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
    return member?.role ?? null;
  },
};

export default workspaceRepository;
