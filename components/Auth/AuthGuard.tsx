'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
    description: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Verify JWT token structure
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Check if token is expired
            if (payload.exp && payload.exp > Date.now() / 1000) {
              setUser(JSON.parse(userData));
            } else {
              // Token expired, clear storage and redirect
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/auth/login');
            }
          } else {
            // Invalid token format
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth/login');
          }
        } catch (error) {
          // Invalid token, clear storage and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
