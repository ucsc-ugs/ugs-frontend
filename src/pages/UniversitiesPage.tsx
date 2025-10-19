import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, ArrowRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getOrganizations } from "@/lib/superAdminApi";

interface Organization {
  id: number;
  name: string;
  description: string;
}

export default function UniversitiesPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
  const response = await getOrganizations();
  const orgs: Organization[] = Array.isArray(response.data) ? response.data : [];
  setOrganizations(orgs);
    } catch (err: any) {
      console.error("Load organizations error:", err);
      setError(err.message || "Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => navigate("/");
  const handleSignIn = () => navigate("/signin");
  const handleContactUs = () => navigate("/contact-us");
  const handleRegister = () => navigate("/signup");
  const handleViewDetails = (id: number) => navigate(`/universities/${id}`);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center min-h-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
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
            <Button
              variant="ghost"
              className="relative border-2 border-[#343A40]/20 text-[#343A40] hover:bg-[#E9ECEF]/50 hover:text-[#012A4A] hover:border-[#89C2D9]/40 hover:shadow-lg hover:shadow-[#89C2D9]/20 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              onClick={handleContactUs}
            >
              Contact Us
            </Button>
            <Button
              variant="outline"
              className="relative border-2 border-[#89C2D9]/50 text-[#01497C] hover:bg-[#89C2D9] hover:text-[#FFFFFF] hover:border-[#89C2D9] hover:shadow-lg hover:shadow-[#89C2D9]/30 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              onClick={handleRegister}
            >
              Register
            </Button>
            <Button
              className="relative bg-gradient-to-r from-[#01497C] to-[#013A63] hover:from-[#012A4A] hover:to-[#01497C] text-[#FFFFFF] px-8 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md shadow-[#01497C]/20 hover:shadow-lg hover:shadow-[#012A4A]/25 border-0 hover:brightness-110"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
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
          <Button variant="outline" className="flex items-center gap-2 mb-8" onClick={handleBack}>
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
          {organizations.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden rounded-t-lg bg-[#E9ECEF] flex items-center justify-center">
                  <GraduationCap className="w-16 h-16 text-[#01497C]" />
                </div>
                <CardContent className="flex-grow p-6">
                  <h2 className="text-xl font-bold text-[#012A4A] mb-2">{org.name}</h2>
                  <p className="text-[#343A40]">{org.description || "No description available."}</p>
                </CardContent>
                <CardFooter className="p-6">
                  <Button
                    className="w-full bg-[#01497C] hover:bg-[#012A4A] text-white"
                    onClick={() => handleViewDetails(org.id)}
                  >
                    View Details
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
