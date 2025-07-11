// src/pages/Notifications.tsx
import { useState, useMemo } from "react";
import { NotificationCard } from "@/components/ui/NotificationCard";
import { CompactCalendar } from "@/components/ui/CompactCalendar";
import type { Notification } from "@/components/ui/NotificationCard";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Payment Received",
    message: "Your payment for GCCT exam was successful. Receipt has been sent to your email.",
    type: "success",
    read: false,
    date: "2025-07-10T10:00:00",
  },
  {
    id: 2,
    title: "Results Available",
    message: "GCAT results are now available. Click here to view your detailed results.",
    type: "info",
    read: false,
    date: "2025-07-09T15:00:00",
  },
  {
    id: 3,
    title: "New Exam Open",
    message: "BIT Aptitude Test registration is now open. Register before the deadline.",
    type: "alert",
    read: true,
    date: "2025-07-08T09:00:00",
  },
  {
    id: 4,
    title: "Exam Schedule Updated",
    message: "Your GMAT exam has been rescheduled to July 15th. Please check your email for details.",
    type: "alert",
    read: false,
    date: "2025-07-07T14:30:00",
  },
  {
    id: 5,
    title: "Welcome to UGS",
    message: "Welcome to University Gateway Solutions! Complete your profile to get started.",
    type: "info",
    read: true,
    date: "2025-07-05T09:00:00",
  },
  {
    id: 6,
    title: "Security Alert",
    message: "New login detected from Chrome on Windows. If this wasn't you, please secure your account immediately.",
    type: "alert",
    read: false,
    date: "2025-07-04T18:45:00",
  },
  {
    id: 7,
    title: "Course Registration",
    message: "Registration for Advanced Database Systems course is now open. Limited seats available.",
    type: "info",
    read: false,
    date: "2025-07-03T14:20:00",
  },
  {
    id: 8,
    title: "Assignment Submitted",
    message: "Your Machine Learning assignment has been successfully submitted and is under review.",
    type: "success",
    read: true,
    date: "2025-07-02T16:30:00",
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "info" | "alert" | "success">("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) =>
      filter === "all" ? true :
        filter === "unread" ? !n.read :
          n.type === filter
    );
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case "info": return <Info className="w-4 h-4" />;
      case "success": return <CheckCircle className="w-4 h-4" />;
      case "alert": return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getFilterCount = (filterType: string) => {
    if (filterType === "all") return notifications.length;
    if (filterType === "unread") return unreadCount;
    return notifications.filter(n => n.type === filterType).length;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-sm">Stay updated with your latest activities</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Notifications (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Pills */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Notifications</h3>
              <div className="flex gap-2 flex-wrap">
                {(["all", "unread", "info", "success", "alert"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                  ${filter === f
                        ? "bg-white text-blue-700 border-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                      }`}
                  >
                    {getFilterIcon(f)}
                    {f[0].toUpperCase() + f.slice(1)}
                    <span className={`px-1.5 py-0.5 text-xs rounded-full 
                  ${filter === f ? "bg-blue-50 text-blue-700" : "bg-gray-300 text-gray-700"}
                `}>
                      {getFilterCount(f)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {filter === "all" ? "All Notifications" :
                        filter === "unread" ? "Unread Notifications" :
                          `${filter.charAt(0).toUpperCase() + filter.slice(1)} Notifications`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {filter === "unread" && unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
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
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {filter === "all" ?
                      "You're all caught up! No notifications to show." :
                      `No ${filter} notifications available.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination or Load More (placeholder) */}
            {filteredNotifications.length > 0 && (
              <div className="text-center">
                <button className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Load More Notifications
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Calendar (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CompactCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
