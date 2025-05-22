import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  icon?: LucideIcon;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  icon: Icon,
  className = '',
  headerClassName = '',
  contentClassName = '',
  headerRight,
  children
}: SectionCardProps) {
  return (
    <div className={cn("bg-card rounded-lg shadow-sm border border-border/40 hover:border-border/80 transition-colors duration-200", className)}>
      {(title || headerRight) && (
        <div className={cn("flex items-center justify-between p-4 border-b border-border/30", headerClassName)}>
          {title && (
            <h3 className="text-lg font-semibold flex items-center">
              {Icon && <Icon className="h-5 w-5 mr-2 text-primary" />}
              {title}
            </h3>
          )}
          {headerRight && (
            <div>{headerRight}</div>
          )}
        </div>
      )}
      <div className={cn("p-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
