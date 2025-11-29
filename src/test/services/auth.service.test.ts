/**
 * Auth Service Tests (Frontend)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../../../services/auth.service';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Auth Service', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      csrfToken: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempToken: null,
    });
    
    mockFetch.mockReset();
  });

  describe('useAuthStore', () => {
    it('should initialize with empty state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should set authentication state', () => {
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        twoFactorEnabled: false,
      };
      
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 900,
        refreshExpiresIn: 604800,
      };

      useAuthStore.getState().setAuth(user, tokens);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe('access_token');
      expect(state.refreshToken).toBe('refresh_token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should update tokens', () => {
      const tokens = {
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
        expiresIn: 900,
        refreshExpiresIn: 604800,
      };

      useAuthStore.getState().setTokens(tokens);
      const state = useAuthStore.getState();

      expect(state.accessToken).toBe('new_access');
      expect(state.refreshToken).toBe('new_refresh');
    });

    it('should set CSRF token', () => {
      useAuthStore.getState().setCsrfToken('csrf_token_123');
      const state = useAuthStore.getState();

      expect(state.csrfToken).toBe('csrf_token_123');
    });

    it('should set 2FA requirement', () => {
      useAuthStore.getState().setRequires2FA(true, 'temp_token');
      const state = useAuthStore.getState();

      expect(state.requires2FA).toBe(true);
      expect(state.tempToken).toBe('temp_token');
    });

    it('should logout user', () => {
      // First, set authenticated state
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        twoFactorEnabled: false,
      };
      
      useAuthStore.getState().setAuth(user, {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        refreshExpiresIn: 604800,
      });

      // Then logout
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear all auth state', () => {
      useAuthStore.getState().setCsrfToken('csrf');
      useAuthStore.getState().setRequires2FA(true, 'temp');
      
      useAuthStore.getState().clearAuth();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.csrfToken).toBeNull();
      expect(state.requires2FA).toBe(false);
      expect(state.tempToken).toBeNull();
    });
  });

  describe('Store Persistence', () => {
    it('should persist specific state fields', () => {
      const user = {
        id: 'user_1',
        email: 'persist@example.com',
        name: 'Persist Test',
        role: 'admin',
        twoFactorEnabled: true,
      };
      
      useAuthStore.getState().setAuth(user, {
        accessToken: 'persist_access',
        refreshToken: 'persist_refresh',
        expiresIn: 900,
        refreshExpiresIn: 604800,
      });

      // Check that state is set correctly
      const state = useAuthStore.getState();
      expect(state.user?.email).toBe('persist@example.com');
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
