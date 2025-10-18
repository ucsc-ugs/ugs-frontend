// src/pages/orgAdmin/ManageUsers.tsx
import { useState, useEffect } from "react";
import { Users, Plus, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { orgAdminApi, type OrgAdmin } from "@/lib/orgAdminApi";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// Permission categories and their permissions
const PERMISSION_GROUPS = [
    {
        category: 'Organization Management',
        icon: '🏢',
        permissions: [
            { value: 'organization.view', label: 'View Organization Details' },
            { value: 'organization.update', label: 'Update Organization Details' },
            { value: 'organization.admins.create', label: 'Create Administrators' },
            { value: 'organization.admins.view', label: 'View Administrators' },
            { value: 'organization.admins.update', label: 'Update Administrators' },
            { value: 'organization.admins.delete', label: 'Delete Administrators' },
        ]
    },
    {
        category: 'Student Management',
        icon: '👨‍🎓',
        permissions: [
            { value: 'student.create', label: 'Create Students' },
            { value: 'student.view', label: 'View Students' },
            { value: 'student.update', label: 'Update Students' },
            { value: 'student.delete', label: 'Delete Students' },
            { value: 'student.detail.view', label: 'View Student Details' },
        ]
    },
    {
        category: 'Exam Management',
        icon: '📝',
        permissions: [
            { value: 'exam.create', label: 'Create Exams' },
            { value: 'exam.view', label: 'View Exams' },
            { value: 'exam.update', label: 'Update Exams' },
            { value: 'exam.schedule.set', label: 'Set Exam Schedule' },
            { value: 'exam.schedule.update', label: 'Update Exam Schedule' },
            { value: 'exam.registration.deadline.set', label: 'Set Registration Deadline' },
            { value: 'exam.registration.deadline.extend', label: 'Extend Registration Deadline' },
        ]
    },
    {
        category: 'Payment Management',
        icon: '💳',
        permissions: [
            { value: 'payments.view', label: 'View Payments' },
            { value: 'payments.create', label: 'Create Payments' },
            { value: 'payments.update', label: 'Update Payments' },
        ]
    },
    {
        category: 'Announcement Management',
        icon: '📢',
        permissions: [
            { value: 'announcement.create', label: 'Create Announcements' },
            { value: 'announcement.view', label: 'View Announcements' },
            { value: 'announcement.update', label: 'Update Announcements' },
            { value: 'announcement.publish', label: 'Publish Announcements' },
        ]
    },
];

export default function ManageUsers() {
    const [admins, setAdmins] = useState<OrgAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<OrgAdmin | null>(null);
    const [adminToDelete, setAdminToDelete] = useState<OrgAdmin | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: ''
    });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [editPermissions, setEditPermissions] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [editExpandedCategories, setEditExpandedCategories] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [editFieldErrors, setEditFieldErrors] = useState({
        name: '',
        email: ''
    });
    const { toast } = useToast();

    // Password strength calculation
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength: 1, label: 'Weak', color: 'text-red-600 bg-red-100' };
        if (strength <= 3) return { strength: 2, label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
        return { strength: 3, label: 'Strong', color: 'text-green-600 bg-green-100' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    useEffect(() => {
        // Check if token exists before loading
        const token = localStorage.getItem('auth_token');
        console.log('ManageUsers: Component mounted, token exists:', !!token);
        
        if (token) {
            loadAdmins();
        } else {
            console.warn('ManageUsers: No auth token found');
            setLoading(false);
            toast({
                title: "Authentication Required",
                description: "Please log in to view administrators.",
                variant: "destructive",
            });
        }
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await orgAdminApi.getOrgAdmins();
            console.log('Loaded admins:', data);
            setAdmins(data);
        } catch (error: any) {
            console.error('Failed to load administrators:', error);
            toast({
                title: "Error Loading Administrators",
                description: error.message || "Failed to load administrators. Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset form when modal closes
    const handleModalChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // Reset form when closing
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
            setSelectedPermissions([]);
            setExpandedCategories([]);
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    };

    // Real-time field validation
    const validateField = (name: string, value: string) => {
        let error = '';
        
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
                break;
            case 'password':
                if (!value) error = 'Password is required';
                else if (value.length < 8) error = 'Password must be at least 8 characters';
                break;
            case 'confirmPassword':
                if (!value) error = 'Please confirm your password';
                else if (value !== formData.password) error = 'Passwords do not match';
                break;
        }
        
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const nameValid = validateField('name', formData.name);
        const emailValid = validateField('email', formData.email);
        const passwordValid = validateField('password', formData.password);
        const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

        if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form.",
                variant: "destructive",
            });
            return;
        }

        // Check if at least one permission is selected
        if (selectedPermissions.length === 0) {
            toast({
                title: "Permissions Required",
                description: "Please select at least one permission for the administrator.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsCreating(true);
            await orgAdminApi.createOrgAdmin({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                permissions: selectedPermissions
            });
            
            toast({
                title: "Success",
                description: `Administrator "${formData.name}" has been created successfully with ${selectedPermissions.length} permission(s).`,
            });
            
            // Close modal (will trigger reset via handleModalChange)
            setIsModalOpen(false);
            
            // Reload admins list
            await loadAdmins();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create administrator. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Real-time validation for confirm password when password field changes
        if (name === 'password' && formData.confirmPassword) {
            validateField('confirmPassword', formData.confirmPassword);
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    // Permission handlers
    const togglePermission = (permission: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const toggleCategoryPermissions = (categoryPermissions: string[]) => {
        const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
        if (allSelected) {
            // Deselect all in category
            setSelectedPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)));
        } else {
            // Select all in category
            setSelectedPermissions(prev => {
                const newPerms = [...prev];
                categoryPermissions.forEach(p => {
                    if (!newPerms.includes(p)) {
                        newPerms.push(p);
                    }
                });
                return newPerms;
            });
        }
    };

    const selectAllPermissions = () => {
        const allPermissions = PERMISSION_GROUPS.flatMap(group => 
            group.permissions.map(p => p.value)
        );
        setSelectedPermissions(allPermissions);
    };

    const deselectAllPermissions = () => {
        setSelectedPermissions([]);
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const expandAllCategories = () => {
        setExpandedCategories(PERMISSION_GROUPS.map(g => g.category));
    };

    const collapseAllCategories = () => {
        setExpandedCategories([]);
    };

    // Edit handlers
    const handleEditClick = (admin: OrgAdmin) => {
        setSelectedAdmin(admin);
        setEditFormData({
            name: admin.data.name,
            email: admin.data.email
        });
        setEditPermissions(admin.meta.permissions);
        setEditExpandedCategories([]);
        setEditFieldErrors({ name: '', email: '' });
        setIsEditModalOpen(true);
    };

    const handleEditModalChange = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
            setSelectedAdmin(null);
            setEditFormData({ name: '', email: '' });
            setEditPermissions([]);
            setEditExpandedCategories([]);
            setEditFieldErrors({ name: '', email: '' });
        }
    };

    const validateEditField = (name: string, value: string) => {
        let error = '';
        
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
                break;
        }
        
        setEditFieldErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (editFieldErrors[name as keyof typeof editFieldErrors]) {
            setEditFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleEditInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        validateEditField(name, value);
    };

    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAdmin) return;

        const nameValid = validateEditField('name', editFormData.name);
        const emailValid = validateEditField('email', editFormData.email);

        if (!nameValid || !emailValid) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form.",
                variant: "destructive",
            });
            return;
        }

        if (editPermissions.length === 0) {
            toast({
                title: "Permissions Required",
                description: "Please select at least one permission for the administrator.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUpdating(true);
            await orgAdminApi.updateOrgAdmin(selectedAdmin.id, {
                name: editFormData.name.trim(),
                email: editFormData.email.trim(),
                permissions: editPermissions
            });
            
            toast({
                title: "Success",
                description: `Administrator "${editFormData.name}" has been updated successfully.`,
            });
            
            setIsEditModalOpen(false);
            await loadAdmins();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update administrator. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Edit permission handlers
    const toggleEditPermission = (permission: string) => {
        setEditPermissions(prev => 
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const toggleEditCategoryPermissions = (categoryPermissions: string[]) => {
        const allSelected = categoryPermissions.every(p => editPermissions.includes(p));
        if (allSelected) {
            setEditPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)));
        } else {
            setEditPermissions(prev => {
                const newPerms = [...prev];
                categoryPermissions.forEach(p => {
                    if (!newPerms.includes(p)) {
                        newPerms.push(p);
                    }
                });
                return newPerms;
            });
        }
    };

    const selectAllEditPermissions = () => {
        const allPermissions = PERMISSION_GROUPS.flatMap(group => 
            group.permissions.map(p => p.value)
        );
        setEditPermissions(allPermissions);
    };

    const deselectAllEditPermissions = () => {
        setEditPermissions([]);
    };

    const toggleEditCategory = (category: string) => {
        setEditExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const expandAllEditCategories = () => {
        setEditExpandedCategories(PERMISSION_GROUPS.map(g => g.category));
    };

    const collapseAllEditCategories = () => {
        setEditExpandedCategories([]);
    };

    // Delete handlers
    const handleDeleteClick = (admin: OrgAdmin) => {
        setAdminToDelete(admin);
    };

    const handleDeleteConfirm = async () => {
        if (!adminToDelete) return;

        try {
            setIsDeleting(true);
            await orgAdminApi.deleteOrgAdmin(adminToDelete.id);
            
            toast({
                title: "Success",
                description: `Administrator "${adminToDelete.data.name}" has been deleted successfully.`,
            });
            
            setAdminToDelete(null);
            await loadAdmins();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete administrator. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setAdminToDelete(null);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Administrators</h1>
                            <p className="text-gray-600 text-sm">Manage administrators in your organization</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Administrator
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">Create New Administrator</DialogTitle>
                                    <DialogDescription className="text-sm text-gray-500">
                                        Add a new administrator to your organization. They will receive access to the admin portal.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateAdmin} className="space-y-5">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="e.g., John Doe"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            className={fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isCreating}
                                        />
                                        {fieldErrors.name && (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{fieldErrors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isCreating}
                                        />
                                        {fieldErrors.email && (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{fieldErrors.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            Password <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter a strong password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                className={fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                                                disabled={isCreating}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                disabled={isCreating}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {fieldErrors.password ? (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{fieldErrors.password}</span>
                                            </div>
                                        ) : formData.password && passwordStrength.strength > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${
                                                            passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                                                            passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                                                            'bg-green-500 w-full'
                                                        }`}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${passwordStrength.color}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Must be at least 8 characters with a mix of letters, numbers, and symbols
                                        </p>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Re-enter password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                className={fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
                                                disabled={isCreating}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                disabled={isCreating}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirmPassword ? (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{fieldErrors.confirmPassword}</span>
                                            </div>
                                        ) : formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                <span>Passwords match</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Permissions Section */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                <Label className="text-base font-semibold text-gray-900">
                                                    Permissions <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={expandAllCategories}
                                                    disabled={isCreating}
                                                    className="text-xs"
                                                >
                                                    Expand All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={collapseAllCategories}
                                                    disabled={isCreating}
                                                    className="text-xs"
                                                >
                                                    Collapse All
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-blue-700">{selectedPermissions.length}</span> permission(s) selected
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={selectAllPermissions}
                                                    disabled={isCreating}
                                                    className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={deselectAllPermissions}
                                                    disabled={isCreating || selectedPermissions.length === 0}
                                                    className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                            {PERMISSION_GROUPS.map((group) => {
                                                const groupPermissionValues = group.permissions.map(p => p.value);
                                                const allSelected = groupPermissionValues.every(p => selectedPermissions.includes(p));
                                                const someSelected = groupPermissionValues.some(p => selectedPermissions.includes(p));
                                                const selectedCount = groupPermissionValues.filter(p => selectedPermissions.includes(p)).length;
                                                const isExpanded = expandedCategories.includes(group.category);

                                                return (
                                                    <div key={group.category} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        {/* Category Header - Always Visible */}
                                                        <div
                                                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                            onClick={() => toggleCategory(group.category)}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                    disabled={isCreating}
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <Checkbox
                                                                    checked={allSelected}
                                                                    onCheckedChange={() => toggleCategoryPermissions(groupPermissionValues)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    disabled={isCreating}
                                                                    className={someSelected && !allSelected ? 'data-[state=checked]:bg-blue-400' : ''}
                                                                />
                                                                <span className="text-lg mr-1">{group.icon}</span>
                                                                <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                                                                    {group.category}
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                                    selectedCount === 0 ? 'bg-gray-200 text-gray-600' :
                                                                    selectedCount === groupPermissionValues.length ? 'bg-green-100 text-green-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {selectedCount}/{groupPermissionValues.length}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Category Content - Collapsible */}
                                                        {isExpanded && (
                                                            <div className="bg-white p-3 space-y-2 border-t">
                                                                {group.permissions.map((permission) => (
                                                                    <div key={permission.value} className="flex items-center gap-2 pl-6 py-1 hover:bg-gray-50 rounded transition-colors">
                                                                        <Checkbox
                                                                            id={permission.value}
                                                                            checked={selectedPermissions.includes(permission.value)}
                                                                            onCheckedChange={() => togglePermission(permission.value)}
                                                                            disabled={isCreating}
                                                                        />
                                                                        <Label
                                                                            htmlFor={permission.value}
                                                                            className="text-sm text-gray-700 cursor-pointer font-normal flex-1"
                                                                        >
                                                                            {permission.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {selectedPermissions.length === 0 && (
                                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>Please select at least one permission to create the administrator</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => handleModalChange(false)}
                                            disabled={isCreating}
                                            className="min-w-[80px]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={isCreating}
                                            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Admin
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Administrator Dialog */}
                        <Dialog open={isEditModalOpen} onOpenChange={handleEditModalChange}>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">Edit Administrator</DialogTitle>
                                    <DialogDescription className="text-sm text-gray-500">
                                        Update administrator details and permissions.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateAdmin} className="space-y-5">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            type="text"
                                            placeholder="e.g., John Doe"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            onBlur={handleEditInputBlur}
                                            className={editFieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isUpdating}
                                        />
                                        {editFieldErrors.name && (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{editFieldErrors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-email"
                                            name="email"
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={editFormData.email}
                                            onChange={handleEditInputChange}
                                            onBlur={handleEditInputBlur}
                                            className={editFieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isUpdating}
                                        />
                                        {editFieldErrors.email && (
                                            <div className="flex items-center gap-1 text-sm text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span>{editFieldErrors.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Permissions Section */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                <Label className="text-base font-semibold text-gray-900">
                                                    Permissions <span className="text-red-500">*</span>
                                                </Label>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={expandAllEditCategories}
                                                    disabled={isUpdating}
                                                    className="text-xs"
                                                >
                                                    Expand All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={collapseAllEditCategories}
                                                    disabled={isUpdating}
                                                    className="text-xs"
                                                >
                                                    Collapse All
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-blue-700">{editPermissions.length}</span> permission(s) selected
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={selectAllEditPermissions}
                                                    disabled={isUpdating}
                                                    className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={deselectAllEditPermissions}
                                                    disabled={isUpdating || editPermissions.length === 0}
                                                    className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-100"
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                            {PERMISSION_GROUPS.map((group) => {
                                                const groupPermissionValues = group.permissions.map(p => p.value);
                                                const allSelected = groupPermissionValues.every(p => editPermissions.includes(p));
                                                const someSelected = groupPermissionValues.some(p => editPermissions.includes(p));
                                                const selectedCount = groupPermissionValues.filter(p => editPermissions.includes(p)).length;
                                                const isExpanded = editExpandedCategories.includes(group.category);

                                                return (
                                                    <div key={group.category} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div
                                                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                            onClick={() => toggleEditCategory(group.category)}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                    disabled={isUpdating}
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <Checkbox
                                                                    checked={allSelected}
                                                                    onCheckedChange={() => toggleEditCategoryPermissions(groupPermissionValues)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    disabled={isUpdating}
                                                                    className={someSelected && !allSelected ? 'data-[state=checked]:bg-blue-400' : ''}
                                                                />
                                                                <span className="text-lg mr-1">{group.icon}</span>
                                                                <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
                                                                    {group.category}
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                                    selectedCount === 0 ? 'bg-gray-200 text-gray-600' :
                                                                    selectedCount === groupPermissionValues.length ? 'bg-green-100 text-green-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {selectedCount}/{groupPermissionValues.length}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="bg-white p-3 space-y-2 border-t">
                                                                {group.permissions.map((permission) => (
                                                                    <div key={permission.value} className="flex items-center gap-2 pl-6 py-1 hover:bg-gray-50 rounded transition-colors">
                                                                        <Checkbox
                                                                            id={`edit-${permission.value}`}
                                                                            checked={editPermissions.includes(permission.value)}
                                                                            onCheckedChange={() => toggleEditPermission(permission.value)}
                                                                            disabled={isUpdating}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`edit-${permission.value}`}
                                                                            className="text-sm text-gray-700 cursor-pointer font-normal flex-1"
                                                                        >
                                                                            {permission.label}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {editPermissions.length === 0 && (
                                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>Please select at least one permission</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => handleEditModalChange(false)}
                                            disabled={isUpdating}
                                            className="min-w-[80px]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={isUpdating}
                                            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Administrator'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Confirmation Dialog */}
                        <ConfirmDialog
                            isOpen={!!adminToDelete}
                            onCancel={handleDeleteCancel}
                            onConfirm={handleDeleteConfirm}
                            title="Delete Administrator"
                            message={`Are you sure you want to delete "${adminToDelete?.data.name}"? This action cannot be undone.`}
                            confirmText={isDeleting ? "Deleting..." : "Delete"}
                            cancelText="Cancel"
                        >
                            {isDeleting && (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                </div>
                            )}
                        </ConfirmDialog>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Administrators</p>
                                    <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Administrators</p>
                                    <p className="text-2xl font-bold text-green-600">{admins.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Administrators List */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Administrators ({admins.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <p className="text-gray-600">Loading administrators...</p>
                                </div>
                            </div>
                        ) : admins.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <div className="mb-4">
                                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <h3 className="text-lg font-medium">No administrators found</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        You can create new administrators for your organization.
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                    <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        As an organization admin, you can:
                                    </p>
                                    <ul className="text-sm text-blue-700 text-left space-y-1">
                                        <li>• Create new administrators for your organization</li>
                                        <li>• View and manage existing administrators</li>
                                        <li>• Update administrator details</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {admins.map((admin) => (
                                    <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center flex-1">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{admin.data.name}</p>
                                                <p className="text-sm text-gray-500">{admin.data.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-gray-500">
                                                    {admin.meta.permissions.length} permission{admin.meta.permissions.length !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Created {new Date(admin.data.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClick(admin)}
                                                    className="h-8 px-3"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(admin)}
                                                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
