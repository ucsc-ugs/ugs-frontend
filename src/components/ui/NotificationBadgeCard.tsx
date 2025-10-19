import { useState } from "react";
import { Bell, Calendar, User, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    const [isOpen, setIsOpen] = useState(false);

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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className={`${notification.is_read ? "bg-white border-gray-200" : `${style.bgColor} ${style.borderColor}`} border-l-4 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer relative group`}
                    onClick={() => {
                        setIsOpen(true);
                        if (onClick) onClick();
                    }}
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
                    )}
                    <div className="flex gap-3">
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
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0" align="start" side="right" sideOffset={8}>
                <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden">
                    {/* Header with colored top border */}
                    <div className={`${style.borderColor} border-t-4`}>
                        <div className="px-5 pt-4 pb-3 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${style.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                                </div>
                                <span className={`${style.labelBg} ${style.labelText} text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide`}>
                                    {style.label}
                                </span>
                            </div>

                            {/* Exam info if available */}
                            {notification.exam_title && (
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {notification.exam_code && `${notification.exam_code} - `}
                                        {notification.exam_title}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 bg-white max-h-96 overflow-y-auto">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                            {notification.title}
                        </h3>

                        {/* Message - Full text with proper formatting */}
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                            {notification.message}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{timeAgo}</span>
                        </div>
                        {!notification.is_read && onMarkAsRead && (
                            <button
                                onClick={() => {
                                    onMarkAsRead(notification.id);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-700 text-xs font-medium rounded-lg transition-all"
                            >
                                <Check className="w-3 h-3" />
                                Mark Read
                            </button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
