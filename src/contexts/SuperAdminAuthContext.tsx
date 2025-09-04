import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Separate token management for super admin
const getSuperAdminToken = (): string | null => {
  return localStorage.getItem('super_admin_auth_token');
};

const setSuperAdminToken = (token: string): void => {
  localStorage.setItem('super_admin_auth_token', token);
};

const removeSuperAdminToken = (): void => {
  localStorage.removeItem('super_admin_auth_token');
};

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
    // Only check auth status if we're on super admin routes
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/super-admin')) {
      checkAuthStatus();
    } else {
      // For non-super-admin routes, set loading to false immediately
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    setIsLoading(true);
    const token = getSuperAdminToken();
    
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
        // Only remove super admin token, don't affect regular user token
        removeSuperAdminToken();
        setUser(null);
        setIsLoading(false);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Super admin auth check failed:', error);
      // Only log error, don't remove token on network failures
      console.log('Network error during super admin auth check, keeping token');
      setUser(null);
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = (userData: SuperAdminUser, token: string, callback?: () => void) => {
    console.log('SuperAdminAuthContext: Setting user and token');
    setUser(userData);
    setSuperAdminToken(token);
    setIsLoading(false);
    setIsAuthenticated(true);
    
    // Execute callback after state update if provided
    if (callback) {
      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        console.log('SuperAdminAuthContext: User state updated, executing callback');
        console.log('SuperAdminAuthContext: User:', userData);
        console.log('SuperAdminAuthContext: Token exists:', !!getSuperAdminToken());
        console.log('SuperAdminAuthContext: isAuthenticated:', true);
        callback();
      }, 0);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeSuperAdminToken();
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
