import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Eye,
  X,
  BookOpen,
  Trophy,
  CheckCircle,
  AlertCircle
} from "lucide-react";
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
    index_number: string;
    created_at: string;
    updated_at: string;
  };
}

const MyExams = () => {
  const [registeredExams, setRegisteredExams] = useState<ExamWithPivot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState<ExamWithPivot | null>(null);

  useEffect(() => {
    const fetchRegisteredExams = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        
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

  // Filter exams based on selected filters
  const filteredExams = registeredExams.filter(exam => {
    const matchesStatus = filterStatus === 'all' || exam.pivot.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string | null) => {
    if (!result) return 'bg-gray-100 text-gray-800';
    
    switch (result.toLowerCase()) {
      case 'pass':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleViewDetails = (exam: ExamWithPivot) => {
    setSelectedExam(exam);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your registered exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Exams</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
              <p className="text-gray-600 text-sm">
                View and manage your registered examinations
              </p>
            </div>
          </div>
        </div>

        {/* Filters + Results Count */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px] rounded-xl shadow-md">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground mt-2">
            Showing {filteredExams.length} of {registeredExams.length} registered exams
          </div>
        </div>

        {/* Exams Grid */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Top Section: Header + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground leading-tight">
                          {exam.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exam.description}
                        </p>
                        
                        {/* Registration Date */}
                        <div className="flex items-center gap-2 mt-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            Registered: {new Date(exam.pivot.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.pivot.status)}`}>
                          {exam.pivot.status.charAt(0).toUpperCase() + exam.pivot.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Details */}
                    <div className="flex flex-col gap-3">
                      {/* Attendance Status */}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Attendance: {exam.pivot.attended ? 'Attended' : 'Not Attended'}
                        </span>
                      </div>

                      {/* Result */}
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Result:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(exam.pivot.result)}`}>
                          {exam.pivot.result || 'Pending'}
                        </span>
                      </div>

                      {/* Payment ID */}
                      {exam.pivot.payment_id && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            Payment ID: {exam.pivot.payment_id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Section: Fee and Button */}
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        LKR {exam.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleViewDetails(exam)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* No Results Message */}
        {filteredExams.length === 0 && (
          <div className="bg-white dark:bg-muted rounded-2xl shadow p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No exams found</h3>
            <p className="text-muted-foreground">
              {registeredExams.length === 0 
                ? "You haven't registered for any exams yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        )}

        {/* Details Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedExam.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedExam.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExam(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Registration Status</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedExam.pivot.status)}`}>
                        {selectedExam.pivot.status.charAt(0).toUpperCase() + selectedExam.pivot.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Attendance</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedExam.pivot.attended ? 'Attended' : 'Not Attended'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Result</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(selectedExam.pivot.result)}`}>
                      {selectedExam.pivot.result || 'Pending'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Fee</h3>
                    <p className="text-sm text-muted-foreground">LKR {selectedExam.price.toLocaleString()}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Index Number</h3>
                    <p className="text-sm text-muted-foreground">{selectedExam.pivot.index_number}</p>
                  </div>

                  {selectedExam.pivot.payment_id && (
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Payment ID</h3>
                      <p className="text-sm text-muted-foreground">{selectedExam.pivot.payment_id}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Registration Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedExam.pivot.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Last Updated</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedExam.pivot.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedExam(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExams;