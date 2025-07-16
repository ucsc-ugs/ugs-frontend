// src/pages/orgAdmin/ManageStudents.tsx
import { useState, useMemo, useCallback } from "react";
import {
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    CreditCard,
    User,
    GraduationCap,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    FileText,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    MoreVertical,
    Edit,
    Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    nicPassport: string;
    registrationNumber: string;
    university: string;
    address?: string;
    registeredExams: RegisteredExam[];
    totalExams: number;
    registrationDate: string;
    lastActivity?: string;
    status: "active" | "inactive" | "suspended";
}

interface RegisteredExam {
    examId: number;
    examName: string;
    examDate: string;
    paymentStatus: "paid" | "pending" | "failed" | "refunded";
    paymentAmount: number;
    registrationDate: string;
    examStatus: "upcoming" | "completed" | "missed" | "cancelled";
    score?: number;
    grade?: string;
}

interface PaymentHistory {
    id: number;
    examName: string;
    amount: number;
    date: string;
    status: "paid" | "pending" | "failed" | "refunded";
    method: string;
    transactionId?: string;
}

const mockStudents: Student[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@student.uoc.lk",
        phone: "+94771234567",
        nicPassport: "200012345678",
        registrationNumber: "CS/2020/001",
        university: "University of Colombo",
        address: "123 Main St, Colombo 07",
        registeredExams: [
            {
                examId: 1,
                examName: "Data Structures & Algorithms",
                examDate: "2025-08-15T09:00:00",
                paymentStatus: "paid",
                paymentAmount: 2500,
                registrationDate: "2025-07-01T10:30:00",
                examStatus: "upcoming"
            },
            {
                examId: 2,
                examName: "Database Management Systems",
                examDate: "2025-07-20T14:00:00",
                paymentStatus: "paid",
                paymentAmount: 3000,
                registrationDate: "2025-06-15T14:20:00",
                examStatus: "completed",
                score: 85,
                grade: "A"
            }
        ],
        totalExams: 2,
        registrationDate: "2025-06-15T14:20:00",
        lastActivity: "2025-07-15T16:45:00",
        status: "active"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@student.pera.lk",
        phone: "+94771234568",
        nicPassport: "199987654321",
        registrationNumber: "ENG/2019/045",
        university: "University of Peradeniya",
        address: "456 Hill View, Kandy",
        registeredExams: [
            {
                examId: 3,
                examName: "Software Engineering",
                examDate: "2025-09-10T10:00:00",
                paymentStatus: "pending",
                paymentAmount: 2800,
                registrationDate: "2025-07-10T11:15:00",
                examStatus: "upcoming"
            }
        ],
        totalExams: 1,
        registrationDate: "2025-07-10T11:15:00",
        lastActivity: "2025-07-14T09:30:00",
        status: "active"
    },
    {
        id: 3,
        name: "Michael Brown",
        email: "michael.brown@student.mora.lk",
        nicPassport: "200156789012",
        registrationNumber: "IT/2021/078",
        university: "University of Moratuwa",
        registeredExams: [
            {
                examId: 1,
                examName: "Data Structures & Algorithms",
                examDate: "2025-08-15T09:00:00",
                paymentStatus: "failed",
                paymentAmount: 2500,
                registrationDate: "2025-07-05T15:45:00",
                examStatus: "upcoming"
            },
            {
                examId: 4,
                examName: "Computer Networks",
                examDate: "2025-07-25T09:30:00",
                paymentStatus: "paid",
                paymentAmount: 3200,
                registrationDate: "2025-06-20T12:30:00",
                examStatus: "completed",
                score: 78,
                grade: "B+"
            }
        ],
        totalExams: 2,
        registrationDate: "2025-06-20T12:30:00",
        lastActivity: "2025-07-12T14:20:00",
        status: "active"
    },
    {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah.wilson@student.ruh.lk",
        phone: "+94771234569",
        nicPassport: "200278901234",
        registrationNumber: "SCI/2022/012",
        university: "University of Ruhuna",
        address: "789 Beach Road, Matara",
        registeredExams: [
            {
                examId: 5,
                examName: "Mathematics for Computing",
                examDate: "2025-08-05T14:00:00",
                paymentStatus: "paid",
                paymentAmount: 2200,
                registrationDate: "2025-07-08T09:20:00",
                examStatus: "upcoming"
            }
        ],
        totalExams: 1,
        registrationDate: "2025-07-08T09:20:00",
        lastActivity: "2025-07-16T11:10:00",
        status: "active"
    },
    {
        id: 5,
        name: "David Kumar",
        email: "david.kumar@student.ucsc.lk",
        nicPassport: "200034567890",
        registrationNumber: "CS/2020/156",
        university: "University of Colombo School of Computing",
        registeredExams: [
            {
                examId: 2,
                examName: "Database Management Systems",
                examDate: "2025-07-20T14:00:00",
                paymentStatus: "refunded",
                paymentAmount: 3000,
                registrationDate: "2025-06-25T16:00:00",
                examStatus: "cancelled"
            }
        ],
        totalExams: 1,
        registrationDate: "2025-06-25T16:00:00",
        lastActivity: "2025-07-01T10:15:00",
        status: "inactive"
    }
];

const examOptions = [
    { value: "all", label: "All Exams" },
    { value: "Data Structures & Algorithms", label: "Data Structures & Algorithms" },
    { value: "Database Management Systems", label: "Database Management Systems" },
    { value: "Software Engineering", label: "Software Engineering" },
    { value: "Computer Networks", label: "Computer Networks" },
    { value: "Mathematics for Computing", label: "Mathematics for Computing" }
];

const paymentStatusOptions = [
    { value: "all", label: "All Payments" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" }
];

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" }
];

const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case "paid": return "bg-green-100 text-green-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        case "failed": return "bg-red-100 text-red-800";
        case "refunded": return "bg-blue-100 text-blue-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getPaymentStatusIcon = (status: string) => {
    switch (status) {
        case "paid": return <CheckCircle className="w-3 h-3" />;
        case "pending": return <Clock className="w-3 h-3" />;
        case "failed": return <XCircle className="w-3 h-3" />;
        case "refunded": return <RefreshCw className="w-3 h-3" />;
        default: return <AlertCircle className="w-3 h-3" />;
    }
};

const getStudentStatusColor = (status: string) => {
    switch (status) {
        case "active": return "bg-green-100 text-green-800";
        case "inactive": return "bg-gray-100 text-gray-800";
        case "suspended": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function ManageStudents() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExam, setSelectedExam] = useState("all");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Live search with debounce effect
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.nicPassport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesExam = selectedExam === "all" ||
                student.registeredExams.some(exam => exam.examName === selectedExam);

            const matchesPaymentStatus = selectedPaymentStatus === "all" ||
                student.registeredExams.some(exam => exam.paymentStatus === selectedPaymentStatus);

            const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;

            const matchesDateRange = (!dateRange.start || !dateRange.end) ||
                (new Date(student.registrationDate) >= new Date(dateRange.start) &&
                    new Date(student.registrationDate) <= new Date(dateRange.end));

            return matchesSearch && matchesExam && matchesPaymentStatus && matchesStatus && matchesDateRange;
        });
    }, [students, searchTerm, selectedExam, selectedPaymentStatus, selectedStatus, dateRange]);

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Statistics
    const stats = useMemo(() => {
        const total = students.length;
        const active = students.filter(s => s.status === "active").length;
        const totalRegistrations = students.reduce((sum, s) => sum + s.totalExams, 0);
        const paidStudents = students.filter(s =>
            s.registeredExams.some(exam => exam.paymentStatus === "paid")
        ).length;
        const pendingPayments = students.filter(s =>
            s.registeredExams.some(exam => exam.paymentStatus === "pending")
        ).length;
        const totalRevenue = students.reduce((sum, s) =>
            sum + s.registeredExams
                .filter(exam => exam.paymentStatus === "paid")
                .reduce((examSum, exam) => examSum + exam.paymentAmount, 0), 0
        );

        return { total, active, totalRegistrations, paidStudents, pendingPayments, totalRevenue };
    }, [students]);

    const handleViewStudent = useCallback((student: Student) => {
        setSelectedStudent(student);
        setShowStudentModal(true);
        setOpenPopoverId(null);
    }, []);

    const handleExportData = useCallback(async (format: 'csv' | 'excel') => {
        setIsExporting(true);
        try {
            // Simulate export process
            await new Promise(resolve => setTimeout(resolve, 2000));

            const exportData = filteredStudents.map(student => ({
                Name: student.name,
                Email: student.email,
                Phone: student.phone || 'N/A',
                'NIC/Passport': student.nicPassport,
                'Registration No.': student.registrationNumber,
                University: student.university,
                'Total Exams': student.totalExams,
                Status: student.status,
                'Registration Date': formatDate(student.registrationDate),
                'Last Activity': student.lastActivity ? formatDate(student.lastActivity) : 'N/A'
            }));

            // In a real app, you would use a library like xlsx or csv-parser
            console.log(`Exporting ${exportData.length} records as ${format.toUpperCase()}`);

            // Show success toast (you would implement actual toast notification)
            alert(`Successfully exported ${exportData.length} student records as ${format.toUpperCase()}`);
        } catch (error) {
            alert(`Failed to export data: ${error}`);
        } finally {
            setIsExporting(false);
        }
    }, [filteredStudents]);

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

    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                            <p className="text-gray-600 text-sm">View and manage all registered students across all exams</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" disabled={isExporting}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {isExporting ? "Exporting..." : "Export"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48" align="end">
                                <div className="flex flex-col space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                        onClick={() => handleExportData('csv')}
                                        disabled={isExporting}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Export as CSV
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start"
                                        onClick={() => handleExportData('excel')}
                                        disabled={isExporting}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Export as Excel
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Students</p>
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
                                    <p className="text-sm text-gray-600">Active Students</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Registrations</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalRegistrations}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Paid Students</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.paidStudents}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                                <CreditCard className="w-8 h-8 text-purple-600" />
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
                                    placeholder="Search by name, email, NIC/passport, or registration number..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {examOptions.map(exam => (
                                        <option key={exam.value} value={exam.value}>{exam.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedPaymentStatus}
                                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {paymentStatusOptions.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
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
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Start date"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="End date"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Students ({filteredStudents.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Registration</TableHead>
                                        <TableHead>Exams</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedStudents.map((student) => {
                                        const primaryPaymentStatus = student.registeredExams.length > 0
                                            ? student.registeredExams[0].paymentStatus
                                            : "pending";

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{student.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {student.id} • {student.university}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            <span className="text-sm">{student.email}</span>
                                                        </div>
                                                        {student.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-3 h-3 text-gray-400" />
                                                                <span className="text-sm">{student.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{student.registrationNumber}</div>
                                                        <div className="text-gray-500">{student.nicPassport}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{student.totalExams} exam(s)</div>
                                                        <div className="text-gray-500">
                                                            {student.registeredExams.slice(0, 2).map(exam => exam.examName).join(", ")}
                                                            {student.registeredExams.length > 2 && "..."}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getPaymentStatusColor(primaryPaymentStatus)} flex items-center gap-1 w-fit`}>
                                                        {getPaymentStatusIcon(primaryPaymentStatus)}
                                                        <span className="capitalize">{primaryPaymentStatus}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStudentStatusColor(student.status)} w-fit`}>
                                                        <span className="capitalize">{student.status}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(student.registrationDate)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Popover open={openPopoverId === student.id} onOpenChange={(open) => setOpenPopoverId(open ? student.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-48" align="end">
                                                            <div className="flex flex-col space-y-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="justify-start"
                                                                    onClick={() => handleViewStudent(student)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Profile
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="justify-start">
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit Student
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="justify-start text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Remove Student
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Empty State */}
                {filteredStudents.length === 0 && (
                    <Card className="mt-6">
                        <CardContent className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || selectedExam !== "all" || selectedPaymentStatus !== "all" || selectedStatus !== "all"
                                    ? "Try adjusting your filters to see more results."
                                    : "No students have registered yet."}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Student Profile Modal */}
                {showStudentModal && selectedStudent && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Student Profile</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowStudentModal(false)}>
                                        ×
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Personal Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Full Name</label>
                                                <p className="text-sm">{selectedStudent.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Email</label>
                                                <p className="text-sm">{selectedStudent.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                                <p className="text-sm">{selectedStudent.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">NIC/Passport</label>
                                                <p className="text-sm">{selectedStudent.nicPassport}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Address</label>
                                                <p className="text-sm">{selectedStudent.address || 'N/A'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <GraduationCap className="w-5 h-5" />
                                                Academic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                                                <p className="text-sm">{selectedStudent.registrationNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">University</label>
                                                <p className="text-sm">{selectedStudent.university}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Registration Date</label>
                                                <p className="text-sm">{formatDateTime(selectedStudent.registrationDate)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Last Activity</label>
                                                <p className="text-sm">{selectedStudent.lastActivity ? formatDateTime(selectedStudent.lastActivity) : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Status</label>
                                                <Badge className={`${getStudentStatusColor(selectedStudent.status)} mt-1`}>
                                                    {selectedStudent.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Registered Exams */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Registered Exams ({selectedStudent.registeredExams.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedStudent.registeredExams.map((exam, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium">{exam.examName}</h4>
                                                        <Badge className={`${getPaymentStatusColor(exam.paymentStatus)} flex items-center gap-1`}>
                                                            {getPaymentStatusIcon(exam.paymentStatus)}
                                                            {exam.paymentStatus}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <label className="font-medium text-gray-600">Exam Date</label>
                                                            <p>{formatDateTime(exam.examDate)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="font-medium text-gray-600">Amount</label>
                                                            <p>{formatCurrency(exam.paymentAmount)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="font-medium text-gray-600">Registration</label>
                                                            <p>{formatDate(exam.registrationDate)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="font-medium text-gray-600">Status</label>
                                                            <p className="capitalize">{exam.examStatus}</p>
                                                        </div>
                                                        {exam.score && (
                                                            <>
                                                                <div>
                                                                    <label className="font-medium text-gray-600">Score</label>
                                                                    <p>{exam.score}%</p>
                                                                </div>
                                                                <div>
                                                                    <label className="font-medium text-gray-600">Grade</label>
                                                                    <p>{exam.grade}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
