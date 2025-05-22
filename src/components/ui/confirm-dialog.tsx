/**
 * Confirm Dialog Component
 * 
 * A reusable dialog component for confirmation actions
 * Supports different variants for different types of actions
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, HelpCircle, Info } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary";
  variant?: "info" | "warning" | "danger" | "default";
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
  isConfirmLoading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  variant = "default",
  onConfirm,
  isConfirmDisabled = false,
  isConfirmLoading = false,
}: ConfirmDialogProps) {
  // Determine icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info className="h-6 w-6 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "danger":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <HelpCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className={cn("flex justify-end gap-2 w-full")}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={isConfirmDisabled || isConfirmLoading}
            >
              {isConfirmLoading ? "Loading..." : confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
