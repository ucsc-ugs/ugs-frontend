import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    ArrowLeft,
    Eye,
    EyeOff,
    Pin,
    Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Interfaces
interface Exam {
    id: string;
    title: string;
    date: string;
    department: string;
}

// Department interface removed (not used)

interface AnnouncementTemplate {
    id: string;
    name: string;
    title: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function CreateAnnouncement() {
    const API_URL =
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
            ? import.meta.env.VITE_API_URL
            : (typeof process !== 'undefined' && process.env.REACT_APP_API_URL)
                ? process.env.REACT_APP_API_URL
                : 'http://localhost:8000';

    const navigate = useNavigate();
    const location = useLocation();
    const editingAnnouncement = location.state?.editingAnnouncement || null;

    // State management
    const [exams, setExams] = useState<Exam[]>([]);
    const [userOrgId, setUserOrgId] = useState<number | null>(null);

    // Fetch logged-in user's organization_id
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        axios.get(
            `${API_URL}/api/user`,
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        )
            .then(res => {
                setUserOrgId(res.data.organization_id || null);
            })
            .catch(() => setUserOrgId(null));
    }, [API_URL]);

    // Fetch exams for logged-in org admin, filter by user's organization_id
    useEffect(() => {
        if (userOrgId === null) {
            setExams([]);
            return;
        }
        const fetchExams = async () => {
            const token = localStorage.getItem('auth_token');
            try {
                const response = await axios.get(
                    `${API_URL}/api/exams`,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
                const examsData = response.data.data || response.data;
                setExams(
                    examsData
                        .filter((exam: any) => exam.organization_id === userOrgId)
                        .map((exam: any) => ({
                            id: exam.id,
                            title: exam.name,
                            date: exam.exam_dates?.[0]?.date || '',
                            department: exam.organization?.name || ''
                        }))
                );
            } catch (err) {
                setExams([]);
            }
        };
        fetchExams();
    }, [API_URL, userOrgId]);

    // Department-specific audience removed; departments variable not needed

    const [templates] = useState<AnnouncementTemplate[]>([
        { id: '1', name: 'Exam Reminder', title: 'Exam Reminder: [Exam Name]', message: 'This is a reminder about your upcoming exam...', category: 'exam', priority: 'high' },
        { id: '2', name: 'General Notice', title: 'Important Notice', message: 'We would like to inform you...', category: 'general', priority: 'medium' },
        { id: '3', name: 'Emergency Alert', title: 'URGENT: Emergency Notice', message: 'Immediate attention required...', category: 'emergency', priority: 'urgent' }
    ]);

    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Add this state
    const [userId, setUserId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'all' as 'all' | 'exam-specific',
        examId: '',
        // departmentId removed
        // yearLevel removed
        expiryDate: '',
        publishDate: '',
        status: 'published' as 'published' | 'draft' | 'scheduled',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        category: 'general' as 'general' | 'exam' | 'academic' | 'administrative' | 'emergency',
        tags: [] as string[],
        isPinned: false,
        // Notification settings removed for announcements
        selectedTemplate: ''
    });

    // Load editing data when component mounts
    useEffect(() => {
        if (editingAnnouncement) {
            setFormData({
                title: editingAnnouncement.title,
                message: editingAnnouncement.message,
                audience: editingAnnouncement.audience === 'department-specific' ? 'all' : editingAnnouncement.audience,
                examId: editingAnnouncement.examId || '',
                // departmentId removed
                // yearLevel removed
                expiryDate: editingAnnouncement.expiryDate,
                publishDate: editingAnnouncement.publishDate || '',
                status: editingAnnouncement.status === 'expired' || editingAnnouncement.status === 'scheduled' ? 'published' : editingAnnouncement.status,
                priority: editingAnnouncement.priority,
                category: editingAnnouncement.category,
                tags: editingAnnouncement.tags || [],
                isPinned: editingAnnouncement.isPinned,
                // Notification settings removed for announcements
                selectedTemplate: ''
            });
        }
    }, [editingAnnouncement]);

    useEffect(() => {
        // Fetch user id from backend
        const token = localStorage.getItem('auth_token');
        axios.get(
            `${API_URL}/api/user`,
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        )
            .then(res => setUserId(String(res.data.id)))
            .catch(() => setUserId(null));
    }, [API_URL]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // Start loading

        // Validation
        if (!formData.title.trim() || !formData.message.trim() || !formData.expiryDate) {
            setNotification({ type: 'error', message: 'Please fill in all required fields!' });
            setTimeout(() => setNotification(null), 3000);
            setIsSubmitting(false); // Stop loading
            return;
        }

        // Audience-specific validation
        if (formData.audience === 'exam-specific' && !formData.examId) {
            setNotification({ type: 'error', message: 'Please select an exam for exam-specific announcements!' });
            setTimeout(() => setNotification(null), 3000);
            setIsSubmitting(false); // Stop loading
            return;
        }

        // Department-specific audience removed

        // year-specific audience removed

        // Prepare payload for backend
        const payload = {
            title: formData.title,
            message: formData.message,
            audience: formData.audience,
            exam_id: formData.examId || null,
            // department_id removed
            // year_level removed
            expiry_date: formData.expiryDate,
            publish_date: formData.publishDate || null,
            status: formData.status,
            priority: formData.priority,
            category: formData.category,
            tags: formData.tags,
            is_pinned: formData.isPinned,
            // Notification settings removed for announcements
            created_by: userId // Use logged-in user's id
        };

        try {
            const token = localStorage.getItem('auth_token');
            if (editingAnnouncement && editingAnnouncement.id) {
                // Edit mode: update existing announcement
                await axios.put(
                    `${API_URL}/api/announcements/${editingAnnouncement.id}`,
                    payload,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
            } else {
                // Create mode: create new announcement
                await axios.post(
                    `${API_URL}/api/announcements`,
                    payload,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
                );
            }
            setNotification({
                type: 'success',
                message: editingAnnouncement
                    ? `Announcement updated successfully!`
                    : `Announcement ${formData.status === 'draft' ? 'saved as draft' : formData.status === 'scheduled' ? 'scheduled' : 'published'} successfully!`
            });
            setTimeout(() => {
                setNotification(null);
                resetForm();
                navigate('/admin/set-announcements');
            }, 2000);
        } catch (error: any) {
            console.error('Announcement error:', error.response?.data || error.message);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to save announcement!'
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };

    // Reset form helper
    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            audience: 'all',
            examId: '',
            // departmentId removed
            // yearLevel removed
            expiryDate: '',
            publishDate: '',
            status: 'published',
            priority: 'medium',
            category: 'general',
            tags: [],
            isPinned: false,
            // Notification settings removed for announcements
            selectedTemplate: ''
        });
    };

    // Handle template selection
    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setFormData(prev => ({
                ...prev,
                title: template.title,
                message: template.message,
                category: template.category as 'general' | 'exam' | 'academic' | 'administrative' | 'emergency',
                priority: template.priority,
                selectedTemplate: templateId
            }));
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
                            size="sm"
                            onClick={() => navigate('/admin/set-announcements')}
                            className="mr-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Megaphone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {editingAnnouncement ? 'Update announcement settings' : 'Create and configure announcement settings'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <Toast
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}

                {/* Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="w-5 h-5" />
                            {editingAnnouncement ? 'Edit Announcement' : 'Announcement Details'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Use Template (Optional)
                                </label>
                                <Select
                                    value={formData.selectedTemplate}
                                    onValueChange={handleTemplateSelect}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map(template => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter announcement title"
                                    required
                                />
                            </div>

                            {/* Priority and Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            priority: value as 'low' | 'medium' | 'high' | 'urgent'
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData(prev => ({
                                            ...prev,
                                            category: value as 'general' | 'exam' | 'academic' | 'administrative' | 'emergency'
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="administrative">Administrative</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Enter announcement message"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tags (comma-separated)
                                </label>
                                <Input
                                    value={formData.tags.join(', ')}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                                    }))}
                                    placeholder="e.g., exam, important, deadline"
                                />
                            </div>

                            {/* Audience */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Audience <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.audience}
                                    onValueChange={(value) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            audience: value as 'all' | 'exam-specific',
                                            examId: ''
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={{
                                                'all': 'All Students',
                                                'exam-specific': 'Exam-specific',
                                                'year-specific': 'Year-specific'
                                            }[formData.audience]}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Students</SelectItem>
                                        <SelectItem value="exam-specific">Exam-specific</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Exam Selection (if exam-specific) */}
                            {formData.audience === 'exam-specific' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Select Exam <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.examId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, examId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    exams.find(e => e.id === formData.examId)
                                                        ? exams.find(e => e.id === formData.examId)!.title
                                                        : 'Choose an exam'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exams.length === 0 ? (
                                                <SelectItem value="" disabled>No exams available</SelectItem>
                                            ) : (
                                                exams.map(exam => (
                                                    <SelectItem key={exam.id} value={exam.id}>
                                                        {exam.title}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Department-specific audience and selection removed */}
                            

                            {/* Dates Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Expiry Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Scheduled Publish Date (Optional)
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                            </div>

                            {/* Pin Option */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={formData.isPinned}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        isPinned: e.target.checked
                                    }))}
                                    className="rounded"
                                />
                                <label htmlFor="pinned" className="flex items-center gap-2 cursor-pointer">
                                    <Pin className="w-4 h-4 text-orange-500" />
                                    <span>Pin this announcement (appears at top)</span>
                                </label>
                            </div>

                            {/* Notification settings removed for announcements */}

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    onClick={() => navigate('/admin/set-announcements')}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                {/* Save as Draft button removed */}
                                <Button
                                    type="submit"
                                    onClick={() => setFormData(prev => ({ ...prev, status: formData.publishDate ? 'scheduled' : 'published' }))}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Eye className="w-4 h-4 mr-2" />
                                    )}
                                    {editingAnnouncement ?
                                        (formData.publishDate ? 'Update & Schedule' : 'Update Announcement') :
                                        (formData.publishDate ? 'Schedule' : 'Publish Now')
                                    }
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
