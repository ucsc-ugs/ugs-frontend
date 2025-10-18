// src/components/ui/NotificationCard.tsx
import { cn } from "@/lib/utils";
import { Bell, Clock } from "lucide-react";

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: "info" | "success" | "alert";
    read: boolean;
    date: string;
}

interface NotificationCardProps {
    notification: Notification;
    onToggleRead?: (id: number) => void;
    onDelete?: (id: number) => void;
    isExamSpecific?: boolean;
}

export const NotificationCard = ({ notification, onToggleRead, onDelete, isExamSpecific = false }: NotificationCardProps) => {

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return "Yesterday";
        return date.toLocaleDateString();
    };

    return (
        <div className={cn(
            "relative p-4 border-l-4 transition-all duration-200 hover:shadow-md group rounded-lg",
            !notification.read
                ? isExamSpecific
                    ? "bg-orange-50 border-l-orange-500 border border-orange-200"
                    : "bg-blue-50 border-l-blue-500 border border-blue-200"
                : "bg-white border-l-gray-300 border border-gray-200",
        )}>

            {/* Top right actions: unread dot and Mark Read button */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {!notification.read && (
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isExamSpecific ? "bg-orange-500" : "bg-blue-500"
                    )}></div>
                )}
                {onToggleRead && !notification.read && (
                    <button
                        onClick={e => { e.stopPropagation(); onToggleRead(notification.id); }}
                        className={cn(
                            "text-xs px-2 py-1 rounded border transition-colors ml-2",
                            isExamSpecific
                                ? "text-orange-600 border-orange-300 hover:bg-orange-100 hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                : "text-blue-600 border-blue-300 hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        )}
                    >
                        Mark read
                    </button>
                )}
            </div>

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 p-2 rounded-full",
                    notification.read
                        ? "bg-gray-100"
                        : isExamSpecific
                            ? "bg-orange-100"
                            : "bg-blue-100"
                )}>
                    <Bell className={cn(
                        "w-4 h-4",
                        notification.read
                            ? "text-gray-500"
                            : isExamSpecific
                                ? "text-orange-600"
                                : "text-blue-600"
                    )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "font-medium text-sm mb-2",
                        !notification.read ? "text-gray-900" : "text-gray-700"
                    )}>
                        {notification.title}
                    </h4>

                    <p className={cn(
                        "text-sm leading-relaxed mb-3",
                        !notification.read ? "text-gray-700" : "text-gray-600"
                    )}>
                        {notification.message}
                    </p>

                    {/* Time display */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notification.date)}</span>
                    </div>

                    {/* Actions (delete only, bottom left) */}
                    <div className="flex items-center gap-2">
                        {onDelete && (
                            <button
                                onClick={() => onDelete(notification.id)}
                                className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
