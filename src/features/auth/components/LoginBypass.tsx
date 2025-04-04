/**
 * Login Bypass Component
 * 
 * This component automatically redirects from the login page to the dashboard.
 * It's used to completely bypass the login screen.
 */

import { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';

export function LoginBypass() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from query parameters if it exists
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  
  useEffect(() => {
    // Log that we're bypassing login
    console.log('[AUTH BYPASS] Bypassing login page');
    
    // If there's a return URL, navigate to it
    if (returnUrl) {
      console.log(`[AUTH BYPASS] Redirecting to return URL: ${returnUrl}`);
      navigate(returnUrl);
    }
  }, [navigate, returnUrl]);
  
  // Redirect to dashboard if no return URL
  return <Navigate to="/" replace />;
}
