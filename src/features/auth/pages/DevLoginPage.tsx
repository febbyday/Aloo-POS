/**
 * Development Login Page
 * 
 * A simplified login page for development environments.
 * Automatically logs in with development credentials.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DevLoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(true);

  // Get the return path from the location state, or default to dashboard
  const from = (location.state as any)?.from || '/dashboard';

  // Check for special routes in URL params
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get('returnUrl');
  const isSpecialRoute = returnUrl && (
    returnUrl.includes('/roles') || 
    returnUrl.includes('/permissions')
  );

  // If returning to a special route, set the flag to prevent dashboard redirect
  useEffect(() => {
    if (isSpecialRoute) {
      sessionStorage.setItem('prevent_dashboard_redirect', 'true');
    }
  }, [isSpecialRoute]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // If we have a return URL in the query params, use that instead of the state
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, from, returnUrl]);

  // Auto-login for development
  useEffect(() => {
    // Set up mock auth data for development
    if (!isAuthenticated && !isLoading && isAutoLoggingIn) {
      console.log('[DEV] Setting up mock authentication for development login');

      // Set localStorage items for auth
      localStorage.setItem('auth_token', 'dev-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: '1',
        username: 'dev_user',
        email: 'dev@example.com',
        fullName: 'Development User',
        firstName: 'Development',
        lastName: 'User',
        roles: ['Admin'],
        permissions: ['*'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }));

      // Set sessionStorage for auth state
      sessionStorage.setItem('auth_state', JSON.stringify({
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'dev_user',
          email: 'dev@example.com',
          fullName: 'Development User',
          firstName: 'Development',
          lastName: 'User',
          roles: ['Admin'],
          permissions: ['*'],
          isActive: true
        },
        permissions: ['*']
      }));

      // Reload the page to apply auth
      window.location.reload();
    }
  }, [isAuthenticated, isLoading, isAutoLoggingIn]);

  // Handle manual login
  const handleManualLogin = () => {
    setIsAutoLoggingIn(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Development Mode
          </CardTitle>
          <CardDescription className="mt-2">
            Automatic login for development environment
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-8">
          {isLoading || isAutoLoggingIn ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Logging in automatically...</p>
            </>
          ) : (
            <>
              <p className="mb-4 text-center">
                Auto-login failed. Click the button below to try again.
              </p>
              <Button onClick={handleManualLogin}>
                Login as Development User
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            This login page is only used in development mode.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
