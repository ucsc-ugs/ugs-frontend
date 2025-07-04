import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import profileSample from "@/assets/profile_sample.png";

const mockUser = {
  name: "User One",
  regNumber: "2025/IS/011",
  avatar: profileSample,
};

const upcomingExams = [
  {
    subject: "Software Engineering",
    date: "2025-08-12",
    time: "09:00 AM",
    status: "Open",
    difficulty: "Intermediate",
    questions: 100,
    duration: "3 hours",
    registration: { current: 245, total: 300 },
    deadline: "2025-08-10",
    daysLeft: 8
  },
  {
    subject: "Database Management",
    date: "2025-08-14",
    time: "01:00 PM",
    status: "Closing Soon",
    difficulty: "Advanced",
    questions: 80,
    duration: "2.5 hours",
    registration: { current: 189, total: 200 },
    deadline: "2025-08-12",
    daysLeft: 10
  },
  {
    subject: "Networking",
    date: "2025-08-16",
    time: "11:00 AM",
    status: "Open",
    difficulty: "Beginner",
    questions: 75,
    duration: "2 hours",
    registration: { current: 156, total: 250 },
    deadline: "2025-08-14",
    daysLeft: 12
  },
];

const results = [
  {
    subject: "Object Oriented Programming",
    examDate: "2025-07-15",
    grade: "A+",
    score: 95,
    total: 100,
    percentile: 98,
    classRank: 5
  },
  {
    subject: "Web Development",
    examDate: "2025-07-10",
    grade: "A",
    score: 88,
    total: 100,
    percentile: 92,
    classRank: 12
  },
  {
    subject: "Mathematics",
    examDate: "2025-07-05",
    grade: "B+",
    score: 82,
    total: 100,
    percentile: 85,
    classRank: 25
  },
];

const Home = () => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn min-h-svh min-w-[320px]">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Input
          placeholder="Search exams or results..."
          className="w-full max-w-lg rounded-xl shadow-md"
        />

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end text-right leading-tight">
            <div className="text-sm font-semibold text-muted-foreground">
              {mockUser.name}
            </div>
            <div className="text-xs text-gray-500">Reg-No: {mockUser.regNumber}</div>
          </div>

          <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-transform duration-200 hover:scale-105">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>MM</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Upcoming Exams Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Upcoming Exams</h2>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Exams
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingExams.map((exam, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      {exam.subject}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${exam.status === 'Open' ? 'bg-green-100 text-green-800' :
                        exam.status === 'Closing Soon' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {exam.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">
                      {exam.date} • {exam.time}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-destructive font-medium">
                      Registration ends: {exam.deadline}
                    </p>
                  </div>

                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                    Register Now
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Results</h2>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Results
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {result.subject}
                  </h3>

                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-2xl font-bold ${result.grade === 'A+' ? 'text-green-600' :
                        result.grade === 'A' ? 'text-green-600' :
                          result.grade === 'B+' ? 'text-blue-600' :
                            'text-gray-600'
                      }`}>
                      {result.grade}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.score}/{result.total}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                      Certificate
                    </button>
                    <button className="flex-1 py-2 px-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                      Details
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;