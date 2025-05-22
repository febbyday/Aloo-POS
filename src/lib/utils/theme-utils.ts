/**
 * Theme Utilities
 * 
 * A collection of utility functions for working with themes in components
 */

import { useTheme } from '@/components/theme-provider';

/**
 * Hook to get theme-conditional values
 * 
 * @param lightValue - Value to use in light mode
 * @param darkValue - Value to use in dark mode
 * @returns The appropriate value based on the current theme
 * 
 * @example
 * // Use different colors based on theme
 * const backgroundColor = useThemeValue('#ffffff', '#1a1a1a');
 * 
 * @example
 * // Use different components based on theme
 * const Icon = useThemeValue(SunIcon, MoonIcon);
 * return <Icon />;
 */
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkValue : lightValue;
}

/**
 * Hook to get conditional class names based on the current theme
 * 
 * @param lightClasses - Classes to apply in light mode
 * @param darkClasses - Classes to apply in dark mode
 * @returns The appropriate classes based on the current theme
 * 
 * @example
 * // Apply different background colors based on theme
 * const bgClass = useThemeClass('bg-white', 'bg-gray-900');
 * return <div className={bgClass}>Themed content</div>;
 */
export function useThemeClass(lightClasses: string, darkClasses: string): string {
  return useThemeValue(lightClasses, darkClasses);
}

/**
 * Function to get theme-conditional styles
 * 
 * @param lightStyles - Styles to use in light mode
 * @param darkStyles - Styles to use in dark mode
 * @param theme - The current theme ('light' or 'dark')
 * @returns The appropriate styles based on the provided theme
 * 
 * @example
 * // In a component that already has access to the theme
 * const { resolvedTheme } = useTheme();
 * const styles = getThemeStyles({ color: 'black' }, { color: 'white' }, resolvedTheme);
 */
export function getThemeStyles<T extends Record<string, any>>(
  lightStyles: T, 
  darkStyles: T, 
  theme: 'light' | 'dark'
): T {
  return theme === 'dark' ? darkStyles : lightStyles;
}

/**
 * Hook to get conditional styles based on the current theme
 * 
 * @param lightStyles - Styles to use in light mode
 * @param darkStyles - Styles to use in dark mode
 * @returns The appropriate styles based on the current theme
 * 
 * @example
 * // Apply different styles based on theme
 * const styles = useThemeStyles({ color: 'black' }, { color: 'white' });
 * return <div style={styles}>Themed content</div>;
 */
export function useThemeStyles<T extends Record<string, any>>(
  lightStyles: T, 
  darkStyles: T
): T {
  const { resolvedTheme } = useTheme();
  return getThemeStyles(lightStyles, darkStyles, resolvedTheme);
}
