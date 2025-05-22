import { useToast } from "@/lib/toast";
import { createCompatibilityToastManager } from "@/lib/toast/migration-utils";

/**
 * ToastManager - A wrapper around the toast system to provide consistent notifications
 *
 * This utility provides standardized toast notifications with appropriate styling
 * and icons for different types of messages (success, error, warning, info).
 *
 * @deprecated Use the new standardized toast system from '@/lib/toast' instead.
 * Import { useToast } from '@/lib/toast' and use toast.success(), toast.error(), etc.
 */
export function useToastManager() {
  const toast = useToast();

  return {
    /**
     * Display a success toast notification
     */
    success: (title: string, description?: string) => {
      return toast.success(title, description);
    },

    /**
     * Display an error toast notification
     */
    error: (title: string, description?: string) => {
      return toast.error(title, description);
    },

    /**
     * Display a warning toast notification
     */
    warning: (title: string, description?: string) => {
      return toast.warning(title, description);
    },

    /**
     * Display an info toast notification
     */
    info: (title: string, description?: string) => {
      return toast.info(title, description);
    },

    /**
     * Display a toast notification for an action with an undo button
     */
    action: (title: string, description: string, action: () => void, actionLabel: string = "Undo") => {
      return toast.action(title, description, action, actionLabel);
    },
  };
}

// For backward compatibility
export const compatToastManager = createCompatibilityToastManager();