// Database Service - Prisma Client Singleton
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Helper function to handle database errors
export function handlePrismaError(error: unknown): { message: string; code: string } {
  if (error instanceof Error) {
    // Prisma known request errors
    if ('code' in error) {
      const prismaError = error as { code: string; message: string };
      
      switch (prismaError.code) {
        case 'P2002':
          return { message: 'A record with this value already exists', code: 'DUPLICATE' };
        case 'P2025':
          return { message: 'Record not found', code: 'NOT_FOUND' };
        case 'P2003':
          return { message: 'Foreign key constraint failed', code: 'FK_VIOLATION' };
        case 'P2014':
          return { message: 'Invalid relation', code: 'INVALID_RELATION' };
        default:
          return { message: prismaError.message, code: prismaError.code };
      }
    }
    return { message: error.message, code: 'UNKNOWN' };
  }
  return { message: 'An unknown error occurred', code: 'UNKNOWN' };
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
