import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, FileText, BarChart3, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSignIn = () => navigate("/signin");
  // const handleSignUp = () => navigate("/signup");
  // const handleAccessPortal = () => navigate("/portal");
  // const handleStudentPortal = () => navigate("/portal");
  // const handleInitiateRegistration = () => navigate("/portal/register");
  const handleContactUs = () => navigate("/contact-us"); 
  const handleAccessPortal = () => {
    navigate("/portal"); // Navigate to home page with sidebar
  };

  const handleStudentPortal = () => {
    navigate("/portal"); // Navigate to home page with sidebar
  };

  const handleRegister = () => {
    navigate("/signup"); // Navigate to register page with sidebar
  };

  const handleInitiateRegistration = () => {
    navigate("/signup"); // Navigate to register page with sidebar
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="../src/assets/ucsc_logo.png" alt="UCSC Logo" width={60} height={40} className="object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">University Gateway Solutions</h1>
              <p className="text-sm text-gray-600">University of Colombo School of Computing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleContactUs}
            >
              Contact Us
            </Button>
            <Button 
              variant="outline"
              className="border-gray-800 text-gray-800 hover:bg-gray-50"
              onClick={handleRegister}
            >
              Register
            </Button>
            <Button 
              className="bg-gray-800 hover:bg-gray-900 text-white"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-300">
            Academic Excellence Initiative
          </Badge>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            University Gateway
            <span className="text-slate-700 block">Solutions</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            A comprehensive academic platform facilitating standardized aptitude assessment and institutional
            collaboration within the higher education sector.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-slate-700 hover:bg-slate-800 text-xl px-12 py-4"
              onClick={handleAccessPortal}
            >
              <GraduationCap className="mr-3 h-6 w-6" />
              Institutional Access
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-700 hover:bg-slate-50 text-xl px-12 py-4 bg-transparent"
              onClick={handleStudentPortal}
            >
              <Users className="mr-3 h-6 w-6" />
              Student Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Core Functions */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Academic Functions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined processes for institutional assessment management and student academic progression.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-slate-300 transition-colors text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Assessment Administration</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Institutional framework for standardized aptitude test creation and management protocols.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-slate-300 transition-colors text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Candidate Registration</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Systematic enrollment procedures for qualified candidates seeking academic assessment opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-slate-300 transition-colors text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Performance Analytics</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Comprehensive evaluation metrics and academic performance tracking systems.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Institutional Statistics */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Institutional Participation</h2>
            <p className="text-lg text-gray-600">Current academic network statistics and engagement metrics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-5xl font-bold text-slate-700 mb-2">50+</div>
              <div className="text-xl text-gray-600">Participating Institutions</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-5xl font-bold text-slate-700 mb-2">10,000+</div>
              <div className="text-xl text-gray-600">Registered Candidates</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-5xl font-bold text-slate-700 mb-2">500+</div>
              <div className="text-xl text-gray-600">Assessments Conducted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-24 bg-slate-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">Academic Registration</h2>
          <p className="text-2xl text-slate-200 mb-12 max-w-3xl mx-auto">
            Commence your institutional participation in the University Gateway Solutions academic network.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-slate-700 text-xl px-12 py-4 bg-transparent"
            onClick={handleInitiateRegistration}
          >
            Initiate Registration Process
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
                <h3 className="font-bold">University Gateway Solutions</h3>
                <p className="text-sm text-gray-400">University of Colombo School of Computing</p>
              </div>
            </div>

            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white">
                Academic Support
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 University of Colombo School of Computing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}