import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser, isAuthenticated, logout } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/admin/login', { replace: true });
          return;
        }
        const user = await fetchCurrentUser();
        if (!user) {
          logout();
          navigate('/admin/login', { replace: true });
          return;
        }
      } catch (error) {
        logout();
        navigate('/admin/login', { replace: true });
        return;
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [navigate]);

  if (checking) {
    return null;
  }

  return <>{children}</>;
}
