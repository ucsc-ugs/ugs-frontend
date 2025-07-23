import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Eye,
  X,
  Download,
  BookOpen
} from "lucide-react";

interface Exam {
  id: number;
  testName: string;
  fullName: string;
  organization: string;
  university: string;
  date: string;
  time: string;
  location?: string;
  fee: string;
  registrationStatus: 'Completed' | 'Cancellable';
  registrationDeadline: string;
  image: string;
  description: string;
  duration: string;
  questions: number;
  receiptNumber?: string;
}

const myExams: Exam[] = [
  {
    id: 1,
    testName: "GCCT",
    fullName: "General Computer Competency Test",
    organization: "UCSC",
    university: "University of Colombo School of Computing",
    date: "2025-08-12",
    time: "09:00 AM",
    location: "Main Computer Lab, UCSC",
    fee: "LKR 2,500",
    registrationStatus: "Completed",
    registrationDeadline: "2025-08-05",
    image: "../src/assets/ucsc_logo.png",
    description: "A comprehensive test to assess computer competency skills.",
    duration: "2 hours",
    questions: 50,
    receiptNumber: "RCP001245"
  },
  {
    id: 2,
    testName: "GCAT",
    fullName: "General Computer Aptitude Test",
    organization: "UCSC",
    university: "University of Colombo School of Computing",
    date: "2025-08-15",
    time: "01:00 PM",
    location: "Lecture Hall A, UCSC",
    fee: "LKR 3,000",
    registrationStatus: "Completed",
    registrationDeadline: "2025-08-08",
    image: "../src/assets/ucsc_logo.png",
    description: "Test your general computer aptitude and problem-solving skills.",
    duration: "2.5 hours",
    questions: 80
  },
  {
    id: 3,
    testName: "BIT Aptitude Test",
    fullName: "Bachelor of Information Technology Aptitude Test",
    organization: "UCSC",
    university: "University of Colombo School of Computing",
    date: "2025-08-16",
    time: "11:00 AM",
    location: "Computer Lab 2, UCSC",
    fee: "LKR 4,000",
    registrationStatus: "Completed",
    registrationDeadline: "2025-08-09",
    image: "../src/assets/ucsc_logo.png",
    description: "Entrance exam for Bachelor of Information Technology program.",
    duration: "2 hours",
    questions: 40
  },
  {
    id: 4,
    testName: "GAT",
    fullName: "General Aptitude Test",
    organization: "Other",
    university: "University of Rajarata",
    date: "2025-08-18",
    time: "10:00 AM",
    location: "Main Auditorium, University of Rajarata",
    fee: "LKR 2,800",
    registrationStatus: "Completed",
    registrationDeadline: "2025-08-11",
    image: "../src/assets/rajarata_uni.png",
    description: "General aptitude assessment for university admission.",
    duration: "3 hours",
    questions: 100,
    receiptNumber: "RCP001246"
  },
  {
    id: 5,
    testName: "MOFIT",
    fullName: "Moratuwa Information Technology Test",
    organization: "Other",
    university: "University of Moratuwa",
    date: "2025-08-20",
    time: "09:30 AM",
    fee: "LKR 3,500",
    registrationStatus: "Completed",
    registrationDeadline: "2025-08-13",
    image: "../src/assets/mora_uni.png",
    description: "Specialized IT assessment for Moratuwa University programs.",
    duration: "2.5 hours",
    questions: 75
  }
];

const MyExams = () => {
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Filter exams based on selected filters
  const filteredExams = myExams.filter(exam => {
    const matchesOrganization = filterOrganization === 'all' || exam.organization === filterOrganization;
    return matchesOrganization;
  });

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancellable':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (exam: Exam) => {
    setSelectedExam(exam);
  };

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
              <span className="text-sm font-medium text-foreground">Organization:</span>
              <Select value={filterOrganization} onValueChange={setFilterOrganization}>
                <SelectTrigger className="w-full md:w-[200px] rounded-xl shadow-md">
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="UCSC">UCSC</SelectItem>
                  <SelectItem value="Other">Other Universities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground mt-2">
            Showing {filteredExams.length} of {myExams.length} registered exams
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
                    {/* Top Section: Header + Image */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-tight">
                          {exam.testName}
                        </h3>
                        <p className="font-bold text-md text-muted-foreground">{exam.fullName}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-2">
                          {exam.university}
                        </p>
                        {/* Date & Time */}
                        <div className="flex items-center gap-2 mt-4">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {exam.date} • {exam.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        
                        <img
                          src={exam.image}
                          alt={`${exam.university} logo`}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </div>
                    </div>

                    {/* Middle Section: Details */}
                    <div className="flex flex-col gap-2">
                      

                      {/* Location */}
                      {exam.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{exam.location}</span>
                        </div>
                      )}

                      {/* Registration Deadline */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Registration Deadline: {exam.registrationDeadline}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Section: Fee and Button */}
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {exam.fee}
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
              Try adjusting your filters or register for new exams.
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
                      {selectedExam.testName}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedExam.fullName}
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
                  <div>
                    <h3 className="font-medium text-foreground mb-2">University</h3>
                    <p className="text-sm text-muted-foreground">{selectedExam.university}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedExam.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Duration</h3>
                      <p className="text-sm text-muted-foreground">{selectedExam.duration}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Questions</h3>
                      <p className="text-sm text-muted-foreground">{selectedExam.questions}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Fee</h3>
                    <p className="text-sm text-muted-foreground">{selectedExam.fee}</p>
                  </div>

                  {selectedExam.receiptNumber && (
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Receipt Number</h3>
                      <p className="text-sm text-muted-foreground">{selectedExam.receiptNumber}</p>
                    </div>
                  )}
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