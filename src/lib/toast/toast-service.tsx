import React from 'react';
// Import directly from the original toast component to avoid circular dependencies
import { toast as shadcnToast } from '@/components/ui/use-toast';
import { ToastActionElement } from '@/components/ui/toast';

// Create a local reference to avoid circular dependencies
const originalToast = shadcnToast;

/**
 * Toast type definition
 */
export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'default'
  | 'confirmation'  // For confirmation messages
  | 'progress'      // For progress indicators
  | 'custom';       // For fully custom styling

/**
 * Toast position options
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast animation options
 */
export type ToastAnimation =
  | 'slide'
  | 'fade'
  | 'zoom'
  | 'bounce'
  | 'none';

/**
 * Toast theme options
 */
export type ToastTheme =
  | 'light'
  | 'dark'
  | 'colored'
  | 'auto';

/**
 * Progress bar options
 */
export interface ProgressOptions {
  /**
   * Current progress value (0-100)
   */
  value: number;

  /**
   * Whether to show the progress value
   */
  showValue?: boolean;

  /**
   * Custom color for the progress bar
   */
  color?: string;
}

/**
 * Toast service options
 */
export interface ToastOptions {
  /**
   * Toast title
   */
  title?: string;

  /**
   * Toast description/message
   */
  description?: string | React.ReactNode;

  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;

  /**
   * Duration in milliseconds
   */
  duration?: number;

  /**
   * Action to display in the toast
   */
  action?: ToastActionElement;

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;

  /**
   * Position of the toast
   * @default 'bottom-right'
   */
  position?: ToastPosition;

  /**
   * Animation type
   * @default 'slide'
   */
  animation?: ToastAnimation;

  /**
   * Theme of the toast
   * @default 'auto'
   */
  theme?: ToastTheme;

  /**
   * Progress bar options (for progress toast)
   */
  progress?: ProgressOptions;

  /**
   * Whether to pause the toast timer on hover
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Whether to dismiss the toast on click
   * @default false
   */
  dismissOnClick?: boolean;

  /**
   * Custom render function for the toast content
   */
  render?: (props: ToastOptions) => React.ReactNode;
}

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Loader2,
  HelpCircle,
  BarChart,
  Palette
} from 'lucide-react';

/**
 * Default options for different toast types
 */
const defaultOptions: Record<ToastType, Partial<ToastOptions>> = {
  success: {
    duration: 4000,
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  error: {
    duration: 8000,
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  warning: {
    duration: 6000,
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    className: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  info: {
    duration: 5000,
    icon: <Info className="h-5 w-5 text-blue-500" />,
    className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  loading: {
    duration: 30000,
    icon: <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />,
    className: "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  confirmation: {
    duration: 10000,
    icon: <HelpCircle className="h-5 w-5 text-purple-500" />,
    className: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
    pauseOnHover: true,
    animation: 'slide',
    showCloseButton: true
  },
  progress: {
    duration: 0, // Infinite duration by default
    icon: <BarChart className="h-5 w-5 text-blue-500" />,
    className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    pauseOnHover: true,
    animation: 'slide',
    progress: { value: 0, showValue: true }
  },
  custom: {
    duration: 5000,
    icon: <Palette className="h-5 w-5 text-indigo-500" />,
    className: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
    pauseOnHover: true,
    animation: 'slide'
  },
  default: {
    duration: 5000,
    icon: <Bell className="h-5 w-5 text-slate-500" />,
    className: "",
    pauseOnHover: true,
    animation: 'slide'
  }
};

/**
 * Safely stringify objects for display in toasts
 */
function safeStringify(obj: unknown): string {
  try {
    return typeof obj === 'object'
      ? JSON.stringify(obj, null, 2)
      : String(obj);
  } catch (e) {
    return 'Unable to display value';
  }
}

/**
 * Show a toast notification
 */
function show(
  type: ToastType,
  options: ToastOptions = {}
): { id: string; dismiss: () => void; update: (props: any) => void } {
  // Merge options with defaults based on type
  const mergedOptions = {
    ...defaultOptions[type],
    ...options,
    duration: options.duration || defaultOptions[type].duration,
  };

  // Handle object descriptions that aren't React elements
  if (
    mergedOptions.description &&
    typeof mergedOptions.description === 'object' &&
    !(mergedOptions.description as any)?.$$typeof
  ) {
    mergedOptions.description = safeStringify(mergedOptions.description);
  }

  // Use destructive variant for error toasts
  const variant = type === 'error' ? 'destructive' : 'default';

  // Show the toast
  return originalToast({
    variant,
    ...mergedOptions,
  });
}

/**
 * Show a success toast
 */
function success(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('success', { title: titleOrOptions, description });
  }
  return show('success', titleOrOptions);
}

/**
 * Show an error toast
 */
function error(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('error', { title: titleOrOptions, description });
  }
  return show('error', titleOrOptions);
}

/**
 * Show a warning toast
 */
function warning(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('warning', { title: titleOrOptions, description });
  }
  return show('warning', titleOrOptions);
}

/**
 * Show an info toast
 */
function info(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('info', { title: titleOrOptions, description });
  }
  return show('info', titleOrOptions);
}

/**
 * Show a loading toast
 */
function loading(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('loading', { title: titleOrOptions, description });
  }
  return show('loading', titleOrOptions);
}

/**
 * Show a default toast
 */
function defaultToast(titleOrOptions: string | ToastOptions, description?: string) {
  if (typeof titleOrOptions === 'string') {
    return show('default', { title: titleOrOptions, description });
  }
  return show('default', titleOrOptions);
}

/**
 * Show a toast with an action button
 */
function action(
  title: string,
  description: string,
  actionFn: () => void,
  actionLabel: string = "Action",
  options: Partial<ToastOptions> = {}
) {
  return show('info', {
    title,
    description,
    action: {
      label: actionLabel,
      onClick: actionFn,
    },
    ...options
  });
}

/**
 * Promise toast - shows loading and then success/error based on promise result
 */
async function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options: Partial<ToastOptions> = {}
): Promise<T> {
  const toastId = loading(messages.loading, options).id;

  try {
    const result = await promise;

    // Update the toast to success
    originalToast({
      id: toastId,
      title: messages.success,
      variant: 'default',
      icon: defaultOptions.success.icon,
      className: defaultOptions.success.className,
      ...options
    });

    return result;
  } catch (err) {
    // Update the toast to error
    originalToast({
      id: toastId,
      title: messages.error,
      description: err instanceof Error ? err.message : String(err),
      variant: 'destructive',
      icon: defaultOptions.error.icon,
      className: defaultOptions.error.className,
      ...options
    });

    throw err;
  }
}

/**
 * Dismiss a toast by ID
 */
function dismiss(toastId?: string): void {
  originalToast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
function dismissAll(): void {
  originalToast.dismiss();
}

/**
 * Show a confirmation toast with action buttons
 */
function confirmation(
  titleOrOptions: string | ToastOptions,
  description?: string,
  confirmAction?: () => void,
  cancelAction?: () => void,
  confirmLabel: string = "Yes",
  cancelLabel: string = "No"
) {
  const options: ToastOptions = typeof titleOrOptions === 'string'
    ? { title: titleOrOptions, description }
    : titleOrOptions;

  // Add confirmation actions if provided
  if (confirmAction || cancelAction) {
    options.action = (
      <div className="flex gap-2 mt-2">
        {confirmAction && (
          <button
            onClick={confirmAction}
            className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {confirmLabel}
          </button>
        )}
        {cancelAction && (
          <button
            onClick={cancelAction}
            className="px-3 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    );
  }

  return show('confirmation', options);
}

/**
 * Show a progress toast with a progress bar
 */
function progress(
  titleOrOptions: string | ToastOptions,
  progressValue: number = 0,
  description?: string
) {
  const options: ToastOptions = typeof titleOrOptions === 'string'
    ? {
        title: titleOrOptions,
        description,
        progress: {
          value: progressValue,
          showValue: true
        }
      }
    : {
        ...titleOrOptions,
        progress: {
          ...(titleOrOptions.progress || {}),
          value: progressValue
        }
      };

  return show('progress', options);
}

/**
 * Update a progress toast with a new progress value
 */
function updateProgress(
  id: string,
  progressValue: number,
  options: Partial<ToastOptions> = {}
) {
  originalToast({
    id,
    progress: {
      ...(options.progress || {}),
      value: progressValue
    },
    ...options
  });

  return { id, dismiss: () => dismiss(id) };
}

/**
 * Show a custom toast with full styling control
 */
function custom(
  titleOrOptions: string | ToastOptions,
  description?: string
) {
  if (typeof titleOrOptions === 'string') {
    return show('custom', { title: titleOrOptions, description });
  }
  return show('custom', titleOrOptions);
}

// Export toast service
export const ToastService = {
  success,
  error,
  warning,
  info,
  loading,
  default: defaultToast,
  action,
  promise,
  dismiss,
  dismissAll,
  show,
  confirmation,
  progress,
  updateProgress,
  custom
};

// Export a simple toast function that defaults to the default type
export const toast = defaultToast;
