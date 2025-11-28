/**
 * Badge Component
 * 
 * Status badges with different variants and sizes.
 * Used for agent tools, task status, run states, etc.
 */

import React from 'react';
import { colors, spacing, borderRadius, semantic } from '../tokens';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Content of the badge */
  children: React.ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: BadgeSize;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Dot indicator instead of icon */
  dot?: boolean;
  /** Custom className */
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  className = '',
}) => {
  // Size configurations
  const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
    sm: {
      padding: `${spacing[0.5]} ${spacing[1.5]}`,
      fontSize: '0.625rem', // 10px
      lineHeight: '1',
    },
    md: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: '0.75rem', // 12px
      lineHeight: '1',
    },
    lg: {
      padding: `${spacing[1.5]} ${spacing[3]}`,
      fontSize: '0.875rem', // 14px
      lineHeight: '1',
    },
  };

  const dotSizes: Record<BadgeSize, string> = {
    sm: '4px',
    md: '6px',
    lg: '8px',
  };

  // Variant color configurations
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    default: {
      backgroundColor: 'rgba(100, 116, 139, 0.15)',
      color: colors.slate[400],
      border: `1px solid rgba(100, 116, 139, 0.2)`,
    },
    primary: {
      backgroundColor: colors.cyan[100],
      color: colors.cyan[400],
      border: `1px solid ${colors.cyan[200]}`,
    },
    success: {
      backgroundColor: colors.emerald[100],
      color: colors.emerald[400],
      border: `1px solid ${colors.emerald[200]}`,
    },
    warning: {
      backgroundColor: colors.yellow[100],
      color: colors.yellow[400],
      border: `1px solid ${colors.yellow[200]}`,
    },
    error: {
      backgroundColor: colors.red[100],
      color: colors.red[400],
      border: `1px solid ${colors.red[200]}`,
    },
    info: {
      backgroundColor: colors.blue[100],
      color: colors.blue[400],
      border: `1px solid ${colors.blue[200]}`,
    },
    pending: {
      backgroundColor: 'rgba(100, 116, 139, 0.1)',
      color: colors.slate[400],
      border: `1px solid rgba(100, 116, 139, 0.2)`,
    },
    running: {
      backgroundColor: colors.blue[100],
      color: colors.blue[400],
      border: `1px solid ${colors.blue[200]}`,
    },
    completed: {
      backgroundColor: colors.emerald[100],
      color: colors.emerald[400],
      border: `1px solid ${colors.emerald[200]}`,
    },
    failed: {
      backgroundColor: colors.red[100],
      color: colors.red[400],
      border: `1px solid ${colors.red[200]}`,
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: borderRadius.md,
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    whiteSpace: 'nowrap',
  };

  return (
    <span
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {dot && (
        <span
          style={{
            width: dotSizes[size],
            height: dotSizes[size],
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

/**
 * StatusBadge - Convenience component for run/task status
 */
export interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true,
  className = '' 
}) => {
  const statusLabels = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
  };

  const icons = {
    pending: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    running: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
    ),
    completed: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    failed: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  };

  return (
    <Badge
      variant={status}
      icon={showIcon ? icons[status] : undefined}
      className={className}
    >
      {statusLabels[status]}
    </Badge>
  );
};

StatusBadge.displayName = 'StatusBadge';

export default Badge;
