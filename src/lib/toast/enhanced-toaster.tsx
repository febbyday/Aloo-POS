import React from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast as useShadcnToast } from "@/components/ui/use-toast-compat";
import { cn } from '@/lib/utils/cn';
import { ToastPosition, ToastAnimation } from './toast-service';

/**
 * Progress bar component for progress toasts
 */
function ProgressBar({ value = 0, showValue = false, color }: { value: number, showValue?: boolean, color?: string }) {
  // Ensure value is between 0 and 100
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-in-out",
            color || "bg-blue-500"
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {showValue && (
        <div className="text-xs text-right mt-1 text-muted-foreground">
          {Math.round(safeValue)}%
        </div>
      )}
    </div>
  );
}

/**
 * Get animation class based on animation type
 */
function getAnimationClass(animation?: ToastAnimation) {
  switch (animation) {
    case 'slide':
      return 'animate-in slide-in-from-right-full duration-300';
    case 'fade':
      return 'animate-in fade-in duration-300';
    case 'zoom':
      return 'animate-in zoom-in-90 duration-300';
    case 'bounce':
      return 'animate-bounce';
    case 'none':
    default:
      return '';
  }
}

/**
 * Get position class based on position type
 */
function getPositionClass(position?: ToastPosition) {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0';
    case 'top-center':
      return 'top-0 left-1/2 -translate-x-1/2';
    case 'top-right':
      return 'top-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'bottom-center':
      return 'bottom-0 left-1/2 -translate-x-1/2';
    case 'bottom-right':
    default:
      return 'bottom-0 right-0';
  }
}

/**
 * Enhanced toaster component with improved styling and icon support
 */
export function EnhancedToaster() {
  const { toasts } = useShadcnToast();

  return (
    <ToastProvider>
      {toasts.map(({
        id,
        title,
        description,
        action,
        icon,
        className,
        animation,
        progress,
        render,
        ...props
      }) => {
        // If a custom render function is provided, use it
        if (render) {
          return (
            <Toast
              key={id}
              className={cn(
                className,
                getAnimationClass(animation as ToastAnimation)
              )}
              {...props}
            >
              {render({ id, title, description, action, icon, className, animation, progress, ...props })}
              <ToastClose />
            </Toast>
          );
        }

        return (
          <Toast
            key={id}
            className={cn(
              className,
              getAnimationClass(animation as ToastAnimation)
            )}
            {...props}
          >
            <div className="flex">
              {icon && (
                <div className="flex-shrink-0 mr-3 pt-0.5">
                  {icon}
                </div>
              )}
              <div className="flex-1 grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>
                    {description}
                  </ToastDescription>
                )}
                {progress && (
                  <ProgressBar
                    value={progress.value}
                    showValue={progress.showValue}
                    color={progress.color}
                  />
                )}
                {action && (
                  <div className="mt-2">
                    {action}
                  </div>
                )}
              </div>
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
        getPositionClass(toasts[0]?.position as ToastPosition)
      )} />
    </ToastProvider>
  );
}

export default EnhancedToaster;
