/**
 * Accessible Button Component
 * A fully accessible button with loading states, icons, and variants
 */

import React, { forwardRef, useCallback } from 'react';
import { useReducedMotion } from '../hooks/useAccessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading || disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      [isLoading, disabled, onClick]
    );

    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-violet-500 to-purple-500
        hover:from-violet-600 hover:to-purple-600
        text-white
        focus:ring-violet-500
      `,
      secondary: `
        bg-slate-700 hover:bg-slate-600
        text-white
        focus:ring-slate-500
      `,
      danger: `
        bg-red-500 hover:bg-red-600
        text-white
        focus:ring-red-500
      `,
      ghost: `
        bg-transparent hover:bg-slate-700
        text-slate-300 hover:text-white
        focus:ring-slate-500
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const spinnerAnimation = reducedMotion ? '' : 'animate-spin';

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        onClick={handleClick}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className={`w-4 h-4 ${spinnerAnimation}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{loadingText || 'Loading...'}</span>
            <span className="sr-only">Please wait</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Icon Button - for icon-only buttons
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', size = 'md', className = '', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    const variants = {
      primary: `
        bg-gradient-to-r from-violet-500 to-purple-500
        hover:from-violet-600 hover:to-purple-600
        text-white
      `,
      secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      ghost: 'bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={`
          ${sizes[size]}
          ${variants[variant]}
          inline-flex items-center justify-center
          rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        <span aria-hidden="true">{icon}</span>
        <span className="sr-only">{label}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default AccessibleButton;
