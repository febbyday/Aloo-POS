/**
 * Development Login Bypass Component
 *
 * This component automatically handles login for development purposes,
 * allowing the app to function without a working backend.
 * DO NOT USE IN PRODUCTION - FOR DEVELOPMENT PURPOSES ONLY
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginBypassProps {
  /** Mock user role to use (default: 'admin') */
  role?: string;
  
  /** Whether to redirect after auto-login (default: true) */
  redirect?: boolean;
  
  /** Path to redirect to after login (default: '/') */
  redirectPath?: string;
}

/**
 * Login Bypass Component
 * 
 * Automatically logs in a user with mock credentials in development mode
 */
export function LoginBypass({
  role = 'admin',
  redirect = true,
  redirectPath = '/'
}: LoginBypassProps) {
  const { login, isAuthenticated, isLoading, isDevelopmentMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const autoLogin = async () => {
      // Only auto-login in development mode and when not already authenticated
      if (!isDevelopmentMode) {
        console.warn('[DEV MODE] LoginBypass is only intended for development use');
        return;
      }
      
      if (isAuthenticated || isLoading) {
        return;
      }

      try {
        console.info('[DEV MODE] Performing automatic login with development credentials');
        
        // Use predictable development credentials (username = password)
        await login({
          username: role,
          password: role,
          rememberMe: true
        });
        
        if (redirect) {
          console.info(`[DEV MODE] Auto-redirecting to ${redirectPath}`);
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('[DEV MODE] Auto-login failed:', error);
      }
    };

    autoLogin();
  }, [isDevelopmentMode, isAuthenticated, isLoading, login, navigate, redirect, redirectPath, role]);

  // This component doesn't render anything visible
  return null;
}

export default LoginBypass;
