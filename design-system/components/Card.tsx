/**
 * Card Component
 * 
 * Base card component with variants for different use cases.
 * Follows cyberpunk design aesthetic with cyan accents.
 */

import React, { forwardRef } from 'react';
import { colors, spacing, borderRadius, shadows, borders, transitions } from '../tokens';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Whether card is clickable/interactive */
  interactive?: boolean;
  /** Active state (for selection) */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Children content */
  children: React.ReactNode;
  /** Optional className for additional styling */
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      active = false,
      disabled = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingMap = {
      none: '0',
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    };

    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.xl,
      padding: paddingMap[padding],
      transition: transitions.all,
      border: borders.card,
      position: 'relative',
    };

    // Variant-specific styles
    const variantStyles: Record<CardVariant, React.CSSProperties> = {
      default: {},
      outlined: {
        backgroundColor: 'rgba(8, 15, 26, 0.6)',
      },
      elevated: {
        boxShadow: shadows.card.default,
      },
      interactive: {
        cursor: interactive || !disabled ? 'pointer' : 'default',
      },
    };

    // State styles
    const stateStyles: React.CSSProperties = {
      ...(active && {
        backgroundColor: colors.background.secondary,
        border: borders.cardActive,
        boxShadow: shadows.card.active,
      }),
      ...(disabled && {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      }),
    };

    // Interactive hover styles (applied via className)
    const interactiveClass = interactive && !disabled && !active
      ? 'hover:bg-[#080F1A] hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,197,220,0.15)]'
      : '';

    const activeClass = active
      ? ''
      : '';

    return (
      <div
        ref={ref}
        className={`${interactiveClass} ${activeClass} ${className}`}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...stateStyles,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader - For card title sections
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        marginBottom: spacing[4],
        paddingBottom: spacing[3],
        borderBottom: borders.dividerCyan,
      }}
    >
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

/**
 * CardContent - Main content area
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

CardContent.displayName = 'CardContent';

/**
 * CardFooter - Footer actions section
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '',
  align = 'right',
}) => {
  const alignmentStyles: Record<string, React.CSSProperties> = {
    left: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    right: { justifyContent: 'flex-end' },
    'space-between': { justifyContent: 'space-between' },
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        marginTop: spacing[4],
        paddingTop: spacing[3],
        borderTop: borders.dividerCyan,
        ...alignmentStyles[align],
      }}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

export default Card;
