import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface OrgAdminProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const OrgAdminProtectedRoute: React.FC<OrgAdminProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/admin/login' 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('OrgAdminProtectedRoute: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-500 mb-4" />
          <p className="text-slate-600 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has admin role (adjust this condition based on your role structure)
  if (user) {
    const isOrgAdmin = user.role === 'org_admin';
    
    if (!isOrgAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render protected content if authenticated and has admin role
  return <>{children}</>;
};

export default OrgAdminProtectedRoute;
