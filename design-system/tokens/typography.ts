/**
 * CrewAI Orchestrator - Typography System
 * 
 * Font scales, weights, and line heights for consistent typography.
 */

// Font families
export const fontFamily = {
  sans: 'Montserrat, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
} as const;

// Font sizes with corresponding line heights
export const fontSize = {
  // Display sizes (headings)
  '3xl': { size: '1.875rem', lineHeight: '2.25rem' },  // 30px
  '2xl': { size: '1.5rem', lineHeight: '2rem' },       // 24px
  'xl': { size: '1.25rem', lineHeight: '1.75rem' },    // 20px
  'lg': { size: '1.125rem', lineHeight: '1.75rem' },   // 18px
  
  // Body sizes
  'base': { size: '1rem', lineHeight: '1.5rem' },      // 16px
  'sm': { size: '0.875rem', lineHeight: '1.25rem' },   // 14px
  'xs': { size: '0.75rem', lineHeight: '1rem' },       // 12px
  '2xs': { size: '0.625rem', lineHeight: '0.875rem' }, // 10px
} as const;

// Font weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography presets for common use cases
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize['2xl'].size,
    lineHeight: fontSize['2xl'].lineHeight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.semibold,
  },
  h4: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.semibold,
  },

  // Body text
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.normal,
  },

  // Labels
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  labelMicro: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize['2xs'].size,
    lineHeight: fontSize['2xs'].lineHeight,
    fontWeight: fontWeight.medium,
  },

  // Code/Mono
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.normal,
  },
  codeSmall: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize['2xs'].size,
    lineHeight: fontSize['2xs'].lineHeight,
    fontWeight: fontWeight.normal,
  },

  // Special
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm.size,
    lineHeight: '1',
    fontWeight: fontWeight.medium,
  },
  badge: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize['2xs'].size,
    lineHeight: '1',
    fontWeight: fontWeight.medium,
  },
} as const;

// Tailwind-compatible class helpers
export const typographyClasses = {
  h1: 'text-2xl font-bold tracking-tight',
  h2: 'text-xl font-semibold tracking-tight',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  body: 'text-sm',
  bodySmall: 'text-xs',
  label: 'text-xs font-medium tracking-wide',
  labelMicro: 'text-[10px] font-medium',
  code: 'font-mono text-xs',
  codeSmall: 'font-mono text-[10px]',
} as const;

export default textStyles;
