import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  LogIn,
  MapPin
} from "lucide-react";
import { getExamByCodeName, type PublicExamData } from "@/lib/publicApi";
import { useAuth } from "@/contexts/AuthContext";

interface ExamDate {
  id: number;
  date: string;
  location: string;
  status: string;
}

const ExamDetailsPage = () => {
  const { codeName } = useParams<{ codeName: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [exam, setExam] = useState<PublicExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string>('');

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      if (!codeName) {
        setError('Exam code not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getExamByCodeName(codeName);
        setExam(response.data);
        
        // Set first available date as default selection
              if (response.data.exam_dates && response.data.exam_dates.length > 0 && response.data.exam_dates[0].id != null) {
                setSelectedDateId(String(response.data.exam_dates[0].id));
              }
      } catch (err: any) {
        console.error('Failed to load exam:', err);
        setError(err.message || 'Failed to load exam details');
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [codeName]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!selectedDateId) {
      setError('Please select an exam date before registering');
      return;
    }

    try {
      setIsRegistering(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/exam/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          examId: exam?.id,
          examDateId: selectedDateId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register for the exam');
      }

      const payhereData = await response.json();
      
      // Create a form and submit to PayHere sandbox
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandbox.payhere.lk/pay/checkout';

      Object.entries(payhereData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register for the exam');
    } finally {
      setIsRegistering(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Exam Details</h2>
            <p className="text-gray-600">Please wait while we fetch the exam information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Exam</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</h2>
            <p className="text-gray-600 mb-4">The exam you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableDates = (exam.exam_dates || []).filter((date: any) => date?.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={handleGoBack} 
            variant="ghost" 
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Exam Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Exam Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.name}</h1>
                    <p className="text-lg text-gray-600">{exam.organization?.name}</p>
                  </div>

                  {/* Exam Timeline Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Registration Fee</p>
                        <p className="font-semibold text-gray-900">LKR {Math.round(exam.price).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {exam.registration_deadline && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-600">Registration Deadline</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(exam.registration_deadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Exam</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {exam.description || 'No description available for this exam.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Details */}
              {exam.organization && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      About the Organization
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {exam.organization.description || 'No organization description available.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Registration */}
            <div className="space-y-6">
              {/* Date Selection Card */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Exam Date</h3>
                  
                  {availableDates.length === 0 ? (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No exam dates available yet</p>
                    </div>
                  ) : (
                    <RadioGroup value={selectedDateId} onValueChange={setSelectedDateId} className="space-y-3">
                      {availableDates.map((examDate) => (
                        <div key={examDate.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={String(examDate.id ?? '')} id={`date-${examDate.id ?? ''}`} />
                          <Label htmlFor={`date-${examDate.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(examDate.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(examDate.date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                                {examDate.location && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {examDate.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <Button 
                    onClick={handleRegister}
                    disabled={isRegistering || availableDates.length === 0 || !selectedDateId}
                    className="w-full h-12 text-lg font-semibold mt-6"
                    size="lg"
                  >
                    {isRegistering ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : !isAuthenticated ? (
                      <LogIn className="h-5 w-5 mr-2" />
                    ) : (
                      <Users className="h-5 w-5 mr-2" />
                    )}
                    {isRegistering 
                      ? 'Processing...' 
                      : !isAuthenticated 
                        ? 'Sign In to Register' 
                        : 'Register Now'
                    }
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-gray-600 text-center mt-3">
                      You need to sign in to register for this exam
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">2 hours</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Questions</span>
                      <span className="font-medium">50</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Format</span>
                      <span className="font-medium">Multiple Choice</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Code</span>
                      <span className="font-medium font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {exam.code_name || exam.id}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
