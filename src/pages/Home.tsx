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
  { subject: "Software Engineering", date: "2025-08-12", time: "09:00 AM" },
  { subject: "Database Management", date: "2025-08-14", time: "01:00 PM" },
  { subject: "Networking", date: "2025-08-16", time: "11:00 AM" },
];

const results = [
  { subject: "OOP", grade: "A+" },
  { subject: "Web Development", grade: "A" },
  { subject: "Mathematics", grade: "B+" },
];

const Home = () => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn min-w-[320px]">

      {/* Top Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Input
          placeholder="Search exams or results..."
          className="w-full max-w-xs rounded-xl shadow-md"
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
        <h2 className="text-xl font-semibold mb-4 text-primary">Upcoming Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingExams.map((exam, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-secondary-foreground">
                    {exam.subject}
                  </h3>
                  <p className="text-muted-foreground">Date: {exam.date}</p>
                  <p className="text-muted-foreground">Time: {exam.time}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4 text-primary">
          Released Results
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((res, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:scale-[1.02] transition-all duration-200 bg-muted/20 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-secondary-foreground">
                    {res.subject}
                  </h3>
                  <p className="text-xl font-bold text-green-600">{res.grade}</p>
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
