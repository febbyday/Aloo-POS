import React from "react";
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 mb-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions ? (
          <div className="flex items-center space-x-2">{actions}</div>
        ) : children ? (
          <div className="flex items-center space-x-2">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
