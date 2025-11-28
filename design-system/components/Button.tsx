/**
 * Button Component
 * 
 * Versatile button component with multiple variants and sizes.
 * Supports icons, loading states, and full customization.
 */

import React, { forwardRef } from 'react';
import { colors, spacing, borderRadius, shadows, transitions, borders } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Icon before text */
  iconBefore?: React.ReactNode;
  /** Icon after text */
  iconAfter?: React.ReactNode;
  /** Icon only (no text) */
  iconOnly?: React.ReactNode;
  /** Children content */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      iconBefore,
      iconAfter,
      iconOnly,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size configurations
    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: '0.875rem',
        lineHeight: '1',
      },
      md: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: '0.875rem',
        lineHeight: '1',
      },
      lg: {
        padding: `${spacing[2.5]} ${spacing[6]}`,
        fontSize: '0.875rem',
        lineHeight: '1',
      },
    };

    // Icon-only size adjustments
    const iconOnlySizes: Record<ButtonSize, React.CSSProperties> = {
      sm: { padding: spacing[1.5], width: 'auto', height: 'auto' },
      md: { padding: spacing[2], width: 'auto', height: 'auto' },
      lg: { padding: spacing[2.5], width: 'auto', height: 'auto' },
    };

    // Variant base styles
    const variantBaseStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'rgba(34, 197, 220, 0.2)',
        color: colors.cyan[400],
        border: borders.card,
      },
      secondary: {
        backgroundColor: colors.slate[800],
        color: colors.white,
        border: `1px solid ${colors.slate[700]}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.slate[400],
        border: '1px solid transparent',
      },
      danger: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: colors.red[400],
        border: `1px solid rgba(239, 68, 68, 0.3)`,
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        color: colors.emerald[400],
        border: `1px solid rgba(34, 197, 94, 0.3)`,
      },
    };

    // Hover state classes (Tailwind)
    const variantHoverClasses: Record<ButtonVariant, string> = {
      primary: 'hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]',
      secondary: 'hover:bg-slate-700',
      ghost: 'hover:bg-slate-800/50 hover:text-white hover:border-cyan-500/20',
      danger: 'hover:bg-red-500/30',
      success: 'hover:bg-emerald-500/20',
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      borderRadius: borderRadius.lg,
      fontWeight: '500',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: transitions.all,
      fontFamily: 'inherit',
      outline: 'none',
      textDecoration: 'none',
      userSelect: 'none',
      width: fullWidth ? '100%' : 'auto',
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto',
    };

    const currentSizeStyle = iconOnly ? iconOnlySizes[size] : sizeStyles[size];

    return (
      <button
        ref={ref}
        className={`${variantHoverClasses[variant]} ${className}`}
        style={{
          ...baseStyles,
          ...variantBaseStyles[variant],
          ...currentSizeStyle,
        }}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
          </svg>
        )}
        {!loading && iconBefore && <span style={{ display: 'flex' }}>{iconBefore}</span>}
        {!loading && iconOnly && <span style={{ display: 'flex' }}>{iconOnly}</span>}
        {!iconOnly && children}
        {!loading && iconAfter && <span style={{ display: 'flex' }}>{iconAfter}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * IconButton - Convenience wrapper for icon-only buttons
 */
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...props }, ref) => {
    return <Button ref={ref} iconOnly={icon} {...props} />;
  }
);

IconButton.displayName = 'IconButton';

export default Button;
