import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, { 
    expiresIn: '7d' 
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
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
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Attach user to request
    (req as any).user = payload;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Simple hardcoded admin user (in production use .env)
export const ADMIN_USER = {
  id: 'admin_001',
  email: config.auth.adminEmail,
  passwordHash: config.auth.adminPasswordHash,
  role: 'admin',
  name: 'Admin User'
};
