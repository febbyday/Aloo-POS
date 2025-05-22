/**
 * Runtime Legacy API Detector
 * 
 * This script can be included in the application to detect legacy API usage at runtime.
 * It monitors network requests and console output to identify legacy API patterns.
 * 
 * Usage:
 *   Import this script in your main.ts/main.js file during development
 */

// Self-executing function to avoid polluting the global scope
(function() {
  console.log('Runtime Legacy API Detector initialized');
  
  // Store original methods to restore them later if needed
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Track detected legacy API usage
  const detectedUsage = new Set();
  
  // Legacy API patterns to detect in URLs
  const LEGACY_URL_PATTERNS = [
    { pattern: /\/api\/v1\/([^\/]+)(?!\/(LIST|DETAIL|CREATE|UPDATE|DELETE))/, description: 'Direct API endpoint without registry action' },
    // Add more URL patterns as needed
  ];
  
  // Legacy API patterns to detect in console messages
  const LEGACY_CONSOLE_PATTERNS = [
    { pattern: /Using legacy endpoint key:/, description: 'Legacy endpoint key usage' },
    { pattern: /DEPRECATED API USAGE:/, description: 'Deprecated API usage' },
    // Add more console patterns as needed
  ];
  
  // Override fetch to monitor network requests
  window.fetch = function(input, init) {
    // Check if the input is a URL string
    if (typeof input === 'string') {
      checkUrlForLegacyPatterns(input);
    }
    // Call the original fetch method
    return originalFetch.apply(this, arguments);
  };
  
  // Override XMLHttpRequest.open to monitor XHR requests
  XMLHttpRequest.prototype.open = function(method, url) {
    // Check if the URL is a string
    if (typeof url === 'string') {
      checkUrlForLegacyPatterns(url);
    }
    // Call the original open method
    return originalXHROpen.apply(this, arguments);
  };
  
  // Override console.warn to monitor warnings
  console.warn = function() {
    // Check if any arguments match legacy console patterns
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string') {
        checkConsoleForLegacyPatterns(arguments[i], 'warning');
      }
    }
    // Call the original warn method
    return originalConsoleWarn.apply(this, arguments);
  };
  
  // Override console.error to monitor errors
  console.error = function() {
    // Check if any arguments match legacy console patterns
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string') {
        checkConsoleForLegacyPatterns(arguments[i], 'error');
      }
    }
    // Call the original error method
    return originalConsoleError.apply(this, arguments);
  };
  
  /**
   * Check a URL for legacy API patterns
   * 
   * @param {string} url - The URL to check
   */
  function checkUrlForLegacyPatterns(url) {
    LEGACY_URL_PATTERNS.forEach(({ pattern, description }) => {
      if (pattern.test(url)) {
        const key = `URL: ${url} - ${description}`;
        if (!detectedUsage.has(key)) {
          detectedUsage.add(key);
          reportLegacyUsage('URL Pattern', description, url);
        }
      }
    });
  }
  
  /**
   * Check a console message for legacy API patterns
   * 
   * @param {string} message - The console message to check
   * @param {string} type - The type of console message (warning or error)
   */
  function checkConsoleForLegacyPatterns(message, type) {
    LEGACY_CONSOLE_PATTERNS.forEach(({ pattern, description }) => {
      if (pattern.test(message)) {
        const key = `Console ${type}: ${message.substring(0, 50)}... - ${description}`;
        if (!detectedUsage.has(key)) {
          detectedUsage.add(key);
          reportLegacyUsage('Console Pattern', description, message);
        }
      }
    });
  }
  
  /**
   * Report legacy API usage
   * 
   * @param {string} type - The type of legacy usage
   * @param {string} description - Description of the legacy pattern
   * @param {string} value - The value that matched the pattern
   */
  function reportLegacyUsage(type, description, value) {
    console.warn(
      `\n=== RUNTIME LEGACY API USAGE DETECTED ===\n` +
      `Type: ${type}\n` +
      `Description: ${description}\n` +
      `Value: ${value}\n` +
      `Stack: ${new Error().stack.split('\n').slice(3).join('\n')}\n` +
      `===========================================\n`
    );
  }
  
  /**
   * Get a summary of detected legacy API usage
   * 
   * @returns {object} Summary of detected usage
   */
  function getLegacyUsageSummary() {
    return {
      count: detectedUsage.size,
      items: Array.from(detectedUsage)
    };
  }
  
  // Add a global function to get the detection status
  window.__getRuntimeLegacyApiUsage = function() {
    const summary = getLegacyUsageSummary();
    console.log(`Runtime Legacy API usage detected: ${summary.count} instances`);
    if (summary.count > 0) {
      console.log('Detected instances:');
      summary.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });
    }
    return summary;
  };
  
  // Log instructions
  console.log(`
=== Runtime Legacy API Detection Enabled ===
Check the console for warnings about legacy API usage.
To see a summary of detected instances, run: window.__getRuntimeLegacyApiUsage()
`);
})();
