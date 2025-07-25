import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Megaphone,
    Plus,
    Edit,
    Trash2,
    Filter,
    Search,
    Users,
    FileText,
    Star,
    AlertCircle,
    Info,
    CheckSquare,
    Send,
    Tag,
    Pin,
    Zap,
    BookOpen,
    GraduationCap,
    Settings,
    MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toast } from '@/components/ui/toast';

// Types
interface Announcement {
    id: string;
    title: string;
    message: string;
    audience: 'all' | 'exam-specific' | 'department-specific' | 'year-specific';
    examId?: string;
    examTitle?: string;
    departmentId?: string;
    departmentName?: string;
    yearLevel?: string;
    expiryDate: string;
    publishDate?: string; // For scheduled publishing
    status: 'published' | 'draft' | 'expired' | 'scheduled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'general' | 'exam' | 'academic' | 'administrative' | 'emergency';
    tags: string[];
    isPinned: boolean;
    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    notificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    viewCount: number;
    clickCount: number;
    attachments?: FileAttachment[];
}

interface FileAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
}



export default function SetAnnouncements() {
    const navigate = useNavigate();

    // State management
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Mock data initialization
    useEffect(() => {
        

        // Mock announcements data
        setAnnouncements([
            {
                id: '1',
                title: 'Important: Exam Schedule Updated',
                message: 'The exam schedule has been updated. Please check your individual timetables for any changes.',
                audience: 'all',
                expiryDate: '2025-08-30',
                status: 'published',
                priority: 'high',
                category: 'exam',
                tags: ['schedule', 'exam', 'important'],
                isPinned: true,
                createdAt: '2025-07-10',
                createdBy: 'Admin',
                notificationsEnabled: true,
                emailNotificationsEnabled: true,
                smsNotificationsEnabled: false,
                pushNotificationsEnabled: true,
                viewCount: 1250,
                clickCount: 890
            },
            {
                id: '2',
                title: 'Computer Science Final - Additional Guidelines',
                message: 'Please bring your student ID and calculator for the Computer Science final exam.',
                audience: 'exam-specific',
                examId: '1',
                examTitle: 'Computer Science Final Exam',
                expiryDate: '2025-08-15',
                status: 'published',
                priority: 'medium',
                category: 'exam',
                tags: ['computer-science', 'final-exam', 'guidelines'],
                isPinned: false,
                createdAt: '2025-07-12',
                createdBy: 'Admin',
                notificationsEnabled: true,
                emailNotificationsEnabled: false,
                smsNotificationsEnabled: true,
                pushNotificationsEnabled: true,
                viewCount: 456,
                clickCount: 234
            },
            {
                id: '3',
                title: 'Draft: New Library Rules',
                message: 'Updated library access rules will be implemented from next month.',
                audience: 'all',
                expiryDate: '2025-09-01',
                status: 'draft',
                priority: 'low',
                category: 'administrative',
                tags: ['library', 'rules', 'policy'],
                isPinned: false,
                createdAt: '2025-07-14',
                createdBy: 'Admin',
                notificationsEnabled: false,
                emailNotificationsEnabled: false,
                smsNotificationsEnabled: false,
                pushNotificationsEnabled: false,
                viewCount: 0,
                clickCount: 0
            }
        ]);
    }, []);

    // Filter announcements
    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && announcement.status === 'published' && new Date(announcement.expiryDate) > new Date()) ||
            (filterStatus === 'expired' && (announcement.status === 'published' && new Date(announcement.expiryDate) <= new Date())) ||
            (filterStatus === 'scheduled' && announcement.status === 'scheduled') ||
            announcement.status === filterStatus;

        const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;

        const matchesCategory = filterCategory === 'all' || announcement.category === filterCategory;

        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    }).sort((a, b) => {
        // Sort by pinned first, then by priority, then by creation date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Handle edit (navigate to edit page)
    const handleEdit = (announcement: Announcement) => {
        // Navigate to create page with edit mode
        navigate('/admin/create-announcement', { state: { editingAnnouncement: announcement } });
    };

    // Handle delete
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            setNotification({ type: 'success', message: 'Announcement deleted successfully!' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
        const config = {
            urgent: { color: 'bg-red-500 text-white', icon: Zap, label: 'URGENT' },
            high: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'High' },
            medium: { color: 'bg-blue-100 text-blue-800', icon: Info, label: 'Medium' },
            low: { color: 'bg-gray-100 text-gray-600', icon: Info, label: 'Low' }
        };
        const { color, icon: Icon, label } = config[priority];
        return (
            <Badge className={`${color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {label}
            </Badge>
        );
    };

    // Get status badge with expiry date
    const getStatusBadge = (announcement: Announcement) => {
        const now = new Date();
        const expiryDate = new Date(announcement.expiryDate);

        if (announcement.status === 'draft') {
            return (
                <div className="space-y-1">
                    <Badge variant="secondary" className="text-gray-600">Draft</Badge>
                    <div className="text-xs text-gray-500">
                        Expires: {expiryDate.toLocaleDateString()}
                    </div>
                </div>
            );
        }

        if (announcement.status === 'scheduled') {
            return (
                <div className="space-y-1">
                    <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                    <div className="text-xs text-gray-500">
                        Expires: {expiryDate.toLocaleDateString()}
                    </div>
                </div>
            );
        }

        if (announcement.status === 'published' && expiryDate <= now) {
            return (
                <div className="space-y-1">
                    <Badge variant="destructive">Expired</Badge>
                    <div className="text-xs text-gray-500">
                        Expired: {expiryDate.toLocaleDateString()}
                    </div>
                </div>
            );
        }

        if (announcement.status === 'published') {
            return (
                <div className="space-y-1">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    <div className="text-xs text-gray-500">
                        Expires: {expiryDate.toLocaleDateString()}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <Badge variant="secondary">Unknown</Badge>
                <div className="text-xs text-gray-500">
                    Expires: {expiryDate.toLocaleDateString()}
                </div>
            </div>
        );
    };

    // Get category badge
    const getCategoryBadge = (category: 'general' | 'exam' | 'academic' | 'administrative' | 'emergency') => {
        const config = {
            emergency: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            exam: { color: 'bg-blue-100 text-blue-800', icon: BookOpen },
            academic: { color: 'bg-green-100 text-green-800', icon: GraduationCap },
            administrative: { color: 'bg-yellow-100 text-yellow-800', icon: Settings },
            general: { color: 'bg-gray-100 text-gray-700', icon: Info }
        };
        const { color, icon: Icon } = config[category];
        return (
            <Badge variant="outline" className={`${color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
        );
    };

    // Handle bulk operations
    const handleBulkDelete = () => {
        if (selectedAnnouncements.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedAnnouncements.length} announcements?`)) {
            setAnnouncements(prev => prev.filter(a => !selectedAnnouncements.includes(a.id)));
            setSelectedAnnouncements([]);
            setNotification({ type: 'success', message: `${selectedAnnouncements.length} announcements deleted successfully!` });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleBulkPublish = () => {
        if (selectedAnnouncements.length === 0) return;
        setAnnouncements(prev => prev.map(a =>
            selectedAnnouncements.includes(a.id) ? { ...a, status: 'published' as const } : a
        ));
        setSelectedAnnouncements([]);
        setNotification({ type: 'success', message: `${selectedAnnouncements.length} announcements published successfully!` });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSelectAll = () => {
        if (selectedAnnouncements.length === filteredAnnouncements.length) {
            setSelectedAnnouncements([]);
        } else {
            setSelectedAnnouncements(filteredAnnouncements.map(a => a.id));
        }
    };

    // Handle pin/unpin
    const handleTogglePin = (id: string) => {
        setAnnouncements(prev => prev.map(a =>
            a.id === id ? { ...a, isPinned: !a.isPinned } : a
        ));
        setNotification({ type: 'success', message: 'Announcement pin status updated!' });
        setTimeout(() => setNotification(null), 2000);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Megaphone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Set Announcements</h1>
                            <p className="text-gray-600 text-sm">Post and manage announcements for students</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/create-announcement')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Announcement
                    </Button>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <Toast
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="space-y-4">
                            {/* Search and Filters Row */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex items-center gap-2 lg:min-w-80">
                                    <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <Input
                                        placeholder="Search announcements..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>

                                {/* Filter Controls */}
                                <div className="flex flex-wrap items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priority</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                                <SelectItem value="exam">Exam</SelectItem>
                                                <SelectItem value="academic">Academic</SelectItem>
                                                <SelectItem value="administrative">Administrative</SelectItem>
                                                <SelectItem value="general">General</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </CardHeader>
                </Card>

                {/* Announcements Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Announcements ({filteredAnnouncements.length})
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {selectedAnnouncements.length > 0 && (
                                    <>
                                        <span className="text-sm font-medium text-blue-900 mr-2">
                                            {selectedAnnouncements.length} selected:
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkPublish}
                                            className="h-8 px-3 text-xs"
                                        >
                                            <Send className="w-3 h-3 mr-1" />
                                            Publish
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBulkDelete}
                                            className="h-8 px-3 text-xs"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    <CheckSquare className="w-4 h-4 mr-1" />
                                    {selectedAnnouncements.length === filteredAnnouncements.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedAnnouncements.length === filteredAnnouncements.length && filteredAnnouncements.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Audience</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAnnouncements.map((announcement) => (
                                        <TableRow key={announcement.id} className={announcement.isPinned ? 'bg-yellow-50' : ''}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAnnouncements.includes(announcement.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAnnouncements(prev => [...prev, announcement.id]);
                                                        } else {
                                                            setSelectedAnnouncements(prev => prev.filter(id => id !== announcement.id));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {announcement.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                                                        <div className="font-medium">{announcement.title}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {announcement.message}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {announcement.tags.slice(0, 2).map(tag => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {announcement.tags.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{announcement.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getPriorityBadge(announcement.priority)}
                                            </TableCell>
                                            <TableCell>
                                                {getCategoryBadge(announcement.category)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(announcement)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="capitalize">
                                                        {announcement.audience === 'all' ? 'All Students' :
                                                            announcement.audience === 'exam-specific' ? announcement.examTitle :
                                                                announcement.audience === 'department-specific' ? announcement.departmentName :
                                                                    announcement.audience === 'year-specific' ? `Year ${announcement.yearLevel}` :
                                                                        announcement.audience}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48 p-1" align="end">
                                                        <div className="space-y-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleTogglePin(announcement.id)}
                                                                className="w-full justify-start"
                                                            >
                                                                <Pin className={`w-4 h-4 mr-2 ${announcement.isPinned ? 'text-orange-500' : 'text-gray-400'}`} />
                                                                {announcement.isPinned ? 'Unpin' : 'Pin'}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(announcement)}
                                                                className="w-full justify-start"
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(announcement.id)}
                                                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredAnnouncements.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No announcements found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
