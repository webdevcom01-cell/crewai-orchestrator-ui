/**
 * useKeyboardShortcut Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

describe('useKeyboardShortcut Hook', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should add event listener on mount', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut('k', callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should call callback when key is pressed with ctrl', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should call callback when key is pressed with meta (cmd)', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { metaKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should not call callback when wrong key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'j',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when modifier is missing', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: false,
    });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle shift modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { shiftKey: true, ctrlKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      shiftKey: true,
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should handle alt modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { altKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      altKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should be case insensitive for key matching', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('K', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should handle disabled state', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true, enabled: false }));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should prevent default when configured', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('s', callback, { ctrlKey: true, preventDefault: true }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
