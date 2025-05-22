" 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤"

import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void | Promise<void>;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
  };
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  contentClassName?: string;
  preventCloseOnAction?: boolean;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
}

export function ActionModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  primaryAction,
  secondaryAction,
  isLoading = false,
  size = 'md',
  contentClassName,
  preventCloseOnAction = false,
  closeOnEsc = true,
  closeOnOutsideClick = true,
}: ActionModalProps) {
  // Size mapping for dialog content
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] w-full',
  };

  // Handle primary action
  const handlePrimaryAction = async () => {
    if (primaryAction) {
      try {
        await primaryAction.onClick();
        if (!preventCloseOnAction) {
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Primary action error:', error);
      }
    }
  };

  // Handle secondary action
  const handleSecondaryAction = () => {
    if (secondaryAction) {
      secondaryAction.onClick();
      if (!preventCloseOnAction) {
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (isLoading && newOpen === false) {
          return; // Prevent closing while loading
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        className={cn(sizeClasses[size], contentClassName)}
        onEscapeKeyDown={(e) => {
          if (!closeOnEsc || isLoading) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (!closeOnOutsideClick || isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="flex items-center justify-end gap-2">
          {actions ? (
            actions
          ) : (
            <>
              {secondaryAction && (
                <Button
                  type="button"
                  variant={secondaryAction.variant || 'outline'}
                  onClick={handleSecondaryAction}
                  disabled={isLoading}
                  className={secondaryAction.className}
                >
                  {secondaryAction.label}
                </Button>
              )}
              
              {primaryAction && (
                <Button
                  type="button"
                  variant={primaryAction.variant || 'default'}
                  onClick={handlePrimaryAction}
                  disabled={isLoading}
                  className={primaryAction.className}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {primaryAction.label}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useActionModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState<Omit<ActionModalProps, 'open' | 'onOpenChange' | 'isLoading'>>({
    title: '',
  });

  const openModal = (config: Omit<ActionModalProps, 'open' | 'onOpenChange' | 'isLoading'>) => {
    setModalConfig(config);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    isOpen,
    isLoading,
    openModal,
    closeModal,
    setLoading,
    ActionModalComponent: (
      <ActionModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        children={modalConfig.children}
        actions={modalConfig.actions}
        primaryAction={modalConfig.primaryAction}
        secondaryAction={modalConfig.secondaryAction}
        isLoading={isLoading}
        size={modalConfig.size}
        contentClassName={modalConfig.contentClassName}
        preventCloseOnAction={modalConfig.preventCloseOnAction}
        closeOnEsc={modalConfig.closeOnEsc}
        closeOnOutsideClick={modalConfig.closeOnOutsideClick}
      />
    ),
  };
}
