import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-white text-gray-900 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-sm border-gray-200',
        elevated: 'shadow-lg border-gray-200 hover:shadow-xl',
        outlined: 'border-2 shadow-none hover:shadow-sm border-gray-300',
        interactive: 'shadow-sm border-gray-200 hover:shadow-md hover:-translate-y-1 cursor-pointer',
        glass: 'bg-white/80 backdrop-blur-sm border-white/20 shadow-lg',
        gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md border-gray-200',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding }),
        hover && 'hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  bordered?: boolean;
}>(
  ({ className, bordered, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        bordered && 'border-b border-gray-200',
        className
      )} 
      {...props} 
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & {
  size?: 'sm' | 'default' | 'lg';
}>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-lg font-semibold',
      default: 'text-xl font-semibold',
      lg: 'text-2xl font-bold',
    };
    
    return (
      <h3
        ref={ref}
        className={cn(
          'leading-none tracking-tight text-gray-900',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-600 leading-relaxed', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  noPadding?: boolean;
}>(
  ({ className, noPadding, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        !noPadding && 'p-6 pt-0',
        className
      )} 
      {...props} 
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  bordered?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}>(
  ({ className, bordered, justify = 'start', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };
    
    return (
      <div 
        ref={ref} 
        className={cn(
          'flex items-center p-6 pt-0',
          bordered && 'border-t border-gray-200 bg-gray-50/50',
          justifyClasses[justify],
          className
        )} 
        {...props} 
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// Additional Card Components
const CardImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}>(
  ({ className, src, alt, aspectRatio = 'video', ...props }, ref) => {
    const aspectClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[21/9]',
    };
    
    return (
      <div 
        ref={ref} 
        className={cn(
          'relative overflow-hidden',
          aspectClasses[aspectRatio],
          className
        )} 
        {...props}
      >
        <img 
          src={src} 
          alt={alt} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }
);
CardImage.displayName = 'CardImage';

const CardBadge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span 
        ref={ref} 
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          variantClasses[variant],
          className
        )} 
        {...props}
      >
        {children}
      </span>
    );
  }
);
CardBadge.displayName = 'CardBadge';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardImage,
  CardBadge,
  cardVariants
};