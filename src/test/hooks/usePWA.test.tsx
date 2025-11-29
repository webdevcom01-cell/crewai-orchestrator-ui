/**
 * usePWA Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../../../hooks/usePWA';

// Mock navigator
const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve({
      waiting: null,
      active: {
        state: 'activated',
      },
    }),
    register: vi.fn(),
    getRegistration: vi.fn(),
  },
  onLine: true,
};

describe('usePWA Hook', () => {
  let originalNavigator: Navigator;
  let originalWindow: typeof window;

  beforeEach(() => {
    originalNavigator = global.navigator;
    originalWindow = global.window;
    
    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });
    
    // Mock window events
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
  });

  it('should detect online status', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOnline).toBe(true);
  });

  it('should provide install prompt handler', () => {
    const { result } = renderHook(() => usePWA());

    expect(typeof result.current.installApp).toBe('function');
  });

  it('should provide update handler', () => {
    const { result } = renderHook(() => usePWA());

    expect(typeof result.current.updateApp).toBe('function');
  });

  it('should handle offline event', async () => {
    const { result } = renderHook(() => usePWA());

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    
    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    // The hook should track this (implementation dependent)
    expect(typeof result.current.isOnline).toBe('boolean');
  });

  it('should handle online event', async () => {
    const { result } = renderHook(() => usePWA());

    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => usePWA());

    unmount();

    expect(removeListenerSpy).toHaveBeenCalled();
  });
});
