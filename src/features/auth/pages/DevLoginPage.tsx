/**
 * Development Login Page
 * 
 * This page is only used in development mode to bypass the login page.
 * It automatically logs in a development user and redirects to the dashboard.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function DevLoginPage() {
  const navigate = useNavigate();

  // Handle automatic login
  const handleAutoLogin = () => {
    // Set up mock authentication data
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
    
    // Redirect to dashboard
    navigate('/');
    
    // Force reload to apply the auth token
    window.location.reload();
  };

  // Auto-login after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoLogin();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Development Mode
          </CardTitle>
          <CardDescription className="mt-2">
            Automatic login in progress...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            You are being automatically logged in with development credentials.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleAutoLogin}>
            Login Manually
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DevLoginPage;
