import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FullPageLoader } from '@/components/ui/FullPageLoader'; 

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Optionally, redirect to an error page or show a message
        navigate('/login?logoutError=true');
      }
    };

    performLogout();
  }, [logout, navigate]);

  return <FullPageLoader message="Logging out..." />;
};

// Named export is used above
