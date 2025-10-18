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

const ExamDetailsPage = () => {
  const { codeName } = useParams<{ codeName: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [exam, setExam] = useState<PublicExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<number | null>(null);

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
      } catch (err: any) {
        console.error('Failed to load exam:', err);
        setError(err.message || 'Failed to load exam details');
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [codeName]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in page with return URL
      navigate(`/signin?redirect=/exams/${codeName}`);
      return;
    }

    if (!exam) return;

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
          examId: exam.id,
          selectedExamDateId: selectedDateId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register for the exam');
      } else {
        const payhereData = await response.json();
        
        // Create a form and submit to PayHere sandbox
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';

        Object.entries(payhereData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        // Add return_url manually
        const returnUrlInput = document.createElement('input');
        returnUrlInput.type = 'hidden';
        returnUrlInput.name = 'return_url';
        returnUrlInput.value = 'http://localhost:5173/portal/payment-success';
        form.appendChild(returnUrlInput);

        const cancelUrlInput = document.createElement('input');
        cancelUrlInput.type = 'hidden';
        cancelUrlInput.name = 'cancel_url';
        cancelUrlInput.value = `http://localhost:5173/exams/${codeName}`;
        form.appendChild(cancelUrlInput);

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoBack = () => {
    navigate('/portal/register');
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
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
          transition={{ duration: 0.6 }}
        >
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <img
                        src={exam.organization?.logo 
                          ? `http://localhost:8000/storage${exam.organization.logo}` 
                          : "/ucsclogo.png"}
                        alt={`${exam.organization?.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/ucsclogo.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {exam.code_name || 'EXAM'}
                        </span>
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {exam.name}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{exam.organization?.name}</span>
                      </div>
                    </div>
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
              {/* Available Exam Dates */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Exam Dates</h3>
                  {exam.exam_dates && exam.exam_dates.length > 0 ? (
                    <RadioGroup value={selectedDateId?.toString()} onValueChange={(value) => setSelectedDateId(parseInt(value))}>
                      <div className="space-y-3">
                        {exam.exam_dates.map((examDate, index) => {
                          const date = new Date(examDate.date);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                          const formattedTime = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                          
                          return (
                            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <RadioGroupItem value={examDate.id?.toString() || index.toString()} id={`date-${index}`} className="mt-1" />
                              <Label htmlFor={`date-${index}`} className="flex-1 cursor-pointer">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <span className="font-medium text-sm">{formattedDate}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm">{formattedTime}</span>
                                  </div>
                                  {examDate.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                      <span className="text-sm text-gray-600 break-words">{examDate.location}</span>
                                    </div>
                                  )}
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
                        <p className="text-yellow-800 text-sm">No exam dates available at the moment.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Card */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        LKR {Math.round(exam.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Registration Fee</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm break-words">{error}</p>
                    </div>
                  )}

                  <Button 
                    onClick={handleRegister}
                    disabled={isRegistering || (!selectedDateId && isAuthenticated)}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    {isRegistering ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : !isAuthenticated ? (
                      <LogIn className="h-5 w-5 mr-2" />
                    ) : (
                      <Users className="h-5 w-5 mr-2" />
                    )}
                    <span className="truncate">
                      {isRegistering 
                        ? 'Processing...' 
                        : !isAuthenticated 
                          ? 'Sign In to Register' 
                          : !selectedDateId
                            ? 'Select Date First'
                            : 'Register Now'
                      }
                    </span>
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-gray-600 text-center mt-3 leading-relaxed">
                      You need to sign in to register for this exam
                    </p>
                  )}
                  {isAuthenticated && !selectedDateId && (
                    <p className="text-xs text-gray-600 text-center mt-3 leading-relaxed">
                      Please select an exam date above to continue with registration
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

export default ExamDetailsPage;
