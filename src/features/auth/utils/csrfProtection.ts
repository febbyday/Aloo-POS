/**
 * CSRF Protection Utility
 *
 * This utility provides functions for CSRF protection using the Double Submit Cookie pattern.
 * It reads CSRF tokens from cookies set by the server and adds them to request headers.
 */

// CSRF token header name
const CSRF_HEADER = 'X-CSRF-Token';
// CSRF token cookie name
const CSRF_COOKIE = 'csrf_token';
// CSRF token endpoint for refreshing tokens
const CSRF_ENDPOINT = '/api/v1/auth/csrf-token';

/**
 * Get CSRF token from cookie
 * In development mode, returns a mock token
 * @returns CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  // In development mode, return a mock token
  if (import.meta.env.DEV) {
    return 'dev-mode-csrf-token';
  }

  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Check if CSRF token exists in cookies
 * In development mode, always returns true to bypass CSRF token check
 * @returns True if token exists or in development mode
 */
export function hasCsrfToken(): boolean {
  // In development mode, always return true to bypass CSRF token check
  if (import.meta.env.DEV) {
    return true;
  }
  return getCsrfToken() !== null;
}

/**
 * Add CSRF token to request headers
 * @param headers Request headers
 * @returns Updated headers with CSRF token
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfToken();

  if (!token) {
    console.warn('CSRF token not found in cookies. Request may fail.');
    return headers;
  }

  return {
    ...headers,
    [CSRF_HEADER]: token
  };
}

/**
 * Add CSRF token to request body
 * @param body Request body
 * @returns Updated body with CSRF token
 */
export function addCsrfToBody(body: any): any {
  const token = getCsrfToken();

  if (!token) {
    console.warn('CSRF token not found in cookies. Request may fail.');
    return body;
  }

  return {
    ...body,
    csrfToken: token
  };
}

/**
 * Refresh CSRF token by making a request to the CSRF token endpoint
 * @returns Promise that resolves when token is refreshed
 */
export async function refreshCsrfToken(): Promise<boolean> {
  try {
    const response = await fetch(CSRF_ENDPOINT, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to refresh CSRF token:', response.statusText);
      return false;
    }

    // The server will set the CSRF token cookie in the response
    return true;
  } catch (error) {
    console.error('Error refreshing CSRF token:', error);
    return false;
  }
}
