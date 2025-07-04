import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";

const availableExams = [
  {
    id: 1,
    testName: "GCCT",
    fullName: "General Computer Competency Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-12",
    time: "09:00 AM",
    fee: "LKR 2,500",
    image: "../src/assets/ucsc_logo.png",
    description: "A comprehensive test to assess computer competency skills.",
    duration: "2 hours",
    questions: 50
  },
  {
    id: 2,
    testName: "GCAT",
    fullName: "General Computer Aptitude Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-15",
    time: "01:00 PM",
    fee: "LKR 3,000",
    image: "../src/assets/ucsc_logo.png",
    description: "Test your general computer aptitude and problem-solving skills.",
    duration: "2.5 hours",
    questions: 80
  },
  {
    id: 3,
    testName: "BIT Aptitude Test",
    fullName: "Bachelor of Information Technology Aptitude Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-16",
    time: "11:00 AM",
    fee: "LKR 4,000",
    image: "../src/assets/ucsc_logo.png",
    description: "Entrance exam for Bachelor of Information Technology program.",
    duration: "2 hours",
    questions: 40
  },
  {
    id: 4,
    testName: "GAT",
    fullName: "General Aptitude Test",
    university: "University of Rajarata",
    date: "2025-08-18",
    time: "10:00 AM",
    fee: "LKR 2,800",
    image: "../src/assets/rajarata_uni.png",
    description: "General aptitude assessment for university admission.",
    duration: "3 hours",
    questions: 100
  },
  {
    id: 5,
    testName: "MOFIT",
    fullName: "Moratuwa Information Technology Test",
    university: "University of Moratuwa",
    date: "2025-08-20",
    time: "09:30 AM",
    fee: "LKR 3,500",
    image: "../src/assets/mora_uni.png",
    description: "Specialized IT assessment for Moratuwa University programs.",
    duration: "2.5 hours",
    questions: 75
  },
  {
    id: 6,
    testName: "SLCAT",
    fullName: "Sri Lanka Computer Aptitude Test",
    university: "University of Kelaniya",
    date: "2025-08-22",
    time: "02:00 PM",
    fee: "LKR 2,200",
    image: "../src/assets/kelaniya_uni.png",
    description: "National level computer aptitude examination.",
    duration: "2 hours",
    questions: 60
  },
  {
    id: 7,
    testName: "ECAT",
    fullName: "Engineering Computer Aptitude Test",
    university: "University of Peradeniya",
    date: "2025-08-25",
    time: "08:00 AM",
    fee: "LKR 4,500",
    image: "../src/assets/pera_uni.png",
    description: "Computer aptitude test for engineering students.",
    duration: "3 hours",
    questions: 90
  },
  {
    id: 8,
    testName: "DCAT",
    fullName: "Data Science Computer Aptitude Test",
    university: "University of Colombo",
    date: "2025-08-28",
    time: "01:30 PM",
    fee: "LKR 3,800",
    image: "../src/assets/uoc.png",
    description: "Aptitude test focused on data science and analytics.",
    duration: "2.5 hours",
    questions: 70
  }
];

const RegisterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');

  // Get unique universities for filter
  const universities = [...new Set(availableExams.map(exam => exam.university))];

  // Filter exams based on search and university filter
  const filteredExams = availableExams.filter(exam => {
    const matchesSearch = exam.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.university.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUniversity = selectedUniversity === 'all' || exam.university === selectedUniversity;
    
    return matchesSearch && matchesUniversity;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn min-h-svh min-w-[320px] p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground">Available Exams</h1>
        <p className="text-muted-foreground">Browse and register for upcoming examinations</p>
      </div>

      {/* Search and Filter Bar */}
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
      <div className="text-sm text-muted-foreground">
        Showing {filteredExams.length} of {availableExams.length} exams
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-foreground mb-2">No exams found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;