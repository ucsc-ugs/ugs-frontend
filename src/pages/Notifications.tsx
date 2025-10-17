import { useState, useEffect } from "react";
import { NotificationCard } from "@/components/ui/NotificationCard";
import { CompactCalendar } from "@/components/ui/CompactCalendar";
import { Bell, AlertTriangle } from "lucide-react";
import AnnouncementModal from "@/components/AnnouncementModal";

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
}

function getType(a: Announcement): "info" | "success" | "alert" {
  if (a.priority === "urgent" || a.priority === "high") return "alert";
  if (a.category === "emergency") return "alert";
  if (a.priority === "low") return "success";
  return "info";
}

function NotificationsPage() {
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [examAnnouncements, setExamAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resAll = await fetch("http://localhost:8000/api/announcements");
        if (!resAll.ok) throw new Error("Failed to fetch announcements");
        const allData: Announcement[] = await resAll.json();
        setAllAnnouncements(allData.filter(a => a.audience === "all" && a.status === "published"));

        const studentId = localStorage.getItem("student_id");
        let examUrl = "http://localhost:8000/api/student/notifications";
        if (studentId) examUrl += `?student_id=${studentId}`;
        const resExam = await fetch(examUrl);
        if (!resExam.ok) throw new Error("Failed to fetch exam notifications");
        const examData: Announcement[] = await resExam.json();
        setExamAnnouncements(examData.filter(a => a.audience === "exam-specific" && a.status === "published"));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Could not load notifications.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Notifications (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Announcements */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">General Announcements</h2>
              {loading ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-gray-400 animate-pulse mx-auto mb-2" />
                  <div>Loading...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <div>{error}</div>
                </div>
              ) : allAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No general announcements.</div>
              ) : (
                <div className="space-y-3">
                  {allAnnouncements.map(a => (
                    <div key={a.id} onClick={() => setSelected(a)} className="cursor-pointer">
                      <NotificationCard
                        notification={{
                          id: a.id,
                          title: a.title,
                          message: a.message,
                          type: getType(a),
                          read: false,
                          date: a.publish_date || a.created_at || "",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exam-Specific Announcements */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">Exam-Specific Announcements</h2>
              {loading ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-gray-400 animate-pulse mx-auto mb-2" />
                  <div>Loading...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <div>{error}</div>
                </div>
              ) : examAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No exam-specific announcements.</div>
              ) : (
                <div className="space-y-3">
                  {examAnnouncements.map(a => (
                    <div key={a.id} onClick={() => setSelected(a)} className="cursor-pointer">
                      <NotificationCard
                        notification={{
                          id: a.id,
                          title: a.title,
                          message: a.message,
                          type: getType(a),
                          read: false,
                          date: a.publish_date || a.created_at || "",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Calendar (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CompactCalendar />
            </div>
          </div>
        </div>
      </div>
      {/* Modal for full details */}
      <AnnouncementModal
        open={!!selected}
        onClose={() => setSelected(null)}
        announcement={selected ? {
          title: selected.title,
          message: selected.message,
          audience: selected.audience,
          priority: selected.priority || "",
          category: selected.category || "",
          status: selected.status || "",
          expiryDate: selected.expiry_date || "",
          publishDate: selected.publish_date || selected.created_at || "",
          tags: selected.tags || [],
          exam_title: selected.exam_title,
          exam_code: selected.exam_code,
          exam_id: selected.exam_id,
          is_pinned: selected.is_pinned,
        } : null}
      />
    </div>
  );
}

export default NotificationsPage;