/**
 * Auth Service - Frontend Authentication Management
 * 
 * Handles:
 * - Token storage (access + refresh)
 * - Auto-refresh of expired tokens
 * - CSRF token management
 * - 2FA flow support
 * - Session management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  
  // Actions
  setAuth: (user: User, tokens: TokenPair) => void;
  setTokens: (tokens: TokenPair) => void;
  setCsrfToken: (token: string) => void;
  setRequires2FA: (requires: boolean, tempToken?: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export interface Session {
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ipAddress: string;
  isCurrent: boolean;
}

export interface TwoFactorSetup {
  qrCode: string;
  manualEntryKey: string;
  backupCodes: string[];
}

// ============================================
// Constants
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_REFRESH_THRESHOLD = 60 * 1000; // 1 minute before expiry

// ============================================
// Auth Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      csrfToken: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempToken: null,
      
      setAuth: (user, tokens) => set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        requires2FA: false,
        tempToken: null,
      }),
      
      setTokens: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
      
      setCsrfToken: (token) => set({ csrfToken: token }),
      
      setRequires2FA: (requires, tempToken) => set({
        requires2FA: requires,
        tempToken: tempToken || null,
      }),
      
      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        requires2FA: false,
        tempToken: null,
      }),
      
      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        csrfToken: null,
        isAuthenticated: false,
        requires2FA: false,
        tempToken: null,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// API Helper with Auto-Refresh
// ============================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

/**
 * Fetch with automatic token refresh
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const state = useAuthStore.getState();
  
  // Add auth headers
  const headers = new Headers(options.headers);
  
  if (state.accessToken) {
    headers.set('Authorization', `Bearer ${state.accessToken}`);
  }
  
  if (state.csrfToken) {
    headers.set('X-CSRF-Token', state.csrfToken);
  }
  
  headers.set('Content-Type', 'application/json');
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include', // For cookies
  });
  
  // Handle expired token
  if (response.status === 401) {
    const data = await response.json();
    
    if (data.code === 'TOKEN_EXPIRED' && state.refreshToken) {
      // Try to refresh token
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const newTokens = await refreshTokens(state.refreshToken);
          
          if (newTokens) {
            state.setTokens(newTokens);
            onTokenRefreshed(newTokens.accessToken);
            
            // Retry original request
            headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
            return fetch(`${API_BASE}${url}`, {
              ...options,
              headers,
              credentials: 'include',
            });
          } else {
            state.logout();
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            headers.set('Authorization', `Bearer ${token}`);
            resolve(fetch(`${API_BASE}${url}`, {
              ...options,
              headers,
              credentials: 'include',
            }));
          });
        });
      }
    }
  }
  
  return response;
};

// ============================================
// Auth API Functions
// ============================================

/**
 * Initialize CSRF token
 */
export const initializeCsrf = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/csrf-token`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      useAuthStore.getState().setCsrfToken(data.data.token);
      return data.data.token;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
  return null;
};

/**
 * Login user
 */
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; requiresTwoFactor?: boolean; error?: string }> => {
  const state = useAuthStore.getState();
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': state.csrfToken || '',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error };
    }
    
    // Check if 2FA required
    if (data.data.requiresTwoFactor) {
      state.setRequires2FA(true, data.data.tempToken);
      return { success: true, requiresTwoFactor: true };
    }
    
    // Full login
    state.setAuth(data.data.user, {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
};

/**
 * Verify 2FA code
 */
export const verify2FA = async (
  code: string
): Promise<{ success: boolean; error?: string }> => {
  const state = useAuthStore.getState();
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/2fa/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.tempToken}`,
        'X-CSRF-Token': state.csrfToken || '',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error };
    }
    
    state.setAuth(data.data.user, {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    });
    
    return { success: true };
  } catch (error) {
    console.error('2FA verification error:', error);
    return { success: false, error: 'Network error' };
  }
};

/**
 * Refresh tokens
 */
export const refreshTokens = async (
  refreshToken: string
): Promise<TokenPair | null> => {
  try {
    const state = useAuthStore.getState();
    
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': state.csrfToken || '',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  const state = useAuthStore.getState();
  
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.accessToken}`,
        'X-CSRF-Token': state.csrfToken || '',
      },
      body: JSON.stringify({ refreshToken: state.refreshToken }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    state.logout();
  }
};

/**
 * Logout from all devices
 */
export const logoutAll = async (): Promise<void> => {
  const state = useAuthStore.getState();
  
  try {
    await authFetch('/api/auth/logout-all', {
      method: 'POST',
    });
  } finally {
    state.logout();
  }
};

/**
 * Get active sessions
 */
export const getSessions = async (): Promise<Session[]> => {
  const response = await authFetch('/api/auth/sessions');
  
  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  
  return [];
};

// ============================================
// 2FA Functions
// ============================================

/**
 * Setup 2FA
 */
export const setup2FA = async (): Promise<TwoFactorSetup | null> => {
  const response = await authFetch('/api/auth/2fa/setup', {
    method: 'POST',
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  
  return null;
};

/**
 * Enable 2FA (verify setup code)
 */
export const enable2FA = async (
  code: string
): Promise<{ success: boolean; error?: string }> => {
  const response = await authFetch('/api/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: data.error };
  }
  
  // Update user state
  const state = useAuthStore.getState();
  if (state.user) {
    state.setAuth({ ...state.user, twoFactorEnabled: true }, {
      accessToken: state.accessToken!,
      refreshToken: state.refreshToken!,
      expiresIn: 0,
      refreshExpiresIn: 0,
    });
  }
  
  return { success: true };
};

/**
 * Disable 2FA
 */
export const disable2FA = async (
  code: string
): Promise<{ success: boolean; error?: string }> => {
  const response = await authFetch('/api/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: data.error };
  }
  
  // Update user state
  const state = useAuthStore.getState();
  if (state.user) {
    state.setAuth({ ...state.user, twoFactorEnabled: false }, {
      accessToken: state.accessToken!,
      refreshToken: state.refreshToken!,
      expiresIn: 0,
      refreshExpiresIn: 0,
    });
  }
  
  return { success: true };
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (
  code: string
): Promise<{ codes: string[] } | null> => {
  const response = await authFetch('/api/auth/2fa/backup-codes', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  
  if (response.ok) {
    const data = await response.json();
    return { codes: data.data.backupCodes };
  }
  
  return null;
};

export default {
  useAuthStore,
  authFetch,
  initializeCsrf,
  login,
  verify2FA,
  refreshTokens,
  logout,
  logoutAll,
  getSessions,
  setup2FA,
  enable2FA,
  disable2FA,
  regenerateBackupCodes,
};
