// src/pages/orgAdmin/ManageStudents.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Search, Eye, Users, ChevronLeft, ChevronRight, BookUser, Globe, Flag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    last_exam_name?: string;
    last_registered_at?: string;
    paid_exam_names?: string[];
    paid_exam_count?: number;
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

    // Detail modal state
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
    const [detailData, setDetailData] = useState<any | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // --- STEP 3: Create a function to fetch data from the API ---
    // useCallback ensures this function is not recreated on every render, which is good practice.
    const fetchStudents = useCallback(async (currentPage: number, query: string) => {
        setLoading(true);
        setError(null);
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('auth_token');
            console.log('Auth token exists:', !!token);
            
            // Construct query parameters for pagination and search
            const params = new URLSearchParams({
                page: String(currentPage),
                per_page: '10', // Or make this dynamic
            });
            if (query) {
                params.append('q', query);
            }

            console.log('Fetching students with params:', params.toString());
            const response = await apiClient.get(`/students?${params.toString()}`);
            
            console.log('Students API response:', response.data);
            setStudents(response.data.data);
            setMeta(response.data.meta);
            
        } catch (err: any) {
            console.error("Failed to fetch students:", err);
            console.error("Response data:", err.response?.data);
            console.error("Response status:", err.response?.status);
            console.error("Request URL:", err.config?.url);
            console.error("Request headers:", err.config?.headers);
            
            // More detailed error handling
            let errorMessage = "An error occurred while fetching data.";
            if (err.response?.status === 401) {
                errorMessage = "Authentication failed. Please log in again.";
            } else if (err.response?.status === 403) {
                errorMessage = "Access denied. You don't have permission to view students.";
            } else if (err.response?.status === 404) {
                errorMessage = "Students endpoint not found.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- useEffect hook to trigger the initial data fetch ---
    useEffect(() => {
        fetchStudents(page, searchTerm);
    }, [page, searchTerm, fetchStudents]);

    // --- Actions: Org Admin is view-only ---
    const handleViewStudent = async (student: StudentUser) => {
        setSelectedStudent(student);
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        setDetailData(null);
        try {
            const res = await apiClient.get(`/students/${student.id}`);
            // API returns { message, data }
            const data = res.data?.data ?? student;
            console.log('Student detail data:', data);
            console.log('Exam registrations:', data?.exam_registrations);
            setDetailData(data);
        } catch (e: any) {
            console.error('Failed to fetch student detail', e);
            setDetailError(e.response?.data?.message || e.message || 'Failed to load student details');
            // fallback to row data so modal still shows something
            setDetailData(student);
        } finally {
            setDetailLoading(false);
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                            <p className="text-gray-600 text-sm">View students registered for exams in your organization</p>
                        </div>
                    </div>
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

                {/* Students Table - View-only for Org Admin */}
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
                                        <TableHead>Exam Name</TableHead>
                                        <TableHead>Date of Registration</TableHead>
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
                                                    <div className="text-sm flex items-center gap-1 flex-wrap">
                                                        {Array.isArray(user.paid_exam_names) && user.paid_exam_names.length > 0 ? (
                                                            <>
                                                                <span>{user.paid_exam_names.slice(0,2).join(', ')}</span>
                                                                {(user.paid_exam_count && user.paid_exam_count > 2) && (
                                                                    <span className="text-xs text-gray-500">+{user.paid_exam_count - 2} more</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{user.last_registered_at ? formatDate(user.last_registered_at) : '—'}</div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewStudent(user)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Button>
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

                {/* Student Detail Modal */}
                {detailOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold">Student Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {detailLoading ? (
                                    <div className="text-center text-gray-600">Loading details...</div>
                                ) : detailError ? (
                                    <div className="text-center text-red-600">{detailError}</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Name</div>
                                                <div className="font-medium">{detailData?.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Email</div>
                                                <div className="font-medium">{detailData?.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Passport / NIC</div>
                                                <div className="font-medium">{detailData?.student?.passport_nic ?? detailData?.nic ?? '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Type</div>
                                                <div>
                                                    {((detailData?.local ?? detailData?.student?.local) !== undefined) ? (
                                                        <Badge className={(detailData?.local ?? detailData?.student?.local) ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                                                            {(detailData?.local ?? detailData?.student?.local) ? 'Local' : 'Foreign'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-700">N/A</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Joined</div>
                                                <div className="font-medium">{detailData?.created_at ? formatDate(detailData.created_at) : '—'}</div>
                                            </div>
                                        </div>

                                        {/* Exam registrations with status */}
                                        {Array.isArray(detailData?.exam_registrations) && detailData.exam_registrations.length > 0 && (
                                            <div className="pt-4 border-t">
                                                <div className="text-sm text-gray-500 mb-3 font-medium">Exam Registrations</div>
                                                <div className="space-y-2">
                                                    {detailData.exam_registrations.map((ex: any, idx: number) => (
                                                        <div key={ex.id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{ex.name ?? ex.title ?? `Exam #${ex.id ?? idx + 1}`}</div>
                                                                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                                                    {ex.registered_at && (
                                                                        <div>
                                                                            <span className="font-medium">Registered:</span> {new Date(ex.registered_at).toLocaleDateString('en-US', { 
                                                                                year: 'numeric', 
                                                                                month: 'short', 
                                                                                day: 'numeric' 
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    {ex.exam_date && (
                                                                        <div>
                                                                            <span className="font-medium">Exam Date:</span> {new Date(ex.exam_date).toLocaleDateString('en-US', { 
                                                                                year: 'numeric', 
                                                                                month: 'short', 
                                                                                day: 'numeric' 
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Badge className={ex.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                                                {ex.completed ? 'Completed' : 'Upcoming'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t flex justify-end">
                                <Button variant="outline" onClick={() => { setDetailOpen(false); setSelectedStudent(null); setDetailData(null); }}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

