// src/pages/orgAdmin/ManageUsers.tsx
import { useState, useEffect } from "react";
import { Users, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { orgAdminApi, type OrgAdmin } from "@/lib/orgAdminApi";
import { useToast } from "@/hooks/use-toast";

export default function ManageUsers() {
    const [admins, setAdmins] = useState<OrgAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { toast } = useToast();

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await orgAdminApi.getOrgAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Failed to load administrators:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name || !formData.email || !formData.password) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error", 
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsCreating(true);
            await orgAdminApi.createOrgAdmin({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            toast({
                title: "Success",
                description: "Administrator created successfully.",
            });
            
            // Reset form and close modal
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            setIsModalOpen(false);
            
            // Reload admins list
            await loadAdmins();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create administrator.",
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
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Administrators</h1>
                    <p className="text-muted-foreground">
                        Manage administrators in your organization
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Administrators</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{admins.length}</div>
                        <p className="text-xs text-muted-foreground">
                            In your organization
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Administrators ({admins.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading administrators...</div>
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
                                <div className="mt-4">
                                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add First Administrator
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Create New Administrator</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="text-sm font-medium">
                                                        Name *
                                                    </label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        type="text"
                                                        placeholder="Enter administrator name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className="text-sm font-medium">
                                                        Email *
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="password" className="text-sm font-medium">
                                                        Password *
                                                    </label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        placeholder="Enter password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                                                        Confirm Password *
                                                    </label>
                                                    <Input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        placeholder="Confirm password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2 pt-4">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setIsModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isCreating}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isCreating ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            'Create Administrator'
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-green-600 mr-2" />
                                        <div>
                                            <h4 className="font-medium text-green-900">Admin Management Ready</h4>
                                            <p className="text-sm text-green-700">
                                                You have {admins.length} administrator{admins.length !== 1 ? 's' : ''} in your organization.
                                            </p>
                                        </div>
                                    </div>
                                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Administrator
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Create New Administrator</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="text-sm font-medium">
                                                        Name *
                                                    </label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        type="text"
                                                        placeholder="Enter administrator name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className="text-sm font-medium">
                                                        Email *
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="password" className="text-sm font-medium">
                                                        Password *
                                                    </label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        placeholder="Enter password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                                                        Confirm Password *
                                                    </label>
                                                    <Input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        placeholder="Confirm password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2 pt-4">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setIsModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isCreating}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isCreating ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            'Create Administrator'
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            
                            {/* List of existing administrators */}
                            <div className="bg-white rounded-lg border">
                                <div className="p-6">
                                    <h4 className="font-medium text-gray-900 mb-4">Current Administrators</h4>
                                    <div className="space-y-3">
                                        {admins.map((admin) => (
                                            <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{admin.name}</p>
                                                        <p className="text-sm text-gray-500">{admin.user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Created {new Date(admin.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
