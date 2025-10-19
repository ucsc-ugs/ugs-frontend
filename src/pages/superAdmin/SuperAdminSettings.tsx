import { useSuperAdminAuth } from "@/contexts/SuperAdminAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { User, Mail, Calendar, Lock, CheckCircle, AlertCircle, X, Shield } from "lucide-react";
import { updateSuperAdminPassword } from "@/lib/superAdminApi";

export default function SuperAdminSettings() {
  const { user } = useSuperAdminAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Auto-dismiss password success message after 5 seconds
  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => {
        setPasswordSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  const handlePasswordSave = async () => {
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordSuccess(null);

    try {
      const response = await updateSuperAdminPassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });

      // Extract the success message from the API response
      const successMessage = response.message || "Password updated successfully";
      setPasswordSuccess(successMessage);
      setIsEditingPassword(false);
      
      // Clear the password form
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      
      console.log("Password update successful:", response);
    } catch (err: any) {
      if (err.errors) {
        // Handle validation errors
        setPasswordFieldErrors(err.errors);
        setPasswordError(err.message || "Please fix the validation errors below");
      } else {
        // Handle general errors
        setPasswordError(err.message || "Failed to update password. Please try again.");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setIsEditingPassword(false);
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordSuccess(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your super admin account settings</p>

        {/* Password Success Message */}
        {passwordSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{passwordSuccess}</span>
            </div>
            <button
              onClick={() => setPasswordSuccess(null)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Password Error Message */}
        {passwordError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">{passwordError}</span>
            </div>
            <button
              onClick={() => setPasswordError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-32 w-32 ring-4 ring-blue-200 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <CardTitle className="text-xl text-blue-800">{user.name}</CardTitle>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <p className="text-gray-700 font-medium">{user.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </h3>
              
              {!isEditingPassword ? (
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">••••••••</p>
                  <Button 
                    onClick={() => setIsEditingPassword(true)} 
                    variant="outline" 
                    size="sm"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <div>
                        <Input
                          id="current_password"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className={passwordFieldErrors.current_password ? "border-red-500" : ""}
                          placeholder="Enter your current password"
                        />
                        {passwordFieldErrors.current_password && (
                          <p className="text-sm text-red-600 mt-1">{passwordFieldErrors.current_password[0]}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <div>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                          className={passwordFieldErrors.password ? "border-red-500" : ""}
                          placeholder="Enter your new password"
                        />
                        {passwordFieldErrors.password && (
                          <p className="text-sm text-red-600 mt-1">{passwordFieldErrors.password[0]}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <div>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordData.password_confirmation}
                          onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                          className={passwordFieldErrors.password_confirmation ? "border-red-500" : ""}
                          placeholder="Confirm your new password"
                        />
                        {passwordFieldErrors.password_confirmation && (
                          <p className="text-sm text-red-600 mt-1">{passwordFieldErrors.password_confirmation[0]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handlePasswordSave} 
                      size="sm" 
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button 
                      onClick={handlePasswordCancel} 
                      variant="outline" 
                      size="sm"
                      disabled={isPasswordLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account ID</Label>
                  <p className="text-gray-700 font-medium">#{user.id}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <p className="text-gray-700 font-medium">{user.role || 'Super Administrator'}</p>
                </div>
                
                {user.created_at && (
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <p className="text-gray-700 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            {user.meta?.permissions && user.meta.permissions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {user.meta.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
