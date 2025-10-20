import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationCard } from "@/components/ui/NotificationCard";
import { NotificationBadgeCard } from "@/components/ui/NotificationBadgeCard";
import { CompactCalendar } from "@/components/ui/CompactCalendar";
import { Bell, AlertTriangle, ChevronDown, ChevronUp, FileText, CalendarDays, RefreshCw } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { NotificationFilters } from "@/components/ui/NotificationFilters";
import type { FilterState } from "@/components/ui/NotificationFilters";

interface Announcement {
  id: number;
  title: string;
  message: string;
  audience: string;
  exam_id?: number;
  exam_title?: string;
  exam_code?: string;
  publish_date?: string;
  expiry_date?: string;
  status?: string;
  priority?: string;
  category?: string;
  is_pinned?: boolean;
  created_at?: string;
  tags?: string[];
  is_read?: boolean;
}

interface Notification {
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
}

function getType(a: Announcement): "info" | "success" | "alert" {
  if (a.priority === "urgent" || a.priority === "high") return "alert";
  if (a.category === "emergency") return "alert";
  if (a.priority === "low") return "success";
  return "info";
}

const filterAnnouncements = (announcements: Announcement[], filters: FilterState) => {
  return announcements.filter(a => {
    // Read Status Filter
    if (filters.readStatus !== 'all') {
      if ((filters.readStatus === 'read') !== !!a.is_read) return false;
    }

    // Date Range Filter
    if (filters.dateRange !== 'all') {
      const date = new Date(a.publish_date || a.created_at || '');
      const now = new Date();

      // Cast to string to allow additional literal cases not present in the imported FilterState type
      switch (filters.dateRange as string) {
        case 'today':
          if (date.toDateString() !== now.toDateString()) return false;
          break;
        case '7days':
          if ((now.getTime() - date.getTime()) > 7 * 24 * 60 * 60 * 1000) return false;
          break;
        case '30days':
          if ((now.getTime() - date.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;
          break;
        default:
          break;
      }
    }

    // Search Query Filter (search in title, message, tags, category)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = a.title.toLowerCase().includes(query);
      const matchesMessage = a.message.toLowerCase().includes(query);
      const matchesTags = a.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      const matchesCategory = a.category?.toLowerCase().includes(query) || false;
      const matchesExamCode = a.exam_code?.toLowerCase().includes(query) || false;
      const matchesExamTitle = a.exam_title?.toLowerCase().includes(query) || false;

      if (!matchesTitle && !matchesMessage && !matchesTags && !matchesCategory && !matchesExamCode && !matchesExamTitle) {
        return false;
      }
    }

    return true;
  });
};

function NotificationsPage() {
  const [generalAnnouncements, setGeneralAnnouncements] = useState<Announcement[]>([]);
  const [examAnnouncements, setExamAnnouncements] = useState<Announcement[]>([]);
  const [generalNotifications, setGeneralNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | Notification | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    readStatus: 'all',
    dateRange: 'all',
    searchQuery: '',
  });
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(true);
  const [isExamExpanded, setIsExamExpanded] = useState(true);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref for the notifications dropdown
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Memoize filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Fetch data function (reusable for initial load and polling)
  const fetchData = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    else setIsRefreshing(true);

    setError(null);
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view all notifications");
      }
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // Get user ID if not already set
      let sid = studentId;
      if (!sid) {
        const userRes = await fetch("http://localhost:8000/api/user", { headers });
        if (!userRes.ok) throw new Error("Failed to authenticate user");
        const userData = await userRes.json();
        sid = userData.id;
        setStudentId(sid);
        if (!sid) throw new Error("Could not determine student ID");
      }

      // Fetch announcements
      const url = `http://localhost:8000/api/student/notifications?student_id=${sid}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to fetch notifications");
      }
      const data: (Announcement & { is_read?: boolean })[] = await res.json();

      // Separate general and exam-specific announcements
      const general = data.filter(a => a.audience === "all");
      const examSpecific = data.filter(a => a.audience === "exam-specific");

      // Check for new items if polling
      if (isPolling) {
        const newGeneralCount = general.filter(a =>
          !generalAnnouncements.some(existing => existing.id === a.id)
        ).length;
        const newExamCount = examSpecific.filter(a =>
          !examAnnouncements.some(existing => existing.id === a.id)
        ).length;

        if (newGeneralCount > 0 || newExamCount > 0) {
          setNewItemsCount(newGeneralCount + newExamCount);
          // Auto-clear the badge after 5 seconds
          setTimeout(() => setNewItemsCount(0), 5000);
        }
      }

      setGeneralAnnouncements(general);
      setExamAnnouncements(examSpecific);

      // Fetch notifications from notifications table using new API
      const notifRes = await fetch("http://localhost:8000/api/general-notifications", { headers });
      if (notifRes.ok) {
        const notifData: Notification[] = await notifRes.json();

        // Check for new notifications if polling
        if (isPolling) {
          const newNotifCount = notifData.filter(n =>
            !generalNotifications.some(existing => existing.id === n.id)
          ).length;
          if (newNotifCount > 0) {
            setNewItemsCount(prev => prev + newNotifCount);
          }
        }

        setGeneralNotifications(notifData);
      } else {
        console.error("Failed to fetch general notifications");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not load notifications.";
      setError(message);
      console.error("Error fetching notifications:", e);
    } finally {
      if (!isPolling) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [studentId, generalAnnouncements, examAnnouncements, generalNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling effect - fetch every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchData(true);
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [fetchData]);

  // Handle click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsExpanded(false);
      }
    };

    if (isNotificationsExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsExpanded]);

  // Mark announcement as read handler
  const handleMarkAsRead = async (id: number) => {
    if (!studentId) return;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    try {
      const res = await fetch("http://localhost:8000/api/announcements/mark-as-read", {
        method: "POST",
        headers,
        body: JSON.stringify({ announcement_id: id }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      // Refresh notifications
      // Optionally, optimistically update UI
      setGeneralAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
      setExamAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all general announcements as read
  const handleMarkAllGeneralAsRead = async () => {
    if (!studentId) return;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const unreadAnnouncements = generalAnnouncements.filter(a => !a.is_read);
    if (unreadAnnouncements.length === 0) return;

    try {
      // Mark all unread announcements as read
      await Promise.all(
        unreadAnnouncements.map(a =>
          fetch("http://localhost:8000/api/announcements/mark-as-read", {
            method: "POST",
            headers,
            body: JSON.stringify({ announcement_id: a.id }),
          })
        )
      );
      // Update UI
      setGeneralAnnouncements(prev => prev.map(a => ({ ...a, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all exam announcements as read
  const handleMarkAllExamAsRead = async () => {
    if (!studentId) return;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const unreadAnnouncements = examAnnouncements.filter(a => !a.is_read);
    if (unreadAnnouncements.length === 0) return;

    try {
      // Mark all unread announcements as read
      await Promise.all(
        unreadAnnouncements.map(a =>
          fetch("http://localhost:8000/api/announcements/mark-as-read", {
            method: "POST",
            headers,
            body: JSON.stringify({ announcement_id: a.id }),
          })
        )
      );
      // Update UI
      setExamAnnouncements(prev => prev.map(a => ({ ...a, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Mark general notification as read
  const handleMarkNotificationAsRead = async (id: number) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    try {
      const res = await fetch(`http://localhost:8000/api/general-notifications/${id}/mark-as-read`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      // Optimistically update UI
      setGeneralNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all general notifications as read
  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    try {
      const res = await fetch("http://localhost:8000/api/general-notifications/mark-all-as-read", {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to mark all notifications as read");
      // Optimistically update UI
      setGeneralNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 text-sm">Stay updated with your latest activities</p>
              </div>
            </div>

            {/* Real-time status indicator */}
            <div className="flex items-center gap-3">
              {newItemsCount > 0 && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg border border-green-200 animate-pulse">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium">{newItemsCount} new item{newItemsCount > 1 ? 's' : ''}</span>
                </div>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 disabled:bg-blue-600/5 text-blue-700 border-2 border-blue-600 hover:border-blue-700 disabled:border-blue-400 rounded-lg transition-colors text-sm font-medium"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Filters - Full Width */}
          <div className="lg:col-span-3">
            <NotificationFilters
              onFilterChange={handleFilterChange}
              totalCount={generalAnnouncements.length + examAnnouncements.length}
              readCount={generalAnnouncements.filter(a => a.is_read).length + examAnnouncements.filter(a => a.is_read).length}
              unreadCount={generalAnnouncements.filter(a => !a.is_read).length + examAnnouncements.filter(a => !a.is_read).length}
            />
          </div>

          {/* Left Column - Announcements (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">

            {/* General Announcements */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <button
                onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      General Announcements
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {generalAnnouncements.length} total
                      {generalAnnouncements.filter(a => !a.is_read).length > 0 && (
                        <span className="text-blue-600 font-medium ml-2">
                          • {generalAnnouncements.filter(a => !a.is_read).length} unread
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {generalAnnouncements.filter(a => !a.is_read).length > 0 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllGeneralAsRead();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"
                      >
                        Mark all as read
                      </button>
                      <span className="bg-blue-600/20 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        {generalAnnouncements.filter(a => !a.is_read).length}
                      </span>
                    </>
                  )}
                  {generalAnnouncements.filter(a => !a.is_read).length === 0 && (
                    <span className="bg-blue-600/20 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      {generalAnnouncements.filter(a => !a.is_read).length}
                    </span>
                  )}
                  {isGeneralExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </button>

              {isGeneralExpanded && (
                <div className="p-6 pt-4 bg-gray-50">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-300 animate-pulse mx-auto mb-3" />
                        <div className="text-gray-500 font-medium">Loading announcements...</div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <div className="text-red-600 font-medium">{error}</div>
                      </div>
                    ) : generalAnnouncements.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 font-medium">No general announcements available</p>
                        </div>
                      </div>
                    ) : (
                      filterAnnouncements(generalAnnouncements, filters).map(a => (
                        <div key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                          <NotificationCard
                            notification={{
                              id: a.id,
                              title: a.title,
                              message: a.message,
                              type: getType(a),
                              read: !!a.is_read,
                              date: a.publish_date || a.created_at || "",
                              priority: a.priority as "low" | "medium" | "high" | "urgent" | undefined,
                            }}
                            onToggleRead={!a.is_read ? handleMarkAsRead : undefined}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Exam-Specific Announcements */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <button
                onClick={() => setIsExamExpanded(!isExamExpanded)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <CalendarDays className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Exam-Specific Announcements
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {examAnnouncements.length} total
                      {examAnnouncements.filter(a => !a.is_read).length > 0 && (
                        <span className="text-orange-600 font-medium ml-2">
                          • {examAnnouncements.filter(a => !a.is_read).length} unread
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {examAnnouncements.filter(a => !a.is_read).length > 0 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllExamAsRead();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors font-medium"
                      >
                        Mark all as read
                      </button>
                      <span className="bg-orange-600/20 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        {examAnnouncements.filter(a => !a.is_read).length}
                      </span>
                    </>
                  )}
                  {examAnnouncements.filter(a => !a.is_read).length === 0 && (
                    <span className="bg-orange-600/20 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      {examAnnouncements.filter(a => !a.is_read).length}
                    </span>
                  )}
                  {isExamExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </button>

              {isExamExpanded && (
                <div className="p-6 pt-4 bg-gray-50">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-300 animate-pulse mx-auto mb-3" />
                        <div className="text-gray-500 font-medium">Loading announcements...</div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <div className="text-red-600 font-medium">{error}</div>
                      </div>
                    ) : examAnnouncements.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 font-medium">No exam-specific announcements available</p>
                        </div>
                      </div>
                    ) : (
                      filterAnnouncements(examAnnouncements, filters).map(a => (
                        <div key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                          <NotificationCard
                            notification={{
                              id: a.id,
                              title: a.title,
                              message: a.message,
                              type: getType(a),
                              read: !!a.is_read,
                              date: a.publish_date || a.created_at || "",
                              priority: a.priority as "low" | "medium" | "high" | "urgent" | undefined,
                            }}
                            onToggleRead={!a.is_read ? handleMarkAsRead : undefined}
                            isExamSpecific={true}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Notifications and Calendar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Notifications */}
            <div ref={notificationsRef} className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
                >
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Notifications
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {generalNotifications.length} total
                      {generalNotifications.filter(n => !n.is_read).length > 0 && (
                        <span className="text-blue-600 font-medium ml-1">
                          • {generalNotifications.filter(n => !n.is_read).length} new
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {generalNotifications.filter(n => !n.is_read).length > 0 && (
                    <>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Mark All
                      </button>
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {generalNotifications.filter(n => !n.is_read).length}
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
                    className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                    aria-label="Toggle notifications"
                  >
                    {isNotificationsExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {isNotificationsExpanded && (
                <div className="p-5 pt-3 bg-gray-50">
                  {loading ? (
                    <div className="text-center py-10">
                      <Bell className="w-10 h-10 text-gray-300 animate-pulse mx-auto mb-2" />
                      <div className="text-gray-500 font-medium">Loading...</div>
                    </div>
                  ) : generalNotifications.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {generalNotifications.map(n => (
                        <NotificationBadgeCard
                          key={n.id}
                          notification={n}
                          onMarkAsRead={handleMarkNotificationAsRead}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="sticky top-6">
              <CompactCalendar />
            </div>
          </div>
        </div>
      </div>
      {/* Modal for full details */}
      {selected && (
        <NotificationModal notification={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default NotificationsPage;