// User Repository - Database operations for users
import { prisma, handlePrismaError } from './database.service.js';
import bcrypt from 'bcrypt';
import type { User, Prisma } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
}

export const userRepository = {
  // Find user by ID
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  // Create new user
  async create(data: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
      },
    });
  },

  // Update user
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  // Update password
  async updatePassword(id: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  // Verify password
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  },

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },

  // Get user with workspaces
  async findWithWorkspaces(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        workspaceMembers: {
          include: {
            workspace: true,
          },
        },
      },
    });
  },
};

export default userRepository;
