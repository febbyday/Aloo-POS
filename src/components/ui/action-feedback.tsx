// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Inline animation component for success/failure indication
interface ActionStatusProps {
  status: "success" | "error" | "warning" | "loading" | "idle";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  labelClassName?: string;
  iconClassName?: string;
  label?: string;
}

/**
 * ActionStatus - Shows an animated icon for action status
 * 
 * This component displays a status icon (checkmark, X, etc.) with an optional label,
 * providing immediate visual feedback for an action's result.
 */
export function ActionStatus({
  status,
  size = "md",
  showLabel = false,
  className,
  labelClassName,
  iconClassName,
  label,
}: ActionStatusProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Status component mapping
  const statusComponents = {
    success: (
      <CheckCircle2 
        className={cn(
          "text-green-500 dark:text-green-400", 
          sizeMap[size], 
          iconClassName
        )} 
      />
    ),
    error: (
      <XCircle 
        className={cn(
          "text-red-500 dark:text-red-400", 
          sizeMap[size], 
          iconClassName
        )} 
      />
    ),
    warning: (
      <AlertCircle 
        className={cn(
          "text-yellow-500 dark:text-yellow-400", 
          sizeMap[size], 
          iconClassName
        )} 
      />
    ),
    loading: (
      <Loader2 
        className={cn(
          "text-blue-500 dark:text-blue-400 animate-spin", 
          sizeMap[size], 
          iconClassName
        )} 
      />
    ),
    idle: null,
  };

  const statusLabels = {
    success: label || "Success",
    error: label || "Error",
    warning: label || "Warning",
    loading: label || "Loading...",
    idle: "",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {statusComponents[status]}
        </motion.div>
      </AnimatePresence>
      
      {showLabel && status !== "idle" && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("text-sm", labelClassName)}
        >
          {statusLabels[status]}
        </motion.span>
      )}
    </div>
  );
}

interface ActionFeedbackProps {
  children: React.ReactNode;
  status: "success" | "error" | "warning" | "loading" | "idle";
  message?: string;
  duration?: number;
  className?: string;
}

/**
 * ActionFeedback - Provides temporary visual feedback for an action
 * 
 * This component wraps any content and displays a feedback message when an action
 * occurs, then automatically clears after a specified duration.
 */
export function ActionFeedback({
  children,
  status,
  message,
  duration = 2000,
  className,
}: ActionFeedbackProps) {
  const [visible, setVisible] = useState(status !== "idle");

  useEffect(() => {
    setVisible(status !== "idle");
    
    let timer: NodeJS.Timeout;
    if (status !== "idle" && status !== "loading") {
      timer = setTimeout(() => {
        setVisible(false);
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, duration]);

  const statusStyles = {
    success: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    loading: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    idle: "",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      
      <AnimatePresence>
        {visible && status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-0 right-0 left-0 p-2 rounded-md border mb-2 text-sm",
              statusStyles[status]
            )}
          >
            <div className="flex items-center gap-2">
              <ActionStatus status={status} size="sm" />
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OperationButtonProps {
  onClick: () => Promise<any> | void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  successMessage?: string;
  errorMessage?: string;
  showFeedback?: boolean;
  feedbackDuration?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * OperationButton - A button that shows loading and result states
 * 
 * This button automatically shows loading state while its operation is in progress,
 * then shows success or error feedback based on the result.
 */
export function OperationButton({
  onClick,
  children,
  className,
  variant = "default",
  successMessage = "Operation completed",
  errorMessage = "Operation failed",
  showFeedback = true,
  feedbackDuration = 2000,
  disabled = false,
  icon,
}: OperationButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleClick = async () => {
    try {
      setStatus("loading");
      await onClick();
      setStatus("success");
      setMessage(successMessage);
      if (showFeedback) {
        setTimeout(() => setStatus("idle"), feedbackDuration);
      }
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage);
      if (showFeedback) {
        setTimeout(() => setStatus("idle"), feedbackDuration);
      }
      console.error("Operation failed:", error);
    }
  };

  return (
    <ActionFeedback status={status} message={message} duration={feedbackDuration}>
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={cn("relative", className)}
      >
        {status === "loading" && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {status === "idle" && icon}
        {children}
      </Button>
    </ActionFeedback>
  );
} 