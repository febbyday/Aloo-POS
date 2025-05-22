import React from 'react';
import { cn } from '@/lib/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { X } from 'lucide-react';

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

/**
 * A responsive dialog component that adapts to different screen sizes
 * 
 * @example
 * <ResponsiveDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Edit Profile"
 *   description="Make changes to your profile here."
 *   size="lg"
 * >
 *   <div>Dialog content</div>
 * </ResponsiveDialog>
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  className,
}: ResponsiveDialogProps) {
  // Size mapping for different screen sizes
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-[95vw] w-full',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Mobile first - full width on small screens
          'w-full rounded-b-lg sm:rounded-lg',
          // Apply size classes for larger screens
          sizeClasses[size],
          // Custom classes
          className
        )}
      >
        <DialogHeader className="relative">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </DialogHeader>
        
        <div className="py-4">{children}</div>
        
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export default ResponsiveDialog;
