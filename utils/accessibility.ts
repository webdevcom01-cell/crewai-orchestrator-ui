/**
 * Accessibility Utilities
 * Comprehensive a11y helpers for the application
 */

// ============================================
// Focus Management
// ============================================

/**
 * Trap focus within a container (for modals, dialogs)
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(', ');

  const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Restore focus to an element after an action
 */
export const restoreFocus = (element: HTMLElement | null) => {
  if (element && typeof element.focus === 'function') {
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      element.focus();
    });
  }
};

/**
 * Get the first focusable element in a container
 */
export const getFirstFocusable = (container: HTMLElement): HTMLElement | null => {
  const focusable = container.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return focusable;
};

// ============================================
// Screen Reader Announcements
// ============================================

let announceRegion: HTMLElement | null = null;

/**
 * Create or get the live region for announcements
 */
const getAnnounceRegion = (priority: 'polite' | 'assertive' = 'polite'): HTMLElement => {
  const id = `sr-announce-${priority}`;
  let region = document.getElementById(id);

  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(region);
  }

  return region;
};

/**
 * Announce a message to screen readers
 */
export const announce = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const region = getAnnounceRegion(priority);
  
  // Clear and set message (triggers announcement)
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
};

/**
 * Announce loading state
 */
export const announceLoading = (isLoading: boolean, context?: string): void => {
  if (isLoading) {
    announce(`${context ? context + ': ' : ''}Loading...`, 'polite');
  } else {
    announce(`${context ? context + ': ' : ''}Content loaded`, 'polite');
  }
};

/**
 * Announce error to screen readers
 */
export const announceError = (message: string): void => {
  announce(`Error: ${message}`, 'assertive');
};

/**
 * Announce success message
 */
export const announceSuccess = (message: string): void => {
  announce(message, 'polite');
};

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Handle arrow key navigation in a list
 */
export const handleListNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onSelect?: (index: number) => void;
  } = {}
): number => {
  const { loop = true, orientation = 'vertical', onSelect } = options;
  let newIndex = currentIndex;

  const isVertical = orientation === 'vertical' || orientation === 'both';
  const isHorizontal = orientation === 'horizontal' || orientation === 'both';

  switch (e.key) {
    case 'ArrowDown':
      if (isVertical) {
        e.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      }
      break;

    case 'ArrowUp':
      if (isVertical) {
        e.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      }
      break;

    case 'ArrowRight':
      if (isHorizontal) {
        e.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      }
      break;

    case 'ArrowLeft':
      if (isHorizontal) {
        e.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      }
      break;

    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;

    case 'End':
      e.preventDefault();
      newIndex = items.length - 1;
      break;

    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect?.(currentIndex);
      return currentIndex;

    default:
      return currentIndex;
  }

  items[newIndex]?.focus();
  return newIndex;
};

/**
 * Create roving tabindex for a group of elements
 */
export const setupRovingTabindex = (
  container: HTMLElement,
  selector: string,
  initialIndex: number = 0
): (() => void) => {
  const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
  
  if (items.length === 0) return () => {};

  // Set initial tabindex values
  items.forEach((item, index) => {
    item.setAttribute('tabindex', index === initialIndex ? '0' : '-1');
  });

  let currentIndex = initialIndex;

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const index = items.indexOf(target);
    
    if (index === -1) return;

    const newIndex = handleListNavigation(e, items, index, { loop: true });
    
    if (newIndex !== index) {
      items[index].setAttribute('tabindex', '-1');
      items[newIndex].setAttribute('tabindex', '0');
      currentIndex = newIndex;
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

// ============================================
// Color Contrast
// ============================================

/**
 * Calculate relative luminance of a color
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Parse hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG requirements
 */
export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

// ============================================
// ARIA Helpers
// ============================================

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
};

/**
 * Create aria-describedby relationship
 */
export const createAriaDescription = (
  element: HTMLElement,
  description: string
): (() => void) => {
  const descId = generateAriaId('desc');
  
  const descElement = document.createElement('span');
  descElement.id = descId;
  descElement.className = 'sr-only';
  descElement.textContent = description;
  descElement.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  
  element.parentNode?.insertBefore(descElement, element.nextSibling);
  element.setAttribute('aria-describedby', descId);

  return () => {
    descElement.remove();
    element.removeAttribute('aria-describedby');
  };
};

// ============================================
// Skip Links
// ============================================

/**
 * Create skip link element
 */
export const createSkipLink = (
  targetId: string,
  text: string = 'Skip to main content'
): HTMLAnchorElement => {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.className = 'skip-link';
  link.textContent = text;
  link.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px 16px;
    z-index: 10000;
    text-decoration: none;
    font-weight: bold;
    transition: top 0.3s;
  `;

  link.addEventListener('focus', () => {
    link.style.top = '0';
  });

  link.addEventListener('blur', () => {
    link.style.top = '-40px';
  });

  return link;
};

// ============================================
// Reduced Motion
// ============================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Subscribe to reduced motion preference changes
 */
export const onReducedMotionChange = (
  callback: (prefersReduced: boolean) => void
): (() => void) => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};

// ============================================
// High Contrast Mode
// ============================================

/**
 * Check if user has high contrast mode enabled
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: more)').matches;
};

// ============================================
// Validation Messages
// ============================================

/**
 * Create accessible error message for form field
 */
export const setFieldError = (
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  message: string
): (() => void) => {
  const errorId = generateAriaId('error');
  
  const errorElement = document.createElement('div');
  errorElement.id = errorId;
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
  input.parentNode?.appendChild(errorElement);

  announce(message, 'assertive');

  return () => {
    errorElement.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  };
};

/**
 * Clear field error
 */
export const clearFieldError = (
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): void => {
  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    const errorElement = document.getElementById(describedBy);
    errorElement?.remove();
  }
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
};

export default {
  createFocusTrap,
  restoreFocus,
  getFirstFocusable,
  announce,
  announceLoading,
  announceError,
  announceSuccess,
  handleListNavigation,
  setupRovingTabindex,
  getContrastRatio,
  meetsContrastRequirement,
  generateAriaId,
  createAriaDescription,
  createSkipLink,
  prefersReducedMotion,
  onReducedMotionChange,
  prefersHighContrast,
  setFieldError,
  clearFieldError,
};
