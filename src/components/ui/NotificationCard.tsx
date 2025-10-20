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
    priority?: "low" | "medium" | "high" | "urgent";
}

interface NotificationCardProps {
    notification: Notification;
    onToggleRead?: (id: number) => void;
    onDelete?: (id: number) => void;
    isExamSpecific?: boolean;
}

export const NotificationCard = ({ notification, onToggleRead, onDelete, isExamSpecific = false }: NotificationCardProps) => {

    // Priority-based colors matching announcements creation
    const getPriorityColors = () => {
        if (!notification.read) {
            switch (notification.priority) {
                case "urgent":
                    return {
                        bg: "bg-red-50",
                        border: "border-red-500",
                        borderLight: "border-red-200",
                        iconBg: "bg-red-100",
                        iconColor: "text-red-600",
                        dot: "bg-red-500",
                        buttonBorder: "border-red-300",
                        buttonHover: "hover:bg-red-100 hover:text-red-800",
                        buttonText: "text-red-600",
                        buttonFocus: "focus:ring-red-200"
                    };
                case "high":
                    return {
                        bg: "bg-orange-50",
                        border: "border-orange-500",
                        borderLight: "border-orange-200",
                        iconBg: "bg-orange-100",
                        iconColor: "text-orange-600",
                        dot: "bg-orange-500",
                        buttonBorder: "border-orange-300",
                        buttonHover: "hover:bg-orange-100 hover:text-orange-800",
                        buttonText: "text-orange-600",
                        buttonFocus: "focus:ring-orange-200"
                    };
                case "medium":
                    return {
                        bg: "bg-yellow-50",
                        border: "border-yellow-500",
                        borderLight: "border-yellow-200",
                        iconBg: "bg-yellow-100",
                        iconColor: "text-yellow-600",
                        dot: "bg-yellow-500",
                        buttonBorder: "border-yellow-300",
                        buttonHover: "hover:bg-yellow-100 hover:text-yellow-800",
                        buttonText: "text-yellow-600",
                        buttonFocus: "focus:ring-yellow-200"
                    };
                case "low":
                    return {
                        bg: "bg-green-50",
                        border: "border-green-500",
                        borderLight: "border-green-200",
                        iconBg: "bg-green-100",
                        iconColor: "text-green-600",
                        dot: "bg-green-500",
                        buttonBorder: "border-green-300",
                        buttonHover: "hover:bg-green-100 hover:text-green-800",
                        buttonText: "text-green-600",
                        buttonFocus: "focus:ring-green-200"
                    };
                default:
                    // Default blue for no priority or exam-specific
                    return isExamSpecific ? {
                        bg: "bg-orange-50",
                        border: "border-orange-500",
                        borderLight: "border-orange-200",
                        iconBg: "bg-orange-100",
                        iconColor: "text-orange-600",
                        dot: "bg-orange-500",
                        buttonBorder: "border-orange-300",
                        buttonHover: "hover:bg-orange-100 hover:text-orange-800",
                        buttonText: "text-orange-600",
                        buttonFocus: "focus:ring-orange-200"
                    } : {
                        bg: "bg-blue-50",
                        border: "border-blue-500",
                        borderLight: "border-blue-200",
                        iconBg: "bg-blue-100",
                        iconColor: "text-blue-600",
                        dot: "bg-blue-500",
                        buttonBorder: "border-blue-300",
                        buttonHover: "hover:bg-blue-100 hover:text-blue-800",
                        buttonText: "text-blue-600",
                        buttonFocus: "focus:ring-blue-200"
                    };
            }
        }

        // Read state - gray
        return {
            bg: "bg-white",
            border: "border-gray-300",
            borderLight: "border-gray-200",
            iconBg: "bg-gray-100",
            iconColor: "text-gray-500",
            dot: "bg-gray-400",
            buttonBorder: "border-gray-300",
            buttonHover: "hover:bg-gray-100 hover:text-gray-800",
            buttonText: "text-gray-600",
            buttonFocus: "focus:ring-gray-200"
        };
    };

    const colors = getPriorityColors();

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
            colors.bg,
            `border-l-${colors.border.split('-')[1]}-${colors.border.split('-')[2]}`,
            `border ${colors.borderLight}`
        )}>

            {/* Top right actions: unread dot and Mark Read button */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {!notification.read && (
                    <div className={cn("w-2 h-2 rounded-full", colors.dot)}></div>
                )}
                {onToggleRead && !notification.read && (
                    <button
                        onClick={e => { e.stopPropagation(); onToggleRead(notification.id); }}
                        className={cn(
                            "text-xs px-2 py-1 rounded border transition-colors ml-2 focus:outline-none focus:ring-2",
                            colors.buttonText,
                            colors.buttonBorder,
                            colors.buttonHover,
                            colors.buttonFocus
                        )}
                    >
                        Mark read
                    </button>
                )}
            </div>

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn("flex-shrink-0 p-2 rounded-full", colors.iconBg)}>
                    <Bell className={cn("w-4 h-4", colors.iconColor)} />
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
