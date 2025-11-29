/**
 * Two-Factor Authentication (2FA) Service
 * Implements TOTP (Time-based One-Time Password) using RFC 6238
 * 
 * Features:
 * - Generate secret keys for users
 * - Generate QR codes for authenticator apps
 * - Verify TOTP codes
 * - Backup codes for recovery
 */

import { authenticator } from '@otplib/preset-default';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Configuration
const APP_NAME = 'CrewAI Orchestrator';
const BACKUP_CODES_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  valid: boolean;
  usedBackupCode?: boolean;
}

/**
 * Generate a new 2FA secret for a user
 */
export const generateSecret = (): string => {
  return authenticator.generateSecret();
};

/**
 * Generate backup codes for recovery
 */
export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = crypto
      .randomBytes(BACKUP_CODE_LENGTH / 2)
      .toString('hex')
      .toUpperCase();
    
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  
  return codes;
};

/**
 * Hash backup codes for secure storage
 */
export const hashBackupCodes = (codes: string[]): string[] => {
  return codes.map(code => 
    crypto.createHash('sha256').update(code.replace('-', '')).digest('hex')
  );
};

/**
 * Generate QR code URL for authenticator apps
 */
export const generateOtpAuthUrl = (
  secret: string,
  userEmail: string
): string => {
  return authenticator.keyuri(userEmail, APP_NAME, secret);
};

/**
 * Generate QR code as data URL
 */
export const generateQRCode = async (otpAuthUrl: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(otpAuthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Complete 2FA setup - generates everything needed
 */
export const setup2FA = async (userEmail: string): Promise<TwoFactorSetup> => {
  const secret = generateSecret();
  const otpAuthUrl = generateOtpAuthUrl(secret, userEmail);
  const qrCode = await generateQRCode(otpAuthUrl);
  const backupCodes = generateBackupCodes();
  
  // Format secret for manual entry (groups of 4)
  const manualEntryKey = secret.match(/.{1,4}/g)?.join(' ') || secret;
  
  return {
    secret,
    qrCode,
    manualEntryKey,
    backupCodes,
  };
};

/**
 * Verify a TOTP code
 */
export const verifyToken = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
};

/**
 * Verify code - checks TOTP first, then backup codes
 */
export const verifyCode = (
  code: string,
  secret: string,
  hashedBackupCodes: string[]
): TwoFactorVerification => {
  // Clean up code (remove spaces and dashes)
  const cleanCode = code.replace(/[\s-]/g, '');
  
  // First, try TOTP verification (6 digits)
  if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
    const isValid = verifyToken(cleanCode, secret);
    
    if (isValid) {
      return { valid: true, usedBackupCode: false };
    }
  }
  
  // If TOTP fails, try backup codes (8 alphanumeric)
  if (cleanCode.length === 8) {
    const hashedInput = crypto
      .createHash('sha256')
      .update(cleanCode.toUpperCase())
      .digest('hex');
    
    const usedCodeIndex = hashedBackupCodes.findIndex(
      hash => hash === hashedInput
    );
    
    if (usedCodeIndex !== -1) {
      return { valid: true, usedBackupCode: true };
    }
  }
  
  return { valid: false };
};

/**
 * Generate a new set of backup codes (invalidates old ones)
 */
export const regenerateBackupCodes = (): {
  codes: string[];
  hashedCodes: string[];
} => {
  const codes = generateBackupCodes();
  const hashedCodes = hashBackupCodes(codes);
  
  return { codes, hashedCodes };
};

/**
 * Check if 2FA is required based on configuration
 */
export const is2FARequired = (userRole: string): boolean => {
  // Require 2FA for admin users
  const ROLES_REQUIRING_2FA = ['admin', 'owner'];
  return ROLES_REQUIRING_2FA.includes(userRole);
};

export default {
  generateSecret,
  generateBackupCodes,
  hashBackupCodes,
  generateQRCode,
  setup2FA,
  verifyToken,
  verifyCode,
  regenerateBackupCodes,
  is2FARequired,
};
