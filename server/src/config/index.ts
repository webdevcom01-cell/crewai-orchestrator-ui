import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  PORT: z.string().default('8000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  API_TIMEOUT_MS: z.string().default('30000'),
  MAX_BACKSTORY_LENGTH: z.string().default('500'),
  MAX_SIMULATION_TOKENS: z.string().default('8000'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('your-random-secret-key-min-32-chars-long'),
  ADMIN_EMAIL: z.string().email().default('admin@crewai.local'),
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required').default('$2b$10$XYV1pzJ4R6fsV2HDeosMSe23dzP1o173LkZCWehUxugNOC462l4PK'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  server: {
    port: parseInt(env.PORT, 10),
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    adminEmail: env.ADMIN_EMAIL,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    timeout: parseInt(env.API_TIMEOUT_MS, 10),
    maxBackstoryLength: parseInt(env.MAX_BACKSTORY_LENGTH, 10),
    maxSimulationTokens: parseInt(env.MAX_SIMULATION_TOKENS, 10),
  },
  security: {
    corsOrigin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    rateLimit: {
      windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
      maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },
  },
} as const;

// Validate config on startup
export function validateConfig(): void {
  console.log('🔍 Validating configuration...');
  
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY must be set in environment variables');
  }
  
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }
  
  console.log('✅ Configuration validated');
  console.log(`📦 Environment: ${config.server.env}`);
  console.log(`🚪 Port: ${config.server.port}`);
  console.log(`🔐 CORS Origins: ${config.security.corsOrigin.join(', ')}`);
}
