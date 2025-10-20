import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, FileText, BarChart3, ArrowRight, UserPlus, Search, TrendingUp, HelpCircle, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll to top on component mount/page refresh
  useEffect(() => {
    // Force scroll to top immediately on page load/refresh
    const scrollToTop = () => {
      // Multiple methods to ensure it works across all browsers
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Fallback methods
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Additional check with timeout to ensure it worked
      setTimeout(() => {
        if (window.pageYOffset !== 0 || document.documentElement.scrollTop !== 0) {
          window.scrollTo(0, 0);
        }
      }, 10);
    };

    // Execute immediately
    scrollToTop();

    // Also execute after a brief delay to catch any delayed content loading
    const timeoutId = setTimeout(scrollToTop, 100);

    // Cleanup timeout
    return () => clearTimeout(timeoutId);
  }, []);

  // Header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the very top
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsHeaderVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener with throttling
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  const handleSignIn = () => navigate("/signin");
  // const handleSignUp = () => navigate("/signup");
  // const handleAccessPortal = () => navigate("/portal");
  // const handleStudentPortal = () => navigate("/portal");
  // const handleInitiateRegistration = () => navigate("/portal/register");
  const handleContactUs = () => navigate("/contact-us");

  const handleRegister = () => {
    navigate("/signup"); // Navigate to register page with sidebar
  };

  const handleInitiateRegistration = () => {
    navigate("/signup"); // Navigate to register page with sidebar
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-xl bg-[#FFFFFF]/95 border-b border-[#89C2D9]/20 shadow-lg shadow-[#89C2D9]/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isHeaderVisible ? 0 : -100,
          opacity: isHeaderVisible ? 1 : 0
        }}
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

      {/* Hero Section */}
      <motion.section
        className="relative py-32 bg-gradient-to-br from-[#012A4A] via-[#013A63] to-[#01497C] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[#012A4A]/30"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Badge className="mb-6 bg-[#89C2D9] text-[#012A4A] hover:bg-[#89C2D9]/90 border-0 px-6 py-2 text-sm font-medium">
              Academic Excellence Initiative
            </Badge>
          </motion.div>

          <motion.h1
            className="text-7xl font-bold text-[#FFFFFF] mb-6 leading-tight"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            University Gateway
            <span className="text-[#89C2D9] block">Solutions</span>
          </motion.h1>

          <motion.p
            className="text-2xl text-[#E9ECEF] mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            A comprehensive eExam Management platform for handling registration, payments, and results management for aptitude exams like GCAT and GCCT at UCSC.
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-[#89C2D9] hover:bg-[#89C2D9]/90 text-[#012A4A] text-xl px-16 py-6 border-0 shadow-2xl shadow-[#89C2D9]/25 rounded-2xl font-semibold"
                onClick={handleRegister}
              >
                <UserPlus className="mr-3 h-6 w-6" />
                Register Now
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-[#89C2D9]/20 rounded-full blur-xl"
          animate={{ y: [0, -20, 0], rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-[#01497C]/20 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </motion.section>      {/* Core Functions */}
      <motion.section
        className="py-24 bg-gradient-to-b from-[#E9ECEF] to-[#FFFFFF] relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        {/* Section Divider */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#89C2D9] to-transparent"></div>

        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-[#01497C] rounded-full mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <FileText className="h-8 w-8 text-[#FFFFFF]" />
            </motion.div>
            <h2 className="text-5xl font-bold text-[#012A4A] mb-6">
              Core Platform Functions
            </h2>
            <p className="text-xl text-[#343A40] max-w-3xl mx-auto leading-relaxed">
              Streamlined exam management processes from registration to results delivery.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            <motion.div
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="border-0 bg-[#FFFFFF] shadow-xl shadow-[#89C2D9]/20 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 text-center h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#E9ECEF]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-[#01497C] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileText className="h-10 w-10 text-[#FFFFFF]" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-[#012A4A] mb-4">Exam Management</CardTitle>
                  <CardDescription className="text-lg text-[#343A40] leading-relaxed">
                    Create and manage aptitude tests like GCAT and GCCT with comprehensive administration tools and scheduling capabilities.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="border-0 bg-[#FFFFFF] shadow-xl shadow-[#89C2D9]/20 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 text-center h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#E9ECEF]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-[#89C2D9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users className="h-10 w-10 text-[#012A4A]" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-[#012A4A] mb-4">Registration & Payment</CardTitle>
                  <CardDescription className="text-lg text-[#343A40] leading-relaxed">
                    Secure online registration for multiple examinations with integrated payment processing and instant confirmation.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="border-0 bg-[#FFFFFF] shadow-xl shadow-[#89C2D9]/20 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 text-center h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#E9ECEF]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-[#013A63] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BarChart3 className="h-10 w-10 text-[#FFFFFF]" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-[#012A4A] mb-4">Results & Transcripts</CardTitle>
                  <CardDescription className="text-lg text-[#343A40] leading-relaxed">
                    Access exam results, download official transcripts, and track your performance with real-time notifications.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section Divider */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#89C2D9] to-transparent"></div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-24 bg-gradient-to-br from-[#012A4A] to-[#013A63] relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#89C2D9]/10 to-[#E9ECEF]/5"></div>
        <motion.div
          className="absolute top-10 right-10 w-40 h-40 bg-[#89C2D9]/20 rounded-full blur-3xl"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-60 h-60 bg-[#E9ECEF]/10 rounded-full blur-3xl"
          animate={{ rotate: -360, scale: [1, 0.8, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="w-16 h-16 bg-[#89C2D9] rounded-full flex items-center justify-center mr-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <GraduationCap className="h-8 w-8 text-[#012A4A]" />
              </motion.div>
              <h2 className="text-5xl font-bold text-[#FFFFFF]">How It Works</h2>
            </div>
            <p className="text-xl text-[#E9ECEF] max-w-3xl mx-auto leading-relaxed">
              Simple 3 steps to register for your aptitude exam
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            {/* Step 1 */}
            <motion.div
              className="text-center group"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="w-24 h-24 bg-[#89C2D9] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#89C2D9]/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserPlus className="h-12 w-12 text-[#012A4A]" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-10 h-10 bg-[#E9ECEF] rounded-full flex items-center justify-center text-[#012A4A] font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  1
                </motion.div>
              </div>
              <div className="bg-[#FFFFFF]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#E9ECEF]/20 hover:bg-[#FFFFFF]/15 transition-colors duration-300">
                <h3 className="text-2xl font-bold text-[#FFFFFF] mb-4">Create Your Account</h3>
                <p className="text-[#E9ECEF] text-lg leading-relaxed">
                  Quick and easy registration process. Sign up with your details to access the exam portal.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="text-center group"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="w-24 h-24 bg-[#89C2D9] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#89C2D9]/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Search className="h-12 w-12 text-[#012A4A]" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-10 h-10 bg-[#E9ECEF] rounded-full flex items-center justify-center text-[#012A4A] font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  2
                </motion.div>
              </div>
              <div className="bg-[#FFFFFF]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#E9ECEF]/20 hover:bg-[#FFFFFF]/15 transition-colors duration-300">
                <h3 className="text-2xl font-bold text-[#FFFFFF] mb-4">Browse and Register for Exams</h3>
                <p className="text-[#E9ECEF] text-lg leading-relaxed">
                  Select from available aptitude tests like GCAT and GCCT, and complete your registration with secure online payment.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="text-center group"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="w-24 h-24 bg-[#89C2D9] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#89C2D9]/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-12 w-12 text-[#012A4A]" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-10 h-10 bg-[#E9ECEF] rounded-full flex items-center justify-center text-[#012A4A] font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  3
                </motion.div>
              </div>
              <div className="bg-[#FFFFFF]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#E9ECEF]/20 hover:bg-[#FFFFFF]/15 transition-colors duration-300">
                <h3 className="text-2xl font-bold text-[#FFFFFF] mb-4">Track Your Results Online</h3>
                <p className="text-[#E9ECEF] text-lg leading-relaxed">
                  Receive instant notifications and access your results and transcripts through our secure student portal.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Registration Section */}
      <motion.section
        className="py-32 bg-gradient-to-br from-[#012A4A] via-[#01497C] to-[#012A4A] relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#89C2D9]/20 to-[#E9ECEF]/10"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2389c2d9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Floating particles */}
        <motion.div
          className="absolute top-20 left-20 w-4 h-4 bg-[#89C2D9] rounded-full"
          animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-40 w-3 h-3 bg-[#E9ECEF] rounded-full"
          animate={{ y: [0, 40, 0], x: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-5 h-5 bg-[#89C2D9] rounded-full"
          animate={{ y: [0, -25, 0], x: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-[#89C2D9] rounded-full mb-8 shadow-2xl shadow-[#89C2D9]/25"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="h-10 w-10 text-[#012A4A]" />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-6xl font-bold text-[#FFFFFF] mb-8 leading-tight"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Ready to Register for
            <span className="text-[#89C2D9] block">Your Aptitude Exam?</span>
          </motion.h2>

          <motion.p
            className="text-2xl text-[#E9ECEF] mb-16 max-w-4xl mx-auto leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Join thousands of candidates who have successfully registered and taken aptitude exams through our comprehensive platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-[#89C2D9] hover:bg-[#89C2D9]/90 text-[#012A4A] text-xl px-16 py-6 border-0 shadow-2xl shadow-[#89C2D9]/25 rounded-2xl font-semibold"
                onClick={handleInitiateRegistration}
              >
                Start Registration Process
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-[#E9ECEF]"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#89C2D9] rounded-full"></div>
              <span className="text-sm">Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#89c2d9] rounded-full"></div>
              <span className="text-sm">Instant Registration</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-32 bg-gradient-to-br from-[#E9ECEF] via-[#FFFFFF] to-[#89C2D9]/20 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        {/* Section Divider */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#89C2D9] to-transparent"></div>

        {/* Background Elements */}
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-[#89C2D9]/20 rounded-full blur-2xl"
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-40 h-40 bg-[#01497C]/20 rounded-full blur-2xl"
          animate={{ scale: [1, 0.8, 1], rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                className="w-16 h-16 bg-[#01497C] rounded-full flex items-center justify-center mr-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <HelpCircle className="h-8 w-8 text-[#FFFFFF]" />
              </motion.div>
              <h2 className="text-5xl font-bold text-[#012A4A]">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-xl text-[#343A40] max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about exam registration, payments, and results
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {/* FAQ Item 1 */}
            <motion.div
              variants={{
                hidden: { y: 40, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Card className="bg-[#FFFFFF]/80 backdrop-blur-sm border-0 shadow-xl shadow-[#89C2D9]/25 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 overflow-hidden">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-[#E9ECEF]/30 transition-colors duration-300"
                  onClick={() => setOpenFAQ(openFAQ === 0 ? null : 0)}
                >
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-lg font-semibold text-[#012A4A] flex items-center">
                      <div className="w-3 h-3 bg-[#01497C] rounded-full mr-4"></div>
                      How do I register for exams?
                    </CardDescription>
                    <motion.div
                      animate={{ rotate: openFAQ === 0 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-[#01497C] rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-[#FFFFFF]" />
                    </motion.div>
                  </div>
                </CardHeader>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === 0 ? "auto" : 0,
                    opacity: openFAQ === 0 ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-[#E9ECEF]/50 rounded-2xl border border-[#89C2D9]/30">
                      <p className="text-[#012A4A] text-base leading-relaxed">
                        Create an account on the platform, browse available aptitude exams (GCAT, GCCT, etc.),
                        select your desired exam, complete the registration form, and make secure online payment.
                        You'll receive instant confirmation via email with exam details.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* FAQ Item 2 */}
            <motion.div
              variants={{
                hidden: { y: 40, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Card className="bg-[#FFFFFF]/80 backdrop-blur-sm border-0 shadow-xl shadow-[#89C2D9]/25 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 overflow-hidden">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-[#E9ECEF]/30 transition-colors duration-300"
                  onClick={() => setOpenFAQ(openFAQ === 1 ? null : 1)}
                >
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-lg font-semibold text-[#012A4A] flex items-center">
                      <div className="w-3 h-3 bg-[#013A63] rounded-full mr-4"></div>
                      How will I receive my exam results?
                    </CardDescription>
                    <motion.div
                      animate={{ rotate: openFAQ === 1 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-[#013A63] rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-[#FFFFFF]" />
                    </motion.div>
                  </div>
                </CardHeader>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === 1 ? "auto" : 0,
                    opacity: openFAQ === 1 ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-[#E9ECEF]/50 rounded-2xl border border-[#89C2D9]/30">
                      <p className="text-[#012A4A] text-base leading-relaxed">
                        Exam results are published directly to your student portal once they're processed and released.
                        You'll receive an email notification when results are available. Log in to your portal to view
                        your results and download official transcripts with verification codes.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* FAQ Item 3 */}
            <motion.div
              variants={{
                hidden: { y: 40, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Card className="bg-[#FFFFFF]/80 backdrop-blur-sm border-0 shadow-xl shadow-[#89C2D9]/25 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 overflow-hidden">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-[#E9ECEF]/30 transition-colors duration-300"
                  onClick={() => setOpenFAQ(openFAQ === 2 ? null : 2)}
                >
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-lg font-semibold text-[#012A4A] flex items-center">
                      <div className="w-3 h-3 bg-[#013A63] rounded-full mr-4"></div>
                      Can foreign students apply through this platform?
                    </CardDescription>
                    <motion.div
                      animate={{ rotate: openFAQ === 2 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-[#013A63] rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-[#FFFFFF]" />
                    </motion.div>
                  </div>
                </CardHeader>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === 2 ? "auto" : 0,
                    opacity: openFAQ === 2 ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-[#E9ECEF]/50 rounded-2xl border border-[#89C2D9]/30">
                      <p className="text-[#012A4A] text-base leading-relaxed">
                        Yes! The platform is designed to be accessible to any qualified candidate.
                        International students can register for available exams using our secure international
                        payment gateway. Contact our support team for specific requirements or assistance with
                        the registration process.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* FAQ Item 4 */}
            <motion.div
              variants={{
                hidden: { y: 40, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Card className="bg-[#FFFFFF]/80 backdrop-blur-sm border-0 shadow-xl shadow-[#89C2D9]/25 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 overflow-hidden">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-[#E9ECEF]/30 transition-colors duration-300"
                  onClick={() => setOpenFAQ(openFAQ === 3 ? null : 3)}
                >
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-lg font-semibold text-[#012A4A] flex items-center">
                      <div className="w-3 h-3 bg-[#013A63] rounded-full mr-4"></div>
                      Is my payment information secure?
                    </CardDescription>
                    <motion.div
                      animate={{ rotate: openFAQ === 3 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-[#013A63] rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-[#FFFFFF]" />
                    </motion.div>
                  </div>
                </CardHeader>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === 3 ? "auto" : 0,
                    opacity: openFAQ === 3 ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-[#E9ECEF]/50 rounded-2xl border border-[#89C2D9]/30">
                      <p className="text-[#012A4A] text-base leading-relaxed">
                        Absolutely! We use industry-standard SSL encryption and secure payment
                        gateways for all transactions. Your financial information is never stored on our servers
                        and all payments are processed through certified, PCI-compliant payment providers ensuring
                        maximum security.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* FAQ Item 5 */}
            <motion.div
              variants={{
                hidden: { y: 40, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 }
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Card className="bg-[#FFFFFF]/80 backdrop-blur-sm border-0 shadow-xl shadow-[#89C2D9]/25 hover:shadow-2xl hover:shadow-[#01497C]/25 transition-all duration-500 overflow-hidden">
                <CardHeader
                  className="cursor-pointer p-6 hover:bg-[#E9ECEF]/30 transition-colors duration-300"
                  onClick={() => setOpenFAQ(openFAQ === 4 ? null : 4)}
                >
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-lg font-semibold text-[#012A4A] flex items-center">
                      <div className="w-3 h-3 bg-[#013A63] rounded-full mr-4"></div>
                      What if I need help during the registration process?
                    </CardDescription>
                    <motion.div
                      animate={{ rotate: openFAQ === 4 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-[#013A63] rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4 text-[#FFFFFF]" />
                    </motion.div>
                  </div>
                </CardHeader>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === 4 ? "auto" : 0,
                    opacity: openFAQ === 4 ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="p-4 bg-[#E9ECEF]/50 rounded-2xl border border-[#89C2D9]/30">
                      <p className="text-[#012A4A] text-base leading-relaxed">
                        Our dedicated support team is here to assist you! You can reach us through the
                        contact form on our website, send an email to our support address, or use the live
                        chat feature during business hours. We're committed to ensuring a smooth registration
                        experience for all candidates.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#012A4A] text-[#FFFFFF] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img
                src="../src/assets/ucsc_logo.png"
                alt="UCSC Logo"
                width={40}
                height={30}
                className="object-contain brightness-0 invert"
              />
              <div>
                <h3 className="font-bold text-[#FFFFFF]">University Gateway Solutions</h3>
                <p className="text-sm text-[#E9ECEF]">University of Colombo School of Computing</p>
              </div>
            </div>

            <div className="flex gap-8 text-sm text-[#E9ECEF]">
              <a
                href="#"
                className="hover:text-[#89C2D9] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-[#89C2D9] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-[#89C2D9] transition-colors"
              >
                Exam Support
              </a>
            </div>
          </div>

          <div className="border-t border-[#013A63] mt-8 pt-8 text-center text-sm text-[#E9ECEF]">
            <p>&copy; 2024 University of Colombo School of Computing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}