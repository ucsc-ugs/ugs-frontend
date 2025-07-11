import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nicPassport: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    nicPassport: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  type ErrorsType = {
    fullName: string;
    email: string;
    nicPassport: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: string;
  };

  const validateForm = () => {
    const newErrors: ErrorsType = {
      fullName: "",
      email: "",
      nicPassport: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: ""
    };
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.nicPassport.trim()) {
      newErrors.nicPassport = "NIC/Passport number is required";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must include a capital letter and a number";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms & Conditions";
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, show success message
    alert("Account created successfully!");
    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    alert("Navigate to login page");
  };

  const handleBackToLanding = () => {
    alert("Navigate to landing page");
  };

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
            <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600">
              Register to apply for exams, track results, and manage your profile.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g., Nimal Perera"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g., nimal@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
                <p className="text-xs text-gray-500 flex items-center">
                  <Shield className="mr-1 h-3 w-3" />
                  Used for account verification and notifications
                </p>
              </div>

              {/* NIC/Passport Field */}
              <div className="space-y-2">
                <Input
                  id="nicPassport"
                  name="nicPassport"
                  type="text"
                  placeholder="e.g., 199045603215 / N1234567"
                  value={formData.nicPassport}
                  onChange={handleInputChange}
                  required
                  className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 ${
                    errors.nicPassport ? 'border-red-500' : ''
                  }`}
                />
                {errors.nicPassport && (
                  <p className="text-sm text-red-600">{errors.nicPassport}</p>
                )}
                <p className="text-xs text-gray-500">
                  Used to uniquely identify you in official records
                </p>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="e.g., 0771234567"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 ${
                    errors.phoneNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
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
                        className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 pr-12 ${
                            errors.password ? 'border-red-500' : ''
                        }`}
                        />
                        <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Min 8 characters, include a number and a capital letter
                    </p>
                    </div>

                    {/*Fixed Confirm Password Field*/}
                    <div className="space-y-2">
                    <div className="relative">
                        <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className={`h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500 pr-12 ${
                            errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        />
                        <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Must match the above password
                    </p>
                    </div>

              {/* Terms & Conditions Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-slate-600 hover:text-slate-800 underline">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-slate-600 hover:text-slate-800 underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-slate-700 hover:bg-slate-800 text-white font-medium"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-slate-600 hover:text-slate-800 p-0 font-medium"
                >
                  Back to Login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 University of Colombo School of Computing</p>
        </div>
      </div>
    </div>
  );
}