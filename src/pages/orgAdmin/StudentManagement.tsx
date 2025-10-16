// src/pages/orgAdmin/ManageStudents.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    BookUser,
    Globe,
    Flag,
    University,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// --- STEP 1: Define TypeScript interfaces to match the API response ---
// These types describe the structure of the data coming from your Laravel backend.
interface Organization {
    id: number;
    name: string;
}

interface StudentDetails {
    id: number;
    local: boolean;
    passport_nic: string;
}

interface StudentUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
    // The backend StudentResource returns a flattened shape. Support both shapes:
    // - legacy: { student: { local, passport_nic, ... }, exams: [] }
    // - resource: { nic, registration, local, exams_count, organization: string }
    organization?: Organization | string; // may be an object or a string (resource returns name)
    student?: StudentDetails | null;
    nic?: string;
    registration?: string;
    local?: boolean;
    exams?: any[]; // list when nested
    exams_count?: number; // when returned from resource
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// --- Helper to create a configured Axios instance ---
// FIX: Removed process.env which is not available in the browser and causes a crash.
// The baseURL should be configured in your build environment (e.g., using Vite's import.meta.env.VITE_API_URL)
// For now, we'll hardcode it to the common local development URL.
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: false, // Changed to false to avoid CORS issues
});

// Interceptor to add auth token to requests if available
apiClient.interceptors.request.use(config => {
    // Use the canonical storage key used across the app: 'auth_token'
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export default function ManageStudents() {
    // --- STEP 2: Update state management for students, loading, and API data ---
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // --- STEP 3: Create a function to fetch data from the API ---
    // useCallback ensures this function is not recreated on every render, which is good practice.
    const fetchStudents = useCallback(async (currentPage: number, query: string) => {
        setLoading(true);
        setError(null);
        try {
            // Construct query parameters for pagination and search
            const params = new URLSearchParams({
                page: String(currentPage),
                per_page: '10', // Or make this dynamic
            });
            if (query) {
                params.append('q', query);
            }

            const response = await apiClient.get(`/students?${params.toString()}`);
            
            setStudents(response.data.data);
            setMeta(response.data.meta);
            
        } catch (err: any) {
            console.error("Failed to fetch students:", err);
            console.error("Response data:", err.response?.data);
            console.error("Response status:", err.response?.status);
            console.error("Request URL:", err.config?.url);
            setError(err.response?.data?.message || err.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    }, []);

    // --- useEffect hook to trigger the initial data fetch ---
    useEffect(() => {
        fetchStudents(page, searchTerm);
    }, [page, searchTerm, fetchStudents]);

    // --- Functions for actions (delete, edit, etc.) ---
    const handleDeleteStudent = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this student? This action is permanent.")) {
            try {
                await apiClient.delete(`/students/${id}`);
                // Refresh the list after successful deletion
                fetchStudents(page, searchTerm);
            } catch (err: any) {
                console.error("Failed to delete student:", err);
                alert(err.response?.data?.message || "Failed to delete student.");
            }
        }
    };

    const handleEditStudent = (student: StudentUser) => {
        console.log("TODO: Open edit modal for student:", student);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // --- useMemo to calculate stats only when students array changes ---
    const stats = useMemo(() => {
        // Use top-level `local` when available, otherwise fall back to nested `student.local`.
        const localStudents = students.filter(s => (s.local ?? s.student?.local) === true).length;
        const foreignStudents = students.filter(s => {
            const isLocal = s.local ?? s.student?.local;
            return isLocal === false;
        }).length;
        return { localStudents, foreignStudents };
    }, [students]);

    return (
        <div className="min-h-screen p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
                            <p className="text-gray-600 text-sm">View, add, and manage students in the organization</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Student
                    </Button>
                </div>

                {/* Stats Cards - Updated for Students */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                           <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{meta?.total ?? '...'}</p>
                           </div>
                           <Users className="w-8 h-8 text-blue-600" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                           <div>
                                <p className="text-sm text-gray-600">Local Students</p>
                                <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.localStudents}</p>
                           </div>
                           <Flag className="w-8 h-8 text-green-600" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                           <div>
                                <p className="text-sm text-gray-600">Foreign Students</p>
                                <p className="text-2xl font-bold text-purple-600">{loading ? '...' : stats.foreignStudents}</p>
                           </div>
                           <Globe className="w-8 h-8 text-purple-600" />
                        </CardContent>
                    </Card>
                </div>


                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students by name, email, or Passport/NIC..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to first page on new search
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table - STEP 4: Update table to display student data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookUser className="w-5 h-5" />
                            Students ({meta?.total ?? 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Passport / NIC</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Organization</TableHead>
                                        <TableHead>Exams</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
                                    ) : error ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10 text-red-500">{error}</TableCell></TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10">No students found.</TableCell></TableRow>
                                    ) : (
                                        students.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{user.student?.passport_nic ?? user.nic ?? '—'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {((user.local ?? user.student?.local) !== undefined) ? (
                                                        <Badge className={(user.local ?? user.student?.local) ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}>
                                                            {(user.local ?? user.student?.local) ? 'Local' : 'Foreign'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-700">N/A</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <University className="w-4 h-4 text-gray-400" />
                                                        {typeof user.organization === 'string' ? (user.organization || 'N/A') : (user.organization?.name ?? 'N/A')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{user.exams_count ?? user.exams?.length ?? 0} Registered</div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                   <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-48" align="end">
                                                            <div className="flex flex-col space-y-1">
                                                                <Button variant="ghost" size="sm" className="justify-start"><Eye className="w-4 h-4 mr-2" />View Profile</Button>
                                                                <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleEditStudent(user)}><Edit className="w-4 h-4 mr-2" />Edit Student</Button>
                                                                <Button variant="ghost" size="sm" className="justify-start text-red-600" onClick={() => handleDeleteStudent(user.id)}><Trash2 className="w-4 h-4 mr-2" />Delete Student</Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination Controls */}
                        {meta && meta.last_page > 1 && !loading && (
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-sm text-gray-600">
                                    Page {meta.current_page} of {meta.last_page} ({meta.total} results)
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page}>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

