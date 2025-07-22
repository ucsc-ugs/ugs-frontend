import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User, Mail, Calendar, CreditCard, MapPin } from "lucide-react";
import profileSample from "@/assets/profile_sample.png";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32 ring-4 ring-blue-200">
                <AvatarImage src={profileSample} alt={user.name} />
                <AvatarFallback>
                  <span className="text-2xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl text-blue-800">{user.name}</CardTitle>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {user.role || "Student"}
              </Badge>
              {user.student?.local !== undefined && (
                <Badge variant="outline">
                  {user.student.local ? "Local Student" : "International Student"}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-blue-800">Account Information</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button onClick={handleSave} size="sm">
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            )}
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
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-700 font-medium">{user.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Student Information */}
            {user.student && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Student Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Student ID / NIC</Label>
                    <p className="text-gray-700 font-medium">{user.student.passport_nic}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Student Type</Label>
                    <p className="text-gray-700 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {user.student.local ? "Local Student" : "International Student"}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
