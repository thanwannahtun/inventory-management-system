'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          // Simple token validation (in production, use JWT verification)
          const tokenData = JSON.parse(atob(token));
          
          // Check if token is expired
          if (tokenData.exp && tokenData.exp < Date.now()) {
            // Token expired, clear storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            router.push('/auth/login');
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Invalid token, clear storage and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          router.push('/auth/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
