// src/pages/admin/ManageExams.tsx
import { useState, useMemo } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Users,
    FileText,
    MoreVertical,
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    ArrowLeft
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CreateExam from "./CreateExam";

interface Exam {
    id: number;
    name: string;
    university: string;
    date: string;
    time: string;
    duration: number; // in minutes
    maxParticipants: number;
    currentRegistrations: number;
    status: "draft" | "published" | "active" | "completed" | "cancelled";
    resultsPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

const mockExams: Exam[] = [
    {
        id: 1,
        name: "General Certificate of Competency Test (GCCT)",
        university: "University of Colombo",
        date: "2025-07-15",
        time: "10:00",
        duration: 180,
        maxParticipants: 500,
        currentRegistrations: 423,
        status: "published",
        resultsPublished: false,
        createdAt: "2025-06-01T10:00:00",
        updatedAt: "2025-07-01T14:30:00"
    },
    {
        id: 2,
        name: "BIT Aptitude Test",
        university: "University of Kelaniya",
        date: "2025-07-20",
        time: "14:00",
        duration: 120,
        maxParticipants: 200,
        currentRegistrations: 190,
        status: "published",
        resultsPublished: false,
        createdAt: "2025-06-15T09:00:00",
        updatedAt: "2025-07-08T11:00:00"
    },
    {
        id: 3,
        name: "GMAT Preparation Assessment",
        university: "University of Peradeniya",
        date: "2025-07-25",
        time: "09:00",
        duration: 240,
        maxParticipants: 150,
        currentRegistrations: 87,
        status: "published",
        resultsPublished: false,
        createdAt: "2025-06-10T16:00:00",
        updatedAt: "2025-07-05T10:15:00"
    },
    {
        id: 4,
        name: "Engineering Entrance Exam",
        university: "University of Moratuwa",
        date: "2025-06-30",
        time: "10:00",
        duration: 180,
        maxParticipants: 300,
        currentRegistrations: 298,
        status: "completed",
        resultsPublished: true,
        createdAt: "2025-05-01T12:00:00",
        updatedAt: "2025-07-01T09:00:00"
    },
    {
        id: 5,
        name: "Computer Science Aptitude Test",
        university: "University of Colombo School of Computing",
        date: "2025-08-10",
        time: "11:00",
        duration: 150,
        maxParticipants: 250,
        currentRegistrations: 45,
        status: "draft",
        resultsPublished: false,
        createdAt: "2025-07-01T14:00:00",
        updatedAt: "2025-07-08T16:30:00"
    },
    {
        id: 6,
        name: "Medical Faculty Entrance",
        university: "University of Peradeniya",
        date: "2025-08-05",
        time: "08:00",
        duration: 200,
        maxParticipants: 400,
        currentRegistrations: 312,
        status: "published",
        resultsPublished: false,
        createdAt: "2025-06-20T08:00:00",
        updatedAt: "2025-07-07T13:45:00"
    }
];

const universities = [
    "All Universities",
    "University of Colombo",
    "University of Kelaniya",
    "University of Peradeniya",
    "University of Moratuwa",
    "University of Colombo School of Computing",
    "University of Ruhuna",
    "University of Jaffna"
];

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "draft": return "bg-gray-100 text-gray-800";
        case "published": return "bg-blue-100 text-blue-800";
        case "active": return "bg-green-100 text-green-800";
        case "completed": return "bg-purple-100 text-purple-800";
        case "cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "draft": return <FileText className="w-3 h-3" />;
        case "published": return <BookOpen className="w-3 h-3" />;
        case "active": return <Clock className="w-3 h-3" />;
        case "completed": return <CheckCircle className="w-3 h-3" />;
        case "cancelled": return <XCircle className="w-3 h-3" />;
        default: return <FileText className="w-3 h-3" />;
    }
};

export default function ManageExams() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("All Universities");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [exams, setExams] = useState<Exam[]>(mockExams);
    const [showCreateExam, setShowCreateExam] = useState(false);

    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exam.university.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesUniversity = selectedUniversity === "All Universities" ||
                exam.university === selectedUniversity;
            const matchesStatus = selectedStatus === "all" || exam.status === selectedStatus;

            return matchesSearch && matchesUniversity && matchesStatus;
        });
    }, [exams, searchTerm, selectedUniversity, selectedStatus]);

    const stats = useMemo(() => {
        const total = exams.length;
        const published = exams.filter(e => e.status === "published").length;
        const active = exams.filter(e => e.status === "active").length;
        const completed = exams.filter(e => e.status === "completed").length;
        const totalRegistrations = exams.reduce((sum, e) => sum + e.currentRegistrations, 0);

        return { total, published, active, completed, totalRegistrations };
    }, [exams]);

    const handlePublishExam = (id: number) => {
        setExams(prev => prev.map(exam =>
            exam.id === id ? { ...exam, status: "published" as const } : exam
        ));
    };

    const handlePublishResults = (id: number) => {
        setExams(prev => prev.map(exam =>
            exam.id === id ? { ...exam, resultsPublished: true } : exam
        ));
    };

    const handleDeleteExam = (id: number) => {
        setExams(prev => prev.filter(exam => exam.id !== id));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRegistrationStatus = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return { color: "text-red-600", icon: <AlertCircle className="w-3 h-3" /> };
        if (percentage >= 70) return { color: "text-orange-600", icon: <Clock className="w-3 h-3" /> };
        return { color: "text-green-600", icon: <CheckCircle className="w-3 h-3" /> };
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Exams</h1>
                            <p className="text-gray-600 text-sm">Create, edit, and manage examination schedules</p>
                        </div>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowCreateExam(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Exam
                    </Button>
                </div>

                {/* Conditional rendering: Show CreateExam or Manage Exams content */}
                {showCreateExam ? (
                    <div className="relative">
                        {/* Custom back button */}
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateExam(false)}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Manage Exams
                            </Button>
                        </div>
                        <CreateExam onBack={() => setShowCreateExam(false)} />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Exams</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                        </div>
                                        <BookOpen className="w-8 h-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Published</p>
                                            <p className="text-2xl font-bold text-blue-600">{stats.published}</p>
                                        </div>
                                        <FileText className="w-8 h-8 text-blue-600" />
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
                                        <Clock className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Completed</p>
                                            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Registrations</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-gray-600" />
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
                                            placeholder="Search exams by name or university..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedUniversity}
                                            onChange={(e) => setSelectedUniversity(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {universities.map(uni => (
                                                <option key={uni} value={uni}>{uni}</option>
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

                        {/* Exams Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Exams ({filteredExams.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Exam Name</TableHead>
                                                <TableHead>University</TableHead>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Registrations</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Results</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredExams.map((exam) => {
                                                const regStatus = getRegistrationStatus(exam.currentRegistrations, exam.maxParticipants);
                                                return (
                                                    <TableRow key={exam.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{exam.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                Created: {formatDate(exam.createdAt)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{exam.university}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium">{formatDate(exam.date)}</div>
                                                                    <div className="text-sm text-gray-500">{exam.time}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{exam.duration} min</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className={`flex items-center gap-1 ${regStatus.color}`}>
                                                                {regStatus.icon}
                                                                <span className="font-medium">
                                                                    {exam.currentRegistrations}/{exam.maxParticipants}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {Math.round((exam.currentRegistrations / exam.maxParticipants) * 100)}% filled
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={`${getStatusColor(exam.status)} flex items-center gap-1`}>
                                                                {getStatusIcon(exam.status)}
                                                                <span className="capitalize">{exam.status}</span>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {exam.resultsPublished ? (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Published
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-800">
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-48" align="end">
                                                                    <div className="flex flex-col space-y-1">
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                            View Details
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit Exam
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Users className="w-4 h-4 mr-2" />
                                                                            View Registrations
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Download className="w-4 h-4 mr-2" />
                                                                            Export Data
                                                                        </Button>
                                                                        {exam.status === "draft" && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="justify-start text-blue-600"
                                                                                onClick={() => handlePublishExam(exam.id)}
                                                                            >
                                                                                <BookOpen className="w-4 h-4 mr-2" />
                                                                                Publish Exam
                                                                            </Button>
                                                                        )}
                                                                        {exam.status === "completed" && !exam.resultsPublished && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="justify-start text-green-600"
                                                                                onClick={() => handlePublishResults(exam.id)}
                                                                            >
                                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                                Publish Results
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="justify-start text-red-600"
                                                                            onClick={() => handleDeleteExam(exam.id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                            Delete Exam
                                                                        </Button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Empty State */}
                        {filteredExams.length === 0 && (
                            <Card className="mt-6">
                                <CardContent className="text-center py-12">
                                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || selectedUniversity !== "All Universities" || selectedStatus !== "all"
                                            ? "Try adjusting your filters to see more results."
                                            : "Get started by creating your first exam."}
                                    </p>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setShowCreateExam(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Exam
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
