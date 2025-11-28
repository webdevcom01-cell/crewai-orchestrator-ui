/**
 * CrewAI Orchestrator - Color Palette
 * 
 * Design system colors inspired by cyberpunk aesthetic
 * with cyan as primary accent color.
 */

// Base colors
export const colors = {
  // Background colors
  background: {
    primary: '#050608',      // Darkest - main app bg
    secondary: '#080F1A',    // Card backgrounds
    tertiary: '#0a1628',     // Elevated surfaces
    overlay: 'rgba(5, 6, 8, 0.8)', // Modal overlays
  },

  // Cyan - Primary accent
  cyan: {
    50: 'rgba(34, 197, 220, 0.05)',
    100: 'rgba(34, 197, 220, 0.1)',
    200: 'rgba(34, 197, 220, 0.2)',
    300: 'rgba(34, 197, 220, 0.3)',
    400: '#22c5dc',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    // Glow effects
    glow: {
      sm: '0 0 10px rgba(34, 197, 220, 0.15)',
      md: '0 0 20px rgba(34, 197, 220, 0.2)',
      lg: '0 0 30px rgba(34, 197, 220, 0.25)',
    }
  },

  // Emerald - Success / Agent connected
  emerald: {
    50: 'rgba(34, 197, 94, 0.05)',
    100: 'rgba(34, 197, 94, 0.1)',
    200: 'rgba(34, 197, 94, 0.2)',
    300: 'rgba(34, 197, 94, 0.3)',
    400: '#22c55e',
    500: '#10b981',
    glow: '0 0 15px rgba(34, 197, 94, 0.15)',
  },

  // Yellow - Warning / Context links
  yellow: {
    50: 'rgba(234, 179, 8, 0.05)',
    100: 'rgba(234, 179, 8, 0.1)',
    200: 'rgba(234, 179, 8, 0.2)',
    400: '#eab308',
    500: '#ca8a04',
    glow: '0 0 15px rgba(234, 179, 8, 0.15)',
  },

  // Red - Error / Danger
  red: {
    50: 'rgba(239, 68, 68, 0.05)',
    100: 'rgba(239, 68, 68, 0.1)',
    200: 'rgba(239, 68, 68, 0.2)',
    400: '#ef4444',
    500: '#dc2626',
    glow: '0 0 15px rgba(239, 68, 68, 0.15)',
  },

  // Blue - Info / Running state
  blue: {
    50: 'rgba(59, 130, 246, 0.05)',
    100: 'rgba(59, 130, 246, 0.1)',
    200: 'rgba(59, 130, 246, 0.2)',
    400: '#3b82f6',
    500: '#2563eb',
    glow: '0 0 15px rgba(59, 130, 246, 0.15)',
  },

  // Purple - Special states
  purple: {
    100: 'rgba(168, 85, 247, 0.1)',
    200: 'rgba(168, 85, 247, 0.2)',
    400: '#a855f7',
    500: '#9333ea',
  },

  // Slate - Text & borders
  slate: {
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Pure colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Semantic color aliases
export const semantic = {
  text: {
    primary: colors.white,
    secondary: colors.slate[400],
    tertiary: colors.slate[500],
    muted: colors.slate[600],
    inverse: colors.black,
  },
  
  border: {
    default: `${colors.cyan[100]}`,
    hover: `${colors.cyan[300]}`,
    focus: `${colors.cyan[400]}`,
    subtle: `${colors.slate[800]}`,
  },

  status: {
    success: colors.emerald[400],
    warning: colors.yellow[400],
    error: colors.red[400],
    info: colors.blue[400],
    pending: colors.slate[400],
    running: colors.blue[400],
    completed: colors.emerald[400],
    failed: colors.red[400],
  },

  interactive: {
    primary: colors.cyan[400],
    primaryHover: colors.cyan[300],
    secondary: colors.slate[700],
    secondaryHover: colors.slate[600],
    danger: colors.red[400],
    dangerHover: colors.red[500],
  },
} as const;

// CSS custom properties for easy theming
export const cssVariables = `
  :root {
    --color-bg-primary: ${colors.background.primary};
    --color-bg-secondary: ${colors.background.secondary};
    --color-bg-tertiary: ${colors.background.tertiary};
    
    --color-cyan-400: ${colors.cyan[400]};
    --color-cyan-glow: ${colors.cyan.glow.md};
    
    --color-text-primary: ${semantic.text.primary};
    --color-text-secondary: ${semantic.text.secondary};
    
    --color-border-default: ${semantic.border.default};
  }
`;

export default colors;
