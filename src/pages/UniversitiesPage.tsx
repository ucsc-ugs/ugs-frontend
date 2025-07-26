import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { GraduationCap, ArrowRight, ChevronLeft, Users, FileText, BarChart3, UserPlus, Search, TrendingUp, HelpCircle, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function UniversitiesPage() {
  const navigate = useNavigate();

  const universities = [
    {
      id: 1,
      name: "University of Colombo",
      description: "The premier university in Sri Lanka with a rich history of academic excellence since 1921.",
      imageUrl: "../src/assets/ucsc_logo.png",
      websiteUrl: "https://www.cmb.ac.lk/"
    },
    {
      id: 2,
      name: "University of Peradeniya",
      description: "One of the largest and oldest universities in Sri Lanka, known for its beautiful campus.",
      imageUrl: "../src/assets/placeholder-uni.jpg",
      websiteUrl: "https://www.pdn.ac.lk/"
    },
    // Add more universities as needed
  ];

  const handleBack = () => navigate("/");
  const handleSignIn = () => navigate("/signin");
  const handleContactUs = () => navigate("/contact-us");
  const handleRegister = () => navigate("/signup");
  const handleVisitWebsite = (url: string) => window.open(url, "_blank");

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Same as landing page but inline */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-xl bg-[#FFFFFF]/95 border-b border-[#89C2D9]/20 shadow-lg shadow-[#89C2D9]/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-[#89C2D9]/20 rounded-full blur-md"></div>
              <img
                src="../src/assets/ucsc_logo.png"
                alt="UCSC Logo"
                width={65}
                height={45}
                className="object-contain relative z-10"
              />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#012A4A] tracking-tight">
                University Gateway Solutions
              </h1>
              <p className="text-sm text-[#343A40]/80 font-medium">
                University of Colombo School of Computing
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E9ECEF]/30 to-[#89C2D9]/30 rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Button
                variant="ghost"
                className="relative border-2 border-[#343A40]/20 text-[#343A40] hover:bg-[#E9ECEF]/50 hover:text-[#012A4A] hover:border-[#89C2D9]/40 hover:shadow-lg hover:shadow-[#89C2D9]/20 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                onClick={handleContactUs}
              >
                Contact Us
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#89C2D9]/20 to-[#01497C]/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Button
                variant="outline"
                className="relative border-2 border-[#89C2D9]/50 text-[#01497C] hover:bg-[#89C2D9] hover:text-[#FFFFFF] hover:border-[#89C2D9] hover:shadow-lg hover:shadow-[#89C2D9]/30 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                onClick={handleRegister}
              >
                Register
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#01497C] to-[#012A4A] rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
              <Button
                className="relative bg-gradient-to-r from-[#01497C] to-[#013A63] hover:from-[#012A4A] hover:to-[#01497C] text-[#FFFFFF] px-8 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md shadow-[#01497C]/20 hover:shadow-lg hover:shadow-[#012A4A]/25 border-0 hover:brightness-110"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Universities Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button
            variant="outline"
            className="flex items-center gap-2 mb-8"
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#012A4A] mb-4">Partner Universities</h1>
            <p className="text-xl text-[#343A40] max-w-3xl mx-auto">
              Explore our network of prestigious academic institutions
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universities.map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={uni.imageUrl}
                    alt={uni.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#012A4A]/90 to-transparent"></div>
                  <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {uni.name}
                  </h2>
                </div>
                <CardContent className="flex-grow p-6">
                  <p className="text-[#343A40]">{uni.description}</p>
                </CardContent>
                <CardFooter className="p-6">
                  <Button
                    className="w-full bg-[#01497C] hover:bg-[#012A4A] text-white"
                    onClick={() => handleVisitWebsite(uni.websiteUrl)}
                  >
                    Visit Website
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}