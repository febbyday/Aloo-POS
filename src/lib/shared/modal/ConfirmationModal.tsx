" 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤"

import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  contentClassName?: string;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'destructive',
  size = 'md',
  icon,
  confirmButtonClassName,
  cancelButtonClassName,
  contentClassName,
}: ConfirmationModalProps) {
  // Size mapping for dialog content
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  // Handle confirmation
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      onOpenChange(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(sizeClasses[size], contentClassName)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            asChild
            onClick={handleCancel}
            disabled={isLoading}
            className={cancelButtonClassName}
          >
            <Button variant="outline">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={handleConfirm}
            disabled={isLoading}
          >
            <Button 
              variant={variant} 
              className={confirmButtonClassName}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState<Omit<ConfirmationModalProps, 'open' | 'onOpenChange' | 'isLoading'>>({
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => {},
  });

  const openConfirmation = (config: Omit<ConfirmationModalProps, 'open' | 'onOpenChange' | 'isLoading'>) => {
    setModalConfig(config);
    setIsOpen(true);
  };

  const closeConfirmation = () => {
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await modalConfig.onConfirm();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return {
    isOpen,
    isLoading,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
    ConfirmationModalComponent: (
      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={modalConfig.onCancel}
        isLoading={isLoading}
        variant={modalConfig.variant}
        size={modalConfig.size}
        icon={modalConfig.icon}
        confirmButtonClassName={modalConfig.confirmButtonClassName}
        cancelButtonClassName={modalConfig.cancelButtonClassName}
        contentClassName={modalConfig.contentClassName}
      />
    ),
  };
}
