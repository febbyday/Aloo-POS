/**
 * useConfirmDialog Hook
 * 
 * A hook that provides a confirmation dialog API.
 * Allows showing a dialog to confirm user actions with custom text.
 */

import { useState, useCallback } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/**
 * Hook that provides a confirmation dialog API
 * 
 * @returns An object with a `confirm` function and a `ConfirmDialog` component
 * @example
 * ```tsx
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 * 
 * // In your component, add the ConfirmDialog component
 * return (
 *   <>
 *     <Button onClick={async () => {
 *       const confirmed = await confirm({
 *         title: "Delete Item",
 *         description: "Are you sure you want to delete this item?",
 *         confirmText: "Delete",
 *         cancelText: "Cancel",
 *         destructive: true
 *       });
 *       
 *       if (confirmed) {
 *         // Perform the action
 *       }
 *     }}>
 *       Delete
 *     </Button>
 *     <ConfirmDialog />
 *   </>
 * );
 * ```
 */
export const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirm',
    description: 'Are you sure you want to continue?',
    confirmText: 'Continue',
    cancelText: 'Cancel',
    destructive: false
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setOpen(false);
    }
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
      setOpen(false);
    }
  }, [resolveRef]);

  const ConfirmDialog = useCallback(() => {
    return (
      <AlertDialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && resolveRef) {
          resolveRef(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={options.destructive ? 'bg-destructive hover:bg-destructive/90' : undefined}
            >
              {options.confirmText || 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [open, options, handleConfirm, handleCancel, resolveRef]);

  return {
    confirm,
    ConfirmDialog
  };
};

export default useConfirmDialog; 