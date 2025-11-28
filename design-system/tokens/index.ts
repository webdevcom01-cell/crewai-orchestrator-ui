/**
 * CrewAI Orchestrator - Design Tokens
 * 
 * Central export for all design tokens.
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

// Convenience re-exports
import { colors, semantic } from './colors';
import { textStyles, fontFamily, fontSize, fontWeight } from './typography';
import { spacing, componentSpacing, borderRadius, zIndex } from './spacing';
import { shadows, borders, transitions, backdrop } from './shadows';

export const tokens = {
  colors,
  semantic,
  textStyles,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  componentSpacing,
  borderRadius,
  zIndex,
  shadows,
  borders,
  transitions,
  backdrop,
} as const;

export default tokens;
