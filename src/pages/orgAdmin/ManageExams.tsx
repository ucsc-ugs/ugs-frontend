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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExamDateDetailsModal } from "@/components/ExamDateDetailsModal";
import CreateExam from "./CreateExam";
import { orgAdminApi, type Location } from "@/lib/orgAdminApi";
import { getExams, createExam, updateExam, deleteExam, updateExamDateStatus, updateExpiredExamStatuses, testConnection, type ExamData, type ExamDate } from "@/lib/examApi";

interface ExamDateRow {
    examId: number;
    examDateId: number;
    examName: string;
    code_name?: string;
    university: string;
    date: string;
    location: string;
    status: "upcoming" | "completed" | "cancelled";
    resultsPublished: boolean;
    createdAt: string;
    updatedAt: string;
    description?: string;
    price: number;
    organization_id?: number;
    registration_deadline?: string;
    currentRegistrations: number;
    maxParticipants: number;
}

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "upcoming": return "bg-blue-100 text-blue-800";
        case "completed": return "bg-green-100 text-green-800";
        case "cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "upcoming": return <Calendar className="w-3 h-3" />;
        case "completed": return <CheckCircle className="w-3 h-3" />;
        case "cancelled": return <XCircle className="w-3 h-3" />;
        default: return <FileText className="w-3 h-3" />;
    }
};

export default function ManageExams() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [examDates, setExamDates] = useState<ExamDateRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateExam, setShowCreateExam] = useState(false);
    const [editingExam, setEditingExam] = useState<ExamDateRow | null>(null);
    const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orgId, setOrgId] = useState<number | null>(null);
    const [orgError, setOrgError] = useState<string>("");
    
    // Location state management
    const [locations, setLocations] = useState<Location[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [locationsError, setLocationsError] = useState<string>("");
    
    // Exam date details modal state
    const [selectedExamDateId, setSelectedExamDateId] = useState<number | null>(null);
    const [selectedExamName, setSelectedExamName] = useState<string>("");
    const [showExamDateDetails, setShowExamDateDetails] = useState(false);
    
    // Form data for create/edit
    const [formData, setFormData] = useState({
        name: "",
        code_name: "",
        description: "",
        price: 0,
        organization_id: 1, // This should come from current user's organization
        registration_deadline: "",
        exam_dates: [{ date: "", location: "", location_id: "" as number | "" }]
    });

    // Helper function to format datetime-local value for backend (Y-m-d\TH:i format)
    const formatDateTimeForBackend = (datetimeLocal: string): string => {
        // Remove seconds if present (datetime-local might include them)
        // Format: YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DDTHH:mm
        return datetimeLocal.substring(0, 16);
    };

    // Helper function to convert backend datetime to datetime-local format
    const formatDateTimeForInput = (backendDateTime: string): string => {
        if (!backendDateTime) return "";
        
        // Convert ISO string or backend format to datetime-local format
        const date = new Date(backendDateTime);
        
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper function to get current datetime in local format for min attribute
    const getCurrentDateTimeLocal = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Function to automatically update expired exam statuses
    const updateExpiredStatuses = async () => {
        try {
            console.log('Checking for expired exam dates...');
            const result = await updateExpiredExamStatuses();
            console.log('Auto-update result:', result);
            
            if (result.data?.updated_count > 0) {
                console.log(`Updated ${result.data.updated_count} expired exam dates to completed status`);
                // Reload exams to reflect the updated statuses
                loadExams();
            }
        } catch (error) {
            console.error('Failed to update expired exam statuses:', error);
            // Don't show error to user as this is automatic background process
        }
    };

    // Load exams on component mount
    useEffect(() => {
        loadExams();
        // Automatically update expired exam statuses
        updateExpiredStatuses();
        (async () => {
            try {
                console.log('Fetching organization for current user...');
                const org = await orgAdminApi.getMyOrganization();
                console.log('Organization response:', org);
                
                const orgIdValue = org?.id ?? org?.organization_id ?? null;
                console.log('Extracted org ID:', orgIdValue);
                
                setOrgId(orgIdValue);
                setOrgError("");
                
                if (!orgIdValue) {
                    setOrgError("Your account is not linked to any organization. Please contact your administrator.");
                }
            } catch (e: any) {
                console.error('Failed to fetch organization', e);
                console.error('Error details:', {
                    status: e.status,
                    message: e.message,
                    response: e
                });
                setOrgError(e?.message || 'Failed to load your organization');
            }
        })();
    }, []);

    // Fetch locations when organization ID is available
    useEffect(() => {
        if (!orgId) return;

        (async () => {
            setLocationsLoading(true);
            setLocationsError("");
            try {
                const locationsData = await orgAdminApi.getLocations();
                setLocations(locationsData);
            } catch (e: any) {
                console.error("Failed to fetch locations:", e);
                setLocationsError(e?.message || "Failed to load locations");
            } finally {
                setLocationsLoading(false);
            }
        })();
    }, [orgId]);

    const loadExams = async () => {
        try {
            setIsLoading(true);
            
            // Test connection first
            console.log('Testing API connection...');
            try {
                const testResult = await testConnection();
                console.log('Connection test successful:', testResult);
                console.log('User context:', {
                    user_id: testResult.user_id,
                    user_name: testResult.user_name,
                    roles: testResult.roles,
                    org_admin: testResult.org_admin,
                    is_org_admin: testResult.is_org_admin
                });
                
                if (!testResult.org_admin) {
                    setOrgError("Your user account is missing the organization admin relationship. Please contact your system administrator.");
                    return;
                }
            } catch (testError) {
                console.error('Connection test failed:', testError);
            }
            
            const response = await getExams();
            console.log('getExams response:', response);
            console.log('response.data:', response.data);
            if (response.data?.length > 0) {
                console.log('First exam structure:', response.data[0]);
            }
            
            // Convert API response to exam date rows
            const examDateRows: ExamDateRow[] = [];
            
            response.data.forEach((exam: ExamData) => {
                console.log('Processing exam:', exam);
                const codeNameValue = exam.code_name ?? (exam as any).codeName ?? null;
                console.log('Code name for exam', exam.name, ':', codeNameValue);
                
                // If exam has dates, create a row for each date
                if (exam.exam_dates && exam.exam_dates.length > 0) {
                    exam.exam_dates.forEach((examDate) => {
                        examDateRows.push({
                            examId: exam.id!,
                            examDateId: examDate.id!,
                            examName: exam.name,
                            code_name: codeNameValue,
                            university: "Organization",
                            date: examDate.date,
                            location: examDate.location || "TBD",
                            status: examDate.status || "upcoming",
                            resultsPublished: false,
                            createdAt: exam.created_at!,
                            updatedAt: exam.updated_at!,
                            description: exam.description,
                            price: Number(exam.price) || 0,
                            organization_id: exam.organization_id,
                            registration_deadline: exam.registration_deadline,
                            currentRegistrations: 0,
                            maxParticipants: 100,
                        });
                    });
                } else {
                    // If no exam dates, create a single row with placeholder
                    examDateRows.push({
                        examId: exam.id!,
                        examDateId: 0, // No date ID
                        examName: exam.name,
                        code_name: codeNameValue,
                        university: "Organization",
                        date: "2025-08-01", // Placeholder
                        location: "TBD",
                        status: "upcoming",
                        resultsPublished: false,
                        createdAt: exam.created_at!,
                        updatedAt: exam.updated_at!,
                        description: exam.description,
                        price: Number(exam.price) || 0,
                        organization_id: exam.organization_id,
                        registration_deadline: exam.registration_deadline,
                        currentRegistrations: 0,
                        maxParticipants: 100,
                    });
                }
            });
            
            setExamDates(examDateRows);
        } catch (err: any) {
            console.error('Load exams error:', err);
            
            if (err.message?.includes('No organization found for this user')) {
                setError('Database Setup Required: Your user account is missing the organization admin relationship. Please run the database setup commands shown in the console.');
                
                // Show helpful database setup information in console
                console.group('🔧 Database Setup Required');
                console.log('Your user account has the org_admin role but is missing the org_admins table relationship.');
                console.log('');
                console.log('To fix this, you need to create an org_admins record. Here are the steps:');
                console.log('');
                console.log('1. First, identify your user ID and organization ID:');
                console.log('   SELECT id, name, email FROM users WHERE email = "your-email@domain.com";');
                console.log('   SELECT id, name FROM organizations LIMIT 5;');
                console.log('');
                console.log('2. Create the org_admins relationship:');
                console.log('   INSERT INTO org_admins (name, user_id, organization_id, created_at, updated_at)');
                console.log('   VALUES ("Your Name", YOUR_USER_ID, YOUR_ORG_ID, NOW(), NOW());');
                console.log('');
                console.log('3. Or use Laravel tinker:');
                console.log('   $user = App\\Models\\User::where("email", "your-email@domain.com")->first();');
                console.log('   $org = App\\Models\\Organization::first(); // or specific org');
                console.log('   App\\Models\\OrgAdmin::create([');
                console.log('       "name" => $user->name,');
                console.log('       "user_id" => $user->id,');
                console.log('       "organization_id" => $org->id');
                console.log('   ]);');
                console.groupEnd();
            } else {
                setError(err.message || 'Failed to load exams');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateExam = async () => {
        if (!formData.name.trim()) {
            setError("Exam name is required");
            return;
        }
        if (!formData.code_name.trim()) {
            setError("Exam code name is required");
            return;
        }
        if (!orgId) {
            setError("Your admin account isn't linked to an organization. Please contact support.");
            return;
        }

        // Validate that exam dates are not in the past
        const now = new Date();
        for (const examDate of formData.exam_dates) {
            if (examDate.date.trim() !== "") {
                const examDateTime = new Date(examDate.date);
                if (examDateTime <= now) {
                    setError("Exam dates cannot be in the past");
                    return;
                }
            }
        }

        // Validate that registration deadline is not in the past
        if (formData.registration_deadline) {
            const deadlineDate = new Date(formData.registration_deadline);
            if (deadlineDate <= now) {
                setError("Registration deadline cannot be in the past");
                return;
            }
        }

        // Validate registration deadline against exam dates
        if (formData.registration_deadline && formData.exam_dates.length > 0) {
            const deadlineDate = new Date(formData.registration_deadline);
            const firstExamDate = new Date(formData.exam_dates[0].date);
            
            if (deadlineDate >= firstExamDate) {
                setError("Registration deadline must be before the first exam date");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            console.log("Creating exam with data:", formData);
            console.log("Registration deadline format:", formData.registration_deadline ? formatDateTimeForBackend(formData.registration_deadline) : undefined);
            console.log("Exam dates format:", formData.exam_dates
                .filter(date => date.date.trim() !== "")
                .map(date => ({
                    ...date,
                    date: formatDateTimeForBackend(date.date)
                })));
            
            await createExam({
                name: formData.name,
                code_name: formData.code_name,
                description: formData.description,
                price: formData.price,
                organization_id: orgId,
                registration_deadline: formData.registration_deadline ? 
                    formatDateTimeForBackend(formData.registration_deadline) : undefined,
                exam_dates: formData.exam_dates
                    .filter(date => date.date.trim() !== "")
                    .map(date => ({
                        ...date,
                        date: formatDateTimeForBackend(date.date)
                    }))
            });
            
            // Reload exams after creating
            await loadExams();
            setShowCreateExam(false);
            setFormData({ name: "", code_name: "", description: "", price: 0, organization_id: 1, registration_deadline: "", exam_dates: [{ date: "", location: "", location_id: "" }] });
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
        if (!formData.code_name.trim()) {
            setError("Exam code name is required");
            return;
        }

        // Validate that exam dates are not in the past
        const now = new Date();
        for (const examDate of formData.exam_dates) {
            if (examDate.date.trim() !== "") {
                const examDateTime = new Date(examDate.date);
                if (examDateTime <= now) {
                    setError("Exam dates cannot be in the past");
                    return;
                }
            }
        }

        // Validate that registration deadline is not in the past
        if (formData.registration_deadline) {
            const deadlineDate = new Date(formData.registration_deadline);
            if (deadlineDate <= now) {
                setError("Registration deadline cannot be in the past");
                return;
            }
        }

        // Validate registration deadline against exam dates
        if (formData.registration_deadline && formData.exam_dates.length > 0) {
            const deadlineDate = new Date(formData.registration_deadline);
            const firstExamDate = new Date(formData.exam_dates[0].date);
            
            if (deadlineDate >= firstExamDate) {
                setError("Registration deadline must be before the first exam date");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            console.log("Updating exam with data:", formData);
            console.log("Registration deadline format:", formData.registration_deadline ? formatDateTimeForBackend(formData.registration_deadline) : undefined);
            console.log("Exam dates format:", formData.exam_dates
                .filter(date => date.date.trim() !== "")
                .map(date => ({
                    ...date,
                    date: formatDateTimeForBackend(date.date)
                })));
            
            // TODO: Update to work with exam dates
            /* await updateExam(editingExam.examId, {
                name: formData.name,
                code_name: formData.code_name,
                description: formData.description,
                price: formData.price,
                registration_deadline: formData.registration_deadline ? 
                    formatDateTimeForBackend(formData.registration_deadline) : undefined,
                exam_dates: formData.exam_dates
                    .filter(date => date.date.trim() !== "")
                    .map(date => ({
                        ...date,
                        date: formatDateTimeForBackend(date.date)
                    }))
            }); */
            
            // Reload exams after updating
            await loadExams();
            setEditingExam(null);
            setFormData({ name: "", code_name: "", description: "", price: 0, organization_id: 1, registration_deadline: "", exam_dates: [{ date: "", location: "", location_id: "" }] });
            setError("");
        } catch (err: any) {
            console.error('Update exam error:', err);
            setError(err.message || 'Failed to update exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExam = async () => {
        if (!deleteExamId) {
            console.error('No deleteExamId provided');
            setError('No exam selected for deletion');
            return;
        }

        console.log('Attempting to delete exam with ID:', deleteExamId);
        console.log('Type of deleteExamId:', typeof deleteExamId);

        try {
            setIsSubmitting(true);
            const result = await deleteExam(deleteExamId);
            console.log('Delete result:', result);
            
            // Reload exams after deleting
            await loadExams();
            setDeleteExamId(null);
            setError("");
        } catch (err: any) {
            console.error('Delete exam error:', err);
            console.error('Error type:', typeof err);
            console.error('Error constructor:', err.constructor.name);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.message);
            console.error('Direct err.status:', err.status);
            console.error('Direct err.errors:', err.errors);
            
            // Show more detailed error message
            let errorMessage = 'Failed to delete exam';
            
            // Handle both axios-style errors and custom thrown objects
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.status && err.message) {
                // Handle custom thrown object from apiRequest
                errorMessage = `${err.message} (Status: ${err.status})`;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else {
                errorMessage = 'An unknown error occurred while deleting the exam';
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (examDate: ExamDateRow) => {
        setEditingExam(examDate);
        
        // Find location_id from location name
        const locationId = examDate.location ? 
            locations.find(loc => loc.location_name === examDate.location)?.id || "" : "";
        
        console.log('Opening edit modal for exam date:', examDate);
        console.log('Found location_id:', locationId, 'for location:', examDate.location);
        
        setFormData({
            name: examDate.examName,
            code_name: examDate.code_name || "",
            description: examDate.description || "",
            price: Number(examDate.price) || 0,
            organization_id: examDate.organization_id || 1,
            registration_deadline: formatDateTimeForInput(examDate.registration_deadline || ""),
            exam_dates: [{ 
                date: formatDateTimeForInput(examDate.date), 
                location: examDate.location || "",
                location_id: locationId
            }]
        });
        setError("");
    };

    const closeModals = () => {
        setShowCreateExam(false);
        setEditingExam(null);
        setDeleteExamId(null);
        setFormData({ name: "", code_name: "", description: "", price: 0, organization_id: 1, registration_deadline: "", exam_dates: [{ date: "", location: "", location_id: "" }] });
        setError("");
    };

    const filteredAndGroupedExamDates = useMemo(() => {
        // First filter the exam dates
        const filtered = examDates.filter(examDate => {
            const matchesSearch = examDate.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                examDate.code_name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = selectedStatus === "all" || examDate.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });

        // Group by exam ID and sort by exam name, then by date
        const grouped = filtered.reduce((acc, examDate) => {
            const key = examDate.examId;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(examDate);
            return acc;
        }, {} as Record<number, ExamDateRow[]>);

        // Sort groups by exam name and sort dates within each group
        const sortedGroups = Object.entries(grouped)
            .sort(([, a], [, b]) => a[0].examName.localeCompare(b[0].examName))
            .map(([examId, dates]) => ({
                examId: Number(examId),
                examName: dates[0].examName,
                code_name: dates[0].code_name,
                dates: dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            }));

        return sortedGroups;
    }, [examDates, searchTerm, selectedStatus]);

    const stats = useMemo(() => {
        const total = examDates.length;
        const upcoming = examDates.filter(e => e.status === "upcoming").length;
        const completed = examDates.filter(e => e.status === "completed").length;
        const totalRegistrations = examDates.reduce((sum, e) => sum + e.currentRegistrations, 0);

        return { total, upcoming, completed, totalRegistrations };
    }, [examDates]);

    const handlePublishResults = (examDateId: number) => {
        setExamDates(prev => prev.map(examDate =>
            examDate.examDateId === examDateId ? { ...examDate, resultsPublished: true } : examDate
        ));
    };

    const handleStatusChange = async (examDateId: number, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
        try {
            setIsSubmitting(true);
            await updateExamDateStatus(examDateId, newStatus);
            
            // Refresh the exams list to get updated data
            await loadExams();
            
            // Show success message (you can add toast notification here)
            console.log(`Exam date status updated to: ${newStatus}`);
        } catch (error) {
            console.error('Failed to update exam date status:', error);
            setError('Failed to update exam date status');
        } finally {
            setIsSubmitting(false);
        }
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

    const handleViewRegistrations = (examDateId: number, examName: string) => {
        setSelectedExamDateId(examDateId);
        setSelectedExamName(examName);
        setShowExamDateDetails(true);
    };

    const handleCloseExamDateDetails = () => {
        setShowExamDateDetails(false);
        setSelectedExamDateId(null);
        setSelectedExamName("");
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
                    {orgError && (
                        <div className="ml-4 p-3 text-sm rounded border border-red-200 bg-red-50 text-red-700">
                            <div className="font-medium mb-1">Organization Access Required</div>
                            <div>{orgError}</div>
                            {orgError.includes('not linked') && (
                                <div className="mt-2 text-xs">
                                    Your admin account needs to be associated with an organization to manage exams.
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setShowCreateExam(true)}
                            disabled={!orgId}
                            title={!orgId ? "Organization access required to create exams" : "Create New Exam"}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Exam
                        </Button>
                        <Button
                            variant="outline"
                            onClick={updateExpiredStatuses}
                            disabled={isLoading}
                            title="Manually update expired exam dates to completed status"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Update Expired Status
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-700 text-sm font-medium mb-1">
                                    {error.includes('Database Setup Required') ? 'Database Setup Required' : 'Error Loading Exams'}
                                </p>
                                <p className="text-red-600 text-sm">
                                    {error}
                                </p>
                                {error.includes('Database Setup Required') && (
                                    <div className="mt-3 p-3 bg-red-100 rounded border text-xs text-red-800">
                                        <p className="font-medium mb-1">Quick Fix:</p>
                                        <p>1. Open browser console (F12) for detailed database setup commands</p>
                                        <p>2. Run the SQL commands or Laravel tinker commands shown</p>
                                        <p>3. Refresh this page after creating the database relationship</p>
                                    </div>
                                )}
                            </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                            <p className="text-sm text-gray-600">Upcoming</p>
                                            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                                        </div>
                                        <Calendar className="w-8 h-8 text-blue-600" />
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
                                    Exam Dates ({filteredAndGroupedExamDates.reduce((total, group) => total + group.dates.length, 0)})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-left">Exam</TableHead>
                                                <TableHead className="text-left">Date & Location</TableHead>
                                                <TableHead className="text-left">Registration Deadline</TableHead>
                                                <TableHead className="text-center">Price</TableHead>
                                                <TableHead className="text-center">Registrations</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndGroupedExamDates.map((group) => 
                                                group.dates.map((examDate, dateIndex) => {
                                                    const regStatus = getRegistrationStatus(examDate.currentRegistrations, examDate.maxParticipants);
                                                    const isFirstInGroup = dateIndex === 0;
                                                    return (
                                                        <TableRow key={`${examDate.examId}-${examDate.examDateId}`} className={isFirstInGroup && dateIndex > 0 ? "border-t-2 border-gray-200" : ""}>
                                                        <TableCell className={isFirstInGroup ? "" : "border-l-4 border-gray-100"}>
                                                            {isFirstInGroup ? (
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{examDate.code_name || '-'}</span>
                                                                        <span>{examDate.examName}</span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        Created: {formatDate(examDate.createdAt)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="pl-4">
                                                                    {/* Empty for grouped rows */}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium">{formatDate(examDate.date)}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {new Date(examDate.date).toLocaleTimeString('en-US', { 
                                                                            hour: '2-digit', 
                                                                            minute: '2-digit', 
                                                                            hour12: true 
                                                                        })}
                                                                    </div>
                                                                    {examDate.location && examDate.location !== "TBD" && (
                                                                        <div className="text-xs text-gray-500">📍 {examDate.location}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                <div>
                                                                    {examDate.registration_deadline ? (
                                                                        <div>
                                                                            <div className="font-medium text-sm">
                                                                                {formatDate(examDate.registration_deadline)}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {new Date(examDate.registration_deadline).toLocaleTimeString('en-US', { 
                                                                                    hour: '2-digit', 
                                                                                    minute: '2-digit', 
                                                                                    hour12: true 
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-gray-400">Not set</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="text-sm font-medium">
                                                                Rs. {examDate.price.toFixed(2)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className={`flex items-center justify-center gap-1 ${regStatus.color}`}>
                                                                {regStatus.icon}
                                                                <span className="font-medium">
                                                                    {examDate.currentRegistrations}/{examDate.maxParticipants}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 text-center">
                                                                {Math.round((examDate.currentRegistrations / examDate.maxParticipants) * 100)}% filled
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center">
                                                                <Badge className={`${getStatusColor(examDate.status)} flex items-center gap-1`}>
                                                                    {getStatusIcon(examDate.status)}
                                                                    <span className="capitalize">{examDate.status}</span>
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-56" align="end">
                                                                    <div className="flex flex-col space-y-3">
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Change Status</label>
                                                                            <Select 
                                                                                value={examDate.status} 
                                                                                onValueChange={(value) => 
                                                                                    handleStatusChange(examDate.examDateId, value as 'upcoming' | 'completed' | 'cancelled')
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="w-full">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="upcoming">📅 Upcoming</SelectItem>

                                                                                    <SelectItem value="completed">✅ Completed</SelectItem>
                                                                                    <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        
                                                                        <hr className="border-gray-200" />
                                                                        
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                            View Details
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            className="justify-start"
                                                                            onClick={() => openEditModal(examDate)}
                                                                        >
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit Exam
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            className="justify-start"
                                                                            onClick={() => handleViewRegistrations(examDate.examDateId, examDate.examName)}
                                                                        >
                                                                            <Users className="w-4 h-4 mr-2" />
                                                                            View Registrations
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="justify-start">
                                                                            <Download className="w-4 h-4 mr-2" />
                                                                            Export Data
                                                                        </Button>
                                                                        {examDate.status === "completed" && !examDate.resultsPublished && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="justify-start text-green-600"
                                                                                onClick={() => handlePublishResults(examDate.examDateId)}
                                                                            >
                                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                                Publish Results
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="justify-start text-red-600"
                                                                            onClick={() => {
                                                                                console.log('Delete button clicked for exam:', examDate.examName);
                                                                                console.log('Exam ID being set:', examDate.examId);
                                                                                console.log('Exam Date ID:', examDate.examDateId);
                                                                                console.log('Full exam object:', examDate);
                                                                                setDeleteExamId(examDate.examId);
                                                                            }}
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
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Empty State */}
                        {filteredAndGroupedExamDates.length === 0 && (
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
                                        <Label htmlFor="examCodeName">Exam Code Name</Label>
                                        <Input
                                            id="examCodeName"
                                            value={formData.code_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, code_name: e.target.value }))}
                                            placeholder="e.g., GCAT, GCCT"
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

                                    <div>
                                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                                        <Input
                                            id="registrationDeadline"
                                            type="datetime-local"
                                            value={formData.registration_deadline}
                                            onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                                            min={getCurrentDateTimeLocal()}
                                            max={formData.exam_dates.length > 0 && formData.exam_dates[0].date ? formData.exam_dates[0].date : undefined}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Must be before the exam date and cannot be in the past</p>
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
                                                    exam_dates: [...prev.exam_dates, { date: "", location: "", location_id: "" }]
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
                                                        min={getCurrentDateTimeLocal()}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        key={`location-select-${index}-${examDate.location_id || 'empty'}-${locations.length}`}
                                                        value={examDate.location_id ? examDate.location_id.toString() : ""}
                                                        onValueChange={(value) => {
                                                            if (locationsLoading) return;
                                                            const newExamDates = [...formData.exam_dates];
                                                            if (value === "") {
                                                                // User selected "Select location" (empty option)
                                                                newExamDates[index] = {
                                                                    ...newExamDates[index],
                                                                    location_id: "",
                                                                    location: ""
                                                                };
                                                            } else {
                                                                // User selected a specific location
                                                                const selectedLocation = locations.find(loc => loc.id === parseInt(value));
                                                                newExamDates[index] = {
                                                                    ...newExamDates[index],
                                                                    location_id: parseInt(value),
                                                                    location: selectedLocation ? selectedLocation.location_name : ""
                                                                };
                                                            }
                                                            setFormData(prev => ({ ...prev, exam_dates: newExamDates }));
                                                        }}
                                                    >
                                                        <SelectTrigger className="text-sm">
                                                            <SelectValue 
                                                                key={`select-value-${examDate.location_id || 'none'}`}
                                                                placeholder="Select location" 
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="">Select location</SelectItem>
                                                            {locations.map(location => (
                                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                                    {location.location_name}
                                                                </SelectItem>
                                                            ))}
                                                            {locations.length === 0 && !locationsLoading && (
                                                                <div className="px-2 py-1 text-sm text-gray-500">
                                                                    No locations available. Create locations first.
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {locationsError && (
                                                        <p className="text-red-500 text-xs mt-1">{locationsError}</p>
                                                    )}
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

                {/* Exam Date Details Modal */}
                <ExamDateDetailsModal
                    isOpen={showExamDateDetails}
                    onClose={handleCloseExamDateDetails}
                    examDateId={selectedExamDateId}
                    examName={selectedExamName}
                />
            </div>
        </div>
    );
}
