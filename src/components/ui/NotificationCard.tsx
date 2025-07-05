// src/components/ui/NotificationCard.tsx
import { cn } from "@/lib/utils";
import { CheckCircle, Info, AlertTriangle, Clock } from "lucide-react";

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
}

const typeConfig = {
    info: {
        bg: "bg-blue-50 border-blue-200",
        badge: "bg-blue-100 text-blue-800",
        icon: Info,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
    },
    success: {
        bg: "bg-green-50 border-green-200",
        badge: "bg-green-100 text-green-800",
        icon: CheckCircle,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    alert: {
        bg: "bg-yellow-50 border-yellow-200",
        badge: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
};

export const NotificationCard = ({ notification, onToggleRead, onDelete }: NotificationCardProps) => {
    const config = typeConfig[notification.type];
    const IconComponent = config.icon;

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
            "relative p-4 border-l-4 transition-all duration-200 hover:shadow-md group",
            !notification.read
                ? `${config.bg} border-l-blue-500`
                : "bg-white border-l-gray-300",
        )}>
            {/* Unread indicator dot */}
            {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 p-2 rounded-full",
                    notification.read ? "bg-gray-100" : config.iconBg
                )}>
                    <IconComponent className={cn(
                        "w-4 h-4",
                        notification.read ? "text-gray-500" : config.iconColor
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

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {onToggleRead && (
                            <button
                                onClick={() => onToggleRead(notification.id)}
                                className={cn(
                                    "text-xs px-2 py-1 rounded border transition-colors",
                                    notification.read
                                        ? "text-gray-600 border-gray-300 hover:bg-gray-50"
                                        : "text-blue-600 border-blue-300 hover:bg-blue-50"
                                )}
                            >
                                {notification.read ? "Mark unread" : "Mark read"}
                            </button>
                        )}
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
