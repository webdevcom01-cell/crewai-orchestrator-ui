/**
 * Input Component
 * 
 * Form input components with consistent styling and validation states.
 * Includes Input, Textarea, and Select variants.
 */

import React, { forwardRef } from 'react';
import { colors, spacing, borderRadius, borders, transitions } from '../tokens';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

export interface BaseInputProps {
  /** Size variant */
  size?: InputSize;
  /** Validation state */
  state?: InputState;
  /** Full width */
  fullWidth?: boolean;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (sets state to error) */
  error?: string;
  /** Icon before input */
  iconBefore?: React.ReactNode;
  /** Icon after input */
  iconAfter?: React.ReactNode;
  /** Custom className */
  className?: string;
}

// Input Component
export interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      fullWidth = false,
      label,
      helperText,
      error,
      iconBefore,
      iconAfter,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const finalState = error ? 'error' : state;

    // Size styles
    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: '0.875rem',
      },
      md: {
        padding: `${spacing[2.5]} ${spacing[4]}`,
        fontSize: '0.875rem',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: '1rem',
      },
    };

    // State styles
    const stateStyles: Record<InputState, { border: string; focus: string }> = {
      default: {
        border: borders.input,
        focus: borders.inputFocus,
      },
      error: {
        border: borders.inputError,
        focus: `1px solid ${colors.red[400]}`,
      },
      success: {
        border: `1px solid ${colors.emerald[300]}`,
        focus: `1px solid ${colors.emerald[400]}`,
      },
    };

    const baseInputStyles: React.CSSProperties = {
      backgroundColor: colors.background.secondary,
      color: colors.white,
      border: stateStyles[finalState].border,
      borderRadius: borderRadius.lg,
      outline: 'none',
      transition: transitions.all,
      fontFamily: 'inherit',
      width: fullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
    };

    const inputWrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: fullWidth ? '100%' : 'auto',
    };

    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      color: colors.slate[500],
      pointerEvents: 'none',
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: '0.75rem',
              fontWeight: '500',
              color: colors.slate[400],
              letterSpacing: '0.025em',
            }}
          >
            {label}
          </label>
        )}
        
        <div style={inputWrapperStyles}>
          {iconBefore && (
            <span style={{ ...iconStyles, left: spacing[3] }}>
              {iconBefore}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`focus:border-cyan-500/50 placeholder:text-slate-600 ${className}`}
            style={{
              ...baseInputStyles,
              paddingLeft: iconBefore ? spacing[10] : sizeStyles[size].padding,
              paddingRight: iconAfter ? spacing[10] : sizeStyles[size].padding,
            }}
            {...props}
          />
          
          {iconAfter && (
            <span style={{ ...iconStyles, right: spacing[3] }}>
              {iconAfter}
            </span>
          )}
        </div>

        {(helperText || error) && (
          <p
            style={{
              marginTop: spacing[1],
              fontSize: '0.625rem',
              color: error ? colors.red[400] : colors.slate[500],
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Number of rows */
  rows?: number;
  /** Enable resize */
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      state = 'default',
      fullWidth = false,
      label,
      helperText,
      error,
      rows = 4,
      resize = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const finalState = error ? 'error' : state;

    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: '0.875rem',
      },
      md: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: '0.875rem',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: '1rem',
      },
    };

    const stateStyles: Record<InputState, string> = {
      default: borders.input,
      error: borders.inputError,
      success: `1px solid ${colors.emerald[300]}`,
    };

    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.background.secondary,
      color: colors.white,
      border: stateStyles[finalState],
      borderRadius: borderRadius.lg,
      outline: 'none',
      transition: transitions.all,
      fontFamily: 'inherit',
      width: fullWidth ? '100%' : 'auto',
      resize: resize ? 'vertical' : 'none',
      ...sizeStyles[size],
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: '0.75rem',
              fontWeight: '500',
              color: colors.slate[400],
              letterSpacing: '0.025em',
            }}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`focus:border-cyan-500/50 placeholder:text-slate-600 ${className}`}
          style={baseStyles}
          {...props}
        />

        {(helperText || error) && (
          <p
            style={{
              marginTop: spacing[1],
              fontSize: '0.625rem',
              color: error ? colors.red[400] : colors.slate[500],
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
export interface SelectProps extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      state = 'default',
      fullWidth = false,
      label,
      helperText,
      error,
      className = '',
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const finalState = error ? 'error' : state;

    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: '0.875rem',
      },
      md: {
        padding: `${spacing[2.5]} ${spacing[4]}`,
        fontSize: '0.875rem',
      },
      lg: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: '1rem',
      },
    };

    const stateStyles: Record<InputState, string> = {
      default: borders.input,
      error: borders.inputError,
      success: `1px solid ${colors.emerald[300]}`,
    };

    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.background.secondary,
      color: colors.white,
      border: stateStyles[finalState],
      borderRadius: borderRadius.lg,
      outline: 'none',
      transition: transitions.all,
      fontFamily: 'inherit',
      width: fullWidth ? '100%' : 'auto',
      cursor: 'pointer',
      ...sizeStyles[size],
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: '0.75rem',
              fontWeight: '500',
              color: colors.slate[400],
              letterSpacing: '0.025em',
            }}
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`focus:border-cyan-500/50 ${className}`}
          style={baseStyles}
          {...props}
        >
          {children}
        </select>

        {(helperText || error) && (
          <p
            style={{
              marginTop: spacing[1],
              fontSize: '0.625rem',
              color: error ? colors.red[400] : colors.slate[500],
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Input;
