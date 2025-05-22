/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Quick Login Page
 *
 * A page for quick PIN-based login for existing users.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PinLoginForm } from '../components/PinLoginForm';
import { useAuth } from '../hooks/useAuth';
import { isAccountLocked } from '../utils/securityUtils';
import { AlertCircle, ArrowLeft, Key } from 'lucide-react';

export function QuickLoginPage() {
  const { isAuthenticated, isLoading, loginWithPin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');
  const [showPinForm, setShowPinForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from location state or default to dashboard
  const from = location.state?.from || '/dashboard';

  // Get username from location state or local storage
  useEffect(() => {
    const storedUsername = localStorage.getItem('last_username');
    const locationUsername = location.state?.username;

    if (locationUsername) {
      setUsername(locationUsername);
      setShowPinForm(true);
    } else if (storedUsername) {
      // Check if account is locked before showing PIN form
      const lockStatus = isAccountLocked(storedUsername);
      if (!lockStatus.isLocked) {
        setUsername(storedUsername);
        setShowPinForm(true);
      } else {
        // Account is locked, show error
        const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);
        setError(`Too many failed login attempts. Please try again in ${remainingMinutes} minutes.`);
      }
    } else {
      // No username found, redirect to regular login
      navigate('/login', { replace: true });
    }
  }, [location.state, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    // Check if we're trying to access a special route from URL params
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    const isSpecialRoute = returnUrl && (
      returnUrl.includes('/roles') ||
      returnUrl.includes('/permissions')
    );

    // If returning to a special route, set the flag to prevent dashboard redirect
    if (isSpecialRoute) {
      sessionStorage.setItem('prevent_dashboard_redirect', 'true');
    }

    if (isAuthenticated && !isLoading) {
      // If we have a return URL in the query params, use that instead of the state
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, from, location.search]);

  // Handle successful login
  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    setError(error);
  };

  // Switch to regular login
  const handleUsePasswordInstead = () => {
    navigate('/login', { state: { username } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg rounded-lg p-6 border border-border">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Quick Login</h1>
            <p className="text-muted-foreground">Enter your PIN to continue</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {showPinForm ? (
            <PinLoginForm
              username={username}
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              onCancel={handleUsePasswordInstead}
              redirectUrl={from}
            />
          ) : (
            <div className="text-center">
              <p className="mb-4">Loading...</p>
            </div>
          )}

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
