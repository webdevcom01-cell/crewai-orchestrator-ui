/**
 * LoadingState Component
 * 
 * Loading indicators and skeleton loaders.
 */

import React from 'react';
import { colors, spacing, borderRadius } from '../tokens';

export type LoadingSize = 'sm' | 'md' | 'lg';

// Spinner Component
export interface SpinnerProps {
  /** Size variant */
  size?: LoadingSize;
  /** Custom color */
  color?: string;
  /** Custom className */
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = colors.cyan[400],
  className = '',
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  return (
    <svg
      className={`animate-spin ${className}`}
      width={sizeMap[size]}
      height={sizeMap[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
};

Spinner.displayName = 'Spinner';

// Loading Screen Component
export interface LoadingScreenProps {
  /** Loading message */
  message?: string;
  /** Custom className */
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[12],
        gap: spacing[4],
      }}
    >
      <Spinner size="lg" />
      {message && (
        <p
          style={{
            fontSize: '0.875rem',
            color: colors.slate[500],
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

LoadingScreen.displayName = 'LoadingScreen';

// Skeleton Components (already exist but refactored)
export interface SkeletonProps {
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Border radius */
  radius?: string;
  /** Custom className */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  radius = borderRadius.md,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        backgroundColor: colors.slate[800],
        borderRadius: radius,
      }}
    />
  );
};

Skeleton.displayName = 'Skeleton';

// Skeleton Text
export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Custom className */
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

SkeletonText.displayName = 'SkeletonText';

// Card Skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.background.secondary,
        border: `1px solid ${colors.slate[800]}`,
        borderRadius: borderRadius.xl,
        padding: spacing[4],
      }}
    >
      <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[4] }}>
        <Skeleton width="2rem" height="2rem" radius={borderRadius.lg} />
        <div style={{ flex: 1 }}>
          <Skeleton height="0.875rem" width="40%" />
          <Skeleton height="0.75rem" width="60%" style={{ marginTop: spacing[2] }} />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[3] }}>
        <Skeleton width="4rem" height="1.25rem" radius={borderRadius.md} />
        <Skeleton width="3rem" height="1.25rem" radius={borderRadius.md} />
      </div>
    </div>
  );
};

SkeletonCard.displayName = 'SkeletonCard';

export default Spinner;
