import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

interface Announcement {
    id: number;
    title: string;
    message: string;
    audience: string;
    publish_date?: string;
    expiry_date?: string;
    priority?: string;
    category?: string;
}

const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/announcements");
                const data = await response.json();
                const filtered = data.filter((a: Announcement) => a.audience === "all");
                setAnnouncements(filtered);
            } catch {
                setError("Failed to fetch announcements.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

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
                            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                            <p className="text-gray-600 text-sm">
                                All public announcements for students
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && announcements.length === 0 && (
                        <p>No announcements for all students.</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((a) => (
                            <Card key={a.id} className="shadow-md">
                                <CardContent className="p-4">
                                    <h2 className="text-lg font-semibold mb-2 text-blue-800">{a.title}</h2>
                                    <p className="mb-2 text-gray-700">{a.message}</p>
                                    <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                                        {a.publish_date && <span>Published: {a.publish_date}</span>}
                                        {a.expiry_date && <span>Expires: {a.expiry_date}</span>}
                                        {a.priority && <span>Priority: {a.priority}</span>}
                                        {a.category && <span>Category: {a.category}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
