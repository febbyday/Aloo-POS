# CSRF Protection Implementation

This document explains the Cross-Site Request Forgery (CSRF) protection implementation in the POS application.

## Overview

CSRF protection is implemented using the Double Submit Cookie pattern, where a CSRF token is stored in both a cookie and sent in request headers. This prevents cross-site request forgery attacks by ensuring that requests come from the same origin.

## Implementation Details

### Backend Implementation

1. **CSRF Token Generation**
   - Tokens are generated using cryptographically secure random bytes
   - Tokens are bound to the user's session using HMAC
   - Tokens have an expiration time (24 hours by default)

2. **CSRF Middleware**
   - `setCsrfToken`: Sets the CSRF token in a cookie and response header
   - `validateCsrfToken`: Validates the token for non-GET requests
   - Token rotation: A new token is generated after each successful validation

3. **Routes Configuration**
   - All routes are protected by CSRF middleware
   - The `/csrf-token` endpoint allows clients to refresh their token
   - Token validation is applied to all non-idempotent methods (POST, PUT, DELETE, etc.)

### Frontend Implementation

1. **CSRF Token Utilities**
   - `getCsrfToken`: Retrieves the token from cookies
   - `hasCsrfToken`: Checks if a token exists
   - `refreshCsrfToken`: Makes a request to refresh the token
   - `addCsrfHeader`: Adds the token to request headers

2. **API Client Integration**
   - The enhanced API client automatically adds CSRF tokens to all non-GET requests
   - Token refresh mechanism: If a request fails due to an invalid token, the client attempts to refresh the token and retry the request

3. **React Integration**
   - `useCsrfToken`: Hook for managing CSRF tokens
   - `CsrfTokenProvider`: Context provider for CSRF token functionality

## Token Flow

1. When a user first loads the application, a CSRF token is set in a cookie
2. Before making any non-GET request, the frontend checks if a token exists
3. If no token exists, it makes a request to `/api/v1/auth/csrf-token` to get a new token
4. The token is sent in the `X-CSRF-Token` header with each non-GET request
5. The backend validates the token by comparing it with the one stored for the session
6. After successful validation, a new token is generated and set in the response
7. The frontend uses the new token for subsequent requests

## Security Features

1. **Token Binding**: Tokens are bound to the user's session using HMAC
2. **Token Rotation**: A new token is generated after each successful validation
3. **Token Expiration**: Tokens expire after 24 hours
4. **Automatic Refresh**: The frontend automatically refreshes expired tokens
5. **Error Handling**: Failed validations are logged and return appropriate error responses

## Testing

CSRF protection is tested using:

1. **Unit Tests**: Testing individual functions like `getCsrfToken` and `addCsrfHeader`
2. **Integration Tests**: Testing the token flow between frontend and backend
3. **Security Tests**: Testing for vulnerabilities like token leakage or missing validation

## Troubleshooting

If you encounter CSRF-related issues:

1. Check browser console for CSRF token errors
2. Ensure cookies are being properly set (check browser developer tools)
3. Verify that the token is being sent in request headers
4. Check server logs for validation failures
5. Try refreshing the token manually using the `/csrf-token` endpoint
