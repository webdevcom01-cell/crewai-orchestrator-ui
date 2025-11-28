import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading placeholder component
 * Used to show loading state before content is available
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-slate-700/50';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
};

/**
 * Skeleton for agent/task cards in list view
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-cyan-500/15 bg-[#080F1A]/60 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="rounded" width={32} height={32} />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={16} className="mb-2" />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
          <Skeleton variant="text" width="80%" height={14} className="mb-2" />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for form fields
 */
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading form">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-cyan-500/15">
        <div>
          <Skeleton variant="text" width={200} height={24} className="mb-2" />
          <Skeleton variant="text" width={150} height={14} />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={100} height={40} />
          <Skeleton variant="rounded" width={120} height={40} />
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton variant="text" width={80} height={14} />
          <Skeleton variant="rounded" width="100%" height={44} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width={100} height={14} />
          <Skeleton variant="rounded" width="100%" height={44} />
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <Skeleton variant="text" width={120} height={14} />
        <Skeleton variant="rounded" width="100%" height={128} />
      </div>

      {/* Another textarea */}
      <div className="space-y-2">
        <Skeleton variant="text" width={140} height={14} />
        <Skeleton variant="rounded" width="100%" height={96} />
      </div>
    </div>
  );
};

/**
 * Skeleton for the task flow visualization
 */
export const FlowSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-0" aria-label="Loading flow">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative">
          {/* Connection line */}
          {i > 0 && (
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center">
                <Skeleton variant="rectangular" width={2} height={16} />
                <Skeleton variant="circular" width={14} height={14} className="mt-1" />
              </div>
            </div>
          )}
          
          {/* Card */}
          <div className="relative p-4 rounded-xl border border-cyan-500/15 bg-[#080F1A]/60 animate-pulse">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2">
              <Skeleton variant="rounded" width={24} height={24} />
            </div>
            <div className="ml-4">
              <Skeleton variant="text" width={80} height={12} className="mb-2" />
              <Skeleton variant="text" width="90%" height={16} className="mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton variant="rounded" width={100} height={24} />
                <Skeleton variant="text" width={60} height={12} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Full page loading skeleton
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div className="flex h-full" aria-label="Loading page">
      {/* Left panel */}
      <div className="w-1/3 border-r border-cyan-500/15 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton variant="text" width={150} height={28} className="mb-2" />
            <Skeleton variant="text" width={100} height={14} />
          </div>
          <Skeleton variant="rounded" width={40} height={40} />
        </div>
        <CardSkeleton count={4} />
      </div>

      {/* Right panel */}
      <div className="w-2/3 p-8">
        <FormSkeleton />
      </div>
    </div>
  );
};

export default Skeleton;
