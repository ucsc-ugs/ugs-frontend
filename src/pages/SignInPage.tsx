import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, XCircle, Coffee, Zap, Star } from "lucide-react";
import { login } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call the login API function
      const response = await login(formData);
      
      // Update auth context with user data
      authLogin(response.user, () => {
        // Small delay to ensure state is fully updated
        setTimeout(() => {
          navigate("/portal/", { replace: true });
        }, 100);
      });
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Creative error messages
      const errorMessages = [
        "🤔 Hmm, those credentials seem to be playing hide and seek!",
        "🔐 Your password and our records are having a disagreement...",
        "📧 Double-check that email - typos happen to the best of us!",
        "🎯 Close, but not quite! Try again with the right combo.",
        "🔑 The digital keys don't match our lock. Give it another shot!",
        "📱 Maybe your fingers got excited? Check those details again!",
        "🎪 Error 401: Credentials not found in our magic hat!"
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

  const handleForgotPassword = () => {
    // Navigate to forgot password page (you'll need to create this)
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/signup");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Welcome Back!</h2>
            <p className="text-green-600 mb-4">🎉 Login successful! Redirecting to your portal...</p>
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
              <h1 className="text-xl font-bold text-gray-900">University Gateway Solution</h1>
            </div>
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Access your student portal account
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
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 pr-12"
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

              {/* Forgot Password Link */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleForgotPassword}
                  className="text-sm text-slate-600 hover:text-slate-800 p-0"
                >
                  Forgot your password?
                </Button>
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
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleRegister}
                className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Create Account
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Coffee className="h-4 w-4" />
            Powered by UCSC
          </p>
        </div>
      </div>
    </div>
  );
}