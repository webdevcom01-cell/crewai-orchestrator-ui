/**
 * Token Service Tests
 * Tests for JWT + Refresh Token Management
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  rotateRefreshToken,
  verifyAccessToken,
  invalidateRefreshToken,
  invalidateAllUserTokens,
  getUserSessions,
  cleanupExpiredTokens,
} from '../../services/token.service.js';

// Mock config
vi.mock('../../config/index.js', () => ({
  config: {
    auth: {
      jwtSecret: 'test-secret-key-for-testing-purposes-only',
    },
  },
}));

describe('Token Service', () => {
  const testUser = {
    userId: 'user_123',
    email: 'test@example.com',
    role: 'admin',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAccessToken(testUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.userId);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.role).toBe(testUser.role);
      expect(payload?.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a random string', () => {
      const token = generateRefreshToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(32);
    });

    it('should generate unique tokens each time', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateTokenPair', () => {
    it('should return access and refresh tokens', () => {
      const tokens = generateTokenPair(
        testUser.userId,
        testUser.email,
        testUser.role
      );
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBe(15 * 60); // 15 minutes
      expect(tokens.refreshExpiresIn).toBe(7 * 24 * 60 * 60); // 7 days
    });

    it('should store refresh token data with metadata', () => {
      const metadata = {
        userAgent: 'Mozilla/5.0 Test Browser',
        ipAddress: '192.168.1.1',
      };
      
      const tokens = generateTokenPair(
        testUser.userId,
        testUser.email,
        testUser.role,
        metadata
      );
      
      const sessions = getUserSessions(testUser.userId);
      expect(sessions.length).toBeGreaterThan(0);
      
      const session = sessions.find(s => s.userAgent === metadata.userAgent);
      expect(session).toBeDefined();
      expect(session?.ipAddress).toBe(metadata.ipAddress);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should exchange old refresh token for new token pair', () => {
      const originalTokens = generateTokenPair(
        testUser.userId,
        testUser.email,
        testUser.role
      );
      
      const newTokens = rotateRefreshToken(originalTokens.refreshToken);
      
      expect(newTokens).not.toBeNull();
      expect(newTokens?.accessToken).toBeDefined();
      expect(newTokens?.refreshToken).toBeDefined();
      expect(newTokens?.refreshToken).not.toBe(originalTokens.refreshToken);
    });

    it('should return null for invalid refresh token', () => {
      const result = rotateRefreshToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should detect token reuse and return null', () => {
      const tokens = generateTokenPair(
        testUser.userId,
        testUser.email,
        testUser.role
      );
      
      // First rotation should succeed
      const newTokens = rotateRefreshToken(tokens.refreshToken);
      expect(newTokens).not.toBeNull();
      
      // Reusing old token should fail (token reuse detection)
      const reuseAttempt = rotateRefreshToken(tokens.refreshToken);
      expect(reuseAttempt).toBeNull();
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid token', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(testUser.userId);
    });

    it('should return null for invalid token', () => {
      const payload = verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = verifyAccessToken('not.a.valid.jwt');
      expect(payload).toBeNull();
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should invalidate existing token', () => {
      const tokens = generateTokenPair(
        testUser.userId,
        testUser.email,
        testUser.role
      );
      
      const result = invalidateRefreshToken(tokens.refreshToken);
      expect(result).toBe(true);
      
      // Token should no longer work
      const rotateAttempt = rotateRefreshToken(tokens.refreshToken);
      expect(rotateAttempt).toBeNull();
    });

    it('should return false for non-existent token', () => {
      const result = invalidateRefreshToken('non-existent-token');
      expect(result).toBe(false);
    });
  });

  describe('invalidateAllUserTokens', () => {
    it('should invalidate all tokens for a user', () => {
      // Create multiple sessions
      const tokens1 = generateTokenPair(testUser.userId, testUser.email, testUser.role);
      const tokens2 = generateTokenPair(testUser.userId, testUser.email, testUser.role);
      
      // Invalidate all
      invalidateAllUserTokens(testUser.userId);
      
      // Both should be invalid
      expect(rotateRefreshToken(tokens1.refreshToken)).toBeNull();
      expect(rotateRefreshToken(tokens2.refreshToken)).toBeNull();
    });
  });

  describe('getUserSessions', () => {
    it('should return active sessions for user', () => {
      const newUserId = 'session_test_user_' + Date.now();
      
      generateTokenPair(newUserId, 'session@test.com', 'user', {
        userAgent: 'Test Browser 1',
        ipAddress: '1.1.1.1',
      });
      
      generateTokenPair(newUserId, 'session@test.com', 'user', {
        userAgent: 'Test Browser 2',
        ipAddress: '2.2.2.2',
      });
      
      const sessions = getUserSessions(newUserId);
      expect(sessions.length).toBe(2);
    });

    it('should not expose token hash', () => {
      const newUserId = 'hash_test_user_' + Date.now();
      generateTokenPair(newUserId, 'hash@test.com', 'user');
      
      const sessions = getUserSessions(newUserId);
      expect(sessions[0].tokenHash).toBe('***');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should not throw when called', () => {
      expect(() => cleanupExpiredTokens()).not.toThrow();
    });
  });
});
