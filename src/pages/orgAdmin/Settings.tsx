// src/pages/orgAdmin/Settings.tsx
import { useState, useEffect, useRef } from "react";
import {
    Save,
    Settings as SettingsIcon,
    Building,
    Upload,
    Shield,
    Lock,
    X
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orgAdminApi } from "@/lib/orgAdminApi";
import { useToast } from "@/contexts/ToastContext";

interface OrganizationSettings {
    id: number;
    name: string;
    description: string;
    contact_email?: string;
    phone_number?: string;
    address?: string;
    website?: string;
    logo?: string;
}

interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const defaultSettings: OrganizationSettings = {
    id: 0,
    name: "",
    description: "",
    contact_email: "",
    phone_number: "",
    address: "",
    website: "",
    logo: ""
};

export default function Settings() {
    const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [lastPasswordChangeRequest, setLastPasswordChangeRequest] = useState<number>(0);
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    // Logo upload states
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadOrganizationData();
    }, []);

    const loadOrganizationData = async () => {
        try {
            setIsLoading(true);
            const organization = await orgAdminApi.getMyOrganization();
            setSettings({
                ...organization
            });
            
            // Set logo preview if exists
            if (organization.logo) {
                setLogoPreview(`http://localhost:8000/storage${organization.logo}`);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load organization data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                name: settings.name,
                description: settings.description,
                contact_email: settings.contact_email,
                phone_number: settings.phone_number,
                address: settings.address,
                website: settings.website
            };
            
            // Filter out empty string values to avoid validation issues
            const filteredData = Object.fromEntries(
                Object.entries(updateData).filter(([key, value]) => value !== "" && value !== null && value !== undefined)
            );
            
            console.log('Original data:', updateData);
            console.log('Filtered data to send:', filteredData);
            
            await orgAdminApi.updateMyOrganization(filteredData);
            
            setSavedMessage("Settings saved successfully!");
            setTimeout(() => setSavedMessage(""), 3000);
            
            toast({
                title: "Success",
                description: "Settings saved successfully!",
            });
        } catch (error: any) {
            setSavedMessage("Error saving settings. Please try again.");
            toast({
                title: "Error",
                description: error.message || "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "Error",
                    description: "Logo file size must be less than 5MB.",
                    variant: "destructive",
                });
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Error",
                    description: "Please select an image file.",
                    variant: "destructive",
                });
                return;
            }
            
            setSelectedLogo(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string || '');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoUpload = async () => {
        if (!selectedLogo) return;
        
        try {
            setIsUploadingLogo(true);
            await orgAdminApi.uploadOrganizationLogo(selectedLogo);
            
            // Reload organization data to get the new logo URL
            await loadOrganizationData();
            
            // Clear selected file
            setSelectedLogo(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            toast({
                title: "Success",
                description: "Logo uploaded successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to upload logo.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const removeLogo = () => {
        setSelectedLogo(null);
        setLogoPreview(settings.logo ? `http://localhost:8000/storage${settings.logo}` : '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (field: keyof OrganizationSettings, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = async (e?: React.MouseEvent) => {
        // Prevent any default behavior and double execution
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const now = Date.now();
        
        // Prevent duplicate requests within 2 seconds (debounce)
        if (now - lastPasswordChangeRequest < 2000) {
            console.log('Ignoring duplicate request - too soon after last request');
            return;
        }

        // Check if already processing to prevent double execution
        if (isChangingPassword) {
            console.log('Password change already in progress, skipping...');
            return;
        }

        setLastPasswordChangeRequest(now);
        console.log('Starting password change process...');

        // Frontend validation first
        if (!passwordData.currentPassword.trim()) {
            toast({
                title: "Error",
                description: "Current password is required!",
                variant: "destructive",
            });
            return;
        }

        if (!passwordData.newPassword.trim()) {
            toast({
                title: "Error",
                description: "New password is required!",
                variant: "destructive",
            });
            return;
        }

        if (!passwordData.confirmPassword.trim()) {
            toast({
                title: "Error",
                description: "Password confirmation is required!",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New password and confirmation password do not match!",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast({
                title: "Error",
                description: "New password must be at least 8 characters long!",
                variant: "destructive",
            });
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            toast({
                title: "Error",
                description: "New password must be different from your current password!",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsChangingPassword(true);
            console.log('Making API call to change password...');
            
            await orgAdminApi.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                new_password_confirmation: passwordData.confirmPassword,
            });
            
            console.log('Password change successful!');
            
            // Success - show success message and clear form
            toast({
                title: "Success",
                description: "Password changed successfully! Please use your new password for future logins.",
            });
            
            // Clear password form
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            
        } catch (error: any) {
            console.error('Password change error:', error);
            
            // Extract and display appropriate error message
            let errorMessage = "Error changing password. Please try again.";
            
            if (error.message) {
                // Check for specific error types
                if (error.message.includes('current_password: The current password is incorrect') || 
                    error.message.includes('Current password is incorrect') ||
                    error.message.includes('current_password')) {
                    errorMessage = "Current password is incorrect. Please check your current password and try again.";
                } else if (error.message.includes('Validation errors')) {
                    // Extract the actual validation message
                    const validationPart = error.message.replace('Validation errors:\n', '').replace('Validation errors:', '').trim();
                    
                    // If it contains current_password error, show user-friendly message
                    if (validationPart.includes('current_password')) {
                        errorMessage = "Current password is incorrect. Please check your current password and try again.";
                    } else if (validationPart.includes('new_password')) {
                        errorMessage = "New password validation failed. Please ensure it meets all requirements.";
                    } else {
                        // Show the cleaned validation message
                        errorMessage = validationPart;
                    }
                } else if (error.message.includes('new_password')) {
                    errorMessage = "New password validation failed. Please ensure it meets all requirements.";
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast({
                title: "Password Change Failed",
                description: errorMessage,
                variant: "destructive",
            });
            
        } finally {
            console.log('Setting isChangingPassword to false');
            setIsChangingPassword(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Organization Profile", icon: Building },
        { id: "account", label: "Account Settings", icon: Lock }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto p-4 lg:p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <SettingsIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600 text-sm">Configure system preferences and defaults</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {savedMessage && (
                            <Badge className="bg-green-100 text-green-800">
                                {savedMessage}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Tabs */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {/* Organization Profile */}
                        {activeTab === "profile" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Organization Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
                                                Organization Name
                                            </Label>
                                            <Input
                                                id="organizationName"
                                                type="text"
                                                value={settings.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                                                Contact Email
                                            </Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={settings.contact_email || ''}
                                                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phoneNumber"
                                                type="tel"
                                                value={settings.phone_number || ''}
                                                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                                                Website
                                            </Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                value={settings.website || ''}
                                                onChange={(e) => handleInputChange("website", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                            Organization Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            value={settings.description || ''}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            rows={4}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter a description of your organization..."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                            Address
                                        </Label>
                                        <textarea
                                            id="address"
                                            value={settings.address || ''}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            rows={3}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">
                                            Organization Logo
                                        </Label>
                                        <div className="mt-1 flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {logoPreview && (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Organization Logo"
                                                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        {selectedLogo && (
                                                            <button
                                                                type="button"
                                                                onClick={removeLogo}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="logo-upload"
                                                    ref={fileInputRef}
                                                    onChange={handleLogoSelect}
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {logoPreview && !selectedLogo ? 'Change Logo' : 'Upload Logo'}
                                                </label>
                                                {selectedLogo && (
                                                    <Button
                                                        type="button"
                                                        onClick={handleLogoUpload}
                                                        disabled={isUploadingLogo}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isUploadingLogo ? 'Uploading...' : 'Save Logo'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Recommended size: 200x200px, Max file size: 5MB</p>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isSaving ? "Saving..." : "Save Profile"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Account Settings */}
                        {activeTab === "account" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Account Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                        <div className="space-y-4 max-w-md">
                                            <div>
                                                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                                                    Current Password
                                                </Label>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                                    New Password
                                                </Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="mt-1"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                                            </div>
                                            <div>
                                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                                    Confirm New Password
                                                </Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handlePasswordChange}
                                                disabled={isChangingPassword}
                                                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isChangingPassword ? (
                                                    <>
                                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Changing Password...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Change Password
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
