/**
 * Badge Component
 * 
 * A versatile badge component for displaying status, labels, or counts.
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';

// Define the variants and sizes available for the badge
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
export type BadgeSize = 'sm' | 'md' | 'lg';

// Define the props for the Badge component
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The visual style variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;
  
  /**
   * The size of the badge
   * @default 'md'
   */
  size?: BadgeSize;
  
  /**
   * Optional additional class names
   */
  className?: string;
  
  /**
   * Badge content
   */
  children: React.ReactNode;
}

/**
 * Badge component for displaying status, labels, or counts
 */
export const Badge = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) => {
  // Define the base styles for the badge
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium';
  
  // Define variant-specific styles
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    success: 'bg-success text-success-foreground hover:bg-success/80',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
  };
  
  // Define size-specific styles
  const sizeStyles = {
    sm: 'h-5 px-2 py-0.5 text-xs',
    md: 'h-6 px-2.5 py-0.5 text-sm',
    lg: 'h-7 px-3 py-1 text-base',
  };
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge; 