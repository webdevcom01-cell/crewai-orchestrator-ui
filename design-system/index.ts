/**
 * CrewAI Orchestrator - Design System
 * 
 * Complete design system with tokens, components, and layouts.
 * 
 * @example Basic usage
 * ```tsx
 * import { Button, Card, colors } from '@/design-system';
 * 
 * <Card padding="lg">
 *   <Button variant="primary">Click me</Button>
 * </Card>
 * ```
 */

// Tokens
export * from './tokens';

// Components
export * from './components';

// Layouts
export * from './layouts';

// Default export with everything
import * as tokens from './tokens';
import * as components from './components';
import * as layouts from './layouts';

export default {
  tokens,
  components,
  layouts,
};
