import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  RefreshCw,
  Loader2,
  Banknote
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
  organization?: {
    id: number;
    name: string;
    description: string;
    logo: string | null;
    status: string;
  };
  available_exam_dates?: Array<{
    id: number;
    date: string;
    location?: string;
    status?: string;
  }>;
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
    selected_exam_date: {
      id: number;
      date: string;
      location?: string;
      status?: string;
    } | null;
    selected_exam_date_id: number | null;
    assigned_location: {
      id: number;
      location_name: string;
      capacity: number;
      organization_id: number;
    } | null;
    assigned_location_id: number | null;
  };
}

const MyExams = () => {
  const [registeredExams, setRegisteredExams] = useState<ExamWithPivot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState<ExamWithPivot | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleExam, setRescheduleExam] = useState<ExamWithPivot | null>(null);
  const [selectedNewDateId, setSelectedNewDateId] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

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

  const handleReschedule = (exam: ExamWithPivot) => {
    setRescheduleExam(exam);
    setSelectedNewDateId('');
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    if (!rescheduleExam || !selectedNewDateId) return;

    try {
      setRescheduleLoading(true);
      const token = localStorage.getItem("auth_token");
      
      await axios.post(
        "http://localhost:8000/api/reschedule-exam",
        {
          exam_id: rescheduleExam.id,
          new_exam_date_id: parseInt(selectedNewDateId)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh the exams list
      const response = await axios.get("http://localhost:8000/api/my-exams", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setRegisteredExams(response.data);
      setShowRescheduleModal(false);
      setRescheduleExam(null);
      setSelectedNewDateId('');
      
    } catch (err: any) {
      console.error("Reschedule error:", err);
      setError(err.response?.data?.message || "Failed to reschedule exam");
    } finally {
      setRescheduleLoading(false);
    }
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
      <div className="p-4 lg:p-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">FILTER BY STATUS:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px] rounded-lg">
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
            
            {/* Results Count */}
            <div className="text-sm text-blue-600">
              Showing <span className="font-semibold">{filteredExams.length}</span> of <span className="font-semibold">{registeredExams.length}</span> registered exams
            </div>
          </div>
        </div>

        {/* Exams Container */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Organization Header - Minimal */}
                    {exam.organization && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          {exam.organization.logo ? (
                            <img
                              src={exam.organization.logo}
                              alt={`${exam.organization.name} logo`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium text-xs">
                              {exam.organization.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 font-medium">
                            {exam.organization.name}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Main Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {exam.name}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(exam.pivot.status)}`}>
                          {exam.pivot.status.charAt(0).toUpperCase() + exam.pivot.status.slice(1)}
                        </span>
                      </div>

                      {/* Highlighted Key Information */}
                      <div className="space-y-3 mb-4">
                        {/* Exam Date - Highlighted */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-700" />
                            <div>
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Exam Date</p>
                              <p className="text-sm font-bold text-blue-900">
                                {exam.pivot.selected_exam_date 
                                  ? new Date(exam.pivot.selected_exam_date.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : "Not Scheduled"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Assigned Location - Highlighted */}
                        {exam.pivot.assigned_location && (
                          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-emerald-700" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Location</p>
                                <p className="text-sm font-bold text-emerald-900">
                                  {exam.pivot.assigned_location.location_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Minimal Status Row */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className={`flex items-center gap-1 ${exam.pivot.attended ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="h-3 w-3" />
                          {exam.pivot.attended ? 'Attended' : 'Not Attended'}
                        </span>
                        <span className={`px-2 py-1 rounded-md font-medium ${getResultColor(exam.pivot.result)}`}>
                          {exam.pivot.result || 'Pending'}
                        </span>
                      </div>

                      {/* Clean Bottom Section */}
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                        <div className="text-lg font-bold text-gray-900">
                          LKR {exam.price.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          {/* Reschedule Button - Show only if there are multiple exam dates available */}
                          {exam.available_exam_dates && exam.available_exam_dates.length > 1 && (
                            <button
                              onClick={() => handleReschedule(exam)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Reschedule
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(exam)}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* No Results Message */}
        {filteredExams.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600 text-sm">
              {registeredExams.length === 0 
                ? "You haven't registered for any exams yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        )}

        {/* Details Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              {/* Organization Header */}
              {selectedExam.organization && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-2xl border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    {selectedExam.organization.logo ? (
                      <img
                        src={selectedExam.organization.logo}
                        alt={`${selectedExam.organization.name} logo`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {selectedExam.organization.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {selectedExam.organization.name}
                      </h3>
                      <p className="text-sm text-gray-600">Organization</p>
                    </div>
                    <button
                      onClick={() => setSelectedExam(null)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-full p-2 transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Student Index Number - Top Position */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Student Index Number</h3>
                    <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-blue-200">
                      <p className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                        {selectedExam.pivot.index_number}
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">Use this number for exam identification</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedExam.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedExam.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Registration Status */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-600" />
                        Registration Status
                      </h3>
                      <span className={`px-3 py-2 text-sm font-medium rounded-lg ${getStatusColor(selectedExam.pivot.status)}`}>
                        {selectedExam.pivot.status.charAt(0).toUpperCase() + selectedExam.pivot.status.slice(1)}
                      </span>
                    </div>

                    {/* Exam Date */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        Exam Date
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedExam.pivot.selected_exam_date 
                          ? new Date(selectedExam.pivot.selected_exam_date.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "Not Scheduled"}
                      </p>
                    </div>

                    {/* Assigned Location */}
                    {selectedExam.pivot.assigned_location && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-600" />
                          Assigned Location
                        </h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedExam.pivot.assigned_location.location_name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Attendance */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                        Attendance
                      </h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        selectedExam.pivot.attended 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedExam.pivot.attended ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {selectedExam.pivot.attended ? 'Attended' : 'Not Attended'}
                      </div>
                    </div>

                    {/* Result */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-gray-600" />
                        Result
                      </h3>
                      <span className={`px-3 py-2 text-sm font-medium rounded-lg ${getResultColor(selectedExam.pivot.result)}`}>
                        {selectedExam.pivot.result || 'Pending'}
                      </span>
                    </div>

                    {/* Fee */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-gray-600" />
                        Fee
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        LKR {selectedExam.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedExam.pivot.payment_id && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-3">Payment ID</h3>
                      <p className="text-lg font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                        {selectedExam.pivot.payment_id}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSelectedExam(null)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && rescheduleExam && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Reschedule Exam</h2>
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{rescheduleExam.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{rescheduleExam.description}</p>
                  
                  {rescheduleExam.pivot.selected_exam_date && (
                    <div className="p-3 bg-blue-50 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Current Date:</strong> {new Date(rescheduleExam.pivot.selected_exam_date.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {new Date(rescheduleExam.pivot.selected_exam_date.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                        {rescheduleExam.pivot.selected_exam_date.location && (
                          <span> - {rescheduleExam.pivot.selected_exam_date.location}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <h4 className="font-medium text-gray-900 mb-3">Select New Date:</h4>
                  {rescheduleExam.available_exam_dates && rescheduleExam.available_exam_dates.length > 0 ? (
                    <RadioGroup value={selectedNewDateId} onValueChange={setSelectedNewDateId}>
                      <div className="space-y-3">
                        {rescheduleExam.available_exam_dates
                          .filter(date => date.id !== rescheduleExam.pivot.selected_exam_date_id)
                          .map((examDate) => {
                            const date = new Date(examDate.date);
                            const formattedDate = date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                            const formattedTime = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                            
                            return (
                              <div key={examDate.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value={examDate.id.toString()} id={`reschedule-date-${examDate.id}`} />
                                <Label htmlFor={`reschedule-date-${examDate.id}`} className="flex-1 cursor-pointer">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">{formattedTime}</span>
                                      {examDate.location && (
                                        <>
                                          <MapPin className="h-4 w-4 text-gray-600 ml-2" />
                                          <span className="text-sm text-gray-600">{examDate.location}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <p className="text-yellow-800">No alternative dates available for rescheduling.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRescheduleModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitReschedule}
                    disabled={!selectedNewDateId || rescheduleLoading}
                    className="flex-1"
                  >
                    {rescheduleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Rescheduling...
                      </>
                    ) : (
                      'Confirm Reschedule'
                    )}
                  </Button>
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
