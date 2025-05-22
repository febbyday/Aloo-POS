import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface ResponsiveFormLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

/**
 * A responsive form layout component that provides consistent styling for forms
 * 
 * @example
 * <ResponsiveFormLayout
 *   title="Edit Profile"
 *   description="Update your profile information"
 *   footer={<Button type="submit">Save Changes</Button>}
 * >
 *   <form>...</form>
 * </ResponsiveFormLayout>
 */
export function ResponsiveFormLayout({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  fullWidth = false,
}: ResponsiveFormLayoutProps) {
  return (
    <div className={cn(
      'w-full mx-auto',
      !fullWidth && 'max-w-full sm:max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%]',
      className
    )}>
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={cn('sm:px-6', contentClassName)}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default ResponsiveFormLayout;
