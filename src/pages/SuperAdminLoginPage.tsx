import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, XCircle, Shield, Lock } from "lucide-react";
import { superAdminLogin } from "@/lib/superAdminApi";
import { useSuperAdminAuth } from "@/contexts/SuperAdminAuthContext";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useSuperAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await superAdminLogin(formData);
      
      // Transform API response to match SuperAdminUser interface if needed
      let userData;
      if (response.user) {
        // Handle legacy response format
        userData = response.user;
      } else {
        // Handle new API response format
        userData = {
          id: response.id!,
          name: (response.data as any).name,
          email: (response.data as any).email,
          role: response.role,
          type: response.type,
          created_at: (response.data as any).created_at,
          student: (response.data as any).student,
          meta: response.meta,
        };
      }
      
      // Update auth context with user data and navigate after state is set
      authLogin(userData, response.token!, () => {
        // Small delay to ensure state is fully updated
        setTimeout(() => {
          navigate("/super-admin/dashboard", { replace: true });
        }, 100);
      });
      
    } catch (err: any) {
      console.error('Super admin login error:', err);
      
      const errorMessages = [
        "🔐 Invalid super admin credentials. Please check your access.",
        "⚠️ Super admin access denied. Verify your credentials.",
        "🛡️ Authentication failed. Super admin privileges required.",
        "🔑 Access denied. Please contact system administrator.",
        "🚨 Invalid super admin login. Check your email and password."
      ];
      
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      setError(err.message || randomError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToLanding}
            className="mb-6 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-12 w-12 text-blue-400" />
            <div className="text-left">
              <h1 className="text-xl font-bold text-white">Super Admin Portal</h1>
              <p className="text-blue-300 text-sm">University Gateway Solution</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
            <CardDescription className="text-blue-200">
              Secure login for system administrators
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Super admin email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/50"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Super admin password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/50 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-300 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Admin Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-blue-200">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-4 w-4" />
            Secured by UCSC
          </p>
        </div>
      </div>
    </div>
  );
}
