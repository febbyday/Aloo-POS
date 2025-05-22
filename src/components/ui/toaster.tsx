import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

/**
 * @deprecated Use the EnhancedToaster component from '@/lib/toast' instead.
 * Import { EnhancedToaster } from '@/lib/toast' and use it in your application.
 */
export function Toaster() {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Warning: The Toaster component from @/components/ui/toaster is deprecated. ' +
      'Please use the EnhancedToaster component by importing { EnhancedToaster } from "@/lib/toast" instead.'
    );
  }

  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
