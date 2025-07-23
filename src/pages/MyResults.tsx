import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Award,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  MessageSquare
} from "lucide-react";

interface ExamResult {
  id: number;
  examTitle: string;
  examDate: string;
  resultStatus: 'Pending' | 'Released';
  score?: number;
  grade?: string;
  transcriptStatus: 'Available' | 'Not yet generated';
  examType: string;
  year: number;
  organizationName: string;
  candidateId: string;
  status: 'Pass' | 'Fail' | 'Merit' | 'Distinction';
  comments?: string;
  image: string;
  totalMarks?: number;
  passingMarks?: number;
  appealAvailable?: boolean;
}

const myResults: ExamResult[] = [
  {
    id: 1,
    examTitle: "GCAT August 2025",
    examDate: "2025-08-20",
    resultStatus: "Released",
    score: 85,
    grade: "Distinction",
    transcriptStatus: "Available",
    examType: "Computer Aptitude",
    year: 2025,
    organizationName: "University of Colombo School of Computing",
    candidateId: "GCAT2025001234",
    status: "Distinction",
    comments: "Excellent performance in all sections",
    image: "../src/assets/ucsc_logo.png",
    totalMarks: 100,
    passingMarks: 50,
    appealAvailable: true
  },
  {
    id: 2,
    examTitle: "GCCT July 2025",
    examDate: "2025-07-10",
    resultStatus: "Pending",
    transcriptStatus: "Not yet generated",
    examType: "Computer Competency",
    year: 2025,
    organizationName: "University of Colombo School of Computing",
    candidateId: "GCCT2025001234",
    status: "Pass",
    image: "../src/assets/ucsc_logo.png",
    totalMarks: 100,
    passingMarks: 50,
    appealAvailable: false
  },
  {
    id: 3,
    examTitle: "GAT June 2025",
    examDate: "2025-06-15",
    resultStatus: "Released",
    score: 72,
    grade: "Pass",
    transcriptStatus: "Available",
    examType: "General Aptitude",
    year: 2025,
    organizationName: "University of Rajarata",
    candidateId: "GAT2025001234",
    status: "Pass",
    comments: "Good performance with room for improvement",
    image: "../src/assets/rajarata_uni.png",
    totalMarks: 100,
    passingMarks: 50,
    appealAvailable: true
  },
  {
    id: 4,
    examTitle: "MOFIT May 2025",
    examDate: "2025-05-22",
    resultStatus: "Released",
    score: 92,
    grade: "Merit",
    transcriptStatus: "Available",
    examType: "Information Technology",
    year: 2025,
    organizationName: "University of Moratuwa",
    candidateId: "MOFIT2025001234",
    status: "Merit",
    comments: "Outstanding technical knowledge demonstrated",
    image: "../src/assets/mora_uni.png",
    totalMarks: 100,
    passingMarks: 60,
    appealAvailable: false
  },
  {
    id: 5,
    examTitle: "BIT Aptitude Test April 2025",
    examDate: "2025-04-18",
    resultStatus: "Released",
    score: 45,
    grade: "Fail",
    transcriptStatus: "Available",
    examType: "IT Aptitude",
    year: 2025,
    organizationName: "University of Colombo School of Computing",
    candidateId: "BIT2025001234",
    status: "Fail",
    comments: "Below passing threshold. Consider retaking the exam.",
    image: "../src/assets/ucsc_logo.png",
    totalMarks: 100,
    passingMarks: 50,
    appealAvailable: true
  },
  {
    id: 6,
    examTitle: "SLCAT March 2024",
    examDate: "2024-03-12",
    resultStatus: "Released",
    score: 78,
    grade: "Merit",
    transcriptStatus: "Available",
    examType: "Computer Aptitude",
    year: 2024,
    organizationName: "University of Kelaniya",
    candidateId: "SLCAT2024001234",
    status: "Merit",
    comments: "Good analytical skills shown",
    image: "../src/assets/kelaniya_uni.png",
    totalMarks: 100,
    passingMarks: 50,
    appealAvailable: false
  }
];

const MyResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Get unique exam types and years for filters
  const examTypes = [...new Set(myResults.map(result => result.examType))];
  const years = [...new Set(myResults.map(result => result.year))].sort((a, b) => b - a);

  // Filter results based on search and filters
  const filteredResults = myResults.filter(result => {
    const matchesSearch = result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExamType = selectedExamType === 'all' || result.examType === selectedExamType;
    const matchesYear = selectedYear === 'all' || result.year.toString() === selectedYear;

    return matchesSearch && matchesExamType && matchesYear;
  });

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (status: string) => {
    switch (status) {
      case 'Distinction':
        return 'bg-purple-100 text-purple-800';
      case 'Merit':
        return 'bg-blue-100 text-blue-800';
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'Released':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleViewResult = (result: ExamResult) => {
    setSelectedResult(result);
  };

  const handleDownloadTranscript = (resultId: number) => {
    console.log(`Downloading transcript for result ${resultId}`);
    // Handle transcript download logic
  };

  const handleAppeal = (resultId: number) => {
    console.log(`Initiating appeal for result ${resultId}`);
    // Handle appeal logic
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
              <p className="text-gray-600 text-sm">
                View your exam results and achievements
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by exam name or organization..."
                  className="pl-10 rounded-xl shadow-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger className="w-full md:w-[200px] rounded-xl shadow-md">
                    <SelectValue placeholder="Filter by Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exam Types</SelectItem>
                    {examTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full md:w-[150px] rounded-xl shadow-md">
                    <SelectValue placeholder="Filter by Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground mt-2">
            Showing {filteredResults.length} of {myResults.length} exam results
          </div>
        </div>

        {/* Results Table/Cards */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="space-y-4">
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:scale-[1.01] transition-all duration-200 shadow-sm border-0 bg-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* Left Section: Image and Exam Info */}
                      <div className="flex gap-4 flex-1">
                        <img
                          src={result.image}
                          alt={`${result.organizationName} logo`}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {result.examTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {result.organizationName}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {formatDate(result.examDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Status on top, View button at bottom */}
                      <div className="flex flex-col justify-center items-end">
                        {/* Top Right: Result Status */}
                        {result.resultStatus === 'Pending' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 text-sm font-medium rounded-full ${getResultStatusColor(result.resultStatus)}`}
                            >
                              {result.resultStatus}
                            </span>
                          </div>
                        )}

                        {/* Bottom Right: View Button */}
                        {result.resultStatus === 'Released' && (
                          <button
                            onClick={() => handleViewResult(result)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View Results
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* No Results Message */}
        {filteredResults.length === 0 && (
          <div className="bg-white dark:bg-muted rounded-2xl shadow p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Result Details Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedResult.examTitle}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedResult.organizationName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Exam Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedResult.examDate)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Candidate ID</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedResult.candidateId}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Status</h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(selectedResult.status)}`}>
                        {selectedResult.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedResult.score && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Score</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedResult.score}/{selectedResult.totalMarks} ({selectedResult.grade})
                        </p>
                      </div>
                    )}

                    {selectedResult.passingMarks && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Passing Marks</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedResult.passingMarks}/{selectedResult.totalMarks}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Grade</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedResult.grade || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedResult.comments && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground mb-2">Comments</h3>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      {selectedResult.comments}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-between flex-wrap gap-3 items-center">
                  <div className="flex flex-wrap gap-3">
                    {selectedResult.transcriptStatus === 'Available' && (
                      <button
                        onClick={() => handleDownloadTranscript(selectedResult.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download Transcript
                      </button>
                    )}

                    {selectedResult.appealAvailable && (
                      <button
                        onClick={() => handleAppeal(selectedResult.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Submit Appeal
                      </button>
                    )}
                  </div>

                    
                  <div>
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResults;