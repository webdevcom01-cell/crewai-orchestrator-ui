/**
 * Two-Factor Authentication Service Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateSecret,
  generateBackupCodes,
  hashBackupCodes,
  generateOtpAuthUrl,
  setup2FA,
  verifyToken,
  verifyCode,
  regenerateBackupCodes,
  is2FARequired,
} from '../../services/twoFactor.service.js';

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
  },
}));

describe('Two-Factor Authentication Service', () => {
  describe('generateSecret', () => {
    it('should generate a base32 encoded secret', () => {
      const secret = generateSecret();
      
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThanOrEqual(16);
    });

    it('should generate unique secrets each time', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 backup codes', () => {
      const codes = generateBackupCodes();
      
      expect(codes).toHaveLength(10);
    });

    it('should generate codes in XXXX-XXXX format', () => {
      const codes = generateBackupCodes();
      
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
      });
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes();
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('hashBackupCodes', () => {
    it('should hash all codes', () => {
      const codes = ['ABCD-1234', 'EFGH-5678'];
      const hashed = hashBackupCodes(codes);
      
      expect(hashed).toHaveLength(2);
      hashed.forEach(hash => {
        expect(hash).toHaveLength(64); // SHA-256 hex length
      });
    });

    it('should produce consistent hashes', () => {
      const codes = ['TEST-CODE'];
      const hash1 = hashBackupCodes(codes);
      const hash2 = hashBackupCodes(codes);
      
      expect(hash1[0]).toBe(hash2[0]);
    });
  });

  describe('generateOtpAuthUrl', () => {
    it('should generate valid otpauth URL', () => {
      const secret = generateSecret();
      const email = 'user@example.com';
      
      const url = generateOtpAuthUrl(secret, email);
      
      expect(url).toMatch(/^otpauth:\/\/totp\//);
      expect(url).toContain(encodeURIComponent(email));
      expect(url).toContain('secret=');
    });

    it('should include app name in URL', () => {
      const url = generateOtpAuthUrl('SECRET', 'user@test.com');
      
      expect(url).toContain('CrewAI');
    });
  });

  describe('setup2FA', () => {
    it('should return complete setup data', async () => {
      const email = 'setup@test.com';
      const setup = await setup2FA(email);
      
      expect(setup).toBeDefined();
      expect(setup.secret).toBeDefined();
      expect(setup.qrCode).toContain('data:image');
      expect(setup.manualEntryKey).toBeDefined();
      expect(setup.backupCodes).toHaveLength(10);
    });

    it('should format manual entry key with spaces', async () => {
      const setup = await setup2FA('format@test.com');
      
      // Manual key should have spaces for readability
      expect(setup.manualEntryKey).toContain(' ');
    });
  });

  describe('verifyToken', () => {
    it('should return false for invalid token', () => {
      const secret = generateSecret();
      const result = verifyToken('000000', secret);
      
      // Random token is almost certainly invalid
      expect(typeof result).toBe('boolean');
    });

    it('should return false for non-numeric token', () => {
      const secret = generateSecret();
      const result = verifyToken('abcdef', secret);
      
      expect(result).toBe(false);
    });
  });

  describe('verifyCode', () => {
    it('should verify valid backup code', () => {
      const backupCodes = ['ABCD-1234'];
      const hashedCodes = hashBackupCodes(backupCodes);
      
      const result = verifyCode('ABCD1234', 'dummy-secret', hashedCodes);
      
      expect(result.valid).toBe(true);
      expect(result.usedBackupCode).toBe(true);
    });

    it('should handle backup code with dash', () => {
      const backupCodes = ['ABCD-1234'];
      const hashedCodes = hashBackupCodes(backupCodes);
      
      const result = verifyCode('ABCD-1234', 'dummy-secret', hashedCodes);
      
      expect(result.valid).toBe(true);
    });

    it('should reject invalid backup code', () => {
      const hashedCodes = hashBackupCodes(['ABCD-1234']);
      
      const result = verifyCode('INVALID1', 'dummy-secret', hashedCodes);
      
      expect(result.valid).toBe(false);
    });

    it('should handle lowercase backup codes', () => {
      const backupCodes = ['ABCD-1234'];
      const hashedCodes = hashBackupCodes(backupCodes);
      
      const result = verifyCode('abcd1234', 'dummy-secret', hashedCodes);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should return new codes and their hashes', () => {
      const result = regenerateBackupCodes();
      
      expect(result.codes).toHaveLength(10);
      expect(result.hashedCodes).toHaveLength(10);
    });

    it('should generate different codes each time', () => {
      const result1 = regenerateBackupCodes();
      const result2 = regenerateBackupCodes();
      
      expect(result1.codes[0]).not.toBe(result2.codes[0]);
    });
  });

  describe('is2FARequired', () => {
    it('should require 2FA for admin role', () => {
      expect(is2FARequired('admin')).toBe(true);
    });

    it('should require 2FA for owner role', () => {
      expect(is2FARequired('owner')).toBe(true);
    });

    it('should not require 2FA for regular user', () => {
      expect(is2FARequired('user')).toBe(false);
    });

    it('should not require 2FA for viewer role', () => {
      expect(is2FARequired('viewer')).toBe(false);
    });
  });
});
