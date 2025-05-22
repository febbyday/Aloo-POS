// Import directly from the original toast component to avoid circular dependencies
import { toast as originalToast } from "@/components/ui/use-toast";
import { ToastService } from "@/lib/toast";

/**
 * Compatibility layer for the old useToast hook
 *
 * @deprecated Use the new standardized toast system from '@/lib/toast' instead.
 * Import { ToastService } from '@/lib/toast' and use ToastService.success(), ToastService.error(), etc.
 */
export const useToast = () => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Warning: The useToast hook from @/components/ui/use-toast-compat is deprecated. ' +
      'Please use the ToastService directly by importing { ToastService } from "@/lib/toast" instead.'
    );
  }

  // Return a compatibility object that maps to ToastService
  return {
    toast: (props: any) => {
      if (props.variant === 'destructive') {
        return ToastService.error(props.title, props.description);
      } else {
        return ToastService.info(props.title, props.description);
      }
    }
  };
};

// For direct toast usage - simplified version to avoid circular dependencies
export const toast = (props: any) => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Warning: The toast function from @/components/ui/use-toast-compat is deprecated. ' +
      'Please use the ToastService directly by importing { ToastService } from "@/lib/toast" instead.'
    );
  }

  if (props.variant === 'destructive') {
    return ToastService.error(props.title, props.description);
  } else {
    return ToastService.info(props.title, props.description);
  }
};
