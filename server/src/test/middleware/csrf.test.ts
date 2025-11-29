/**
 * CSRF Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  generateCsrfToken,
  csrfTokenGenerator,
  csrfProtection,
  csrfTokenEndpoint,
} from '../../middleware/csrf.js';

// Helper to create mock request
const createMockRequest = (options: {
  method?: string;
  path?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
} = {}): Partial<Request> => ({
  method: options.method || 'GET',
  path: options.path || '/api/test',
  cookies: options.cookies || {},
  headers: options.headers || {},
});

// Helper to create mock response
const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    cookie: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('CSRF Middleware', () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = vi.fn();
  });

  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCsrfToken();
      
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('csrfTokenGenerator', () => {
    it('should generate new token if cookie not present', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      csrfTokenGenerator(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing token from cookie', () => {
      const existingToken = 'existing-csrf-token';
      const req = createMockRequest({
        cookies: { 'csrf-token': existingToken },
      }) as Request;
      const res = createMockResponse() as Response;

      csrfTokenGenerator(req, res, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', existingToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should attach token to request', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      csrfTokenGenerator(req, res, mockNext);

      expect((req as any).csrfToken).toBeDefined();
    });
  });

  describe('csrfProtection', () => {
    it('should skip validation for GET requests', () => {
      const req = createMockRequest({ method: 'GET' }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should skip validation for HEAD requests', () => {
      const req = createMockRequest({ method: 'HEAD' }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip validation for OPTIONS requests', () => {
      const req = createMockRequest({ method: 'OPTIONS' }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip validation for webhook endpoints', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api/billing/webhook',
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject POST without token', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api/test',
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        code: 'CSRF_TOKEN_MISSING',
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject POST with mismatched tokens', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api/test',
        cookies: { 'csrf-token': 'cookie-token' },
        headers: { 'x-csrf-token': 'different-token' },
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'CSRF_TOKEN_INVALID',
      }));
    });

    it('should accept POST with matching tokens', () => {
      const token = generateCsrfToken();
      const req = createMockRequest({
        method: 'POST',
        path: '/api/test',
        cookies: { 'csrf-token': token },
        headers: { 'x-csrf-token': token },
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should validate DELETE requests', () => {
      const req = createMockRequest({
        method: 'DELETE',
        path: '/api/test',
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should validate PUT requests', () => {
      const req = createMockRequest({
        method: 'PUT',
        path: '/api/test',
      }) as Request;
      const res = createMockResponse() as Response;

      csrfProtection(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('csrfTokenEndpoint', () => {
    it('should return new token in response', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      csrfTokenEndpoint(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
        }),
      }));
    });
  });
});
