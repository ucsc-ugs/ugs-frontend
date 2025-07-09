// src/pages/admin/CreateExam.tsx
import { useState } from "react";
import {
    Save,
    Eye,
    RefreshCw,
    BookOpen,
    Calendar,
    Clock,
    Users,
    DollarSign,
    FileText,
    School,
    ArrowLeft
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ExamFormData {
    name: string;
    fullName: string;
    description: string;
    university: string;
    date: string;
    time: string;
    duration: string;
    questionCount: number;
    maxParticipants: number;
    fee: number;
    status: "draft" | "published";
}

const universities = [
    "University of Colombo",
    "University of Kelaniya",
    "University of Peradeniya",
    "University of Moratuwa",
    "University of Colombo School of Computing",
    "University of Ruhuna",
    "University of Jaffna"
];

const durationOptions = [
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "150", label: "2.5 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
];

export default function CreateExam() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ExamFormData>({
        name: "",
        fullName: "",
        description: "",
        university: "",
        date: "",
        time: "",
        duration: "120",
        questionCount: 50,
        maxParticipants: 100,
        fee: 0,
        status: "draft"
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Exam name is required";
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.university) newErrors.university = "University selection is required";
        if (!formData.date) newErrors.date = "Exam date is required";
        if (!formData.time) newErrors.time = "Exam time is required";
        if (formData.questionCount <= 0) newErrors.questionCount = "Question count must be greater than 0";
        if (formData.maxParticipants <= 0) newErrors.maxParticipants = "Max participants must be greater than 0";
        if (formData.fee < 0) newErrors.fee = "Fee cannot be negative";

        // Check if date is in the future
        const examDate = new Date(`${formData.date}T${formData.time}`);
        if (examDate <= new Date()) {
            newErrors.date = "Exam date must be in the future";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (action: "draft" | "published") => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const examData = {
                ...formData,
                status: action,
                id: Date.now(),
                createdAt: new Date().toISOString(),
                currentRegistrations: 0,
                resultsPublished: false
            };

            console.log("Creating exam:", examData);

            // Show success message
            alert(`Exam ${action === "draft" ? "saved as draft" : "published"} successfully!`);

            // Navigate back to manage exams
            navigate("/admin/manage-exams");

        } catch {
            alert("Error creating exam. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            name: "",
            fullName: "",
            description: "",
            university: "",
            date: "",
            time: "",
            duration: "120",
            questionCount: 50,
            maxParticipants: 100,
            fee: 0,
            status: "draft"
        });
        setErrors({});
    };

    const handleInputChange = (field: keyof ExamFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/manage-exams")}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
                            <p className="text-gray-600 text-sm">Set up a new examination for your institution</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {showPreview ? "Hide Preview" : "Preview"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Exam Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="e.g., GCCT, BIT Aptitude"
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="General Certificate of Competency Test"
                                            />
                                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            rows={4}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Describe the exam purpose, requirements, and any special instructions..."
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            University <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.university}
                                            onChange={(e) => handleInputChange("university", e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.university ? "border-red-500" : "border-gray-300"
                                                }`}
                                        >
                                            <option value="">Select a university</option>
                                            {universities.map(uni => (
                                                <option key={uni} value={uni}>{uni}</option>
                                            ))}
                                        </select>
                                        {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Schedule</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange("date", e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => handleInputChange("time", e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.time ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration
                                            </label>
                                            <select
                                                value={formData.duration}
                                                onChange={(e) => handleInputChange("duration", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {durationOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Exam Configuration */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Configuration</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question Count <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.questionCount}
                                                onChange={(e) => handleInputChange("questionCount", parseInt(e.target.value) || 0)}
                                                min="1"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.questionCount ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.questionCount && <p className="text-red-500 text-sm mt-1">{errors.questionCount}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Participants <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.maxParticipants}
                                                onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value) || 0)}
                                                min="1"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxParticipants ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fee (LKR)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.fee}
                                                onChange={(e) => handleInputChange("fee", parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fee ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.fee && <p className="text-red-500 text-sm mt-1">{errors.fee}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClear}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Clear Form
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSubmit("draft")}
                                            disabled={isLoading}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save as Draft
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={() => handleSubmit("published")}
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            {isLoading ? "Publishing..." : "Publish Exam"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-1">
                        <Card className={`sticky top-6 ${showPreview ? "block" : "hidden lg:block"}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{formData.name || "Exam Name"}</h3>
                                    <p className="text-sm text-gray-600">{formData.fullName || "Full exam name"}</p>
                                    <Badge className="mt-2 bg-blue-100 text-blue-800">
                                        {formData.status === "draft" ? "Draft" : "Published"}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <School className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">{formData.university || "No university selected"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            {formData.date ? new Date(formData.date).toLocaleDateString() : "No date selected"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            {formData.time || "No time selected"}
                                            {formData.duration && ` (${durationOptions.find(d => d.value === formData.duration)?.label})`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">Max {formData.maxParticipants} participants</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">{formData.questionCount} questions</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            {formData.fee > 0 ? `LKR ${formData.fee.toFixed(2)}` : "Free"}
                                        </span>
                                    </div>
                                </div>

                                {formData.description && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-gray-600">{formData.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
