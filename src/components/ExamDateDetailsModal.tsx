import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Mail, 
  User, 
  Phone,
  Hash,
  Loader2,
  AlertCircle
} from "lucide-react";
import axios from 'axios';

interface StudentRegistration {
  id: number;
  student_id: number;
  exam_id: number;
  index_number: string;
  status: string;
  attended: boolean;
  result?: string;
  created_at: string;
  student: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  assigned_location?: {
    id: number;
    location_name: string;
    capacity: number;
  };
}

interface ExamDateDetails {
  id: number;
  exam_id: number;
  date: string;
  location?: string;
  status: string;
  exam: {
    id: number;
    name: string;
    code_name?: string;
    price: number;
  };
  location_details?: {
    id: number;
    location_name: string;
    capacity: number;
    current_registrations: number;
  };
  registrations: StudentRegistration[];
}

interface ExamDateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examDateId: number | null;
  examName?: string;
}

export const ExamDateDetailsModal = ({ 
  isOpen, 
  onClose, 
  examDateId, 
  examName 
}: ExamDateDetailsModalProps) => {
  const [examDetails, setExamDetails] = useState<ExamDateDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && examDateId) {
      fetchExamDateDetails();
    }
  }, [isOpen, examDateId]);

  const fetchExamDateDetails = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `http://localhost:8000/api/admin/exam-dates/${examDateId}/details`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      setExamDetails(response.data);
    } catch (err: any) {
      console.error('Error fetching exam date details:', err);
      setError('Failed to load exam details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attended: boolean) => {
    return attended 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Exam Date Details - {examName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading exam details...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : examDetails ? (
          <div className="space-y-6">
            {/* Exam Info Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Exam Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Date:</strong> {formatDate(examDetails.date)}
                  </div>
                  <div>
                    <strong>Time:</strong> {formatTime(examDetails.date)}
                  </div>
                  <div>
                    <strong>Price:</strong> Rs. {examDetails.exam.price.toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <Badge className={`ml-2 ${getStatusColor(examDetails.status)}`}>
                      {examDetails.status.charAt(0).toUpperCase() + examDetails.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examDetails.location_details ? (
                    <>
                      <div>
                        <strong>Location:</strong> {examDetails.location_details.location_name}
                      </div>
                      <div>
                        <strong>Capacity:</strong> {examDetails.location_details.capacity} students
                      </div>
                      <div>
                        <strong>Current Registrations:</strong> {examDetails.location_details.current_registrations}
                      </div>
                      <div>
                        <strong>Availability:</strong>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          examDetails.location_details.current_registrations >= examDetails.location_details.capacity
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {examDetails.location_details.capacity - examDetails.location_details.current_registrations} slots available
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">
                      No specific location assigned
                      {examDetails.location && <div>Legacy Location: {examDetails.location}</div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Registered Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Registered Students ({examDetails.registrations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examDetails.registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Index Number</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Assigned Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Registration Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examDetails.registrations.map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">{registration.student.name}</div>
                                  <div className="text-sm text-gray-500">ID: {registration.student.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3 text-gray-400" />
                                <span className="font-mono text-sm">{registration.index_number}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span>{registration.student.email}</span>
                                </div>
                                {registration.student.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span>{registration.student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.assigned_location ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-green-600" />
                                  <span className="text-sm">{registration.assigned_location.location_name}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(registration.status)}>
                                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getAttendanceColor(registration.attended)}>
                                {registration.attended ? 'Present' : 'Absent'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {registration.result ? (
                                <span className="font-medium">{registration.result}</span>
                              ) : (
                                <span className="text-gray-500 text-sm">Pending</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(registration.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No students registered for this exam date yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};