import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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
    const [examDetails, setExamDetails] = useState<any>(null);
    const [examLoading, setExamLoading] = useState(false);
    const [examError, setExamError] = useState<string | null>(null);

    useEffect(() => {
        if (notification.exam_id) {
            setExamLoading(true);
            setExamError(null);
            setExamDetails(null);
            fetch(`http://localhost:8000/api/exams/${notification.exam_id}`)
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
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-screen-2xl w-[98vw] p-0 rounded-2xl shadow-lg">
                <DialogHeader className="border-b pb-4 mb-4 bg-blue-50 rounded-t-2xl px-6 pt-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                            <DialogTitle className="whitespace-normal break-words text-2xl font-bold text-gray-900 flex-1">
                                {notification.title}
                            </DialogTitle>
                            <DialogClose asChild>
                                <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" aria-label="Close">&times;</button>
                            </DialogClose>
                        </div>
                        <p className="text-gray-600 text-sm pl-10">Notification Details</p>
                    </div>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-8 px-8 pb-10">
                    {/* Left: Announcement Details */}
                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Message Section */}
                        <div className="bg-white rounded-lg p-6 border shadow-sm">
                            <span className="font-semibold text-blue-700 block mb-2">Message:</span>
                            <div className="whitespace-pre-line break-words text-base text-gray-800">{notification.message}</div>
                        </div>
                        {/* Announcement Details Section */}
                        <div className="bg-gray-50 rounded-lg p-6 border">
                            <h3 className="text-lg font-semibold mb-4 text-blue-900">Announcement Details</h3>
                            <div className="grid grid-cols-1 gap-y-4">
                                {notification.exam_title && <div><span className="font-semibold">Exam:</span> {notification.exam_title}</div>}
                                {notification.exam_code && <div><span className="font-semibold">Exam Code:</span> {notification.exam_code}</div>}
                                {notification.audience && <div><span className="font-semibold">Audience:</span> {notification.audience}</div>}
                                {notification.priority && <div><span className="font-semibold">Priority:</span> {notification.priority}</div>}
                                {notification.category && <div><span className="font-semibold">Category:</span> {notification.category}</div>}
                                <div><span className="font-semibold">Published Date:</span> {(() => {
                                    const dateStr = notification.publish_date || notification.created_at;
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
                                })()}</div>
                            </div>
                            {notification.tags && notification.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 items-center">
                                    <span className="font-semibold">Tags:</span>
                                    {notification.tags.map((tag: string) => (
                                        <Badge key={tag} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right: Exam Details */}
                    {notification.exam_id && (
                        <div className="flex-1 min-w-0 bg-gray-100 rounded-lg p-6 border h-fit self-start">
                            <h3 className="text-lg font-semibold mb-4 text-blue-900">Exam Details</h3>
                            {examLoading ? (
                                <div className="text-blue-600">Loading exam details...</div>
                            ) : examError ? (
                                <div className="text-red-600">{examError}</div>
                            ) : examDetails ? (
                                <div className="space-y-4">
                                    {examDetails.name && (
                                        <div>
                                            <span className="font-semibold">Exam Name:</span> <span className="text-gray-800">{examDetails.name}</span>
                                        </div>
                                    )}
                                    {examDetails.description && (
                                        <div>
                                            <span className="font-semibold">Description:</span> <span className="text-gray-800">{examDetails.description}</span>
                                        </div>
                                    )}
                                    {examDetails.code_name && (
                                        <div>
                                            <span className="font-semibold">Code Name:</span> <span className="text-gray-800">{examDetails.code_name}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500">No exam details found.</div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationModal;
