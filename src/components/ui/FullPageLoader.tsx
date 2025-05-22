import React from 'react';
import { Loader2 } from 'lucide-react'; // Using Lucide icon for spinner
import { cn } from '@/lib/utils/cn'; // Standardized cn utility

interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading...'}
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      {message && <p className="mt-4 text-lg font-medium text-foreground">{message}</p>}
    </div>
  );
};

export default FullPageLoader;
