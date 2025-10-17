import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, XCircle, Shield, Lock, CheckCircle } from "lucide-react";
import { superAdminLogin } from "@/lib/superAdminApi";
import { useSuperAdminAuth } from "@/contexts/SuperAdminAuthContext";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useSuperAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Welcome, Super Admin!</h2>
            <p className="text-green-600 mb-4">🎉 Login successful! Accessing admin dashboard...</p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToLanding}
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="../src/assets/ucsc_logo.png" 
              alt="UCSC Logo" 
              width={50} 
              height={35} 
              className="object-contain" 
            />
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">Super Admin Portal</h1>
              <p className="text-gray-600 text-sm">University Gateway Solution</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-slate-600" />
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-600">
              Secure login for system administrators
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
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
                  className="w-full h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-slate-500 focus:ring-slate-500/20"
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
                    className="w-full h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-slate-500 focus:ring-slate-500/20 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-slate-700 hover:bg-slate-800 text-white font-medium"
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
        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-4 w-4" />
            Secured by UCSC
          </p>
        </div>
      </div>
    </div>
  );
}
