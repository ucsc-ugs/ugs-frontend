// src/pages/admin/ManageExams.tsx
import { useState, useMemo, useEffect } from "react";
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
    ArrowLeft,
    Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import CreateExam from "./CreateExam";
import { getExams, createExam, updateExam, deleteExam, type ExamData, type ExamDate } from "@/lib/examApi";

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
    description?: string;
    price: number;
    organization_id?: number;
    exam_dates?: ExamDate[];
}

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
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateExam, setShowCreateExam] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form data for create/edit
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        organization_id: 1, // This should come from current user's organization
        exam_dates: [{ date: "", location: "" }]
    });

    // Load exams on component mount
    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            setIsLoading(true);
            const response = await getExams();
            // Convert API response to component format
            const examData = response.data.map((exam: ExamData) => ({
                id: exam.id!,
                name: exam.name,
                university: "Organization", // Placeholder
                date: exam.exam_dates?.[0]?.date || "2025-08-01", // Use first exam date or placeholder
                time: "10:00", // Placeholder
                duration: 120, // Placeholder
                maxParticipants: 100, // Placeholder
                currentRegistrations: 0, // Placeholder
                status: "draft" as const, // Default status
                resultsPublished: false,
                createdAt: exam.created_at!,
                updatedAt: exam.updated_at!,
                description: exam.description,
                price: Number(exam.price) || 0,
                organization_id: exam.organization_id,
                exam_dates: exam.exam_dates
            }));
            setExams(examData);
        } catch (err: any) {
            console.error('Load exams error:', err);
            setError(err.message || 'Failed to load exams');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateExam = async () => {
        if (!formData.name.trim()) {
            setError("Exam name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await createExam({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                organization_id: formData.organization_id,
                exam_dates: formData.exam_dates.filter(date => date.date.trim() !== "")
            });
            
            // Reload exams after creating
            await loadExams();
            setShowCreateExam(false);
            setFormData({ name: "", description: "", price: 0, organization_id: 1, exam_dates: [{ date: "", location: "" }] });
            setError("");
        } catch (err: any) {
            console.error('Create exam error:', err);
            setError(err.message || 'Failed to create exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateExam = async () => {
        if (!editingExam || !formData.name.trim()) {
            setError("Exam name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateExam(editingExam.id, {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                exam_dates: formData.exam_dates.filter(date => date.date.trim() !== "")
            });
            
            // Reload exams after updating
            await loadExams();
            setEditingExam(null);
            setFormData({ name: "", description: "", price: 0, organization_id: 1, exam_dates: [{ date: "", location: "" }] });
            setError("");
        } catch (err: any) {
            console.error('Update exam error:', err);
            setError(err.message || 'Failed to update exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExam = async () => {
        if (!deleteExamId) return;

        try {
            setIsSubmitting(true);
            await deleteExam(deleteExamId);
            
            // Reload exams after deleting
            await loadExams();
            setDeleteExamId(null);
            setError("");
        } catch (err: any) {
            console.error('Delete exam error:', err);
            setError(err.message || 'Failed to delete exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (exam: Exam) => {
        setEditingExam(exam);
        setFormData({
            name: exam.name,
            description: exam.description || "",
            price: Number(exam.price) || 0,
            organization_id: exam.organization_id || 1,
            exam_dates: exam.exam_dates?.map(d => ({ date: d.date, location: d.location || "" })) || [{ date: "", location: "" }]
        });
        setError("");
    };

    const closeModals = () => {
        setShowCreateExam(false);
        setEditingExam(null);
        setDeleteExamId(null);
        setFormData({ name: "", description: "", price: 0, organization_id: 1, exam_dates: [{ date: "", location: "" }] });
        setError("");
    };

    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = selectedStatus === "all" || exam.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [exams, searchTerm, selectedStatus]);

    const stats = useMemo(() => {
        const total = exams.length;
        const published = exams.filter(e => e.status === "published").length;
        const active = exams.filter(e => e.status === "active").length;
        const completed = exams.filter(e => e.status === "completed").length;
        const totalRegistrations = exams.reduce((sum, e) => sum + e.currentRegistrations, 0);

        return { total, published, active, completed, totalRegistrations };
    }, [exams]);

    const handlePublishResults = (id: number) => {
        setExams(prev => prev.map(exam =>
            exam.id === id ? { ...exam, resultsPublished: true } : exam
        ));
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

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <p className="text-gray-600">Loading exams...</p>
                        </div>
                    </div>
                ) : (
                    <>
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
                                            placeholder="Search exams by name..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
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
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Price</TableHead>
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
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    {exam.exam_dates && exam.exam_dates.length > 0 ? (
                                                                        <div>
                                                                            <div className="font-medium">{formatDate(exam.exam_dates[0].date)}</div>
                                                                            {exam.exam_dates[0].location && (
                                                                                <div className="text-sm text-gray-500">{exam.exam_dates[0].location}</div>
                                                                            )}
                                                                            {exam.exam_dates.length > 1 && (
                                                                                <div className="text-xs text-blue-600">+{exam.exam_dates.length - 1} more</div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <div className="font-medium">{formatDate(exam.date)}</div>
                                                                            <div className="text-sm text-gray-500">{exam.time}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{exam.duration} min</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm font-medium">
                                                                ${exam.price.toFixed(2)}
                                                            </div>
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
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            className="justify-start"
                                                                            onClick={() => openEditModal(exam)}
                                                                        >
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
                                                                            onClick={() => setDeleteExamId(exam.id)}
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
                                        {searchTerm || selectedStatus !== "all"
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
                    </>
                )}

                {/* Create/Edit Modal */}
                {(showCreateExam || editingExam) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    {editingExam ? 'Edit Exam' : 'Create New Exam'}
                                </h3>
                                
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="examName">Exam Name</Label>
                                        <Input
                                            id="examName"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter exam name"
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="examDescription">Description (Optional)</Label>
                                        <Textarea
                                            id="examDescription"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Enter exam description"
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="examPrice">Price ($)</Label>
                                        <Input
                                            id="examPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                            placeholder="Enter exam price"
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Exam Dates Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label>Exam Dates</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    exam_dates: [...prev.exam_dates, { date: "", location: "" }]
                                                }))}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Date
                                            </Button>
                                        </div>
                                        
                                        {formData.exam_dates.map((examDate, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <div className="flex-1">
                                                    <Input
                                                        type="datetime-local"
                                                        value={examDate.date}
                                                        onChange={(e) => {
                                                            const newExamDates = [...formData.exam_dates];
                                                            newExamDates[index] = { ...newExamDates[index], date: e.target.value };
                                                            setFormData(prev => ({ ...prev, exam_dates: newExamDates }));
                                                        }}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="Location (optional)"
                                                        value={examDate.location}
                                                        onChange={(e) => {
                                                            const newExamDates = [...formData.exam_dates];
                                                            newExamDates[index] = { ...newExamDates[index], location: e.target.value };
                                                            setFormData(prev => ({ ...prev, exam_dates: newExamDates }));
                                                        }}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                {formData.exam_dates.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newExamDates = formData.exam_dates.filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, exam_dates: newExamDates }));
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={closeModals}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={editingExam ? handleUpdateExam : handleCreateExam}
                                        disabled={isSubmitting || !formData.name.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {editingExam ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteExamId && (
                    <ConfirmDialog
                        isOpen={!!deleteExamId}
                        title="Delete Exam"
                        message="Are you sure you want to delete this exam? This action cannot be undone."
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={handleDeleteExam}
                        onCancel={() => setDeleteExamId(null)}
                    />
                )}
            </div>
        </div>
    );
}
