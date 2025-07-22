import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, LogOut } from "lucide-react";
import { logout } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    const handleLogout = async () => {
      // Prevent multiple logout attempts
      if (hasLoggedOut.current) return;
      
      hasLoggedOut.current = true;
      
      try {
        console.log('Starting logout process...');
        console.log('Token before logout:', localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING');
        
        // Send logout request to backend FIRST (while token is still available)
        await logout();
        console.log('Backend logout successful');
        
        // THEN clear auth context after successful backend logout
        authLogout();
        setLogoutSuccess(true);
        setIsLoggingOut(false);
        
        // Wait a moment to show success message, then redirect to landing page
        setTimeout(() => {
          navigate("/");
        }, 2000);
        
      } catch (error: any) {
        console.error('Logout error:', error);
        console.log('Token after error:', localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING');
        
        // If it's a 401 error, that's actually expected for logout (user is being unauthenticated)
        // So we should still proceed with clearing the auth context
        if (error.status === 401) {
          console.log('401 error on logout - this is expected, proceeding with local logout');
          authLogout();
          setLogoutSuccess(true);
          setIsLoggingOut(false);
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          // For other errors, clear auth context and redirect quickly
          authLogout();
          setIsLoggingOut(false);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      }
    };

    handleLogout();
  }, [navigate, authLogout]);

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <LogOut className="mx-auto h-16 w-16 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Signing Out</h2>
            <p className="text-slate-600 mb-4">Please wait while we log you out...</p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (logoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Logged Out Successfully!</h2>
            <p className="text-green-600 mb-4">👋 Thank you for using UGS. Redirecting to home...</p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback - should not reach here normally
  return null;
}

export default Logout;