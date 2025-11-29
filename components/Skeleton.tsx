import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-700/50';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <Skeleton
      variant="rounded"
      width={100}
      height={36}
      className={className}
    />
  );
}

// Card skeleton
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={20} className="w-1/2" />
          <Skeleton variant="text" height={14} className="w-3/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" height={24} className="w-16" />
        <Skeleton variant="rounded" height={24} className="w-16" />
      </div>
    </div>
  );
}

// Agent card skeleton
export function SkeletonAgentCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-5 rounded-xl bg-gray-900/80 border border-gray-800 ${className}`}>
      <div className="flex items-start gap-4">
        <SkeletonAvatar size={56} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={24} className="w-2/3" />
          <Skeleton variant="text" height={16} className="w-1/2" />
        </div>
        <Skeleton variant="rounded" width={32} height={32} />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-5/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rounded" height={28} className="w-20" />
        <Skeleton variant="rounded" height={28} className="w-24" />
      </div>
    </div>
  );
}

// Task card skeleton
export function SkeletonTaskCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-lg bg-gray-900/60 border border-gray-800 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="text" height={20} className="w-2/3" />
        <Skeleton variant="rounded" height={24} className="w-16" />
      </div>
      <SkeletonText lines={2} />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonAvatar size={24} />
          <Skeleton variant="text" height={14} className="w-24" />
        </div>
        <Skeleton variant="text" height={14} className="w-16" />
      </div>
    </div>
  );
}

// Table skeleton
export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden border border-gray-800 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800/50 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={16} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4 border-t border-gray-800">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// List skeleton
export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
          <SkeletonAvatar size={36} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" height={16} className="w-1/2" />
            <Skeleton variant="text" height={12} className="w-3/4" />
          </div>
          <Skeleton variant="rounded" width={60} height={28} />
        </div>
      ))}
    </div>
  );
}

// Dashboard stats skeleton
export function SkeletonStats({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="rounded" width={40} height={40} />
            <Skeleton variant="text" height={14} className="w-20" />
          </div>
          <Skeleton variant="text" height={32} className="w-16 mb-1" />
          <Skeleton variant="text" height={12} className="w-24" />
        </div>
      ))}
    </div>
  );
}

// Page skeleton
export function SkeletonPage({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" height={32} className="w-48" />
          <Skeleton variant="text" height={16} className="w-64" />
        </div>
        <SkeletonButton />
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default Skeleton;
