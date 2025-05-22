/**
 * Theme Provider Tests
 *
 * This file contains tests for the ThemeProvider component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customRender, screen, waitFor, userEvent } from '@/test/utils';
import { ThemeProvider, useTheme } from '@/components/theme-provider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia for system theme testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default to light mode
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage and mocks before each test
    localStorageMock.clear();
    vi.clearAllMocks();

    // Reset document classList
    document.documentElement.classList.remove('light', 'dark');
  });

  it('provides the default theme when no theme is stored', () => {
    customRender(
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-theme');
  });

  it('changes the theme when setTheme is called', async () => {
    const user = userEvent.setup();

    customRender(
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    // Initial theme is light
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Click the toggle button to change to dark
    await user.click(screen.getByRole('button'));

    // Check that localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark');

    // Check that the theme was updated in the component
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('uses the theme from localStorage if available', () => {
    // Set a theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');

    customRender(
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    // Should use the theme from localStorage (dark) instead of the default (light)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('applies the theme class to the document element', () => {
    // Mock document.documentElement.classList
    const addSpy = vi.spyOn(document.documentElement.classList, 'add');
    const removeSpy = vi.spyOn(document.documentElement.classList, 'remove');

    customRender(
      <ThemeProvider defaultTheme="dark" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    // Check that the dark theme class was added
    expect(addSpy).toHaveBeenCalledWith('dark');
    expect(removeSpy).toHaveBeenCalledWith('light', 'dark');
  });

  it('handles system theme preference', () => {
    // Mock system preference to dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true, // System prefers dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    customRender(
      <ThemeProvider defaultTheme="system" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    // Theme should be "system"
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');

    // But resolved theme should be "dark" because system prefers dark
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });
});