import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'border-gray-300 border-t-blue-600',
        primary: 'border-blue-200 border-t-blue-600',
        success: 'border-green-200 border-t-green-600',
        warning: 'border-yellow-200 border-t-yellow-600',
        error: 'border-red-200 border-t-red-600',
        white: 'border-white/30 border-t-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function LoadingSpinner({ 
  size, 
  variant, 
  className, 
  label = 'Loading...',
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Dots Loading Animation
export function LoadingDots({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current rounded-full animate-pulse',
            dotSizes[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}

// Pulse Loading Animation
export function LoadingPulse({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'bg-blue-600 rounded-full animate-pulse',
        sizeClasses[size],
        className
      )}
      style={{
        animationDuration: '1.5s',
      }}
    />
  );
}

// Bars Loading Animation
export function LoadingBars({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const barSizes = {
    sm: 'w-0.5 h-4',
    md: 'w-1 h-6',
    lg: 'w-1.5 h-8',
  };

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            barSizes[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Skeleton Components
export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  animated?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  lines = 1, 
  animated = true 
}: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-2', animated && 'animate-pulse')}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded',
            i === lines - 1 && lines > 1 && 'w-3/4', // Last line shorter
            animated && 'animate-shimmer',
            className
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonText({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded animate-shimmer',
            i === lines - 1 && 'w-2/3'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 rounded-full animate-shimmer',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function SkeletonButton({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 rounded-md animate-shimmer',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-shimmer" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-shimmer" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
}

// Enhanced Loading State Component
export interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function LoadingState({ 
  loading, 
  children, 
  fallback,
  delay = 0 
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = React.useState(!delay);

  React.useEffect(() => {
    if (loading && delay > 0) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(loading);
    }
  }, [loading, delay]);

  if (loading && showLoading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }
  return <>{children}</>;
}

// Progress Bar Component
export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = false,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantClasses[variant],
            animated && 'animate-shimmer'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading Overlay Component
export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  spinner?: React.ReactNode;
  className?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  loading,
  children,
  spinner,
  className,
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-white/80 z-50',
          blur && 'backdrop-blur-sm'
        )}>
          {spinner || <LoadingSpinner size="lg" />}
        </div>
      )}
    </div>
  );
}