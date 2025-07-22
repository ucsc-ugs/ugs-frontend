import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/api';

interface SuperAdminUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  type?: string;
  created_at?: string;
  student?: {
    local: boolean;
    passport_nic: string;
  } | null;
  meta?: {
    permissions: string[];
  };
  roles?: Array<{ name: string }>;
}

interface SuperAdminContextType {
  user: SuperAdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: SuperAdminUser, token: string, callback?: () => void) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
  }
  return context;
};

interface SuperAdminAuthProviderProps {
  children: ReactNode;
}

export const SuperAdminAuthProvider: React.FC<SuperAdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    setIsLoading(true);
    const token = getAuthToken();
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Transform the new API response structure to match our SuperAdminUser interface
        const userData: SuperAdminUser = {
          id: apiResponse.id,
          name: apiResponse.data.name,
          email: apiResponse.data.email,
          role: apiResponse.role,
          type: apiResponse.type,
          created_at: apiResponse.data.created_at,
          student: apiResponse.data.student,
          meta: apiResponse.meta,
        };
        setUser(userData);
        setIsLoading(false);
        setIsAuthenticated(true);
        return true;
      } else {
        removeAuthToken();
        setUser(null);
        setIsLoading(false);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Super admin auth check failed:', error);
      removeAuthToken();
      setUser(null);
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = (userData: SuperAdminUser, token: string, callback?: () => void) => {
    console.log('SuperAdminAuthContext: Setting user and token');
    setUser(userData);
    setAuthToken(token);
    setIsLoading(false);
    setIsAuthenticated(true);
    
    // Execute callback after state update if provided
    if (callback) {
      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        console.log('SuperAdminAuthContext: User state updated, executing callback');
        console.log('SuperAdminAuthContext: User:', userData);
        console.log('SuperAdminAuthContext: Token exists:', !!getAuthToken());
        console.log('SuperAdminAuthContext: isAuthenticated:', true);
        callback();
      }, 0);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeAuthToken();
  };

  const value: SuperAdminContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};
