import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { useOrchestrator } from '../../../hooks/useOrchestrator';
import { OrchestratorContext } from '../../../reducer';
import { mockInitialState, mockDispatch } from '../testUtils';

describe('useOrchestrator', () => {
  it('should return context value when inside provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <OrchestratorContext.Provider value={{ state: mockInitialState, dispatch: mockDispatch }}>
        {children}
      </OrchestratorContext.Provider>
    );

    const { result } = renderHook(() => useOrchestrator(), { wrapper });

    expect(result.current.state).toEqual(mockInitialState);
    expect(result.current.dispatch).toBe(mockDispatch);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useOrchestrator());
    }).toThrow('useOrchestrator must be used within OrchestratorContext.Provider');

    consoleSpy.mockRestore();
  });

  it('should provide state and dispatch', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <OrchestratorContext.Provider value={{ state: mockInitialState, dispatch: mockDispatch }}>
        {children}
      </OrchestratorContext.Provider>
    );

    const { result } = renderHook(() => useOrchestrator(), { wrapper });

    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('dispatch');
    expect(typeof result.current.dispatch).toBe('function');
  });
});
