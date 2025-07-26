import { useState, useEffect } from 'react';
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
  image: string;
  description: string;
  duration: string;
  questions: number;
}

interface ExamCardData {
  id: number;
  testName: string;
  fullName: string;
  university: string;
  date: string;
  time: string;
  fee: string;
  image: string;
  description: string;
  duration: string;
  questions: number;
}

const RegisterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [exams, setExams] = useState<ExamCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
            fee: `LKR ${exam.price.toFixed(1)}`,
            image: exam.organization?.logo 
              ? `http://localhost:8000${exam.organization.logo}` 
              : "../src/assets/ucsc_logo.png", // Fallback image
            description: exam.description || 'No description available',
            duration: "2 hours", // Default duration (could be added to database later)
            questions: 50 // Default questions (could be added to database later)
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

                              <div className="mb-3">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {exam.fee}
                                </span>
                              </div>
                            </div>

                            <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm mt-auto">
                              View Details
                            </button>
                          </div>

                          <img
                            src={exam.image}
                            alt={`${exam.university} logo`}
                            className="w-30 h-30 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              // Fallback to default image if logo fails to load
                              e.currentTarget.src = "../src/assets/ucsc_logo.png";
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
      </div>
    </div>
  );
};

export default RegisterPage;