// src/pages/admin/ManageUsers.tsx
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
    Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: "student" | "admin" | "super_admin";
    status: "active" | "blocked" | "pending";
    university?: string;
    lastLogin?: string;
    createdAt: string;
    examsTaken?: number;
    totalExams?: number;
}

const mockUsers: User[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@student.uoc.lk",
        phone: "+94771234567",
        role: "student",
        status: "active",
        university: "University of Colombo",
        lastLogin: "2025-07-09T10:30:00",
        createdAt: "2025-01-15T08:00:00",
        examsTaken: 3,
        totalExams: 5
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@admin.uoc.lk",
        phone: "+94771234568",
        role: "admin",
        status: "active",
        university: "University of Colombo",
        lastLogin: "2025-07-09T14:15:00",
        createdAt: "2025-02-01T09:00:00",
        totalExams: 12
    },
    {
        id: 3,
        name: "Robert Johnson",
        email: "robert.j@student.pera.lk",
        role: "student",
        status: "blocked",
        university: "University of Peradeniya",
        lastLogin: "2025-07-05T16:45:00",
        createdAt: "2025-03-10T10:30:00",
        examsTaken: 1,
        totalExams: 2
    },
    {
        id: 4,
        name: "Emily Davis",
        email: "emily.davis@student.mora.lk",
        phone: "+94771234569",
        role: "student",
        status: "pending",
        university: "University of Moratuwa",
        createdAt: "2025-07-08T11:00:00",
        examsTaken: 0,
        totalExams: 0
    },
    {
        id: 5,
        name: "Michael Wilson",
        email: "michael.wilson@admin.ucsc.lk",
        role: "admin",
        status: "active",
        university: "University of Colombo School of Computing",
        lastLogin: "2025-07-08T13:20:00",
        createdAt: "2025-04-20T14:00:00",
        totalExams: 8
    },
    {
        id: 6,
        name: "Sarah Brown",
        email: "sarah.brown@student.ruh.lk",
        phone: "+94771234570",
        role: "student",
        status: "active",
        university: "University of Ruhuna",
        lastLogin: "2025-07-07T09:10:00",
        createdAt: "2025-05-15T16:30:00",
        examsTaken: 2,
        totalExams: 4
    }
];

const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "student", label: "Students" },
    { value: "admin", label: "Admins" },
    { value: "super_admin", label: "Super Admins" }
];

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "blocked", label: "Blocked" },
    { value: "pending", label: "Pending" }
];

const getRoleColor = (role: string) => {
    switch (role) {
        case "student": return "bg-blue-100 text-blue-800";
        case "admin": return "bg-purple-100 text-purple-800";
        case "super_admin": return "bg-red-100 text-red-800";
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
        case "student": return <Users className="w-3 h-3" />;
        case "admin": return <Shield className="w-3 h-3" />;
        case "super_admin": return <ShieldCheck className="w-3 h-3" />;
        default: return <Users className="w-3 h-3" />;
    }
};

export default function ManageUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === "all" || user.role === selectedRole;
            const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, selectedRole, selectedStatus]);

    const stats = useMemo(() => {
        const total = users.length;
        const students = users.filter(u => u.role === "student").length;
        const admins = users.filter(u => u.role === "admin").length;
        const active = users.filter(u => u.status === "active").length;
        const blocked = users.filter(u => u.status === "blocked").length;
        const pending = users.filter(u => u.status === "pending").length;

        return { total, students, admins, active, blocked, pending };
    }, [users]);

    const handleDeleteUser = (id: number) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            setUsers(prev => prev.filter(user => user.id !== id));
        }
    };

    const handleBlockUser = (id: number) => {
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: user.status === "blocked" ? "active" : "blocked" as const } : user
        ));
    };

    const handleResetPassword = (id: number) => {
        const user = users.find(u => u.id === id);
        if (user) {
            alert(`Password reset email sent to ${user.email}`);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
        setOpenPopoverId(null); // Close the popover
    };

    const handleSaveEdit = () => {
        if (editingUser) {
            setUsers(prev => prev.map(user =>
                user.id === editingUser.id ? editingUser : user
            ));
            setShowEditModal(false);
            setEditingUser(null);
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
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
                            <p className="text-gray-600 text-sm">Manage student and admin accounts</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New User
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Students</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Admins</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                                </div>
                                <Shield className="w-8 h-8 text-purple-600" />
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
                                    <p className="text-sm text-gray-600">Blocked</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                                </div>
                                <UserX className="w-8 h-8 text-red-600" />
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
                                    placeholder="Search users by name or email..."
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
                            <Users className="w-5 h-5" />
                            Users ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>University</TableHead>
                                        <TableHead>Performance</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id} • Joined {formatDate(user.createdAt)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{user.email}</span>
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span className="text-sm">{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                                                    {getRoleIcon(user.role)}
                                                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(user.status)} w-fit`}>
                                                    <span className="capitalize">{user.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.university}</div>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === "student" ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium">
                                                            {user.examsTaken}/{user.totalExams} exams
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {user.totalExams ? Math.round((user.examsTaken! / user.totalExams) * 100) : 0}% completion
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm">
                                                        <div className="font-medium">{user.totalExams} exams managed</div>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Popover open={openPopoverId === user.id} onOpenChange={(open) => setOpenPopoverId(open ? user.id : null)}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setOpenPopoverId(user.id)}>
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
                                                                onClick={() => handleEditUser(user)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit User
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start"
                                                                onClick={() => handleResetPassword(user.id)}
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                                Reset Password
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`justify-start ${user.status === "blocked" ? "text-green-600" : "text-orange-600"}`}
                                                                onClick={() => handleBlockUser(user.id)}
                                                            >
                                                                {user.status === "blocked" ? (
                                                                    <>
                                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                                        Unblock User
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserX className="w-4 h-4 mr-2" />
                                                                        Block User
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start text-red-600"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete User
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
                {filteredUsers.length === 0 && (
                    <Card className="mt-6">
                        <CardContent className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                                    ? "Try adjusting your filters to see more results."
                                    : "Get started by adding your first user."}
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New User
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Edit User Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'student' | 'admin' | 'super_admin' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editingUser.status}
                                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'blocked' | 'pending' })}
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
