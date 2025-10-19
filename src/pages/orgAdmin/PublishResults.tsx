// src/pages/orgAdmin/PublishResults.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import {
    Upload,
    FileText,
    Download,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    BookOpen,
    Target,
    Eye,
    Send,
    X,
    Info,
    Users,
    Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface ExamDate {
    id: number;
    date: string;
    location?: string;
    status?: string;
    student_exams_count?: number;
}

interface Exam {
    id: number;
    name: string;
    code_name: string;
    description: string;
    price: number;
    organization_id: number;
    exam_dates: ExamDate[];
}

// Flattened structure for display - each exam date becomes a separate card
interface ExamDateCard {
    id: number;
    exam_id: number;
    exam_name: string;
    exam_code_name: string;
    exam_description: string;
    exam_price: number;
    date: string;
    location?: string;
    status?: string;
    student_count: number;
}

interface ResultEntry {
    id: string;
    studentId: string;
    studentName: string;
    score: number;
    grade: string;
    isValid: boolean;
    errors: string[];
}

interface ManualEntry {
    studentId: string;
    score: string;
    grade: string;
}

interface Student {
    id: number;
    index_number: string;
    student_id: number;
    student_name: string;
    status: string;
    attended: boolean;
    result: string | null;
    selected_exam_date_id: number;
    assigned_location_id: number | null;
}

interface PublishedResult {
    id: number;
    index_number: string;
    student_id: number;
    student_name: string;
    result: string;
    attended: boolean;
    status: string;
    updated_at: string;
}

// Helper function to determine exam date status
const getExamDateStatus = (date: string): "completed" | "active" | "draft" => {
    const now = new Date();
    const examDate = new Date(date);
    
    if (examDate < now) return "completed";
    if (examDate > now) return "active";
    return "draft";
};

// Helper function to flatten exams with their exam dates into separate cards
const flattenExamDates = (exams: Exam[]): ExamDateCard[] => {
    // Ensure exams is an array
    if (!Array.isArray(exams)) {
        console.error("flattenExamDates: exams is not an array:", exams);
        return [];
    }
    
    const flattened: ExamDateCard[] = [];
    
    exams.forEach(exam => {
        // Ensure exam has exam_dates array
        if (!exam.exam_dates || !Array.isArray(exam.exam_dates)) {
            console.warn("Exam has no exam_dates:", exam);
            return;
        }
        
        exam.exam_dates
            .filter(examDate => new Date(examDate.date) < new Date())
            .forEach(examDate => {
                flattened.push({
                    id: examDate.id,
                    exam_id: exam.id,
                    exam_name: exam.name,
                    exam_code_name: exam.code_name,
                    exam_description: exam.description,
                    exam_price: exam.price,
                    date: examDate.date,
                    location: examDate.location,
                    status: examDate.status,
                    student_count: examDate.student_exams_count || 0
                });
            });
    });
    
    // Sort by exam name, then by date
    return flattened.sort((a, b) => {
        if (a.exam_name !== b.exam_name) {
            return a.exam_name.localeCompare(b.exam_name);
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
};


const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
        case "A+":
        case "A":
            return "bg-green-100 text-green-800";
        case "A-":
        case "B+":
        case "B":
            return "bg-blue-100 text-blue-800";
        case "B-":
        case "C+":
        case "C":
            return "bg-yellow-100 text-yellow-800";
        case "C-":
        case "D":
            return "bg-orange-100 text-orange-800";
        case "F":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const validateStudentId = (studentId: string, students: Student[]): boolean => {
    return students.some(student => student.index_number === studentId);
};

const getStudentName = (studentId: string, students: Student[]): string => {
    const student = students.find(s => s.index_number === studentId);
    return student ? student.student_name : "Unknown Student";
};

const validateScore = (score: number): boolean => {
    return score >= 0 && score <= 100;
};

const validateGrade = (grade: string): boolean => {
    const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    return validGrades.includes(grade.toUpperCase());
};

const parseCSVContent = (content: string, students: Student[]): ResultEntry[] => {
    const lines = content.trim().split('\n');
    const results: ResultEntry[] = [];

    // Skip header row if present
    const dataLines = lines[0].toLowerCase().includes('student') ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
        const [studentId, score, grade] = line.split(',').map(item => item.trim());

        if (!studentId && !score && !grade) return; // Skip empty lines

        const errors: string[] = [];
        const numericScore = parseFloat(score);

        if (!studentId) errors.push("Student ID is required");
        else if (!validateStudentId(studentId, students)) errors.push("Invalid Student ID");

        if (!score) errors.push("Score is required");
        else if (isNaN(numericScore)) errors.push("Score must be a number");
        else if (!validateScore(numericScore)) errors.push("Score must be between 0-100");

        if (!grade) errors.push("Grade is required");
        else if (!validateGrade(grade)) errors.push("Invalid grade format");

        results.push({
            id: `row-${index}`,
            studentId: studentId || "",
            studentName: studentId ? getStudentName(studentId, students) : "",
            score: numericScore || 0,
            grade: grade || "",
            isValid: errors.length === 0,
            errors
        });
    });

    return results;
};

export default function PublishResults() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [examDateCards, setExamDateCards] = useState<ExamDateCard[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [publishedResults, setPublishedResults] = useState<PublishedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedExamDate, setSelectedExamDate] = useState<number | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [manualEntry, setManualEntry] = useState<ManualEntry>({
        studentId: "",
        score: "",
        grade: ""
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editingResult, setEditingResult] = useState<PublishedResult | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch exams from API
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/exam-dates", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("API Response:", response.data); // Debug log

                // Handle different response structures
                let fetchedExams: Exam[] = [];
                
                if (response.data && response.data.data) {
                    fetchedExams = Array.isArray(response.data.data) ? response.data.data : [];
                } else if (Array.isArray(response.data)) {
                    fetchedExams = response.data;
                } else {
                    console.error("Unexpected API response structure:", response.data);
                    setError("Invalid response format from server");
                    return;
                }

                console.log("Fetched exams:", fetchedExams); // Debug log
                setExams(fetchedExams);
                
                // Flatten the exams into separate exam date cards
                const flattened = flattenExamDates(fetchedExams);
                setExamDateCards(flattened);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || err.message || "Failed to fetch exams");
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    const selectedExamDateData = useMemo(() => {
        return examDateCards.find(card => card.id === selectedExamDate);
    }, [selectedExamDate, examDateCards]);

    // Fetch students when exam date is selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedExamDate) {
                setStudents([]);
                return;
            }

            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                const response = await axios.get(`http://localhost:8000/api/admin/exam-dates/${selectedExamDate}/students`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setStudents(response.data.data.students || []);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || err.message || "Failed to fetch students");
            }
        };

        fetchStudents();
    }, [selectedExamDate]);

    // Fetch published results when exam date is selected
    useEffect(() => {
        const fetchPublishedResults = async () => {
            if (!selectedExamDate) {
                setPublishedResults([]);
                return;
            }

            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                const response = await axios.get(`http://localhost:8000/api/admin/exam-dates/${selectedExamDate}/published-results`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setPublishedResults(response.data.data.results || []);
            } catch (err: any) {
                console.error(err);
                // Don't set error for published results as it's optional
                setPublishedResults([]);
            }
        };

        fetchPublishedResults();
    }, [selectedExamDate]);

    const validResults = useMemo(() => {
        return results.filter(result => result.isValid);
    }, [results]);

    const invalidResults = useMemo(() => {
        return results.filter(result => !result.isValid);
    }, [results]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parsedResults = parseCSVContent(content, students);
            setResults(parsedResults);
        };
        reader.readAsText(file);
    }, [students]);

    const handleAddManualEntry = useCallback(() => {
        const { studentId, score, grade } = manualEntry;

        if (!studentId || !score || !grade) {
            alert('Please fill all fields');
            return;
        }

        const numericScore = parseFloat(score);
        const errors: string[] = [];

        if (!validateStudentId(studentId, students)) errors.push("Invalid Student ID");
        if (isNaN(numericScore) || !validateScore(numericScore)) errors.push("Invalid score");
        if (!validateGrade(grade)) errors.push("Invalid grade");

        // Check for duplicate entries
        if (results.some(r => r.studentId === studentId)) {
            errors.push("Student already has a result entry");
        }

        const newEntry: ResultEntry = {
            id: `manual-${Date.now()}`,
            studentId,
            studentName: getStudentName(studentId, students),
            score: numericScore,
            grade: grade.toUpperCase(),
            isValid: errors.length === 0,
            errors
        };

        setResults(prev => [...prev, newEntry]);
        setManualEntry({ studentId: "", score: "", grade: "" });
    }, [manualEntry, results, students]);

    const handleRemoveResult = useCallback((id: string) => {
        setResults(prev => prev.filter(result => result.id !== id));
    }, []);

    const handlePublishResults = useCallback(async () => {
        if (validResults.length === 0) {
            alert('No valid results to publish');
            return;
        }

        if (!selectedExamDate) {
            alert('No exam date selected');
            return;
        }

        setIsPublishing(true);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                alert('No authentication token found');
                return;
            }

            // Transform results to match API format
            const resultsData = validResults.map(result => ({
                index_number: result.studentId,
                result: result.grade,
                attended: true // Assuming all students with results attended
            }));

            const response = await axios.post(
                `http://localhost:8000/api/admin/exam-dates/${selectedExamDate}/publish-results`,
                { results: resultsData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsPublished(true);
            setShowConfirmModal(false);
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to publish results. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    }, [validResults, selectedExamDate]);

    const downloadSampleCSV = useCallback(() => {
        if (students.length === 0) {
            alert('No students available for this exam date');
            return;
        }

        const sampleData = [
            "Student ID,Score,Grade",
            ...students.slice(0, 5).map(student => 
                `${student.index_number},${Math.floor(Math.random() * 40) + 60},${['A', 'B+', 'B', 'C+', 'C'][Math.floor(Math.random() * 5)]}`
            )
        ].join('\n');

        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [students]);

    const handleEditResult = useCallback((result: PublishedResult) => {
        setEditingResult(result);
        setShowEditModal(true);
    }, []);

    const handleUpdateResult = useCallback(async () => {
        if (!editingResult || !selectedExamDate) return;

        setIsUpdating(true);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                alert('No authentication token found');
                return;
            }

            const response = await axios.put(
                `http://localhost:8000/api/admin/exam-dates/${selectedExamDate}/results/${editingResult.id}`,
                {
                    result: editingResult.result,
                    attended: editingResult.attended
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update the published results list
            setPublishedResults(prev => 
                prev.map(result => 
                    result.id === editingResult.id 
                        ? { ...result, ...response.data.data }
                        : result
                )
            );

            setShowEditModal(false);
            setEditingResult(null);
            alert('Result updated successfully!');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update result. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    }, [editingResult, selectedExamDate]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading exams...</span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Exams</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Publish Results</h1>
                            <p className="text-gray-600 text-sm">Upload and publish exam results to notify students</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={downloadSampleCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Sample CSV
                    </Button>
                </div>

                {/* Success State */}
                {isPublished && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-green-900">Results Published Successfully!</h3>
                                    <p className="text-green-700 text-sm">
                                        {validResults.length} students have been notified about their results for {selectedExamDateData?.exam_name} ({new Date(selectedExamDateData?.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Exam Date Selection */}
                <div className="mb-6">
                    {examDateCards.length === 0 ? (
                        <Card className="text-center py-8">
                            <CardContent>
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exam Dates Available</h3>
                                <p className="text-gray-600">There are no past exam dates available for publishing results.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {examDateCards.map(examDateCard => {
                                const status = getExamDateStatus(examDateCard.date);
                                
                                return (
                                    <Card
                                        key={examDateCard.id}
                                        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${selectedExamDate === examDateCard.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg leading-tight mb-2">{examDateCard.exam_name}</CardTitle>
                                                    <Badge
                                                        className={`${status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : status === 'active'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            } text-xs`}
                                                    >
                                                        {status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{examDateCard.exam_code_name}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {new Date(examDateCard.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    
                                                    {examDateCard.location && (
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">{examDateCard.location}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{examDateCard.student_count} students</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => setSelectedExamDate(examDateCard.id)}
                                                    className={`w-full transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 ${selectedExamDate === examDateCard.id ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}`}
                                                    variant="outline"
                                                    disabled={status !== 'completed'}
                                                >
                                                    {selectedExamDate === examDateCard.id ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Selected - Publish Results
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            {status === 'completed' ? 'Publish Results' : 'Not Available'}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {selectedExamDateData && (
                        <Card className="mt-6 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">
                                                Selected: {selectedExamDateData.exam_name}
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                {new Date(selectedExamDateData.date).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })} - Ready to publish results for {selectedExamDateData.student_count} students
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedExamDate(null);
                                            setCsvFile(null);
                                            setResults([]);
                                            setManualEntry({ studentId: "", score: "", grade: "" });
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {selectedExamDate && (
                    <>
                        {/* File Upload Section */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Results CSV
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <label htmlFor="csv-upload" className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                                                Click to upload CSV file
                                            </span>
                                            <span className="text-gray-500"> or drag and drop</span>
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">
                                            CSV format: Student ID, Score, Grade
                                        </p>
                                    </div>

                                    {csvFile && (
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium">{csvFile.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(csvFile.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setCsvFile(null);
                                                    setResults([]);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Manual Entry Section */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Manual Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student ID
                                        </label>
                                        <select
                                            value={manualEntry.studentId}
                                            onChange={(e) => setManualEntry(prev => ({ ...prev, studentId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select student...</option>
                                            {students.map(student => (
                                                <option key={student.index_number} value={student.index_number}>
                                                    {student.index_number} - {student.student_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Score (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={manualEntry.score}
                                            onChange={(e) => setManualEntry(prev => ({ ...prev, score: e.target.value }))}
                                            placeholder="85"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Grade
                                        </label>
                                        <select
                                            value={manualEntry.grade}
                                            onChange={(e) => setManualEntry(prev => ({ ...prev, grade: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select grade...</option>
                                            <option value="A+">A+</option>
                                            <option value="A">A</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B">B</option>
                                            <option value="B-">B-</option>
                                            <option value="C+">C+</option>
                                            <option value="C">C</option>
                                            <option value="C-">C-</option>
                                            <option value="D">D</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddManualEntry} className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Entry
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Preview */}
                        {results.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Results Preview ({results.length} entries)
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        {validResults.length > 0 && (
                                            <Badge className="bg-green-100 text-green-800">
                                                {validResults.length} Valid
                                            </Badge>
                                        )}
                                        {invalidResults.length > 0 && (
                                            <Badge className="bg-red-100 text-red-800">
                                                {invalidResults.length} Invalid
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Student ID</TableHead>
                                                    <TableHead>Student Name</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead>Grade</TableHead>
                                                    <TableHead>Errors</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.map((result) => (
                                                    <TableRow key={result.id} className={!result.isValid ? "bg-red-50" : ""}>
                                                        <TableCell>
                                                            {result.isValid ? (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{result.studentId}</TableCell>
                                                        <TableCell>{result.studentName || "Unknown"}</TableCell>
                                                        <TableCell>{result.score}%</TableCell>
                                                        <TableCell>
                                                            <Badge className={getGradeColor(result.grade)}>
                                                                {result.grade}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {result.errors.length > 0 && (
                                                                <div className="text-red-600 text-sm">
                                                                    {result.errors.join(", ")}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveResult(result.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Publish Section */}
                        {validResults.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        Publish Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium text-blue-900">Publication Summary</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-600 font-medium">Valid Results:</span>
                                                    <p>{validResults.length} students</p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-600 font-medium">Notifications:</span>
                                                    <p>{validResults.length} students will be notified</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setShowConfirmModal(true)}
                                            className="w-full"
                                            disabled={isPublishing || isPublished}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {isPublished ? "Results Published" : "Publish Results"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Published Results Section */}
                {publishedResults.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Published Results ({publishedResults.length} students)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student ID</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>Attended</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {publishedResults.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell className="font-medium">{result.index_number}</TableCell>
                                                <TableCell>{result.student_name}</TableCell>
                                                <TableCell>
                                                    <Badge className={getGradeColor(result.result)}>
                                                        {result.result}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {result.attended ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(result.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditResult(result)}
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                    <h3 className="text-lg font-semibold">Confirm Publication</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to publish results for <strong>{selectedExamDateData?.exam_name}</strong> on <strong>{selectedExamDateData?.date ? new Date(selectedExamDateData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</strong>?
                                    This will notify <strong>{validResults.length} students</strong> about their results.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConfirmModal(false)}
                                        disabled={isPublishing}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePublishResults}
                                        disabled={isPublishing}
                                        className="flex-1"
                                    >
                                        {isPublishing ? "Publishing..." : "Publish Results"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg w-full max-w-lg mx-4 shadow-xl">
                            <div className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Results Published Successfully!</h3>
                                    <p className="text-gray-600 mb-4">
                                        {validResults.length} students have been notified about their results for {selectedExamDateData?.exam_name} on {selectedExamDateData?.date ? new Date(selectedExamDateData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}.
                                    </p>

                                    <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                                        <h4 className="font-medium mb-2">Affected Students:</h4>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {validResults.slice(0, 10).map((result) => (
                                                <div key={result.id} className="text-sm flex justify-between">
                                                    <span>{result.studentId} - {result.studentName}</span>
                                                    <Badge className={`${getGradeColor(result.grade)} text-xs`}>
                                                        {result.grade}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {validResults.length > 10 && (
                                                <div className="text-sm text-gray-500">
                                                    ... and {validResults.length - 10} more students
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Result Modal */}
                {showEditModal && editingResult && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
                        <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                    <h3 className="text-lg font-semibold">Edit Result</h3>
                                </div>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student
                                        </label>
                                        <p className="text-gray-900 font-medium">
                                            {editingResult.index_number} - {editingResult.student_name}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Grade
                                        </label>
                                        <select
                                            value={editingResult.result}
                                            onChange={(e) => setEditingResult(prev => prev ? { ...prev, result: e.target.value } : null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="A+">A+</option>
                                            <option value="A">A</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B">B</option>
                                            <option value="B-">B-</option>
                                            <option value="C+">C+</option>
                                            <option value="C">C</option>
                                            <option value="C-">C-</option>
                                            <option value="D">D</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editingResult.attended}
                                                onChange={(e) => setEditingResult(prev => prev ? { ...prev, attended: e.target.checked } : null)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Student attended the exam</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingResult(null);
                                        }}
                                        disabled={isUpdating}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateResult}
                                        disabled={isUpdating}
                                        className="flex-1"
                                    >
                                        {isUpdating ? "Updating..." : "Update Result"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
