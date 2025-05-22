/**
 * Theme-Aware Component Example
 * 
 * This component demonstrates how to create components that are aware of the current theme
 * and adapt their appearance accordingly.
 */

import React from 'react';
import { useTheme } from '@/components/theme-provider';
import { useThemeValue, useThemeClass, useThemeStyles } from '@/lib/utils/theme-utils';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeAwareComponentProps {
  title?: string;
  description?: string;
}

export function ThemeAwareComponent({
  title = 'Theme-Aware Component',
  description = 'This component adapts to the current theme'
}: ThemeAwareComponentProps) {
  // Get the current theme information
  const { theme, resolvedTheme } = useTheme();
  
  // Use theme-conditional values
  const Icon = useThemeValue(Sun, Moon);
  const iconColor = useThemeValue('#f59e0b', '#60a5fa');
  const bgClass = useThemeClass('bg-amber-50', 'bg-slate-800');
  const styles = useThemeStyles(
    { borderLeft: '4px solid #f59e0b' },
    { borderLeft: '4px solid #60a5fa' }
  );
  
  return (
    <Card className={bgClass} style={styles}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon color={iconColor} size={20} />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p>Current theme setting: <strong>{theme}</strong></p>
          <p>Resolved theme: <strong>{resolvedTheme}</strong></p>
          <p>This component uses different styles based on the current theme:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Different icons (Sun/Moon)</li>
            <li>Different accent colors (Amber/Blue)</li>
            <li>Different background colors</li>
            <li>Different border styles</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <Icon className="mr-2 h-4 w-4" color={iconColor} />
          Theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </Button>
      </CardFooter>
    </Card>
  );
}
