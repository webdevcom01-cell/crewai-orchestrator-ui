import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';
import { 
  generateToken, 
  comparePassword, 
  ADMIN_USER, 
  authenticate, 
  AuthRequest 
} from '../middleware/auth.js';
import { 
  generateTokenPair, 
  rotateRefreshToken, 
  invalidateRefreshToken,
  invalidateAllUserTokens,
  getUserSessions
} from '../services/token.service.js';
import {
  setup2FA,
  verifyCode,
  hashBackupCodes,
  regenerateBackupCodes
} from '../services/twoFactor.service.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const TwoFactorVerifySchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters'),
});

// ============================================
// Routes
// ============================================

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token pair
 */
router.post('/login', validateRequest(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check against hardcoded admin user
    if (email !== ADMIN_USER.email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await comparePassword(password, ADMIN_USER.passwordHash);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if 2FA is required
    if (ADMIN_USER.twoFactorEnabled) {
      // Return partial auth - requires 2FA verification
      const tempToken = generateToken({
        userId: ADMIN_USER.id,
        email: ADMIN_USER.email,
        role: 'pending_2fa'
      });

      return res.json({
        success: true,
        data: {
          requiresTwoFactor: true,
          tempToken,
        }
      });
    }

    // Generate token pair with refresh token rotation
    const tokens = generateTokenPair(
      ADMIN_USER.id,
      ADMIN_USER.email,
      ADMIN_USER.role,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: ADMIN_USER.role,
          twoFactorEnabled: ADMIN_USER.twoFactorEnabled,
        },
        ...tokens
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token (with rotation)
 */
router.post('/refresh', validateRequest(RefreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const tokens = rotateRefreshToken(refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Invalidate refresh token
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      invalidateRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout-all
 * Invalidate all refresh tokens for user (logout everywhere)
 */
router.post('/logout-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    invalidateAllUserTokens(user.id);

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/sessions
 * Get all active sessions for current user
 */
router.get('/sessions', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const sessions = getUserSessions(user.id);

    res.json({
      success: true,
      data: sessions.map(s => ({
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        isCurrent: s.userAgent === req.headers['user-agent'],
      }))
    });

  } catch (error) {
    next(error);
  }
});

// ============================================
// Two-Factor Authentication Routes
// ============================================

/**
 * POST /api/auth/2fa/setup
 * Initialize 2FA setup for user
 */
router.post('/2fa/setup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Generate 2FA setup data
    const setup = await setup2FA(user.email);

    // In production, store secret temporarily until verified
    // For demo, we'll update ADMIN_USER directly
    ADMIN_USER.twoFactorSecret = setup.secret;
    ADMIN_USER.backupCodes = hashBackupCodes(setup.backupCodes);

    res.json({
      success: true,
      data: {
        qrCode: setup.qrCode,
        manualEntryKey: setup.manualEntryKey,
        backupCodes: setup.backupCodes, // Only show once!
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code and enable 2FA
 */
router.post('/2fa/verify', authenticate, validateRequest(TwoFactorVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    const { code } = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!ADMIN_USER.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: '2FA not set up. Call /2fa/setup first.'
      });
    }

    const result = verifyCode(code, ADMIN_USER.twoFactorSecret, ADMIN_USER.backupCodes);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid 2FA code'
      });
    }

    // Enable 2FA
    ADMIN_USER.twoFactorEnabled = true;

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/2fa/validate
 * Validate 2FA code during login
 */
router.post('/2fa/validate', validateRequest(TwoFactorVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const tempToken = req.headers.authorization?.substring(7);

    if (!tempToken) {
      return res.status(401).json({
        success: false,
        error: 'Temp token required'
      });
    }

    // Verify temp token
    // In production, properly verify the temp token
    
    if (!ADMIN_USER.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: '2FA not configured'
      });
    }

    const result = verifyCode(code, ADMIN_USER.twoFactorSecret, ADMIN_USER.backupCodes);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid 2FA code'
      });
    }

    // If backup code was used, remove it
    if (result.usedBackupCode) {
      // In production, remove the used backup code from database
      console.log('Backup code used - should be removed');
    }

    // Generate full token pair
    const tokens = generateTokenPair(
      ADMIN_USER.id,
      ADMIN_USER.email,
      ADMIN_USER.role,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: ADMIN_USER.role,
          twoFactorEnabled: true,
        },
        ...tokens
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for user
 */
router.post('/2fa/disable', authenticate, validateRequest(TwoFactorVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    const { code } = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!ADMIN_USER.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: '2FA not enabled'
      });
    }

    // Verify code before disabling
    const result = verifyCode(code, ADMIN_USER.twoFactorSecret, ADMIN_USER.backupCodes);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid 2FA code'
      });
    }

    // Disable 2FA
    ADMIN_USER.twoFactorEnabled = false;
    ADMIN_USER.twoFactorSecret = null;
    ADMIN_USER.backupCodes = [];

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/2fa/backup-codes
 * Regenerate backup codes
 */
router.post('/2fa/backup-codes', authenticate, validateRequest(TwoFactorVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    const { code } = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!ADMIN_USER.twoFactorSecret || !ADMIN_USER.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: '2FA not enabled'
      });
    }

    // Verify code before regenerating
    const verifyResult = verifyCode(code, ADMIN_USER.twoFactorSecret, ADMIN_USER.backupCodes);

    if (!verifyResult.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid 2FA code'
      });
    }

    // Generate new backup codes
    const { codes, hashedCodes } = regenerateBackupCodes();
    ADMIN_USER.backupCodes = hashedCodes;

    res.json({
      success: true,
      data: {
        backupCodes: codes // Only show once!
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: ADMIN_USER.name,
        twoFactorEnabled: ADMIN_USER.twoFactorEnabled,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
