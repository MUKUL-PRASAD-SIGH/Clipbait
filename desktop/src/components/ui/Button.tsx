import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500 hover:shadow-sm',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500 shadow-sm hover:shadow-md',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 hover:shadow-sm',
        link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-11 px-8 text-base',
        xl: 'h-12 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const LoadingSpinner = ({ size = 'default' }: { size?: 'xs' | 'sm' | 'default' | 'lg' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeClasses[size])} />
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading, 
    loadingText, 
    icon, 
    iconPosition = 'left', 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const spinnerSize = size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'lg' || size === 'xl' ? 'lg' : 'default';
    
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center">
            <LoadingSpinner size={spinnerSize} />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </div>
        )}
        
        {/* Normal state */}
        {!loading && (
          <div className="flex items-center">
            {icon && iconPosition === 'left' && (
              <span className={cn('flex-shrink-0', children && 'mr-2')}>
                {icon}
              </span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className={cn('flex-shrink-0', children && 'ml-2')}>
                {icon}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };