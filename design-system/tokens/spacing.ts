/**
 * CrewAI Orchestrator - Spacing System
 * 
 * Consistent spacing scale for margins, paddings, and gaps.
 * Based on 4px base unit with Tailwind-compatible naming.
 */

// Base spacing scale (in pixels, used as rem values)
export const spacing = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
} as const;

// Component-specific spacing presets
export const componentSpacing = {
  // Card padding variants
  card: {
    sm: spacing[3],    // 12px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
  },

  // Button padding
  button: {
    sm: { x: spacing[3], y: spacing[1.5] },     // px-3 py-1.5
    md: { x: spacing[4], y: spacing[2] },       // px-4 py-2
    lg: { x: spacing[6], y: spacing[2.5] },     // px-6 py-2.5
  },

  // Input padding
  input: {
    x: spacing[4],     // 16px horizontal
    y: spacing[2.5],   // 10px vertical
  },

  // Modal spacing
  modal: {
    padding: spacing[6],       // 24px
    gap: spacing[4],           // 16px between sections
    headerGap: spacing[3],     // 12px
  },

  // Page layout
  page: {
    padding: spacing[6],       // 24px
    paddingLg: spacing[8],     // 32px
    gap: spacing[6],           // 24px between sections
  },

  // Sidebar
  sidebar: {
    width: '16rem',            // 256px
    padding: spacing[4],       // 16px
    itemGap: spacing[2],       // 8px
    itemPadding: { x: spacing[4], y: spacing[3] }, // px-4 py-3
  },

  // List/Grid gaps
  list: {
    gap: spacing[2],           // 8px
    gapLg: spacing[3],         // 12px
  },
  grid: {
    gap: spacing[4],           // 16px
    gapLg: spacing[6],         // 24px
  },

  // Form spacing
  form: {
    fieldGap: spacing[6],      // 24px between fields
    labelGap: spacing[2],      // 8px between label and input
    helperGap: spacing[1],     // 4px for helper text
  },

  // Icon spacing
  icon: {
    gap: spacing[2],           // 8px gap with text
    gapSm: spacing[1.5],       // 6px small gap
  },
} as const;

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.25rem',       // 4px
  md: '0.5rem',        // 8px
  lg: '0.75rem',       // 12px
  xl: '1rem',          // 16px
  '2xl': '1.5rem',     // 24px
  full: '9999px',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Container max widths
export const containerMaxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  prose: '65ch',       // Optimal reading width
  form: '40rem',       // Form max width (640px)
} as const;

export default spacing;
