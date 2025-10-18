import { Bell, Calendar, User, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationBadgeCardProps {
    notification: {
        id: number;
        title: string;
        message: string;
        exam_id?: number;
        user_id?: number;
        is_for_all: boolean;
        is_read?: boolean;
        exam_title?: string;
        exam_code?: string;
        created_at?: string;
    };
    onMarkAsRead?: (id: number) => void;
    onClick?: () => void;
}

export function NotificationBadgeCard({ notification, onMarkAsRead, onClick }: NotificationBadgeCardProps) {
    // Determine notification type and styling
    const getNotificationStyle = () => {
        if (notification.is_for_all) {
            return {
                borderColor: "border-blue-300",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
                icon: Bell,
                label: "General",
                labelBg: "bg-blue-100",
                labelText: "text-blue-700"
            };
        } else if (notification.exam_id) {
            return {
                borderColor: "border-orange-300",
                bgColor: "bg-orange-50",
                iconColor: "text-orange-600",
                icon: Calendar,
                label: "Exam",
                labelBg: "bg-orange-100",
                labelText: "text-orange-700"
            };
        } else if (notification.user_id) {
            return {
                borderColor: "border-green-300",
                bgColor: "bg-green-50",
                iconColor: "text-green-600",
                icon: User,
                label: "Personal",
                labelBg: "bg-green-100",
                labelText: "text-green-700"
            };
        }
        return {
            borderColor: "border-gray-300",
            bgColor: "bg-gray-50",
            iconColor: "text-gray-600",
            icon: Bell,
            label: "Info",
            labelBg: "bg-gray-100",
            labelText: "text-gray-700"
        };
    };

    const style = getNotificationStyle();
    const Icon = style.icon;

    const timeAgo = notification.created_at
        ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
        : "";

    return (
        <div
            className={`${notification.is_read ? "bg-white border-gray-200" : `${style.bgColor} ${style.borderColor}`} border-l-4 rounded-lg p-3 hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""} relative group`}
            onClick={onClick}
        >
            {/* Mark as read button - show only if not read */}
            {!notification.is_read && onMarkAsRead && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white border-2 border-green-500 hover:bg-green-50 rounded-md shadow-sm"
                    aria-label="Mark as read"
                    title="Mark as read"
                >
                    <Check className="w-4 h-4 text-green-600" />
                </button>
            )}            <div className="flex gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 ${style.iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header with badge */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`${style.labelBg} ${style.labelText} text-xs px-2 py-0.5 rounded-full font-medium`}>
                            {style.label}
                        </span>
                        {notification.exam_title && (
                            <span className="text-xs text-gray-600 truncate">
                                {notification.exam_code || notification.exam_title}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                        {notification.title}
                    </h4>

                    {/* Message */}
                    <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                        {notification.message}
                    </p>

                    {/* Time */}
                    {timeAgo && (
                        <span className="text-xs text-gray-500">
                            {timeAgo}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
