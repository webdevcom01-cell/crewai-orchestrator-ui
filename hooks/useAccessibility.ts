/**
 * useAccessibility Hook
 * React hook for common accessibility patterns
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createFocusTrap,
  announce,
  announceLoading,
  prefersReducedMotion,
  onReducedMotionChange,
  handleListNavigation,
} from '../utils/accessibility';

// ============================================
// Focus Trap Hook
// ============================================

export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Create focus trap
    const cleanup = createFocusTrap(containerRef.current);

    return () => {
      cleanup();
      // Restore focus when trap is deactivated
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
};

// ============================================
// Announce Hook
// ============================================

export const useAnnounce = () => {
  const announceMessage = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    announce(message, priority);
  }, []);

  const announceLoadingState = useCallback((
    isLoading: boolean,
    context?: string
  ) => {
    announceLoading(isLoading, context);
  }, []);

  return {
    announce: announceMessage,
    announceLoading: announceLoadingState,
  };
};

// ============================================
// Reduced Motion Hook
// ============================================

export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const cleanup = onReducedMotionChange(setReducedMotion);
    return cleanup;
  }, []);

  return reducedMotion;
};

// ============================================
// Keyboard Navigation Hook
// ============================================

interface UseKeyboardNavigationOptions {
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onSelect?: (index: number) => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (
  itemCount: number,
  options: UseKeyboardNavigationOptions = {}
) => {
  const { loop = true, orientation = 'vertical', onSelect, enabled = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemsRef.current[index] = el;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;

    const items = itemsRef.current.filter(Boolean) as HTMLElement[];
    if (items.length === 0) return;

    const newIndex = handleListNavigation(
      e.nativeEvent,
      items,
      activeIndex,
      { loop, orientation, onSelect }
    );

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, enabled, loop, orientation, onSelect]);

  const getItemProps = useCallback((index: number) => ({
    ref: setItemRef(index),
    tabIndex: index === activeIndex ? 0 : -1,
    'aria-selected': index === activeIndex,
    onKeyDown: handleKeyDown,
  }), [activeIndex, handleKeyDown, setItemRef]);

  const focusItem = useCallback((index: number) => {
    const item = itemsRef.current[index];
    if (item) {
      item.focus();
      setActiveIndex(index);
    }
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    getItemProps,
    focusItem,
  };
};

// ============================================
// Focus on Mount Hook
// ============================================

export const useFocusOnMount = <T extends HTMLElement>(autoFocus: boolean = true) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      // Small delay to ensure element is ready
      requestAnimationFrame(() => {
        ref.current?.focus();
      });
    }
  }, [autoFocus]);

  return ref;
};

// ============================================
// ARIA Expanded Hook
// ============================================

export const useAriaExpanded = (initialExpanded: boolean = false) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const contentId = useRef(`content-${Date.now()}`);

  const toggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const triggerProps = {
    'aria-expanded': expanded,
    'aria-controls': contentId.current,
    onClick: toggle,
  };

  const contentProps = {
    id: contentId.current,
    hidden: !expanded,
    'aria-hidden': !expanded,
  };

  return {
    expanded,
    setExpanded,
    toggle,
    triggerProps,
    contentProps,
  };
};

// ============================================
// Live Region Hook
// ============================================

export const useLiveRegion = (priority: 'polite' | 'assertive' = 'polite') => {
  const [message, setMessage] = useState('');
  
  const regionProps = {
    role: 'status',
    'aria-live': priority,
    'aria-atomic': true,
    className: 'sr-only',
  };

  const announceMessage = useCallback((msg: string) => {
    // Clear first, then set to trigger announcement
    setMessage('');
    requestAnimationFrame(() => {
      setMessage(msg);
    });
  }, []);

  return {
    message,
    regionProps,
    announce: announceMessage,
  };
};

// ============================================
// Skip Link Hook
// ============================================

export const useSkipLink = (mainContentId: string = 'main-content') => {
  const skipLinkProps = {
    href: `#${mainContentId}`,
    className: 'skip-link',
  };

  const mainContentProps = {
    id: mainContentId,
    tabIndex: -1,
  };

  return {
    skipLinkProps,
    mainContentProps,
  };
};

// ============================================
// Form Field Accessibility Hook
// ============================================

interface UseAccessibleFieldOptions {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const useAccessibleField = (
  fieldId: string,
  options: UseAccessibleFieldOptions
) => {
  const { label, error, hint, required } = options;
  
  const labelId = `${fieldId}-label`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  const labelProps = {
    id: labelId,
    htmlFor: fieldId,
  };

  const fieldProps = {
    id: fieldId,
    'aria-labelledby': labelId,
    'aria-describedby': describedBy,
    'aria-invalid': !!error,
    'aria-required': required,
  };

  const errorProps = {
    id: errorId,
    role: 'alert',
    'aria-live': 'polite' as const,
  };

  const hintProps = {
    id: hintId,
  };

  return {
    labelProps,
    fieldProps,
    errorProps,
    hintProps,
  };
};

// ============================================
// Dialog Accessibility Hook
// ============================================

interface UseAccessibleDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export const useAccessibleDialog = (options: UseAccessibleDialogOptions) => {
  const { isOpen, onClose, title, description } = options;
  const titleId = useRef(`dialog-title-${Date.now()}`);
  const descriptionId = useRef(`dialog-desc-${Date.now()}`);
  const containerRef = useFocusTrap(isOpen);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Announce dialog opening
  useEffect(() => {
    if (isOpen) {
      announce(`Dialog opened: ${title}`, 'assertive');
    }
  }, [isOpen, title]);

  const dialogProps = {
    ref: containerRef,
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId.current,
    'aria-describedby': description ? descriptionId.current : undefined,
  };

  const titleProps = {
    id: titleId.current,
  };

  const descriptionProps = {
    id: descriptionId.current,
  };

  const closeButtonProps = {
    'aria-label': 'Close dialog',
    onClick: onClose,
  };

  return {
    dialogProps,
    titleProps,
    descriptionProps,
    closeButtonProps,
  };
};

export default {
  useFocusTrap,
  useAnnounce,
  useReducedMotion,
  useKeyboardNavigation,
  useFocusOnMount,
  useAriaExpanded,
  useLiveRegion,
  useSkipLink,
  useAccessibleField,
  useAccessibleDialog,
};
