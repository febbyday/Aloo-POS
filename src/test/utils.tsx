/**
 * Test Utilities
 * 
 * This file contains helper functions and utilities for testing components.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';

// Define custom render options interface
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  routerWrapper?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 * and allows for route setting
 */
function customRender(
  ui: ReactElement,
  {
    route = '/',
    routerWrapper = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set up window.location with the route
  window.history.pushState({}, 'Test page', route);

  // Wrap with router if needed
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (routerWrapper) {
      return (
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      );
    }
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Creates a user event instance for simulating user interactions
 */
function createUserEvent() {
  return userEvent.setup();
}

/**
 * Utility to wait for a specified time
 */
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility to wait for an element to appear in the DOM
 */
async function waitForElement(callback: () => HTMLElement | null, timeout = 1000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) return element;
    await wait(50);
  }
  throw new Error('Element not found within timeout');
}

// Re-export everything from testing-library for convenience
export * from '@testing-library/react';
export { userEvent, customRender, createUserEvent, wait, waitForElement };

// Default export for convenience
export default customRender; 