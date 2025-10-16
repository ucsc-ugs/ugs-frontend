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
    FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createExam } from "@/lib/examApi";

interface ExamFormData {
    name: string;
    fullName: string;
    description: string;
    date: string;
    time: string;
    registrationDeadline: string;
    duration: string;
    questionCount: number;
    maxParticipants: number;
    fee: number;
    status: "draft" | "published";
}

const durationOptions = [
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "150", label: "2.5 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
];

interface CreateExamProps {
    onBack?: () => void;
}

export default function CreateExam({ onBack }: CreateExamProps = {}) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ExamFormData>({
        name: "",
        fullName: "",
        description: "",
        date: "",
        time: "",
        registrationDeadline: "",
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

        // Registration deadline validation
        if (!formData.registrationDeadline) {
            newErrors.registrationDeadline = "Registration deadline is required";
        } else {
            const deadlineDate = new Date(formData.registrationDeadline);
            const now = new Date();
            
            // Check if deadline is in the past
            if (deadlineDate <= now) {
                newErrors.registrationDeadline = "Registration deadline must be in the future";
            }
            // Check if deadline is after exam date/time
            else if (deadlineDate >= examDate) {
                newErrors.registrationDeadline = "Registration deadline must be before the exam date and time";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Helper function to format datetime for backend (Y-m-d\TH:i format)
    const formatDateTimeForBackend = (date: string, time: string): string => {
        // Ensure time is in HH:mm format (no seconds)
        const timeParts = time.split(':');
        const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
        return `${date}T${formattedTime}`;
    };

    // Helper function to format datetime-local value for backend
    const formatDateTimeLocalForBackend = (datetimeLocal: string): string => {
        // Remove seconds if present (datetime-local might include them)
        // Format: YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DDTHH:mm
        return datetimeLocal.substring(0, 16);
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

    const handleSubmit = async (action: "draft" | "published") => {
        if (!validateForm()) return;

        // Additional validation for past dates
        const now = new Date();
        
        // Check if exam date/time is in the past
        const examDateTime = new Date(`${formData.date}T${formData.time}`);
        if (examDateTime <= now) {
            setErrors(prev => ({ ...prev, date: "Exam date and time cannot be in the past" }));
            return;
        }

        // Check if registration deadline is in the past
        if (formData.registrationDeadline) {
            const deadlineDate = new Date(formData.registrationDeadline);
            if (deadlineDate <= now) {
                setErrors(prev => ({ ...prev, registrationDeadline: "Registration deadline cannot be in the past" }));
                return;
            }

            // Check if registration deadline is after exam date
            if (deadlineDate >= examDateTime) {
                setErrors(prev => ({ ...prev, registrationDeadline: "Registration deadline must be before the exam date" }));
                return;
            }
        }

        setIsLoading(true);

        try {
            // Prepare exam data for API
            // Ensure date format matches backend expectations (Y-m-d\TH:i)
            const examDateTime = formatDateTimeForBackend(formData.date, formData.time);
            const registrationDeadline = formData.registrationDeadline ? 
                formatDateTimeLocalForBackend(formData.registrationDeadline) : undefined;
            
            const examData = {
                name: formData.name,
                description: formData.description,
                price: formData.fee,
                organization_id: 1, // This should come from logged-in org admin
                registration_deadline: registrationDeadline,
                exam_dates: [{
                    date: examDateTime,
                    location: "TBD" // You may want to add location field to the form
                }]
            };

            console.log("Sending exam data:", examData);
            console.log("Exam date format:", examDateTime);
            console.log("Registration deadline format:", registrationDeadline);

            const response = await createExam(examData);
            console.log("Exam created:", response);

            // Show success message
            alert(`Exam ${action === "draft" ? "saved as draft" : "published"} successfully!`);

            // Navigate back to manage exams
            if (onBack) {
                onBack();
            } else {
                navigate("/admin/manage-exams");
            }

        } catch (error: any) {
            console.error("Error creating exam:", error);
            alert(`Error creating exam: ${error.message || "Please try again."}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            name: "",
            fullName: "",
            description: "",
            date: "",
            time: "",
            registrationDeadline: "",
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
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
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
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
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
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="Describe the exam purpose, requirements, and any special instructions..."
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>
                                </div>
                                {/* Schedule */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange("date", e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => handleInputChange("time", e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.time ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Deadline <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.registrationDeadline}
                                                onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                                                min={getCurrentDateTimeLocal()}
                                                max={formData.date && formData.time ? `${formData.date}T${formData.time}` : undefined}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.registrationDeadline ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {errors.registrationDeadline && <p className="text-red-500 text-sm mt-1">{errors.registrationDeadline}</p>}
                                            <p className="text-xs text-gray-500 mt-1">Must be before the exam date and time, cannot be in the past</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.duration}
                                                onChange={(e) => handleInputChange("duration", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                {/* Schedule section fixed above; duplicate removed. */}

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
                        <Card className="sticky top-6 hidden lg:block">
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
                                        <Calendar className="w-4 h-4 text-red-500" />
                                        <span className="text-sm">
                                            Deadline: {formData.registrationDeadline ? 
                                                new Date(formData.registrationDeadline).toLocaleString() : 
                                                "Not set"
                                            }
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
