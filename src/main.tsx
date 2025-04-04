// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider'
import { HelmetProvider } from 'react-helmet-async'

// Import API verification
import './lib/api/api-verification'

// Import the role setup utility to ensure roles are created in development
// This will now only run after authentication is complete
import { setupDefaultRoles } from './features/staff/utils/setupRoles'

// Import admin account initialization
import { initAdminAccount } from './lib/api/init-admin-account'

// Create a global error handler specifically for vendor.js errors
const handleVendorJsErrors = () => {
  // Global error handler for extension-related errors
  window.addEventListener('error', (event) => {
    // Filter out extension-related errors
    if (
      event.message?.includes('extension port') ||
      event.message?.includes('back/forward cache') ||
      event.message?.includes('Access to storage is not allowed') ||
      event.message?.includes('No tab with id') ||
      event.message?.includes('message channel closed') ||
      event.message?.includes('A listener indicated an asynchronous response') ||
      (event.filename && event.filename.includes('vendor.js'))
    ) {
      // Prevent the error from appearing in the console
      event.preventDefault();
      return true;
    }
    return false;
  }, true); // Use capture phase to catch errors early

  // Handle unhandled promise rejections (common with extension errors)
  window.addEventListener('unhandledrejection', (event) => {
    // Filter out extension-related errors
    if (
      event.reason?.message?.includes('extension port') ||
      event.reason?.message?.includes('back/forward cache') ||
      event.reason?.message?.includes('Access to storage is not allowed') ||
      event.reason?.message?.includes('No tab with id') ||
      event.reason?.message?.includes('message channel closed') ||
      event.reason?.message?.includes('A listener indicated an asynchronous response') ||
      event.reason?.stack?.includes('vendor.js')
    ) {
      // Prevent the error from appearing in the console
      event.preventDefault();
      return true;
    }
    return false;
  }, true); // Use capture phase to catch errors early

  // Add a special handler for vendor.js errors which are often extension-related
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Check if the error is related to vendor.js or extensions
    const errorString = args.join(' ');
    if (
      errorString.includes('vendor.js') ||
      errorString.includes('extension') ||
      errorString.includes('message channel closed') ||
      errorString.includes('A listener indicated an asynchronous response')
    ) {
      // Silently ignore these errors
      return;
    }

    // Pass through all other errors to the original console.error
    return originalConsoleError.apply(console, args);
  };

  // Add MutationObserver to remove vendor.js error elements from the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            // Look for error messages in the DOM
            const errorText = node.textContent || '';
            if (
              errorText.includes('vendor.js') ||
              errorText.includes('message channel closed') ||
              errorText.includes('A listener indicated an asynchronous response')
            ) {
              // Remove the error element
              node.remove();
            }
          }
        }
      }
    }
  });

  // Start observing the document body for error messages
  observer.observe(document.body, { childList: true, subtree: true });
};

// Initialize error handling
handleVendorJsErrors();

// Initialize admin account
initAdminAccount();

// Create a custom event listener for authentication success
document.addEventListener('auth:login:success', () => {
  // Run role setup after successful authentication
  console.log('Authentication successful, setting up roles...');
  setupDefaultRoles().catch(err => {
    console.warn('Error setting up roles after authentication:', err);
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="pos-theme">
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
