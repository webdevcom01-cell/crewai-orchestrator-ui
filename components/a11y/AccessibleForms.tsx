/**
 * Accessible Form Components
 * Input, Select, Checkbox, Radio with full accessibility support
 */

import React, { forwardRef, useId } from 'react';

// ============================================
// Input Component
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, hideLabel = false, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-slate-300
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {hint && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}

        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={props.required}
          className={`
            w-full px-4 py-2
            bg-slate-900 border rounded-lg
            text-white placeholder-slate-500
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 hover:border-slate-500'
            }
            ${className}
          `}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-400 flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// ============================================
// Textarea Component
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, hideLabel = false, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-slate-300
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {hint && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}

        <textarea
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={props.required}
          className={`
            w-full px-4 py-2
            bg-slate-900 border rounded-lg
            text-white placeholder-slate-500
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y min-h-[100px]
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 hover:border-slate-500'
            }
            ${className}
          `}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-400 flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// ============================================
// Select Component
// ============================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, hideLabel = false, placeholder, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-slate-300
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {hint && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            aria-required={props.required}
            className={`
              w-full px-4 py-2 pr-10
              bg-slate-900 border rounded-lg
              text-white
              appearance-none
              cursor-pointer
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-slate-600 hover:border-slate-500'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-400 flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// ============================================
// Checkbox Component
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const descriptionId = `${id}-desc`;

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            aria-describedby={description ? descriptionId : undefined}
            className={`
              w-4 h-4
              bg-slate-900 border-slate-600
              rounded
              text-violet-500
              focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800
              transition-colors duration-200
              cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-300 cursor-pointer"
          >
            {label}
          </label>
          
          {description && (
            <p id={descriptionId} className="text-xs text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// ============================================
// Radio Group Component
// ============================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  hideLabel?: boolean;
}

export const AccessibleRadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
  hideLabel = false,
}) => {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={!!error}
    >
      <legend
        id={`${groupId}-label`}
        className={`
          text-sm font-medium text-slate-300 mb-2
          ${hideLabel ? 'sr-only' : ''}
        `}
      >
        {label}
      </legend>

      <div className={`
        flex gap-4
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
      `}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 cursor-pointer
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className="
                  w-4 h-4
                  bg-slate-900 border-slate-600
                  text-violet-500
                  focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800
                  cursor-pointer
                  disabled:cursor-not-allowed
                "
              />
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-slate-300">
                {option.label}
              </span>
              
              {option.description && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-red-400 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </fieldset>
  );
};

// ============================================
// Form Group Component
// ============================================

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

export default {
  AccessibleInput,
  AccessibleTextarea,
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleRadioGroup,
  FormGroup,
};
