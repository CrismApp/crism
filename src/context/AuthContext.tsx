"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, getSession } from '@/lib/auth-client';

interface User {
  id: string
  email: string
  name: string
  [key: string]: unknown
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Force check session from server
        const currentSession = await getSession();
        if (currentSession?.data?.user) {
          setIsAuthenticated(true);
          setUser(currentSession.data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPending) {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        setIsLoading(false);
      } else {
        // If no session from hook, try to get it from server
        checkAuthState();
      }
    }
  }, [session, isPending]);

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const currentSession = await getSession();
      if (currentSession?.data?.user) {
        setIsAuthenticated(true);
        setUser(currentSession.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
