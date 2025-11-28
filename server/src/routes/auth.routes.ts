import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';
import { generateToken, comparePassword, ADMIN_USER } from '../middleware/auth.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Routes
// ============================================

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
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

    // Generate token
    const token = generateToken({
      userId: ADMIN_USER.id,
      email: ADMIN_USER.email,
      role: ADMIN_USER.role
    });

    res.json({
      success: true,
      data: {
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: ADMIN_USER.role
        },
        token
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
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is attached by authenticate middleware
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.userId,
        email: user.email,
        role: user.role,
        name: ADMIN_USER.name // In real app, fetch from DB
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
