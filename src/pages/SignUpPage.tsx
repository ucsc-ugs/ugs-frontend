import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, XCircle, UserPlus, Sparkles, Lock } from "lucide-react";
import { register } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    local: true, // Default to local student
    passport_nic: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (!formData.passport_nic.trim()) {
      newErrors.passport_nic = formData.local ? "NIC number is required" : "Passport number is required";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      
      // Update auth context with user data
      authLogin(response.user);
      
      setShowSuccess(true);
      
      // Wait a moment to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.errors) {
        // Handle validation errors from backend
        const backendErrors: Record<string, string> = {};
        Object.keys(err.errors).forEach(key => {
          if (Array.isArray(err.errors[key])) {
            backendErrors[key] = err.errors[key][0];
          } else {
            backendErrors[key] = err.errors[key];
          }
        });
        setErrors(backendErrors);
      } else {
        // Creative error messages
        const errorMessages = [
          "🎭 Oops! Something went wrong in our registration theater!",
          "🚀 Houston, we have a problem! Registration failed to launch.",
          "🎪 The registration circus encountered a technical difficulty!",
          "🎨 Our registration canvas got a bit messy. Let's try again!",
          "⚡ A registration lightning strike occurred! Please retry.",
          "🎯 Missed the registration bullseye! Give it another shot!",
          "🎲 The registration dice rolled badly. Try your luck again!"
        ];
        
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        setErrors({ general: err.message || randomError });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/portal/signin");
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
            <h2 className="text-2xl font-bold text-green-800 mb-2">Welcome to UGS!</h2>
            <p className="text-green-600 mb-4">🎉 Registration successful! Taking you to your portal...</p>
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

        {/* Sign Up Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join UGS to access educational opportunities
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full h-12 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'}`}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full h-12 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'}`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Student Type Field */}
              <div className="space-y-3">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="local"
                      name="studentType"
                      checked={formData.local === true}
                      onChange={() => setFormData(prev => ({ ...prev, local: true }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="local" className="text-sm text-gray-700">Local Student</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="international"
                      name="studentType"
                      checked={formData.local === false}
                      onChange={() => setFormData(prev => ({ ...prev, local: false }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="international" className="text-sm text-gray-700">International Student</label>
                  </div>
                </div>
              </div>

              {/* NIC/Passport Field */}
              <div className="space-y-2">
                <Input
                  id="passport_nic"
                  name="passport_nic"
                  type="text"
                  placeholder={formData.local ? "Enter your NIC number" : "Enter your Passport number"}
                  value={formData.passport_nic}
                  onChange={handleInputChange}
                  className={`w-full h-12 ${errors.passport_nic ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'}`}
                />
                {errors.passport_nic && (
                  <p className="text-red-600 text-sm">{errors.passport_nic}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-12 pr-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className={`w-full h-12 pr-12 ${errors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-500'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-600 text-sm">{errors.password_confirmation}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked: boolean) => {
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }));
                      if (errors.agreeToTerms) {
                        setErrors(prev => ({ ...prev, agreeToTerms: "" }));
                      }
                    }}
                    className="mt-1"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-5">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-slate-600 hover:text-slate-800 underline"
                      onClick={() => {/* Handle terms modal */}}
                    >
                      Terms and Conditions
                    </button>
                    {" "}and{" "}
                    <button
                      type="button"
                      className="text-slate-600 hover:text-slate-800 underline"
                      onClick={() => {/* Handle privacy modal */}}
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-600 text-sm">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToSignIn}
                className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium mt-4"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In Instead
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4" />
            Powered by UCSC
          </p>
        </div>
      </div>
    </div>
  );
}
