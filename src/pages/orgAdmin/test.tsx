    // src/pages/orgAdmin/ViewPastExams.tsx
    import { useState, useEffect } from "react";
    import { Card, CardContent } from "@/components/ui/card";
    import { Loader2, Calendar, MapPin, Users } from "lucide-react";
    import axios from "axios";

    interface ExamDate {
    id: number;
    date: string;
    location?: string;
    status?: string;
    student_count?: number; // number of students registered
    }

    interface Exam {
    id: number;
    name: string;
    code_name: string;
    description: string;
    price: number;
    organization_id: number;
    exam_dates: ExamDate[];
    }

    const ViewPastExams = () => {
    const [pastExamDates, setPastExamDates] = useState<
        { exam: Exam; date: ExamDate }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPastExams = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
            setError("No authentication token found");
            return;
            }

            const response = await axios.get("http://localhost:8000/api/exam-dates", {
            headers: { Authorization: `Bearer ${token}` },
            });

            const exams: Exam[] = response.data.data || [];

            // Flatten exams so each past date becomes a separate card
            const flattened = exams.flatMap((exam) =>
            exam.exam_dates.map((date) => ({ exam, date }))
            );

            setPastExamDates(flattened);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to fetch exams");
        } finally {
            setLoading(false);
        }
        };

        fetchPastExams();
    }, []);

    if (loading)
        return (
        <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin w-8 h-8" />
        </div>
        );

    if (error) return <p className="text-red-500 font-medium">{error}</p>;

    if (pastExamDates.length === 0)
        return <p className="text-gray-600">No exams available in the past.</p>;

    return (
        <div className="space-y-4 p-4">
        {pastExamDates.map(({ exam, date }) => (
            <Card key={`${exam.id}-${date.id}`}>
            <CardContent>
                <h3 className="text-lg font-semibold">{exam.name}</h3>
                <p className="text-gray-600">{exam.description}</p>
                <p>Code Name: {exam.code_name}</p>
                <p>Price: ${exam.price}</p>
                <p className="flex items-center gap-1">
                <Calendar size={16} />{" "}
                {new Date(date.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
                </p>
                {date.location && (
                <p className="flex items-center gap-1">
                    <MapPin size={16} /> {date.location}
                </p>
                )}
                {date.status && <p>Status: {date.status}</p>}
                <p className="flex items-center gap-1">
                <Users size={16} /> Registered Students: {date.student_count ?? 0}
                </p>
            </CardContent>
            </Card>
        ))}
        </div>
    );
    };

    export default ViewPastExams;
