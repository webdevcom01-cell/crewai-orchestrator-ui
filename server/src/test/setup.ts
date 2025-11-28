import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables before any other imports
// This must run BEFORE any module that reads process.env
dotenvConfig({ path: resolve(__dirname, '../../.env.test') });

// Set defaults if not provided
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key-for-testing';
process.env.PORT = process.env.PORT || '8001';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
