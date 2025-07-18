import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';
import { Loader2, Shield } from 'lucide-react';

interface SuperAdminProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/super-admin/login' 
}) => {
  const { isAuthenticated, isLoading } = useSuperAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-4" />
          <p className="text-blue-200 text-lg">Verifying super admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default SuperAdminProtectedRoute;
