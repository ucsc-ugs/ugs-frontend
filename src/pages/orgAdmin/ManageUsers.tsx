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
        name: "Nimal K. Perera",
        email: "nimal.perera@admin.ucsc.cmb.ac.lk",
        phone: "+94771234568",
        role: "admin",
        status: "active",
        department: "",
        permissions: ["manage_students", "view_reports"],
        lastLogin: "2025-07-09T14:15:00",
        createdAt: "2025-02-01T09:00:00",
        examsManaged: 0,
        studentsManaged: 245
    },
    {
        id: 2,
        name: "Kumari S. Fernando",
        email: "kumari.fernando@admin.ucsc.cmb.ac.lk",
        role: "super_admin",
        status: "active",
        department: "Exam: CS2010 - Database Management Systems Midterm",
        permissions: ["manage_exams", "view_reports"],
        lastLogin: "2025-07-08T13:20:00",
        createdAt: "2025-04-20T14:00:00",
        examsManaged: 8,
        studentsManaged: 0
    },
    {
        id: 3,
        name: "Sunil A. Jayasinghe",
        email: "sunil.jayasinghe@admin.ucsc.cmb.ac.lk",
        phone: "+94771234569",
        role: "department_admin",
        status: "active",
        department: "Mathematics & Statistics",
        permissions: ["manage_department", "view_reports"],
        lastLogin: "2025-07-07T09:10:00",
        createdAt: "2025-05-15T16:30:00",
        examsManaged: 6,
        studentsManaged: 120
    },
    {
        id: 4,
        name: "Chaminda R. Silva",
        email: "chaminda.silva@admin.ucsc.cmb.ac.lk",
        role: "admin",
        status: "pending",
        department: "",
        permissions: ["manage_students"],
        createdAt: "2025-07-08T11:00:00",
        examsManaged: 0,
        studentsManaged: 0
    },
    {
        id: 5,
        name: "Priyanka M. Wickramasinghe",
        email: "priyanka.wickramasinghe@admin.ucsc.cmb.ac.lk",
        phone: "+94771234570",
        role: "department_admin",
        status: "blocked",
        department: "Information Systems",
        permissions: ["manage_department"],
        lastLogin: "2025-07-05T16:45:00",
        createdAt: "2025-03-10T10:30:00",
        examsManaged: 4,
        studentsManaged: 85
    },
    {
        id: 6,
        name: "Kasun T. Rajapaksa",
        email: "kasun.rajapaksa@admin.ucsc.cmb.ac.lk",
        phone: "+94771234571",
        role: "super_admin",
        status: "active",
        department: "Exam: CS2001 - Data Structures & Algorithms Final Exam",
        permissions: ["manage_exams", "view_reports"],
        lastLogin: "2025-07-06T10:30:00",
        createdAt: "2025-03-15T08:00:00",
        examsManaged: 5,
        studentsManaged: 0
    }
];

const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Student Admins" },
    { value: "super_admin", label: "Exams Admins" },
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

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case "admin": return "Student Admin";
        case "super_admin": return "Exams Admin";
        case "department_admin": return "Department Admin";
        default: return role;
    }
};

// Mock data for exams and departments
const mockExams = [
    { id: 1, title: "Data Structures & Algorithms Final Exam", code: "CS2001" },
    { id: 2, title: "Database Management Systems Midterm", code: "CS2010" },
    { id: 3, title: "Software Engineering Project Evaluation", code: "CS3001" },
    { id: 4, title: "Network Security Assessment", code: "CS3020" },
    { id: 5, title: "Machine Learning Practical Exam", code: "CS4001" },
    { id: 6, title: "Advanced Mathematics Final", code: "MATH201" },
    { id: 7, title: "Statistics & Probability Assessment", code: "STAT301" }
];

const mockDepartments = [
    { id: 1, name: "Computer Science", code: "CS" },
    { id: 2, name: "Information Systems", code: "IS" },
    { id: 3, name: "Software Engineering", code: "SE" },
    { id: 4, name: "Mathematics & Statistics", code: "MATH" },
    { id: 5, name: "Physical Sciences", code: "PS" },
    { id: 6, name: "Management Studies", code: "MGT" },
    { id: 7, name: "Library & Information Science", code: "LIS" }
];

export default function ManageAdmins() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
    const [selectedExam, setSelectedExam] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

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

    const handleEditAdmin = (admin: Admin) => {
        setEditingAdmin({ ...admin });

        // Set initial selections based on admin's current data
        if (admin.role === "super_admin" && admin.department?.startsWith("Exam:")) {
            // Extract exam ID from department field if it contains exam info
            const examMatch = admin.department.match(/Exam: (\w+)/);
            if (examMatch) {
                const examCode = examMatch[1];
                const exam = mockExams.find(e => e.code === examCode);
                setSelectedExam(exam ? exam.id.toString() : "");
            }
            setSelectedDepartment("");
        } else if (admin.role === "department_admin" && admin.department && !admin.department.startsWith("Exam:")) {
            // Find department ID from name
            const dept = mockDepartments.find(d => d.name === admin.department);
            setSelectedDepartment(dept ? dept.id.toString() : "");
            setSelectedExam("");
        } else {
            setSelectedExam("");
            setSelectedDepartment("");
        }

        setShowEditModal(true);
        setOpenPopoverId(null); // Close the popover
    };

    const handleSaveEdit = () => {
        if (editingAdmin) {
            const updatedAdmin = { ...editingAdmin };

            // Handle department assignment for Department Admin
            if (editingAdmin.role === "department_admin" && selectedDepartment) {
                const dept = mockDepartments.find(d => d.id.toString() === selectedDepartment);
                updatedAdmin.department = dept?.name;
            }

            // Handle exam assignment for Exams Admin (you might want to store this in a different field)
            if (editingAdmin.role === "super_admin" && selectedExam) {
                const exam = mockExams.find(e => e.id.toString() === selectedExam);
                // For now, we'll store the exam info in the department field, but you might want a separate field
                updatedAdmin.department = `Exam: ${exam?.code} - ${exam?.title}`;
            }

            // For Student Admin, clear department
            if (editingAdmin.role === "admin") {
                updatedAdmin.department = "";
            }

            if (admins.find(a => a.id === editingAdmin.id)) {
                // Editing existing admin
                setAdmins(prev => prev.map(admin =>
                    admin.id === editingAdmin.id ? updatedAdmin : admin
                ));
            } else {
                // Adding new admin
                setAdmins(prev => [...prev, updatedAdmin]);
            }

            setShowEditModal(false);
            setShowAddForm(false);
            setEditingAdmin(null);
            setSelectedExam("");
            setSelectedDepartment("");
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
                {!showAddForm ? (
                    <>
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
                                        status: "active",
                                        permissions: [],
                                        createdAt: new Date().toISOString(),
                                    });
                                    setSelectedExam("");
                                    setSelectedDepartment("");
                                    setShowAddForm(true);
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
                                            <p className="text-sm text-gray-600">Student Admins</p>
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
                                            <p className="text-sm text-gray-600">Exams Admins</p>
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
                                            placeholder="Search admins by name, email, or assignment..."
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
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Responsibility</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAdmins.map((admin) => (
                                                <TableRow key={admin.id}>
                                                    <TableCell>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <div className="font-medium">{admin.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {admin.id} • Joined {formatDate(admin.createdAt)}
                                                                </div>
                                                            </div>
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
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${getRoleColor(admin.role)} flex items-center gap-1 w-fit`}>
                                                            {getRoleIcon(admin.role)}
                                                            <span className="capitalize">{getRoleDisplayName(admin.role)}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Badge className={`${getStatusColor(admin.status)} w-fit`}>
                                                                <span className="capitalize">{admin.status}</span>
                                                            </Badge>
                                                            <div className="text-xs text-gray-500">
                                                                Last: {admin.lastLogin ? formatDateTime(admin.lastLogin) : "Never"}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm space-y-1">
                                                            {admin.role === "admin" && (
                                                                <div>
                                                                    <div className="font-medium">Student Management</div>
                                                                    <div className="font-medium text-blue-600">
                                                                        {admin.studentsManaged || 0} students
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs">
                                                                        Student records & enrollment
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {admin.role === "super_admin" && (
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {admin.department?.startsWith("Exam:") ? admin.department.replace("Exam: ", "") : "Exam Assignment Pending"}
                                                                    </div>
                                                                    <div className="font-medium text-red-600">
                                                                        {admin.examsManaged || 0} exams
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs">
                                                                        Exam management & scheduling
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {admin.role === "department_admin" && (
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {admin.department && !admin.department.startsWith("Exam:") ? `${admin.department} Department` : "Department Assignment Pending"}
                                                                    </div>
                                                                    <div className="font-medium text-purple-600">
                                                                        {admin.studentsManaged || 0} students
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs">
                                                                        Department oversight
                                                                    </div>
                                                                </div>
                                                            )}
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
                    </>
                ) : (
                    /* Add New Admin Form */
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-xl">
                                            <Plus className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Add New Admin</CardTitle>
                                            <p className="text-gray-600 text-sm mt-1">Create a new administrator account</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setEditingAdmin(null);
                                            setSelectedExam("");
                                            setSelectedDepartment("");
                                        }}
                                    >
                                        Back to List
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Personal Information Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingAdmin?.name || ""}
                                                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={editingAdmin?.email || ""}
                                                    onChange={(e) => setEditingAdmin(prev => prev ? { ...prev, email: e.target.value } : null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role & Permissions Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Admin Role <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={editingAdmin?.role || "admin"}
                                                    onChange={(e) => {
                                                        const newRole = e.target.value as 'admin' | 'super_admin' | 'department_admin';
                                                        setEditingAdmin(prev => prev ? { ...prev, role: newRole } : null);
                                                        setSelectedExam("");
                                                        setSelectedDepartment("");
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="admin">Student Admin</option>
                                                    <option value="super_admin">Exams Admin</option>
                                                    <option value="department_admin">Department Admin</option>
                                                </select>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {editingAdmin?.role === "admin" && "Manages student records and enrollment"}
                                                    {editingAdmin?.role === "super_admin" && "Manages exams and assessments"}
                                                    {editingAdmin?.role === "department_admin" && "Manages department operations"}
                                                </p>
                                            </div>

                                            {/* Conditional Exam Selection for Exams Admin */}
                                            {editingAdmin?.role === "super_admin" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Assign Exam <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={selectedExam}
                                                        onChange={(e) => setSelectedExam(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select an exam to manage</option>
                                                        {mockExams.map(exam => (
                                                            <option key={exam.id} value={exam.id.toString()}>
                                                                {exam.code} - {exam.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        This admin will be responsible for managing the selected exam
                                                    </p>
                                                </div>
                                            )}

                                            {/* Conditional Department Selection for Department Admin */}
                                            {editingAdmin?.role === "department_admin" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Assign Department <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={selectedDepartment}
                                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select a department to manage</option>
                                                        {mockDepartments.map(dept => (
                                                            <option key={dept.id} value={dept.id.toString()}>
                                                                {dept.name} ({dept.code})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        This admin will oversee the selected department
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setEditingAdmin(null);
                                                setSelectedExam("");
                                                setSelectedDepartment("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveEdit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Admin
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Edit Admin Modal (for editing existing admins) */}
                {showEditModal && editingAdmin && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Edit Admin</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editingAdmin.name}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter admin name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingAdmin.email}
                                        onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingAdmin.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value as 'admin' | 'super_admin' | 'department_admin';
                                            setEditingAdmin({ ...editingAdmin, role: newRole });
                                            setSelectedExam("");
                                            setSelectedDepartment("");
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="admin">Student Admin</option>
                                        <option value="super_admin">Exams Admin</option>
                                        <option value="department_admin">Department Admin</option>
                                    </select>
                                </div>

                                {/* Conditional Exam Selection for Exams Admin */}
                                {editingAdmin.role === "super_admin" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                                        <select
                                            value={selectedExam}
                                            onChange={(e) => setSelectedExam(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select an exam</option>
                                            {mockExams.map(exam => (
                                                <option key={exam.id} value={exam.id.toString()}>
                                                    {exam.code} - {exam.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Conditional Department Selection for Department Admin */}
                                {editingAdmin.role === "department_admin" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select a department</option>
                                            {mockDepartments.map(dept => (
                                                <option key={dept.id} value={dept.id.toString()}>
                                                    {dept.name} ({dept.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedExam("");
                                        setSelectedDepartment("");
                                    }}
                                >
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
