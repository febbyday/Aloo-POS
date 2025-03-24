import { useToast } from "@/components/ui/use-toast";
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * ToastManager - A wrapper around the toast system to provide consistent notifications
 * 
 * This utility provides standardized toast notifications with appropriate styling
 * and icons for different types of messages (success, error, warning, info).
 */
export function useToastManager() {
  const { toast } = useToast();

  const showToast = {
    /**
     * Display a success toast notification
     */
    success: (title: string, description?: string) => {
      return toast({
        title,
        description,
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        iconclassname: "text-green-500 dark:text-green-400",
        icon: <Check className="h-4 w-4" />,
      });
    },

    /**
     * Display an error toast notification
     */
    error: (title: string, description?: string) => {
      return toast({
        title,
        description,
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    },

    /**
     * Display a warning toast notification
     */
    warning: (title: string, description?: string) => {
      return toast({
        title,
        description,
        className: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
        iconclassname: "text-yellow-500 dark:text-yellow-400",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    },

    /**
     * Display an info toast notification
     */
    info: (title: string, description?: string) => {
      return toast({
        title,
        description,
        className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
        iconclassname: "text-blue-500 dark:text-blue-400",
        icon: <Info className="h-4 w-4" />,
      });
    },

    /**
     * Display a toast notification for an action with an undo button
     */
    action: (title: string, description: string, action: () => void, actionLabel: string = "Undo") => {
      return toast({
        title,
        description,
        className: "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800",
        action: {
          label: actionLabel,
          onClick: action,
        },
        icon: <Info className="h-4 w-4" />,
      });
    },
  };

  return showToast;
} 