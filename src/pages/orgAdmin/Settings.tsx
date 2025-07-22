// src/pages/admin/Settings.tsx
import { useState } from "react";
import {
    Save,
    Settings as SettingsIcon,
    Building,
    Mail,
    Upload,
    Clock,
    Shield,
    Database,
    Palette
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SettingsData {
    // Organization Settings
    organizationName: string;
    organizationEmail: string;
    organizationPhone: string;
    organizationAddress: string;
    organizationWebsite: string;
    organizationLogo: string;

    // Default Exam Settings
    defaultExamDuration: number;
    defaultExamFee: number;
    defaultMaxParticipants: number;
    defaultQuestionCount: number;

    // Email Settings
    emailSenderName: string;
    emailSenderAddress: string;
    emailSignature: string;

    // System Settings
    autoPublishResults: boolean;
    allowStudentRegistration: boolean;
    requireEmailVerification: boolean;
    enableNotifications: boolean;
    maintenanceMode: boolean;

    // UI Settings
    primaryColor: string;
    footerMessage: string;
    aboutMessage: string;

    // Security Settings
    sessionTimeout: number;
    passwordMinLength: number;
    enableTwoFactor: boolean;
    maxLoginAttempts: number;
}

const defaultSettings: SettingsData = {
    organizationName: "University Gateway Solutions",
    organizationEmail: "admin@ugs.lk",
    organizationPhone: "+94112581835",
    organizationAddress: "UCSC Building, University of Colombo, Colombo 07",
    organizationWebsite: "https://ugs.lk",
    organizationLogo: "",

    defaultExamDuration: 120,
    defaultExamFee: 1000,
    defaultMaxParticipants: 100,
    defaultQuestionCount: 50,

    emailSenderName: "UGS Admin",
    emailSenderAddress: "noreply@ugs.lk",
    emailSignature: "Best regards,\nUniversity Gateway Solutions Team",

    autoPublishResults: false,
    allowStudentRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,

    primaryColor: "#3B82F6",
    footerMessage: "© 2025 University Gateway Solutions. All rights reserved.",
    aboutMessage: "University Gateway Solutions provides comprehensive exam management and student portal services for universities across Sri Lanka.",

    sessionTimeout: 30,
    passwordMinLength: 8,
    enableTwoFactor: false,
    maxLoginAttempts: 3
};

export default function Settings() {
    const [settings, setSettings] = useState<SettingsData>(defaultSettings);
    const [activeTab, setActiveTab] = useState("organization");
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");

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

    const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const tabs = [
        { id: "organization", label: "Organization", icon: Building },
        { id: "exam", label: "Exam Defaults", icon: Clock },
        { id: "email", label: "Email Settings", icon: Mail },
        { id: "system", label: "System", icon: Database },
        { id: "ui", label: "UI & Content", icon: Palette },
        { id: "security", label: "Security", icon: Shield }
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
                        {/* Organization Settings */}
                        {activeTab === "organization" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Organization Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Organization Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.organizationName}
                                                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contact Email
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.organizationEmail}
                                                onChange={(e) => handleInputChange("organizationEmail", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={settings.organizationPhone}
                                                onChange={(e) => handleInputChange("organizationPhone", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                value={settings.organizationWebsite}
                                                onChange={(e) => handleInputChange("organizationWebsite", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <textarea
                                            value={settings.organizationAddress}
                                            onChange={(e) => handleInputChange("organizationAddress", e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Organization Logo
                                        </label>
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
                                            {settings.organizationLogo && (
                                                <img
                                                    src={settings.organizationLogo}
                                                    alt="Organization Logo"
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Exam Default Settings */}
                        {activeTab === "exam" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Default Exam Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Default Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.defaultExamDuration}
                                                onChange={(e) => handleInputChange("defaultExamDuration", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Default Fee (LKR)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.defaultExamFee}
                                                onChange={(e) => handleInputChange("defaultExamFee", parseFloat(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Default Max Participants
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.defaultMaxParticipants}
                                                onChange={(e) => handleInputChange("defaultMaxParticipants", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Default Question Count
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.defaultQuestionCount}
                                                onChange={(e) => handleInputChange("defaultQuestionCount", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Email Settings */}
                        {activeTab === "email" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="w-5 h-5" />
                                        Email Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sender Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.emailSenderName}
                                                onChange={(e) => handleInputChange("emailSenderName", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sender Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.emailSenderAddress}
                                                onChange={(e) => handleInputChange("emailSenderAddress", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Signature
                                        </label>
                                        <textarea
                                            value={settings.emailSignature}
                                            onChange={(e) => handleInputChange("emailSignature", e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* System Settings */}
                        {activeTab === "system" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="w-5 h-5" />
                                        System Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Auto-publish Results
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Automatically publish exam results when available
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.autoPublishResults}
                                                    onChange={(e) => handleInputChange("autoPublishResults", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Allow Student Registration
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Allow students to register for exams
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.allowStudentRegistration}
                                                    onChange={(e) => handleInputChange("allowStudentRegistration", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Require Email Verification
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Require users to verify their email addresses
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.requireEmailVerification}
                                                    onChange={(e) => handleInputChange("requireEmailVerification", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Enable Notifications
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Send system notifications to users
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enableNotifications}
                                                    onChange={(e) => handleInputChange("enableNotifications", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Maintenance Mode
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Put the system in maintenance mode
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.maintenanceMode}
                                                    onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* UI Settings */}
                        {activeTab === "ui" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="w-5 h-5" />
                                        UI & Content Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Primary Color
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.primaryColor}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                className="w-12 h-10 rounded border border-gray-300"
                                            />
                                            <input
                                                type="text"
                                                value={settings.primaryColor}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Footer Message
                                        </label>
                                        <textarea
                                            value={settings.footerMessage}
                                            onChange={(e) => handleInputChange("footerMessage", e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            About Message
                                        </label>
                                        <textarea
                                            value={settings.aboutMessage}
                                            onChange={(e) => handleInputChange("aboutMessage", e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Security Settings */}
                        {activeTab === "security" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Session Timeout (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Password Minimum Length
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.passwordMinLength}
                                                onChange={(e) => handleInputChange("passwordMinLength", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Login Attempts
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.maxLoginAttempts}
                                                onChange={(e) => handleInputChange("maxLoginAttempts", parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Enable Two-Factor Authentication
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                Require 2FA for admin accounts
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableTwoFactor}
                                                onChange={(e) => handleInputChange("enableTwoFactor", e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
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
