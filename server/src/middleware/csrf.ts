/**
 * CSRF Protection Middleware
 * Uses Double Submit Cookie Pattern (modern approach)
 * 
 * How it works:
 * 1. Server generates a CSRF token and sends it in both:
 *    - A cookie (csrf-token) - HttpOnly: false so JS can read it
 *    - Response header (X-CSRF-Token)
 * 2. Client must include the token in request header (X-CSRF-Token)
 * 3. Server validates that header token matches cookie token
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Configuration
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

// Safe methods that don't require CSRF validation
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a cryptographically secure random token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
};

/**
 * Set CSRF token cookie
 */
export const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be false so frontend JS can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
};

/**
 * Middleware to generate and attach CSRF token
 * Use this on routes that render pages or need a fresh token
 */
export const csrfTokenGenerator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate new token if not exists in cookie
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  
  if (!token) {
    token = generateCsrfToken();
    setCsrfCookie(res, token);
  }
  
  // Also set in response header for SPAs
  res.setHeader('X-CSRF-Token', token);
  
  // Attach to request for use in templates/responses
  (req as any).csrfToken = token;
  
  next();
};

/**
 * Middleware to validate CSRF token
 * Validates that the token in header matches the token in cookie
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip validation for safe methods
  if (SAFE_METHODS.includes(req.method.toUpperCase())) {
    return next();
  }
  
  // Skip for webhook endpoints (they use different auth)
  if (req.path.includes('/webhook')) {
    return next();
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  // Both tokens must exist
  if (!cookieToken || !headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
    });
    return;
  }
  
  // Tokens must match (timing-safe comparison)
  if (!timingSafeEqual(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID',
    });
    return;
  }
  
  next();
};

/**
 * Timing-safe string comparison to prevent timing attacks
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  } catch {
    return false;
  }
};

/**
 * Endpoint to get fresh CSRF token
 * Frontend can call this to get a new token
 */
export const csrfTokenEndpoint = (
  _req: Request,
  res: Response
): void => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  
  res.json({
    success: true,
    data: {
      token,
    },
  });
};

export default {
  csrfTokenGenerator,
  csrfProtection,
  csrfTokenEndpoint,
  generateCsrfToken,
};
