import { useEffect, useState } from "react";
import { Bell, Calendar, Clock, Tag, Users, AlertCircle, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface NotificationModalProps {
    open?: boolean;
    notification: {
        id: number;
        title: string;
        message: string;
        audience?: string;
        exam_title?: string;
        exam_code?: string;
        publish_date?: string;
        expiry_date?: string;
        priority?: string;
        category?: string;
        tags?: string[];
        created_at?: string;
        exam_id?: number;
    };
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ open = true, notification, onClose }) => {
    const [examDetails, setExamDetails] = useState<{ name?: string; code_name?: string } | null>(null);
    const [examLoading, setExamLoading] = useState(false);
    const [examError, setExamError] = useState<string | null>(null);

    useEffect(() => {
        if (notification.exam_id) {
            setExamLoading(true);
            setExamError(null);
            setExamDetails(null);
            fetch(`http://localhost:8000/api/exams/id/${notification.exam_id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch exam details");
                    return res.json();
                })
                .then(data => setExamDetails(data))
                .catch(e => setExamError(e.message || "Could not load exam details."))
                .finally(() => setExamLoading(false));
        } else {
            setExamDetails(null);
        }
    }, [notification.exam_id]);

    if (!notification) return null;

    // Priority color mapping
    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Format date helper
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="!max-w-[800px] !w-[85vw] sm:!max-w-[800px] max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden"
                style={{ maxWidth: '800px', width: '85vw' }}
            >
                {/* Header Section */}
                <div className="bg-blue-600/10 px-8 py-6 relative border-b border-blue-100">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-blue-200/50 rounded-lg transition-colors group"
                        aria-label="Close notification"
                    >
                        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Bell className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {notification.title}
                            </h2>
                            <div className="flex items-center gap-3 flex-wrap">
                                {notification.priority && (
                                    <Badge className={`${getPriorityColor(notification.priority)} font-semibold px-3 py-1`}>
                                        {notification.priority.toUpperCase()}
                                    </Badge>
                                )}
                                {notification.category && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1">
                                        {notification.category}
                                    </Badge>
                                )}
                                {notification.audience && (
                                    <span className="flex items-center gap-1.5 text-gray-600 text-sm">
                                        <Users className="w-4 h-4" />
                                        {notification.audience}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>                {/* Body Section */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="p-8 space-y-6">
                        {/* Message Section - Full Width */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-900">Message</h3>
                            </div>
                            <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                                {notification.message}
                            </div>
                        </div>

                        {/* Conditional Layout: Two columns if exam exists, single column if not */}
                        <div className={notification.exam_id ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
                            {/* Announcement Details */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Announcement Details</h3>
                                </div>
                                <div className="space-y-3">
                                    {notification.exam_title && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-medium text-gray-600 min-w-[100px]">Exam:</span>
                                            <span className="text-gray-900">{notification.exam_title}</span>
                                        </div>
                                    )}
                                    {notification.exam_code && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-medium text-gray-600 min-w-[100px]">Exam Code:</span>
                                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                {notification.exam_code}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-gray-500 mt-1" />
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-600">Published:</span>
                                            <span className="text-gray-900 ml-2">
                                                {formatDate(notification.publish_date || notification.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {notification.expiry_date && (
                                        <div className="flex items-start gap-2">
                                            <Clock className="w-4 h-4 text-gray-500 mt-1" />
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-600">Expires:</span>
                                                <span className="text-gray-900 ml-2">
                                                    {formatDate(notification.expiry_date)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tags Section */}
                                {notification.tags && notification.tags.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium text-gray-600 text-sm">Tags</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {notification.tags.map((tag: string) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Exam Details - Only show if exam_id exists */}
                            {notification.exam_id && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Exam Information</h3>
                                    </div>

                                    {examLoading ? (
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading exam details...</span>
                                        </div>
                                    ) : examError ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-red-600 text-sm">{examError}</p>
                                        </div>
                                    ) : examDetails ? (
                                        <div className="space-y-3">
                                            {examDetails.name && (
                                                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                    <span className="font-medium text-gray-600 text-sm block mb-1">Exam Name</span>
                                                    <span className="text-gray-900 font-semibold">{examDetails.name}</span>
                                                </div>
                                            )}
                                            {examDetails.code_name && (
                                                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                                                    <span className="font-medium text-gray-600 text-sm block mb-1">Code Name</span>
                                                    <span className="text-gray-900 font-mono font-semibold bg-indigo-100 px-2 py-1 rounded">
                                                        {examDetails.code_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No exam details available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationModal;
