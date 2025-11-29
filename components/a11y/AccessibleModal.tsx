/**
 * Accessible Modal Component
 * Fully accessible modal with focus trap, escape handling, and screen reader support
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap, useReducedMotion } from '../../hooks/useAccessibility';
import { announce } from '../../utils/accessibility';
import { IconButton } from './AccessibleButton';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocusRef,
  finalFocusRef,
}) => {
  const reducedMotion = useReducedMotion();
  const containerRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${React.useId()}`;
  const descriptionId = `modal-desc-${React.useId()}`;

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus initial element or first focusable
      requestAnimationFrame(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        }
      });

      // Announce modal opening
      announce(`Dialog opened: ${title}`, 'assertive');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      
      // Restore focus
      const focusTarget = finalFocusRef?.current || previousFocusRef.current;
      focusTarget?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title, initialFocusRef, finalFocusRef]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center p-4
        ${reducedMotion ? '' : 'animate-fadeIn'}
      `}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`
          relative w-full ${sizes[size]}
          bg-slate-800 rounded-xl shadow-2xl
          ${reducedMotion ? '' : 'animate-scaleIn'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2
            id={titleId}
            className="text-lg font-semibold text-white"
          >
            {title}
          </h2>
          
          {showCloseButton && (
            <IconButton
              icon="✕"
              label="Close dialog"
              onClick={onClose}
              size="sm"
            />
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            id={descriptionId}
            className="px-4 pt-4 text-slate-400"
          >
            {description}
          </p>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

/**
 * Confirmation Dialog
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const variantStyles = {
    danger: {
      icon: '⚠️',
      color: 'text-red-400',
      buttonClass: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: '⚡',
      color: 'text-amber-400',
      buttonClass: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      icon: 'ℹ️',
      color: 'text-blue-400',
      buttonClass: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
    >
      <div className="text-center">
        <div className={`text-4xl mb-4 ${styles.color}`} aria-hidden="true">
          {styles.icon}
        </div>
        
        <p className="text-slate-300 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${styles.buttonClass}`}
            aria-busy={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default AccessibleModal;
