import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { verifyAccessToken } from '../services/token.service.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Extended user type for authenticated requests
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  stripeCustomerId?: string;
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;
}

// Extended Request type with user
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, { 
    expiresIn: '15m' // Shorter expiry with refresh tokens
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12); // Increased from 10 to 12 rounds
};

export const comparePassword = async (
  password: string, 
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Middleware
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
      return;
    }
    
    const token = authHeader.substring(7);
    
    // Use new token service for verification
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
      return;
    }
    
    // Attach user to request
    (req as AuthRequest).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    
    next();
  } catch (error) {
    // Check if token expired
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }
    
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * Middleware to require 2FA verification
 */
export const require2FA = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as AuthRequest).user;
  
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
      code: 'NOT_AUTHENTICATED'
    });
    return;
  }
  
  // Check if 2FA is enabled and verified in this session
  // This would typically check a session flag or JWT claim
  // For now, we allow through - implement with session storage
  
  next();
};

// Simple hardcoded admin user (in production use .env)
export const ADMIN_USER = {
  id: 'admin_001',
  email: config.auth.adminEmail,
  passwordHash: config.auth.adminPasswordHash,
  role: 'admin',
  name: 'Admin User',
  twoFactorEnabled: false,
  twoFactorSecret: null as string | null,
  backupCodes: [] as string[],
};
