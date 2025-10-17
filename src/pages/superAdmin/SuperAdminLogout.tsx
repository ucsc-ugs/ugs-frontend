import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, Shield } from "lucide-react";
import { superAdminLogout } from "@/lib/superAdminApi";
import { useSuperAdminAuth } from "@/contexts/SuperAdminAuthContext";

function SuperAdminLogout() {
  const navigate = useNavigate();
  const { logout: authLogout } = useSuperAdminAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Send logout request to backend FIRST (while token is still available)
        await superAdminLogout();
        
        // THEN clear auth context after successful backend logout
        authLogout();
        setLogoutSuccess(true);
        setIsLoggingOut(false);
        
        setTimeout(() => {
          navigate("/");
        }, 2000);
        
      } catch (error: any) {
        console.error('Super admin logout error:', error);
        
        // If it's a 401 error, that's actually expected for logout (user is being unauthenticated)
        // So we should still proceed with clearing the auth context
        if (error.status === 401) {
          console.log('401 error on super admin logout - this is expected, proceeding with local logout');
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

    performLogout();
  }, [navigate, authLogout]);

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-white/10 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Shield className="mx-auto h-16 w-16 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Signing Out</h2>
            <p className="text-blue-200 mb-4">Logging out from super admin panel...</p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (logoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-white/10 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-green-300 mb-2">Logged Out Successfully!</h2>
            <p className="text-green-200 mb-4">👋 Thank you for using the admin panel. Redirecting to home...</p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default SuperAdminLogout;
