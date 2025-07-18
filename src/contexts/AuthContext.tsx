import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthToken, removeAuthToken } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, callback?: () => void) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
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
      // Verify token with backend
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoading(false);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token is invalid, remove it
        removeAuthToken();
        setUser(null);
        setIsLoading(false);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeAuthToken();
      setUser(null);
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = (userData: User, callback?: () => void) => {
    console.log('AuthContext: Setting user and token');
    setUser(userData);
    setIsLoading(false); // Ensure loading is set to false immediately after login
    setIsAuthenticated(true); // Set authentication status to true
    // Token is already set by the login function in api.ts
    
    // Execute callback after state update if provided
    if (callback) {
      // Use setTimeout to ensure state update completes
      setTimeout(() => {
        console.log('AuthContext: User state updated, executing callback');
        console.log('AuthContext: User:', userData);
        console.log('AuthContext: Token exists:', !!getAuthToken());
        console.log('AuthContext: isAuthenticated:', true);
        callback();
      }, 0);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeAuthToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
