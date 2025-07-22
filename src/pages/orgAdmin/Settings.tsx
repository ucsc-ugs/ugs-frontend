// src/pages/orgAdmin/Settings.tsx
import { useState } from "react";
import {
    Save,
    Settings as SettingsIcon,
    Building,
    Upload,
    Shield,
    Bell,
    Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";

interface OrganizationSettings {
    // Organization Profile
    organizationName: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
    website: string;
    logo: string;

    // Communication Preferences
    enableEmailNotifications: boolean;
    enableInAppNotifications: boolean;
    emailSignature: string;
}

interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const defaultSettings: OrganizationSettings = {
    organizationName: "University of Colombo School of Computing",
    contactEmail: "admin@ucsc.cmb.ac.lk",
    phoneNumber: "+94112581835",
    address: "UCSC Building, University of Colombo, Colombo 07, Sri Lanka",
    website: "https://ucsc.cmb.ac.lk",
    logo: "",
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    emailSignature: "Best regards,\nUCSC Administration Team\nUniversity of Colombo School of Computing"
};

export default function Settings() {
    const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSavedMessage("Settings saved successfully!");
            setTimeout(() => setSavedMessage(""), 3000);
        } catch {
            setSavedMessage("Error saving settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof OrganizationSettings, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("Password changed successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch {
            alert("Error changing password. Please try again.");
        }
    };

    const tabs = [
        { id: "profile", label: "Organization Profile", icon: Building },
        { id: "communication", label: "Communication", icon: Bell },
        { id: "account", label: "Account Settings", icon: Lock }
    ];

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
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
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
                                                value={settings.organizationName}
                                                disabled
                                                className="mt-1 bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contact system administrator to change</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                                                Contact Email
                                            </Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={settings.contactEmail}
                                                disabled
                                                className="mt-1 bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contact system administrator to change</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phoneNumber"
                                                type="tel"
                                                value={settings.phoneNumber}
                                                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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
                                                value={settings.website}
                                                disabled
                                                className="mt-1 bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contact system administrator to change</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                            Address
                                        </Label>
                                        <textarea
                                            id="address"
                                            value={settings.address}
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
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="logo-upload"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            // Handle file upload
                                                            console.log("Logo uploaded:", file.name);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload Logo
                                                </label>
                                            </div>
                                            {settings.logo && (
                                                <Avatar className="w-16 h-16">
                                                    <img
                                                        src={settings.logo}
                                                        alt="Organization Logo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </Avatar>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Recommended size: 200x200px, Max file size: 2MB</p>
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

                        {/* Communication Preferences */}
                        {activeTab === "communication" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Communication Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Enable Email Notifications
                                                </Label>
                                                <p className="text-sm text-gray-500">
                                                    Receive system notifications via email
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableEmailNotifications}
                                                    onChange={(e) => handleInputChange("enableEmailNotifications", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Enable In-App Notifications
                                                </Label>
                                                <p className="text-sm text-gray-500">
                                                    Show notifications within the application
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableInAppNotifications}
                                                    onChange={(e) => handleInputChange("enableInAppNotifications", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="emailSignature" className="text-sm font-medium text-gray-700">
                                            Email Signature for Announcements
                                        </Label>
                                        <textarea
                                            id="emailSignature"
                                            value={settings.emailSignature}
                                            onChange={(e) => handleInputChange("emailSignature", e.target.value)}
                                            rows={4}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your email signature for official announcements..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">This signature will be automatically added to announcement emails</p>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isSaving ? "Saving..." : "Save Preferences"}
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
                                                onClick={handlePasswordChange}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                Change Password
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
