// src/pages/orgAdmin/ManageUsers.tsx
import { useState, useMemo } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    Shield,
    ShieldCheck,
    UserX,
    MoreVertical,
    RefreshCw,
    Mail,
    Phone,
    Calendar,
    Crown
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Admin {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: "admin" | "super_admin" | "department_admin";
    status: "active" | "blocked" | "pending";
    department?: string;
    permissions: string[];
    lastLogin?: string;
    createdAt: string;
    examsManaged?: number;
    studentsManaged?: number;
}

const mockAdmins: Admin[] = [
    {
        id: 1,
        name: "Jane Smith",
        email: "jane.smith@admin.uoc.lk",
        phone: "+94771234568",
        role: "admin",
        status: "active",
        department: "Computer Science",
        permissions: ["manage_exams", "view_reports", "manage_students"],
        lastLogin: "2025-07-09T14:15:00",
        createdAt: "2025-02-01T09:00:00",
        examsManaged: 12,
        studentsManaged: 245
    },
    {
        id: 2,
        name: "Michael Wilson",
        email: "michael.wilson@admin.ucsc.lk",
        role: "super_admin",
        status: "active",
        department: "IT Administration",
        permissions: ["manage_exams", "manage_users", "view_reports", "system_settings"],
        lastLogin: "2025-07-08T13:20:00",
        createdAt: "2025-04-20T14:00:00",
        examsManaged: 8,
        studentsManaged: 180
    },
    {
        id: 3,
        name: "Sarah Johnson",
        email: "sarah.johnson@admin.uoc.lk",
        phone: "+94771234569",
        role: "department_admin",
        status: "active",
        department: "Mathematics",
        permissions: ["manage_exams", "view_reports"],
        lastLogin: "2025-07-07T09:10:00",
        createdAt: "2025-05-15T16:30:00",
        examsManaged: 6,
        studentsManaged: 120
    },
    {
        id: 4,
        name: "Robert Davis",
        email: "robert.davis@admin.uoc.lk",
        role: "admin",
        status: "pending",
        department: "Physics",
        permissions: ["view_reports"],
        createdAt: "2025-07-08T11:00:00",
        examsManaged: 0,
        studentsManaged: 0
    },
    {
        id: 5,
        name: "Emily Brown",
        email: "emily.brown@admin.uoc.lk",
        phone: "+94771234570",
        role: "department_admin",
        status: "blocked",
        department: "Chemistry",
        permissions: ["manage_exams"],
        lastLogin: "2025-07-05T16:45:00",
        createdAt: "2025-03-10T10:30:00",
        examsManaged: 4,
        studentsManaged: 85
    }
];

const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admins" },
    { value: "super_admin", label: "Super Admins" },
    { value: "department_admin", label: "Department Admins" }
];

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "blocked", label: "Blocked" },
    { value: "pending", label: "Pending" }
];

const getRoleColor = (role: string) => {
    switch (role) {
        case "admin": return "bg-blue-100 text-blue-800";
        case "super_admin": return "bg-red-100 text-red-800";
        case "department_admin": return "bg-purple-100 text-purple-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "active": return "bg-green-100 text-green-800";
        case "blocked": return "bg-red-100 text-red-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case "admin": return <Shield className="w-3 h-3" />;
        case "super_admin": return <Crown className="w-3 h-3" />;
        case "department_admin": return <Users className="w-3 h-3" />;
        default: return <Shield className="w-3 h-3" />;
    }
};

export default function ManageAdmins() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

    const filteredAdmins = useMemo(() => {
        return admins.filter(admin => {
            const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (admin.department && admin.department.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = selectedRole === "all" || admin.role === selectedRole;
            const matchesStatus = selectedStatus === "all" || admin.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [admins, searchTerm, selectedRole, selectedStatus]);

    const stats = useMemo(() => {
        const total = admins.length;
        const regularAdmins = admins.filter(a => a.role === "admin").length;
        const superAdmins = admins.filter(a => a.role === "super_admin").length;
        const departmentAdmins = admins.filter(a => a.role === "department_admin").length;
        const active = admins.filter(a => a.status === "active").length;
        const blocked = admins.filter(a => a.status === "blocked").length;
        const pending = admins.filter(a => a.status === "pending").length;

        return { total, regularAdmins, superAdmins, departmentAdmins, active, blocked, pending };
    }, [admins]);

    const handleDeleteAdmin = (id: number) => {
        if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            setAdmins(prev => prev.filter(admin => admin.id !== id));
        }
    };

    const handleBlockAdmin = (id: number) => {
        setAdmins(prev => prev.map(admin =>
            admin.id === id ? { ...admin, status: admin.status === "blocked" ? "active" : "blocked" as const } : admin
        ));
    };

    const handleResetPassword = (id: number) => {
        const admin = admins.find(a => a.id === id);
        if (admin) {
            alert(`Password reset email sent to ${admin.email}`);
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setEditingAdmin({ ...admin });
        setShowEditModal(true);
        setOpenPopoverId(null); // Close the popover
    };

    const handleSaveEdit = () => {
        if (editingAdmin) {
            setAdmins(prev => prev.map(admin =>
                admin.id === editingAdmin.id ? editingAdmin : admin
            ));
            setShowEditModal(false);
            setEditingAdmin(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
                            <p className="text-gray-600 text-sm">Manage organization administrators and their permissions</p>
                        </div>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                            setEditingAdmin({
                                id: Date.now(),
                                name: "",
                                email: "",
                                role: "admin",
                                status: "pending",
                                department: "",
                                permissions: [],
                                createdAt: new Date().toISOString(),
                            });
                            setShowEditModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Admin
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Admins</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Shield className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Regular Admins</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.regularAdmins}</p>
                                </div>
                                <Shield className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Super Admins</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.superAdmins}</p>
                                </div>
                                <Crown className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Department Admins</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.departmentAdmins}</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search admins by name, email, or department..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {roleOptions.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Administrators ({filteredAdmins.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Admin</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Management</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAdmins.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{admin.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {admin.id} • Joined {formatDate(admin.createdAt)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{admin.email}</span>
                                                    </div>
                                                    {admin.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span className="text-sm">{admin.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getRoleColor(admin.role)} flex items-center gap-1 w-fit`}>
                                                    {getRoleIcon(admin.role)}
                                                    <span className="capitalize">{admin.role.replace('_', ' ')}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(admin.status)} w-fit`}>
                                                    <span className="capitalize">{admin.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{admin.department || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {admin.examsManaged || 0} exams
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {admin.studentsManaged || 0} students
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {admin.lastLogin ? formatDateTime(admin.lastLogin) : "Never"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Popover open={openPopoverId === admin.id} onOpenChange={(open) => setOpenPopoverId(open ? admin.id : null)}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setOpenPopoverId(admin.id)}>
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48" align="end">
                                                        <div className="flex flex-col space-y-1">
                                                            <Button variant="ghost" size="sm" className="justify-start">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Profile
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start"
                                                                onClick={() => handleEditAdmin(admin)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Admin
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start"
                                                                onClick={() => handleResetPassword(admin.id)}
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                                Reset Password
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`justify-start ${admin.status === "blocked" ? "text-green-600" : "text-orange-600"}`}
                                                                onClick={() => handleBlockAdmin(admin.id)}
                                                            >
                                                                {admin.status === "blocked" ? (
                                                                    <>
                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                        Unblock Admin
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserX className="w-4 h-4 mr-2" />
                                                                        Block Admin
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start text-red-600"
                                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Admin
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State */}
                {filteredAdmins.length === 0 && (
                    <Card className="mt-6">
                        <CardContent className="text-center py-12">
                            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                                    ? "Try adjusting your filters to see more results."
                                    : "Get started by adding your first administrator."}
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Admin
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Admin Modal */}
                {showEditModal && editingAdmin && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingAdmin.id && admins.find(a => a.id === editingAdmin.id) ? 'Edit Admin' : 'Add New Admin'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editingAdmin.name}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingAdmin.email}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={editingAdmin.department || ''}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingAdmin.role}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as 'admin' | 'super_admin' | 'department_admin' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="department_admin">Department Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editingAdmin.status}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value as 'active' | 'blocked' | 'pending' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
