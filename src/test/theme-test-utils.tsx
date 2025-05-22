/**
 * Theme Testing Utilities
 * 
 * Utilities for testing components with different themes
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';

// Mock for matchMedia for testing system theme
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Types for theme render options
interface ThemeRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
  systemPrefersDark?: boolean;
}

/**
 * Renders a component with the ThemeProvider
 * 
 * @param ui - The component to render
 * @param options - Render options including theme settings
 * @returns The rendered component with testing utilities
 * 
 * @example
 * // Test a component in dark mode
 * const { getByText } = renderWithTheme(<MyComponent />, { theme: 'dark' });
 * 
 * @example
 * // Test a component with system preference set to dark
 * const { getByText } = renderWithTheme(<MyComponent />, { 
 *   theme: 'system', 
 *   systemPrefersDark: true 
 * });
 */
export function renderWithTheme(
  ui: React.ReactElement,
  {
    theme = 'light',
    systemPrefersDark = false,
    ...renderOptions
  }: ThemeRenderOptions = {}
) {
  // Mock matchMedia for system theme testing
  mockMatchMedia(systemPrefersDark);
  
  // Create a custom wrapper with the ThemeProvider
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider defaultTheme={theme} storageKey="test-theme">
      {children}
    </ThemeProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Renders a component in both light and dark themes
 * 
 * @param ui - The component to render
 * @param testFn - Function to run tests on the rendered component
 * @param options - Additional render options
 * 
 * @example
 * // Test a component in both themes
 * testInBothThemes(
 *   <Button>Click me</Button>,
 *   ({ getByRole }) => {
 *     const button = getByRole('button');
 *     expect(button).toBeInTheDocument();
 *   }
 * );
 */
export function testInBothThemes(
  ui: React.ReactElement,
  testFn: (utils: ReturnType<typeof render>) => void,
  options: Omit<ThemeRenderOptions, 'theme'> = {}
) {
  describe('Theme rendering', () => {
    it('renders correctly in light mode', () => {
      const utils = renderWithTheme(ui, { theme: 'light', ...options });
      testFn(utils);
    });
    
    it('renders correctly in dark mode', () => {
      const utils = renderWithTheme(ui, { theme: 'dark', ...options });
      testFn(utils);
    });
  });
}
