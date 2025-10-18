import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Home as HomeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";

const registeredExams = [
  {
    testName: "GCCT",
    fullName: "General Computer Competency Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-12",
    time: "09:00 AM",
    questions: 50,
    duration: "2 hours",
    paymentStatus: "Paid",
    image: "../src/assets/ucsc_logo.png",
  },
  {
    testName: "GCAT",
    fullName: "General Computer Aptitude Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-15",
    time: "01:00 PM",
    questions: 80,
    duration: "2.5 hours",
    paymentStatus: "Pending",
    image: "../src/assets/ucsc_logo.png",
  },
  {
    testName: "BIT Aptitude Test",
    fullName: "Bachelor of Information Technology Aptitude Test",
    university: "University of Colombo School of Computing",
    date: "2025-08-16",
    time: "11:00 AM",
    questions: 40,
    duration: "2 hours",
    paymentStatus: "Paid",
    image: "../src/assets/ucsc_logo.png",
  },
];

const completedExams = [
  {
    testName: "GAT",
    fullName: "General Aptitude Test",
    university: "University of Rajarata",
    examDate: "2025-07-15",
    grade: "A+",
    band: 4,
    score: 95,
    total: 100,
    resultsOut: true,
    image: "../src/assets/rajarata_uni.png",
  },
  {
    testName: "MOFIT",
    fullName: "Moratuwa Information Technology Test",
    university: "University of Moratuwa",
    examDate: "2025-07-10",
    grade: "A",
    band: 3,
    score: 88,
    total: 100,
    resultsOut: true,
    image: "../src/assets/mora_uni.png",
  },
  {
    testName: "SLCAT",
    fullName: "Sri Lanka Computer Aptitude Test",
    university: "University of Kelaniya",
    examDate: "2025-07-05",
    resultsOut: false,
    image: "../src/assets/ucsc_logo.png",
  },
];

const Home = () => {
  const [serverData, setServerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboard()
      .then((res) => {
        if (!mounted) return;
        // Expecting API to return { registeredExams: [], completedExams: [], student: {...} }
        setServerData(res);
      })
      .catch((err) => {
        console.warn('Failed to load dashboard from API, falling back to mock data', err);
        setServerData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Home</h1>
              <p className="text-gray-600 text-sm">Personalized exam dashboard and latest updates</p>
            </div>
          </div>
        </div>

        {/* Registered Exams Section */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Registered Exams</h2>
            <button onClick={() => navigate('/portal/my-exams')} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All Registered Exams</button>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading registered exams...</div>
          ) : (
            <div>
              {serverData && Array.isArray(serverData.registeredExams) && serverData.registeredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serverData.registeredExams.map((exam: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-foreground leading-tight mb-2">
                                {exam.testName || exam.name || exam.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exam.fullName || exam.description || ''}
                              </p>

                              <div className="mb-2">
                                <p className="text-sm text-muted-foreground font-medium">
                                  {exam.university || exam.organization || ''}
                                </p>
                              </div>

                              <div className="mb-2">
                                <p className="text-sm text-foreground">
                                  {exam.date || exam.exam_date || exam.examDate || ''}
                                  {exam.time ? ` • ${exam.time}` : ''}
                                </p>
                              </div>

                              <div className="mb-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${exam.paymentStatus === "Paid"
                                      ? "bg-green-100 text-green-800"
                                      : exam.paymentStatus === "Pending"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {exam.paymentStatus || exam.payment_status || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            <img
                              src={exam.image || exam.logo || '/profile_sample.png'}
                              alt={`${exam.university || exam.organization || 'university'} logo`}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">You have no registered exams.</div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-muted rounded-2xl shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Results</h2>
            <button onClick={() => navigate('/portal/my-exams')} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All Results</button>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading recent results...</div>
          ) : (
            <div>
              {serverData && Array.isArray(serverData.recentExams) && serverData.recentExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serverData.recentExams.map((exam: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="hover:scale-[1.02] transition-all duration-200 shadow-sm border-0 bg-card">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-foreground mb-2">
                                {exam.testName || exam.name || exam.title}
                              </h3>

                              <p className="text-sm text-muted-foreground mb-2">
                                {exam.fullName || exam.description || ''}
                              </p>

                              <p className="text-sm text-muted-foreground font-medium mb-3">
                                {exam.university || exam.organization || ''}
                              </p>

                              <div className="mb-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${exam.resultsOut || exam.results_out
                                      ? "bg-green-100 text-green-800"
                                      : "bg-orange-100 text-orange-800"
                                    }`}
                                >
                                  {exam.resultsOut || exam.results_out
                                    ? "Results Out"
                                    : "Results Pending"}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                {(exam.resultsOut || exam.results_out) ? (
                                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                                    Check Results
                                  </button>
                                ) : (
                                  <button
                                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed text-sm"
                                    disabled
                                  >
                                    Results Not Available
                                  </button>
                                )}
                              </div>
                            </div>

                            <img
                              src={exam.image || exam.logo || '/profile_sample.png'}
                              alt={`${exam.university || exam.organization || 'university'} logo`}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">You have no recent exam results.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;