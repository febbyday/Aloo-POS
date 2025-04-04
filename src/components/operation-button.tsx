import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OperationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function OperationButton({
  variant = 'default',
  size = 'default',
  icon,
  children,
  className,
  ...props
}: OperationButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </Button>
  );
}
