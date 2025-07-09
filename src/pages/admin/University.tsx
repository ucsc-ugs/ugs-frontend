// src/pages/admin/University.tsx
import { useState, useMemo } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    School,
    Users,
    BookOpen,
    Mail,
    Phone,
    MapPin,
    MoreVertical,
    Building,
    GraduationCap,
    Award
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface University {
    id: number;
    name: string;
    shortName: string;
    code: string;
    contactEmail: string;
    phone: string;
    address: string;
    website?: string;
    established: number;
    totalStudents: number;
    totalExams: number;
    adminCount: number;
    status: "active" | "inactive" | "pending";
    logo?: string;
    createdAt: string;
    updatedAt: string;
}

const mockUniversities: University[] = [
    {
        id: 1,
        name: "University of Colombo",
        shortName: "UoC",
        code: "UOC",
        contactEmail: "admin@uoc.lk",
        phone: "+94112581835",
        address: "College House, University of Colombo, Colombo 03",
        website: "https://www.cmb.ac.lk",
        established: 1921,
        totalStudents: 15420,
        totalExams: 45,
        adminCount: 8,
        status: "active",
        createdAt: "2025-01-01T00:00:00",
        updatedAt: "2025-07-01T10:00:00"
    },
    {
        id: 2,
        name: "University of Peradeniya",
        shortName: "UoP",
        code: "PERA",
        contactEmail: "registrar@pdn.ac.lk",
        phone: "+94812388001",
        address: "University of Peradeniya, Peradeniya 20400",
        website: "https://www.pdn.ac.lk",
        established: 1942,
        totalStudents: 12800,
        totalExams: 38,
        adminCount: 6,
        status: "active",
        createdAt: "2025-01-01T00:00:00",
        updatedAt: "2025-06-15T14:30:00"
    },
    {
        id: 3,
        name: "University of Moratuwa",
        shortName: "UoM",
        code: "MORA",
        contactEmail: "registrar@uom.lk",
        phone: "+94112650301",
        address: "University of Moratuwa, Moratuwa 10400",
        website: "https://www.mrt.ac.lk",
        established: 1966,
        totalStudents: 8500,
        totalExams: 28,
        adminCount: 5,
        status: "active",
        createdAt: "2025-01-01T00:00:00",
        updatedAt: "2025-07-05T09:15:00"
    },
    {
        id: 4,
        name: "University of Kelaniya",
        shortName: "UoK",
        code: "KELA",
        contactEmail: "registrar@kln.ac.lk",
        phone: "+94112903000",
        address: "University of Kelaniya, Kelaniya 11600",
        website: "https://www.kln.ac.lk",
        established: 1959,
        totalStudents: 11200,
        totalExams: 32,
        adminCount: 4,
        status: "active",
        createdAt: "2025-01-01T00:00:00",
        updatedAt: "2025-06-20T16:45:00"
    },
    {
        id: 5,
        name: "University of Colombo School of Computing",
        shortName: "UCSC",
        code: "UCSC",
        contactEmail: "info@ucsc.cmb.ac.lk",
        phone: "+94112581245",
        address: "UCSC Building, University of Colombo, Colombo 07",
        website: "https://www.ucsc.cmb.ac.lk",
        established: 2002,
        totalStudents: 2400,
        totalExams: 18,
        adminCount: 3,
        status: "active",
        createdAt: "2025-01-01T00:00:00",
        updatedAt: "2025-07-08T11:20:00"
    },
    {
        id: 6,
        name: "University of Ruhuna",
        shortName: "UoR",
        code: "RUH",
        contactEmail: "registrar@ruh.ac.lk",
        phone: "+94912234567",
        address: "University of Ruhuna, Matara 81000",
        website: "https://www.ruh.ac.lk",
        established: 1978,
        totalStudents: 7800,
        totalExams: 22,
        adminCount: 3,
        status: "pending",
        createdAt: "2025-06-01T00:00:00",
        updatedAt: "2025-07-07T13:30:00"
    }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "active": return "bg-green-100 text-green-800";
        case "inactive": return "bg-red-100 text-red-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function University() {
    const [searchTerm, setSearchTerm] = useState("");
    const [universities, setUniversities] = useState<University[]>(mockUniversities);
    const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUniversity, setNewUniversity] = useState<Partial<University>>({
        name: "",
        shortName: "",
        code: "",
        contactEmail: "",
        phone: "",
        address: "",
        website: "",
        established: new Date().getFullYear(),
        status: "pending"
    });
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

    const filteredUniversities = useMemo(() => {
        return universities.filter(uni =>
            uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            uni.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            uni.shortName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [universities, searchTerm]);

    const stats = useMemo(() => {
        const total = universities.length;
        const active = universities.filter(u => u.status === "active").length;
        const pending = universities.filter(u => u.status === "pending").length;
        const totalStudents = universities.reduce((sum, u) => sum + u.totalStudents, 0);
        const totalExams = universities.reduce((sum, u) => sum + u.totalExams, 0);
        const totalAdmins = universities.reduce((sum, u) => sum + u.adminCount, 0);

        return { total, active, pending, totalStudents, totalExams, totalAdmins };
    }, [universities]);

    const handleDeleteUniversity = (id: number) => {
        const university = universities.find(u => u.id === id);
        if (university && window.confirm(`Are you sure you want to delete ${university.name}? This action cannot be undone.`)) {
            setUniversities(prev => prev.filter(uni => uni.id !== id));
        }
    };

    const handleEditUniversity = (university: University) => {
        setEditingUniversity({ ...university });
        setShowEditModal(true);
        setOpenPopoverId(null); // Close the popover
    };

    const handleSaveEdit = () => {
        if (editingUniversity) {
            setUniversities(prev => prev.map(uni =>
                uni.id === editingUniversity.id ? { ...editingUniversity, updatedAt: new Date().toISOString() } : uni
            ));
            setShowEditModal(false);
            setEditingUniversity(null);
        }
    };

    const handleAddUniversity = () => {
        const university: University = {
            id: Date.now(),
            name: newUniversity.name!,
            shortName: newUniversity.shortName!,
            code: newUniversity.code!,
            contactEmail: newUniversity.contactEmail!,
            phone: newUniversity.phone!,
            address: newUniversity.address!,
            website: newUniversity.website,
            established: newUniversity.established!,
            status: newUniversity.status!,
            totalStudents: 0,
            totalExams: 0,
            adminCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setUniversities(prev => [...prev, university]);
        setShowAddModal(false);
        setNewUniversity({
            name: "",
            shortName: "",
            code: "",
            contactEmail: "",
            phone: "",
            address: "",
            website: "",
            established: new Date().getFullYear(),
            status: "pending"
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <School className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
                            <p className="text-gray-600 text-sm">Manage registered universities and institutions</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add University
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Universities</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <School className="w-8 h-8 text-blue-600" />
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
                                <Building className="w-8 h-8 text-green-600" />
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
                                <Award className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Exams</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.totalExams}</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Admins</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.totalAdmins}</p>
                                </div>
                                <GraduationCap className="w-8 h-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search universities by name, code, or short name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Universities Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <School className="w-5 h-5" />
                            Universities ({filteredUniversities.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>University</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Statistics</TableHead>
                                        <TableHead>Established</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUniversities.map((university) => (
                                        <TableRow key={university.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{university.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {university.shortName} • {university.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{university.contactEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{university.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-500">{university.address}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(university.status)} w-fit`}>
                                                    <span className="capitalize">{university.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{university.totalStudents.toLocaleString()} students</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{university.totalExams} exams</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm">{university.adminCount} admins</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{university.established}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{formatDate(university.updatedAt)}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Popover open={openPopoverId === university.id} onOpenChange={(open) => setOpenPopoverId(open ? university.id : null)}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setOpenPopoverId(university.id)}>
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48" align="end">
                                                        <div className="flex flex-col space-y-1">
                                                            <Button variant="ghost" size="sm" className="justify-start">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start"
                                                                onClick={() => handleEditUniversity(university)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit University
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="justify-start">
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Manage Admins
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="justify-start">
                                                                <BookOpen className="w-4 h-4 mr-2" />
                                                                View Exams
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="justify-start text-red-600"
                                                                onClick={() => handleDeleteUniversity(university.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
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
                {filteredUniversities.length === 0 && (
                    <Card className="mt-6">
                        <CardContent className="text-center py-12">
                            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No universities found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm
                                    ? "Try adjusting your search terms to see more results."
                                    : "Get started by adding your first university."}
                            </p>
                            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add University
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Add University Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Add New University</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                                    <input
                                        type="text"
                                        value={newUniversity.name}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="University of Colombo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                                    <input
                                        type="text"
                                        value={newUniversity.shortName}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, shortName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="UoC"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={newUniversity.code}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="UOC"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                    <input
                                        type="email"
                                        value={newUniversity.contactEmail}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, contactEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@uoc.lk"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={newUniversity.phone}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+94112581835"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="url"
                                        value={newUniversity.website}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, website: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.uoc.lk"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                                    <input
                                        type="number"
                                        value={newUniversity.established}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, established: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1921"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={newUniversity.status}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, status: e.target.value as "active" | "inactive" | "pending" })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={newUniversity.address}
                                        onChange={(e) => setNewUniversity({ ...newUniversity, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="College House, University of Colombo, Colombo 03"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddUniversity} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Add University
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit University Modal */}
                {showEditModal && editingUniversity && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Edit University</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                                    <input
                                        type="text"
                                        value={editingUniversity.name}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                                    <input
                                        type="text"
                                        value={editingUniversity.shortName}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, shortName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={editingUniversity.code}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                    <input
                                        type="email"
                                        value={editingUniversity.contactEmail}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, contactEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editingUniversity.phone}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="url"
                                        value={editingUniversity.website}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, website: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                                    <input
                                        type="number"
                                        value={editingUniversity.established}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, established: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editingUniversity.status}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, status: e.target.value as "active" | "inactive" | "pending" })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={editingUniversity.address}
                                        onChange={(e) => setEditingUniversity({ ...editingUniversity, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
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
