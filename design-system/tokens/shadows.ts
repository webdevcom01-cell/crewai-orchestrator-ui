/**
 * CrewAI Orchestrator - Shadows & Effects
 * 
 * Box shadows, border styles, and visual effects.
 */

import { colors } from './colors';

// Box shadows
export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Glow effects (cyberpunk style)
  glow: {
    cyan: {
      sm: '0 0 10px rgba(34, 197, 220, 0.15)',
      md: '0 0 20px rgba(34, 197, 220, 0.2)',
      lg: '0 0 30px rgba(34, 197, 220, 0.25)',
      xl: '0 0 40px rgba(34, 197, 220, 0.3)',
    },
    emerald: {
      sm: '0 0 10px rgba(34, 197, 94, 0.1)',
      md: '0 0 15px rgba(34, 197, 94, 0.15)',
      lg: '0 0 20px rgba(34, 197, 94, 0.2)',
    },
    red: {
      sm: '0 0 10px rgba(239, 68, 68, 0.1)',
      md: '0 0 15px rgba(239, 68, 68, 0.15)',
      lg: '0 0 20px rgba(239, 68, 68, 0.2)',
    },
    yellow: {
      sm: '0 0 10px rgba(234, 179, 8, 0.1)',
      md: '0 0 15px rgba(234, 179, 8, 0.15)',
    },
    blue: {
      sm: '0 0 10px rgba(59, 130, 246, 0.1)',
      md: '0 0 15px rgba(59, 130, 246, 0.15)',
    },
  },

  // Card shadows
  card: {
    default: 'none',
    hover: '0 0 30px rgba(34, 197, 220, 0.15)',
    active: '0 0 40px rgba(34, 197, 220, 0.2)',
  },

  // Modal shadow
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  // Floating elements
  dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
  toast: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
} as const;

// Border styles
export const borders = {
  // Width
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },

  // Common border colors
  color: {
    default: 'rgba(34, 197, 220, 0.15)',
    hover: 'rgba(34, 197, 220, 0.3)',
    focus: 'rgba(34, 197, 220, 0.5)',
    active: colors.cyan[400],
    subtle: colors.slate[800],
    error: 'rgba(239, 68, 68, 0.3)',
    success: 'rgba(34, 197, 94, 0.3)',
  },

  // Preset border styles
  card: `1px solid rgba(34, 197, 220, 0.15)`,
  cardHover: `1px solid rgba(34, 197, 220, 0.3)`,
  cardActive: `1px solid ${colors.cyan[400]}`,
  
  input: `1px solid rgba(34, 197, 220, 0.2)`,
  inputFocus: `1px solid rgba(34, 197, 220, 0.5)`,
  inputError: `1px solid rgba(239, 68, 68, 0.5)`,
  
  divider: `1px solid ${colors.slate[800]}`,
  dividerCyan: `1px solid rgba(34, 197, 220, 0.15)`,
} as const;

// Backdrop effects
export const backdrop = {
  blur: {
    none: 'none',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
    '2xl': 'blur(24px)',
  },
} as const;

// Transition presets
export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common transitions
  all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'color 200ms, background-color 200ms, border-color 200ms',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Animation keyframes (for CSS-in-JS)
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInUp: {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  glow: {
    '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 220, 0.2)' },
    '50%': { boxShadow: '0 0 30px rgba(34, 197, 220, 0.4)' },
  },
} as const;

export default shadows;
