// src/pages/orgAdmin/PublishResults.tsx
import { useState, useCallback, useMemo } from "react";
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
    Users
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Exam {
    id: number;
    name: string;
    date: string;
    university: string;
    totalStudents: number;
    status: "completed" | "active" | "draft";
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

const mockExams: Exam[] = [
    {
        id: 1,
        name: "Data Structures & Algorithms",
        date: "2025-07-10",
        university: "University of Colombo",
        totalStudents: 125,
        status: "completed"
    },
    {
        id: 2,
        name: "Database Management Systems",
        date: "2025-07-08",
        university: "University of Peradeniya",
        totalStudents: 98,
        status: "completed"
    },
    {
        id: 3,
        name: "Software Engineering",
        date: "2025-07-12",
        university: "University of Moratuwa",
        totalStudents: 87,
        status: "completed"
    }
];

const mockStudents = [
    { id: "CS/2020/001", name: "John Doe" },
    { id: "CS/2020/002", name: "Jane Smith" },
    { id: "CS/2020/003", name: "Michael Brown" },
    { id: "CS/2020/004", name: "Sarah Wilson" },
    { id: "CS/2020/005", name: "David Kumar" }
];

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

const validateStudentId = (studentId: string): boolean => {
    return mockStudents.some(student => student.id === studentId);
};

const getStudentName = (studentId: string): string => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
};

const validateScore = (score: number): boolean => {
    return score >= 0 && score <= 100;
};

const validateGrade = (grade: string): boolean => {
    const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    return validGrades.includes(grade.toUpperCase());
};

const parseCSVContent = (content: string): ResultEntry[] => {
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
        else if (!validateStudentId(studentId)) errors.push("Invalid Student ID");

        if (!score) errors.push("Score is required");
        else if (isNaN(numericScore)) errors.push("Score must be a number");
        else if (!validateScore(numericScore)) errors.push("Score must be between 0-100");

        if (!grade) errors.push("Grade is required");
        else if (!validateGrade(grade)) errors.push("Invalid grade format");

        results.push({
            id: `row-${index}`,
            studentId: studentId || "",
            studentName: studentId ? getStudentName(studentId) : "",
            score: numericScore || 0,
            grade: grade || "",
            isValid: errors.length === 0,
            errors
        });
    });

    return results;
};

export default function PublishResults() {
    const [selectedExam, setSelectedExam] = useState<number | null>(null);
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

    const selectedExamData = useMemo(() => {
        return mockExams.find(exam => exam.id === selectedExam);
    }, [selectedExam]);

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
            const parsedResults = parseCSVContent(content);
            setResults(parsedResults);
        };
        reader.readAsText(file);
    }, []);

    const handleAddManualEntry = useCallback(() => {
        const { studentId, score, grade } = manualEntry;

        if (!studentId || !score || !grade) {
            alert('Please fill all fields');
            return;
        }

        const numericScore = parseFloat(score);
        const errors: string[] = [];

        if (!validateStudentId(studentId)) errors.push("Invalid Student ID");
        if (isNaN(numericScore) || !validateScore(numericScore)) errors.push("Invalid score");
        if (!validateGrade(grade)) errors.push("Invalid grade");

        // Check for duplicate entries
        if (results.some(r => r.studentId === studentId)) {
            errors.push("Student already has a result entry");
        }

        const newEntry: ResultEntry = {
            id: `manual-${Date.now()}`,
            studentId,
            studentName: getStudentName(studentId),
            score: numericScore,
            grade: grade.toUpperCase(),
            isValid: errors.length === 0,
            errors
        };

        setResults(prev => [...prev, newEntry]);
        setManualEntry({ studentId: "", score: "", grade: "" });
    }, [manualEntry, results]);

    const handleRemoveResult = useCallback((id: string) => {
        setResults(prev => prev.filter(result => result.id !== id));
    }, []);

    const handlePublishResults = useCallback(async () => {
        if (validResults.length === 0) {
            alert('No valid results to publish');
            return;
        }

        setIsPublishing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsPublished(true);
            setShowConfirmModal(false);
            setShowSuccessModal(true);
        } catch {
            alert('Failed to publish results. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    }, [validResults]);

    const downloadSampleCSV = useCallback(() => {
        const sampleData = [
            "Student ID,Score,Grade",
            "CS/2020/001,85,A",
            "CS/2020/002,78,B+",
            "CS/2020/003,92,A+",
            "CS/2020/004,65,C+",
            "CS/2020/005,58,C"
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
    }, []);

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
                                        {validResults.length} students have been notified about their results for {selectedExamData?.name}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Exam Selection */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockExams.map(exam => (
                            <Card
                                key={exam.id}
                                className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${selectedExam === exam.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg leading-tight mb-2">{exam.name}</CardTitle>
                                            <Badge
                                                className={`${exam.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : exam.status === 'active'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    } text-xs`}
                                            >
                                                {exam.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">{exam.university}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {new Date(exam.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">{exam.totalStudents} students</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setSelectedExam(exam.id)}
                                            className={`w-full transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 ${selectedExam === exam.id ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}`}
                                            variant="outline"
                                            disabled={exam.status !== 'completed'}
                                        >
                                            {selectedExam === exam.id ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Selected - Publish Results
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    {exam.status === 'completed' ? 'Publish Results' : 'Not Available'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedExamData && (
                        <Card className="mt-6 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">
                                                Selected: {selectedExamData.name}
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                Ready to upload and publish results for {selectedExamData.totalStudents} students
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedExam(null);
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

                {selectedExam && (
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
                                        <input
                                            type="text"
                                            value={manualEntry.studentId}
                                            onChange={(e) => setManualEntry(prev => ({ ...prev, studentId: e.target.value }))}
                                            placeholder="e.g., CS/2020/001"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
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
                                    Are you sure you want to publish results for <strong>{selectedExamData?.name}</strong>?
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
                                        {validResults.length} students have been notified about their results for {selectedExamData?.name}.
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
            </div>
        </div>
    );
}
