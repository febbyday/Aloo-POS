/**
 * Toast Migration Utilities
 *
 * This file contains utilities to help migrate from the old toast system to the new standardized toast system.
 * It provides compatibility layers and helper functions to make the migration process smoother.
 */

// Import from the compatibility layer to avoid circular dependencies
import { toast as shadcnToast } from '@/components/ui/use-toast-compat';
import { ToastService, ToastOptions } from './toast-service';

/**
 * Compatibility layer for the old toast API
 * This allows existing code to continue working while migrating to the new system
 */
// Guard to prevent recursion
let inToastCall = false;

export function createCompatibilityToast() {
  // Create a compatibility function that maps old toast calls to new ones
  const compatToast = (props: any) => {
    // Guard against infinite recursion
    if (inToastCall) {
      console.warn('Preventing recursive toast call');
      return { id: 'prevented-recursive-toast', dismiss: () => {}, update: () => {} };
    }
    
    inToastCall = true;
    // Extract properties from the old format
    const {
      title,
      description,
      variant,
      className,
      icon,
      iconclassname,
      action,
      ...rest
    } = props;

    // Determine the toast type based on variant and className
    let toastType = 'default';

    if (variant === 'destructive') {
      toastType = 'error';
    } else if (className?.includes('green')) {
      toastType = 'success';
    } else if (className?.includes('amber') || className?.includes('yellow')) {
      toastType = 'warning';
    } else if (className?.includes('blue')) {
      toastType = 'info';
    }

    // Create options for the new toast system
    const options: ToastOptions = {
      title,
      description,
      icon,
      className,
      action,
      ...rest
    };

    // Call the appropriate method on the new toast service
    try {
      return ToastService.show(toastType as any, options);
    } finally {
      inToastCall = false;
    }
  };

  // Add compatibility methods for the old toast API
  compatToast.success = (title: string, description?: string) => {
    // Guard against infinite recursion
    if (inToastCall) {
      console.warn('Preventing recursive toast success call');
      return { id: 'prevented-recursive-toast', dismiss: () => {}, update: () => {} };
    }
    
    inToastCall = true;
    try {
      return ToastService.success(title, description);
    } finally {
      inToastCall = false;
    }
  };

  compatToast.error = (title: string, description?: string) => {
    // Guard against infinite recursion
    if (inToastCall) {
      console.warn('Preventing recursive toast error call');
      return { id: 'prevented-recursive-toast', dismiss: () => {}, update: () => {} };
    }
    
    inToastCall = true;
    try {
      return ToastService.error(title, description);
    } finally {
      inToastCall = false;
    }
  };

  compatToast.warning = (title: string, description?: string) => {
    // Guard against infinite recursion
    if (inToastCall) {
      console.warn('Preventing recursive toast warning call');
      return { id: 'prevented-recursive-toast', dismiss: () => {}, update: () => {} };
    }
    
    inToastCall = true;
    try {
      return ToastService.warning(title, description);
    } finally {
      inToastCall = false;
    }
  };

  compatToast.info = (title: string, description?: string) => {
    // Guard against infinite recursion
    if (inToastCall) {
      console.warn('Preventing recursive toast info call');
      return { id: 'prevented-recursive-toast', dismiss: () => {}, update: () => {} };
    }
    
    inToastCall = true;
    try {
      return ToastService.info(title, description);
    } finally {
      inToastCall = false;
    }
  };

  compatToast.loading = (title: string, description?: string) => {
    return ToastService.loading(title, description);
  };

  compatToast.promise = (promise: Promise<any>, messages: any, options?: any) => {
    return ToastService.promise(promise, messages, options);
  };

  compatToast.dismiss = (toastId?: string) => {
    return ToastService.dismiss(toastId);
  };

  compatToast.custom = (content: React.ReactNode, options?: any) => {
    // Map custom toast to default toast with content as description
    return ToastService.default({
      description: content,
      ...options
    });
  };

  return compatToast;
}

/**
 * Create a compatibility layer for the old useToast hook
 */
export function createCompatibilityUseToast() {
  const compatToast = createCompatibilityToast();

  return () => {
    // Get the original toast state
    const originalToast = shadcnToast;

    // Return a compatibility object that mimics the old useToast return value
    return {
      toast: compatToast,
      dismiss: ToastService.dismiss,
      toasts: [], // This is not used in most cases
    };
  };
}

/**
 * Create a compatibility layer for the old useToastManager hook
 */
export function createCompatibilityToastManager() {
  return () => {
    return {
      success: (title: string, description?: string) => {
        return ToastService.success(title, description);
      },
      error: (title: string, description?: string) => {
        return ToastService.error(title, description);
      },
      warning: (title: string, description?: string) => {
        return ToastService.warning(title, description);
      },
      info: (title: string, description?: string) => {
        return ToastService.info(title, description);
      },
      action: (title: string, description: string, action: () => void, actionLabel: string = "Undo") => {
        return ToastService.action(title, description, action, actionLabel);
      },
    };
  };
}
