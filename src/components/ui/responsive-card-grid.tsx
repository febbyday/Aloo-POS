import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A responsive grid layout for cards that adapts to different screen sizes
 * 
 * @example
 * <ResponsiveCardGrid columns={3}>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 *   <Card>Card 3</Card>
 * </ResponsiveCardGrid>
 */
export function ResponsiveCardGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: ResponsiveCardGridProps) {
  // Map columns to responsive grid classes
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  // Map gap sizes to Tailwind classes
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

export default ResponsiveCardGrid;
