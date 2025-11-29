/**
 * Token Service - JWT + Refresh Token Management
 * 
 * Features:
 * - Access token generation (short-lived)
 * - Refresh token generation (long-lived)
 * - Refresh token rotation (security best practice)
 * - Token blacklisting for logout
 * - Token family tracking for breach detection
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_BYTES = 64;

// In-memory stores (use Redis in production)
const refreshTokenStore = new Map<string, RefreshTokenData>();
const tokenBlacklist = new Set<string>();
const tokenFamilies = new Map<string, TokenFamily>();

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface RefreshTokenData {
  userId: string;
  email: string;
  role: string;
  familyId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  rotationCount: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface TokenFamily {
  id: string;
  userId: string;
  createdAt: Date;
  lastUsed: Date;
  rotationCount: number;
  compromised: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

/**
 * Generate access token (JWT)
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' },
    config.auth.jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate secure random refresh token
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

/**
 * Hash refresh token for storage
 */
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create a new token family (for tracking related refresh tokens)
 */
const createTokenFamily = (userId: string): TokenFamily => {
  const family: TokenFamily = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date(),
    lastUsed: new Date(),
    rotationCount: 0,
    compromised: false,
  };
  
  tokenFamilies.set(family.id, family);
  return family;
};

/**
 * Generate a complete token pair (access + refresh)
 */
export const generateTokenPair = (
  userId: string,
  email: string,
  role: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): TokenPair => {
  // Create new token family
  const family = createTokenFamily(userId);
  
  // Generate tokens
  const accessToken = generateAccessToken({ userId, email, role });
  const refreshToken = generateRefreshToken();
  
  // Store refresh token data
  const tokenHash = hashToken(refreshToken);
  const refreshData: RefreshTokenData = {
    userId,
    email,
    role,
    familyId: family.id,
    tokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    rotationCount: 0,
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
  };
  
  refreshTokenStore.set(tokenHash, refreshData);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
    refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

/**
 * Rotate refresh token (exchange old for new)
 * Implements refresh token rotation for security
 */
export const rotateRefreshToken = (
  oldRefreshToken: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): TokenPair | null => {
  const tokenHash = hashToken(oldRefreshToken);
  const tokenData = refreshTokenStore.get(tokenHash);
  
  // Token not found or expired
  if (!tokenData || tokenData.expiresAt < new Date()) {
    // If token was valid but expired, clean up
    refreshTokenStore.delete(tokenHash);
    return null;
  }
  
  // Check if token family is compromised
  const family = tokenFamilies.get(tokenData.familyId);
  if (family?.compromised) {
    // Security breach detected - invalidate all tokens in family
    console.warn(`🚨 Compromised token family detected: ${family.id}`);
    invalidateTokenFamily(family.id);
    return null;
  }
  
  // Check for token reuse (potential breach)
  if (tokenBlacklist.has(tokenHash)) {
    console.warn(`🚨 Refresh token reuse detected for user: ${tokenData.userId}`);
    
    // Mark family as compromised and invalidate all tokens
    if (family) {
      family.compromised = true;
      invalidateTokenFamily(family.id);
    }
    
    return null;
  }
  
  // Blacklist old token (mark as used)
  tokenBlacklist.add(tokenHash);
  refreshTokenStore.delete(tokenHash);
  
  // Update family
  if (family) {
    family.rotationCount++;
    family.lastUsed = new Date();
  }
  
  // Generate new token pair
  const accessToken = generateAccessToken({
    userId: tokenData.userId,
    email: tokenData.email,
    role: tokenData.role,
  });
  
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);
  
  // Store new refresh token
  const newRefreshData: RefreshTokenData = {
    ...tokenData,
    tokenHash: newTokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    rotationCount: tokenData.rotationCount + 1,
    userAgent: metadata?.userAgent,
    ipAddress: metadata?.ipAddress,
  };
  
  refreshTokenStore.set(newTokenHash, newRefreshData);
  
  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 15 * 60,
    refreshExpiresIn: 7 * 24 * 60 * 60,
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
    
    if (payload.type !== 'access') {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
};

/**
 * Invalidate all tokens in a family (security breach response)
 */
export const invalidateTokenFamily = (familyId: string): void => {
  // Remove all refresh tokens in this family
  for (const [hash, data] of refreshTokenStore.entries()) {
    if (data.familyId === familyId) {
      tokenBlacklist.add(hash);
      refreshTokenStore.delete(hash);
    }
  }
  
  console.log(`🔒 Invalidated token family: ${familyId}`);
};

/**
 * Invalidate all tokens for a user (logout everywhere)
 */
export const invalidateAllUserTokens = (userId: string): void => {
  // Remove all refresh tokens for this user
  for (const [hash, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      tokenBlacklist.add(hash);
      refreshTokenStore.delete(hash);
    }
  }
  
  // Mark all families as compromised
  for (const [id, family] of tokenFamilies.entries()) {
    if (family.userId === userId) {
      tokenFamilies.delete(id);
    }
  }
  
  console.log(`🔒 Invalidated all tokens for user: ${userId}`);
};

/**
 * Invalidate single refresh token (logout from device)
 */
export const invalidateRefreshToken = (refreshToken: string): boolean => {
  const tokenHash = hashToken(refreshToken);
  
  if (refreshTokenStore.has(tokenHash)) {
    tokenBlacklist.add(tokenHash);
    refreshTokenStore.delete(tokenHash);
    return true;
  }
  
  return false;
};

/**
 * Get active sessions for a user
 */
export const getUserSessions = (userId: string): RefreshTokenData[] => {
  const sessions: RefreshTokenData[] = [];
  
  for (const data of refreshTokenStore.values()) {
    if (data.userId === userId && data.expiresAt > new Date()) {
      sessions.push({
        ...data,
        tokenHash: '***', // Don't expose hash
      });
    }
  }
  
  return sessions;
};

/**
 * Cleanup expired tokens (run periodically)
 */
export const cleanupExpiredTokens = (): void => {
  const now = new Date();
  let cleaned = 0;
  
  for (const [hash, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      refreshTokenStore.delete(hash);
      cleaned++;
    }
  }
  
  // Cleanup old blacklist entries (older than 7 days doesn't matter)
  // In production, use Redis with TTL
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired refresh tokens`);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  rotateRefreshToken,
  verifyAccessToken,
  invalidateTokenFamily,
  invalidateAllUserTokens,
  invalidateRefreshToken,
  getUserSessions,
  cleanupExpiredTokens,
};
