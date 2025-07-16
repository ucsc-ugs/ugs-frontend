// src/pages/admin/AdminNotifications.tsx
import { useState, useMemo } from "react";
import { NotificationCard } from "@/components/ui/NotificationCard";
import type { Notification } from "@/components/ui/NotificationCard";
import {
    Bell,
    CheckCircle,
    Clock,
    Database,
    AlertCircle
} from "lucide-react";

const mockAdminNotifications: Notification[] = [
    {
        id: 1,
        title: "High Priority: System Security Alert",
        message: "Multiple failed login attempts detected from suspicious IPs. Immediate attention required to review security logs and potentially block IPs.",
        type: "alert",
        read: false,
        date: "2025-07-09T14:30:00",
    },
    {
        id: 2,
        title: "Urgent: Server Capacity Warning",
        message: "Database server is at 85% capacity. Schedule maintenance and consider scaling to handle upcoming exam season load.",
        type: "alert",
        read: false,
        date: "2025-07-09T13:45:00",
    },
    {
        id: 3,
        title: "Action Required: Exam Approval Pending",
        message: "5 new exam proposals from faculty require your approval. Review and approve before the academic deadline.",
        type: "info",
        read: false,
        date: "2025-07-09T11:20:00",
    },
    {
        id: 4,
        title: "Critical: Payment Gateway Issue",
        message: "Payment processing is experiencing delays. 23 student registrations are pending payment confirmation.",
        type: "alert",
        read: false,
        date: "2025-07-09T09:15:00",
    },
    {
        id: 5,
        title: "Success: Monthly Backup Completed",
        message: "July 2025 full system backup completed successfully. All student data and exam records are secure.",
        type: "success",
        read: true,
        date: "2025-07-08T23:00:00",
    },
    {
        id: 6,
        title: "Notice: University Partnership Update",
        message: "University of Peradeniya has updated admission criteria for Engineering programs. Update exam weightings accordingly.",
        type: "info",
        read: false,
        date: "2025-07-08T16:30:00",
    },
    {
        id: 7,
        title: "Success: Exam Results Published",
        message: "GCAT July 2025 results published successfully. 234 students evaluated with 89% pass rate. Reports sent to universities.",
        type: "success",
        read: true,
        date: "2025-07-08T14:00:00",
    },
    {
        id: 8,
        title: "Reminder: Faculty Training Session",
        message: "Quarterly faculty training on new exam protocols is scheduled for tomorrow at 10:00 AM. 12 faculty members registered.",
        type: "info",
        read: false,
        date: "2025-07-07T10:00:00",
    },
    {
        id: 9,
        title: "Alert: Low Exam Capacity",
        message: "BIT Aptitude Test is at 95% capacity (190/200 students). Consider opening additional session or waitlist management.",
        type: "alert",
        read: true,
        date: "2025-07-06T15:30:00",
    },
    {
        id: 10,
        title: "System: Automated Report Generated",
        message: "Weekly performance report: 1,245 active users, 23 exams conducted, 98.5% system uptime. Full report attached.",
        type: "info",
        read: true,
        date: "2025-07-05T08:00:00",
    },
];

export default function AdminNotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread" | "critical" | "action-required" | "system" | "success">("all");
    const [notifications, setNotifications] = useState(mockAdminNotifications);
    const [selectedPriority, setSelectedPriority] = useState<"all" | "high" | "medium" | "low">("all");

    // Enhanced filtering for admin needs
    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        // Filter by type/category
        if (filter !== "all") {
            if (filter === "critical") {
                filtered = filtered.filter(n =>
                    n.type === "alert" || n.title.toLowerCase().includes("critical") || n.title.toLowerCase().includes("urgent")
                );
            } else if (filter === "action-required") {
                filtered = filtered.filter(n =>
                    n.title.toLowerCase().includes("action required") ||
                    n.title.toLowerCase().includes("approval") ||
                    n.title.toLowerCase().includes("review")
                );
            } else if (filter === "system") {
                filtered = filtered.filter(n =>
                    n.title.toLowerCase().includes("system") ||
                    n.title.toLowerCase().includes("server") ||
                    n.title.toLowerCase().includes("backup")
                );
            } else if (filter === "unread") {
                filtered = filtered.filter(n => !n.read);
            } else {
                filtered = filtered.filter(n => n.type === filter);
            }
        }

        return filtered;
    }, [notifications, filter]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const criticalCount = notifications.filter(n =>
        n.type === "alert" || n.title.toLowerCase().includes("critical") || n.title.toLowerCase().includes("urgent")
    ).length;
    const actionRequiredCount = notifications.filter(n =>
        n.title.toLowerCase().includes("action required") ||
        n.title.toLowerCase().includes("approval") ||
        n.title.toLowerCase().includes("review")
    ).length;

    const toggleRead = (id: number) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: !n.read } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getFilterCount = (filterType: string) => {
        if (filterType === "all") return notifications.length;
        if (filterType === "unread") return unreadCount;
        if (filterType === "critical") return criticalCount;
        if (filterType === "action-required") return actionRequiredCount;
        if (filterType === "system") return notifications.filter(n =>
            n.title.toLowerCase().includes("system") ||
            n.title.toLowerCase().includes("server") ||
            n.title.toLowerCase().includes("backup")
        ).length;
        return notifications.filter(n => n.type === filterType).length;
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Admin Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
                            <p className="text-gray-600 text-sm">Manage system alerts and administrative updates</p>
                        </div>
                    </div>
                </div>

                {/* Admin Control Panel */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    {/* Admin-specific Filters */}
                    <div className="flex gap-2 flex-wrap items-center justify-center">
                        {([
                            { key: "all", label: "All Notifications", icon: Bell },
                            { key: "critical", label: "Critical", icon: AlertCircle },
                            { key: "action-required", label: "Action Required", icon: Clock },
                            { key: "system", label: "System", icon: Database },
                            { key: "unread", label: "Unread", icon: Bell },
                            { key: "success", label: "Success", icon: CheckCircle }
                        ] as const).map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border min-h-[38px]
                                    ${filter === f.key
                                        ? "text-blue-700 border-blue-700 ring-1 ring-blue-200"
                                        : "text-gray-600 border-gray-300 hover:border-gray-400 hover:text-gray-700"
                                    }`}
                            >
                                <f.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{f.label}</span>
                                <span className={`px-1.5 py-0.5 text-xs rounded-full flex-shrink-0
                                    ${filter === f.key ? "text-blue-700" : "text-gray-700"}
                                `}>
                                    {getFilterCount(f.key)}
                                </span>
                            </button>
                        ))}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {filter === "all" ? "All Administrative Notifications" :
                                        filter === "critical" ? "Critical System Alerts" :
                                            filter === "action-required" ? "Items Requiring Your Action" :
                                                filter === "system" ? "System & Infrastructure" :
                                                    filter === "unread" ? "Unread Notifications" :
                                                        `${filter.charAt(0).toUpperCase() + filter.slice(1)} Notifications`}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {filteredNotifications.length} item{filteredNotifications.length !== 1 ? 's' : ''}
                                    {filter === "critical" && " requiring immediate attention"}
                                    {filter === "action-required" && " pending your review"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value as "all" | "high" | "medium" | "low")}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notif) => (
                                <NotificationCard
                                    key={notif.id}
                                    notification={notif}
                                    onToggleRead={toggleRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {filter === "critical" ? "No critical alerts at this time. System is running smoothly." :
                                    filter === "action-required" ? "No pending actions. All administrative tasks are up to date." :
                                        filter === "all" ? "No administrative notifications. Everything is under control." :
                                            `No ${filter} notifications at this time.`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {filteredNotifications.length > 10 && (
                    <div className="mt-6 text-center">
                        <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                            Load More Notifications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
