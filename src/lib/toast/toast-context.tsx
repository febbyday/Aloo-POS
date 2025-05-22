import React, { createContext, useContext } from 'react';
import { ToastService, ToastOptions } from './toast-service';

/**
 * Toast context type
 */
interface ToastContextType {
  /**
   * Show a success toast
   */
  success: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show an error toast
   */
  error: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show a warning toast
   */
  warning: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show an info toast
   */
  info: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show a loading toast
   */
  loading: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show a default toast
   */
  default: (titleOrOptions: string | ToastOptions, description?: string) => { id: string; dismiss: () => void };

  /**
   * Show a toast with an action button
   */
  action: (
    title: string,
    description: string,
    actionFn: () => void,
    actionLabel?: string,
    options?: Partial<ToastOptions>
  ) => { id: string; dismiss: () => void };

  /**
   * Show a confirmation toast with Yes/No buttons
   */
  confirmation: (
    titleOrOptions: string | ToastOptions,
    description?: string,
    confirmAction?: () => void,
    cancelAction?: () => void,
    confirmLabel?: string,
    cancelLabel?: string
  ) => { id: string; dismiss: () => void };

  /**
   * Show a progress toast with a progress bar
   */
  progress: (
    titleOrOptions: string | ToastOptions,
    progressValue?: number,
    description?: string
  ) => { id: string; dismiss: () => void };

  /**
   * Update a progress toast with a new progress value
   */
  updateProgress: (
    id: string,
    progressValue: number,
    options?: Partial<ToastOptions>
  ) => { id: string; dismiss: () => void };

  /**
   * Show a custom toast with full styling control
   */
  custom: (
    titleOrOptions: string | ToastOptions,
    description?: string
  ) => { id: string; dismiss: () => void };

  /**
   * Promise toast - shows loading and then success/error based on promise result
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: Partial<ToastOptions>
  ) => Promise<T>;

  /**
   * Dismiss a toast by ID
   */
  dismiss: (toastId?: string) => void;

  /**
   * Dismiss all toasts
   */
  dismissAll: () => void;
}

// Create the toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast provider component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Use the toast service directly
  const toastContextValue: ToastContextType = {
    success: ToastService.success,
    error: ToastService.error,
    warning: ToastService.warning,
    info: ToastService.info,
    loading: ToastService.loading,
    default: ToastService.default,
    action: ToastService.action,
    confirmation: ToastService.confirmation,
    progress: ToastService.progress,
    updateProgress: ToastService.updateProgress,
    custom: ToastService.custom,
    promise: ToastService.promise,
    dismiss: ToastService.dismiss,
    dismissAll: ToastService.dismissAll,
  };

  return (
    <ToastContext.Provider value={toastContextValue}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use the toast context
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    // Fallback to the toast service if not in a provider
    return ToastService;
  }

  return context;
}
