/**
 * Registrations for the exams page
 * 
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, Filter, UserPlus as UserPlusIcon, Loader2, AlertCircle } from "lucide-react";
import { getPublicExams, type PublicExamData } from "@/lib/publicApi";

interface ExamCardData {
  id: number;
  testName: string;
  fullName: string;
  university: string;
  date: string;
  time: string;
  fee: string;
  registrationDeadline?: string;
  image: string;
  description: string;
  duration: string;
  questions: number;
  codeName?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [exams, setExams] = useState<ExamCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamCardData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load exams from API
  useEffect(() => {
    const loadExams = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicExams();
        
        // Convert API data to component format
        const examData: ExamCardData[] = response.data.map((exam: PublicExamData) => {
          const firstDate = exam.exam_dates?.[0];
          const examDate = firstDate ? new Date(firstDate.date) : new Date();
          
          // Format registration deadline if it exists
          const registrationDeadline = exam.registration_deadline 
            ? new Date(exam.registration_deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }) + ' ' + new Date(exam.registration_deadline).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : undefined;
          
          return {
            id: exam.id,
            testName: exam.name,
            fullName: exam.description || exam.name,
            university: exam.organization?.name || 'Unknown Organization',
            date: examDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }),
            time: examDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            fee: `LKR ${Math.round(exam.price)}`,
            registrationDeadline,
            image: exam.organization?.logo 
              ? `http://localhost:8000/storage${exam.organization.logo}` 
              : "/ucsclogo.png", // Fallback image
            description: exam.description || 'No description available',
            duration: "2 hours", // Default duration (could be added to database later)
            questions: 50, // Default questions (could be added to database later)
            codeName: exam.code_name
          };
        });
        
        setExams(examData);
      } catch (err: any) {
        console.error('Failed to load exams:', err);
        setError(err.message || 'Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    };

    loadExams();
  }, []);

  // Get unique universities for filter
  const universities = [...new Set(exams.map(exam => exam.university))];

  // Modal handlers
  const handleViewDetails = (exam: ExamCardData) => {
    if (exam.codeName) {
      navigate(`/exams/${exam.codeName}`);
    } else {
      // Fallback to modal if no code_name is available
      setSelectedExam(exam);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedExam(null);
    setShowModal(false);
  };

  const handleRegister = async () => {
    if (!selectedExam) return;
    try {
      setIsLoading(true);
      setError('');
      // Replace with your actual registration API endpoint and payload
      const token = localStorage.getItem('auth_token');
      console.log('TOKEN= ', token);
      const response = await fetch('http://localhost:8000/api/exam/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          examId: selectedExam.id 
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
        returnUrlInput.value = 'http://localhost:5173/portal/payment-success'; // Change to your actual return URL
        form.appendChild(returnUrlInput);

        const cancelUrlInput = document.createElement('input');
        cancelUrlInput.type = 'hidden';
        cancelUrlInput.name = 'cancel_url';
        cancelUrlInput.value = 'http://localhost:5173/portal/register'; // Change to your actual cancel URL
        form.appendChild(cancelUrlInput);

        document.body.appendChild(form);
        form.submit();
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
    
    console.log('Registering for exam:', selectedExam);
    // For now, just close the modal
    handleCloseModal();
  };

  // Filter exams based on search and university filter
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.university.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUniversity = selectedUniversity === 'all' || exam.university === selectedUniversity;

    return matchesSearch && matchesUniversity;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Register for Exams</h1>
              <p className="text-gray-600 text-sm">
                Browse and register for upcoming examinations
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar + Results Count */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search exams by name, university, or description..."
                className="pl-10 rounded-xl shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="w-full md:w-[280px] rounded-xl shadow-md">
                  <SelectValue placeholder="Filter by University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities.map(university => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground mt-2">
            Showing {filteredExams.length} of {exams.length} exams
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white dark:bg-muted rounded-2xl shadow p-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading exams...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-muted rounded-2xl shadow p-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Exams Grid */}
            <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-0">
                {filteredExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card h-full">
                      <CardContent className="p-4">
                        <div className="flex gap-3 h-full">
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground leading-tight mb-2">
                                {exam.testName}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exam.fullName}
                              </p>

                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground font-medium">
                                  {exam.university}
                                </p>
                              </div>

                              <div className="mb-3">
                                <p className="text-sm text-foreground">
                                  {exam.date} • {exam.time}
                                </p>
                              </div>

                              {exam.registrationDeadline && (
                                <div className="mb-3">
                                  <p className="text-xs text-orange-600 font-medium">
                                    📅 Registration Deadline: {exam.registrationDeadline}
                                  </p>
                                </div>
                              )}

                              <div className="mb-3">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {exam.fee}
                                </span>
                              </div>
                            </div>

                            <button 
                              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm mt-auto"
                              onClick={() => handleViewDetails(exam)}
                            >
                              View Details
                            </button>
                          </div>

                          <img
                            src={exam.image}
                            alt={`${exam.university} logo`}
                            className="w-30 h-30 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              // Fallback to default image if logo fails to load
                              e.currentTarget.src = "/ucsclogo.png";
                            }}
                          />
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
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No exams found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            )}
          </>
        )}

        {/* Exam Details Modal */}
        {showModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedExam.image}
                    alt={`${selectedExam.university} logo`}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/ucsclogo.png";
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedExam.testName}</h2>
                    <p className="text-gray-600">{selectedExam.university}</p>
                  </div>
                </div>

                {/* Exam Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                    <p className="text-gray-600">{selectedExam.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Date</h3>
                      <p className="text-gray-600">{selectedExam.date}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Time</h3>
                      <p className="text-gray-600">{selectedExam.time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-gray-600">{selectedExam.duration}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Questions</h3>
                      <p className="text-gray-600">{selectedExam.questions}</p>
                    </div>
                  </div>

                  {selectedExam.registrationDeadline && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Registration Deadline</h3>
                      <p className="text-orange-600 font-medium">{selectedExam.registrationDeadline}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Registration Fee</h3>
                    <div className="inline-block">
                      <span className="px-3 py-2 text-lg font-bold rounded-lg bg-blue-100 text-blue-800">
                        {selectedExam.fee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  {(() => {
                    const isDeadlinePassed = selectedExam.registrationDeadline 
                      ? new Date() > new Date(selectedExam.registrationDeadline)
                      : false;
                    
                    return (
                      <button
                        onClick={handleRegister}
                        disabled={isDeadlinePassed}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          isDeadlinePassed
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isDeadlinePassed ? 'Registration Closed' : 'Register'}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;