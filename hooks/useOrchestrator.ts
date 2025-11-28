import { useContext } from 'react';
import { OrchestratorContext } from '../reducer';

/**
 * Custom hook to safely access OrchestratorContext
 * Throws an error if used outside of the Provider
 * This centralizes the null check in one place
 */
export function useOrchestrator() {
  const context = useContext(OrchestratorContext);
  
  if (!context) {
    throw new Error(
      'useOrchestrator must be used within OrchestratorContext.Provider. ' +
      'Wrap your component tree with <OrchestratorContext.Provider>.'
    );
  }
  
  return context;
}

/**
 * Hook to access just the state (read-only)
 */
export function useOrchestratorState() {
  const { state } = useOrchestrator();
  return state;
}

/**
 * Hook to access just the dispatch function
 */
export function useOrchestratorDispatch() {
  const { dispatch } = useOrchestrator();
  return dispatch;
}

export default useOrchestrator;
