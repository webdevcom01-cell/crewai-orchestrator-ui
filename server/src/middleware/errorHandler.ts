import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  ValidationError, 
  AIServiceError, 
  RateLimitError,
  ApiResponse 
} from '../types/index.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation error',
      message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
    res.status(400).json(response);
    return;
  }

  // Custom validation errors
  if (error instanceof ValidationError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      data: error.details,
    };
    res.status(400).json(response);
    return;
  }

  // AI service errors
  if (error instanceof AIServiceError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
    };
    res.status(429).json(response);
    return;
  }

  // Default server error
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(response);
}
