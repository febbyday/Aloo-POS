/**
 * ThemeContext Tests
 * 
 * This file contains tests for the ThemeContext provider
 * created in Phase 2.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customRender, screen, waitFor, userEvent } from '@/test/utils';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Mock the useLocalStorage hook
vi.mock('../hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn()
}));

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  let mockSetValue: any;
  
  beforeEach(() => {
    mockSetValue = vi.fn();
    
    // Default mock implementation for useLocalStorage
    (useLocalStorage as any).mockReturnValue(['light', mockSetValue]);
    
    // Clear all mocks between tests
    vi.clearAllMocks();
  });
  
  it('provides the current theme from localStorage', () => {
    customRender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(useLocalStorage).toHaveBeenCalledWith('theme', 'light');
  });
  
  it('toggles the theme when toggleTheme is called', async () => {
    const user = userEvent.setup();
    
    customRender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Initial theme is light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    
    // Click the toggle button
    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    
    // Check that the setter from useLocalStorage was called with 'dark'
    expect(mockSetValue).toHaveBeenCalledWith('dark');
  });
  
  it('uses dark theme when localStorage has dark theme', () => {
    // Mock useLocalStorage to return 'dark' theme
    (useLocalStorage as any).mockReturnValue(['dark', mockSetValue]);
    
    customRender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
  
  it('applies the theme class to the document element', () => {
    // Mock document.documentElement
    const originalClassList = document.documentElement.classList;
    const mockClassList = {
      add: vi.fn(),
      remove: vi.fn()
    };
    
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true
    });
    
    customRender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Check that the light theme class was added
    expect(mockClassList.add).toHaveBeenCalledWith('light');
    
    // Restore original classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: originalClassList
    });
  });
  
  it('removes the previous theme class when theme changes', async () => {
    const user = userEvent.setup();
    
    // Mock document.documentElement
    const originalClassList = document.documentElement.classList;
    const mockClassList = {
      add: vi.fn(),
      remove: vi.fn()
    };
    
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true
    });
    
    customRender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Initial theme is light
    expect(mockClassList.add).toHaveBeenCalledWith('light');
    
    // Click the toggle button to change to dark
    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    
    // Check that the light theme class was removed
    expect(mockClassList.remove).toHaveBeenCalledWith('light');
    
    // Restore original classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: originalClassList
    });
  });
}); 