import { useState, useEffect } from "react";
import axios from "axios";

// Updated interface to match Laravel's response structure
interface ExamWithPivot {
  id: number;
  name: string;
  description: string;
  price: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  pivot: {
    student_id: number;
    exam_id: number;
    payment_id: string | null;
    status: string;
    attended: boolean;
    result: string | null;
    created_at: string;
    updated_at: string;
  };
}

const MyRegisteredExams = () => {
  const [registeredExams, setRegisteredExams] = useState<ExamWithPivot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegisteredExams = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token"); // adjust key if needed
        
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/my-exams",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        console.log("API Response:", response.data); // For debugging
        setRegisteredExams(response.data);
      } catch (err: any) {
        console.error("API Error:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to fetch registered exams");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredExams();
  }, []);

  if (loading) return <div>Loading registered exams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Registered Exams</h2>
      {registeredExams.length === 0 ? (
        <p>No registered exams found.</p>
      ) : (
        <div>
          {registeredExams.map((exam) => (
            <div key={exam.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{exam.name}</h3>
              <p><strong>Description:</strong> {exam.description}</p>
              <p><strong>Price:</strong> ${exam.price}</p>
              <p><strong>Status:</strong> {exam.pivot.status}</p>
              <p><strong>Attended:</strong> {exam.pivot.attended ? "Yes" : "No"}</p>
              <p><strong>Result:</strong> {exam.pivot.result || "Pending"}</p>
              <p><strong>Registration Date:</strong> {new Date(exam.pivot.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegisteredExams;