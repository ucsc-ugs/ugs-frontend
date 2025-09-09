import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperAdminAuthProvider } from "@/contexts/SuperAdminAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminProtectedRoute from "@/components/SuperAdminProtectedRoute";
import OrgAdminProtectedRoute from "@/components/OrgAdminProtectedRoute";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import ExamDetails from "@/pages/ExamDetails";
import Sidebar from "@/components/ui/sidebar";
import OrgAdminSidebar from "@/components/ui/OrgAdminSidebar";
import SignUpPage from "./pages/SignUpPage";
import ContactUsForm from "./components/ui/ContactUsForm";
import AdminDashboard from "@/pages/orgAdmin/OrgAdminHome";
import AdminNotifications from "@/pages/orgAdmin/AdminNotifications";
import ManageExams from "@/pages/orgAdmin/ManageExams";
import CreateExam from "@/pages/orgAdmin/CreateExam";
import PublishResults from "@/pages/orgAdmin/PublishResults";
import FinanceDashboard from "@/pages/orgAdmin/FinanceDashboard";
import ManageStudents from "@/pages/orgAdmin/StudentManagement";
import ManageUsers from "@/pages/orgAdmin/ManageUsers";
import Settings from "@/pages/orgAdmin/Settings";
import SetAnnouncements from "@/pages/orgAdmin/SetAnnouncements";
import CreateAnnouncement from "@/pages/orgAdmin/CreateAnnouncement";
import SuperAdminSidebar from "@/components/ui/SuperAdminSidebar";
import SuperAdminLoginPage from "@/pages/superAdmin/SuperAdminLoginPage";
import SuperAdminDashboard from "@/pages/superAdmin/SuperAdminDashboard";
import ManageOrganizations from "@/pages/superAdmin/ManageOrganizations";
import ManageOrgAdmins from "@/pages/superAdmin/ManageOrgAdmins";
import SuperAdminLogout from "@/pages/superAdmin/SuperAdminLogout";
import OrgAdminLoginPage from "@/pages/orgAdmin/OrgAdminLoginPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import Revenue from "./pages/superAdmin/Revenue";
import SuperAdminExams from "./pages/superAdmin/ManageExams";
import UniversitiesPage from "./pages/UniversitiesPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyRegisteredExams from "./pages/test";

function App() {
  return (
    <AuthProvider>
      <SuperAdminAuthProvider>
        <Router>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/contact" element={<ContactUsForm />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/exams/:codeName" element={<ExamDetails />} />

            {/* Sign in and sign up routes */}

            {/* Organization Admin Login */}
            <Route path="/admin/login" element={<OrgAdminLoginPage />} />
            
            {/* Unauthorized access page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Super Admin Routes */}
            <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/super-admin/*" element={
              <SuperAdminProtectedRoute>
                <div className="min-h-screen">
                  <SuperAdminSidebar />
                  <div className="ml-16 md:ml-64 p-6">
                    <Routes>
                      <Route path="/dashboard" element={<SuperAdminDashboard />} />
                      <Route path="/organizations" element={<ManageOrganizations />} />
                      <Route path="/org-admins" element={<ManageOrgAdmins />} />
                      <Route path="/logout" element={<SuperAdminLogout />} />
                      <Route path="/revenue" element={<Revenue />} />
                      <Route path="/exams" element={<SuperAdminExams />} />
                    </Routes>
                  </div>
                </div>
              </SuperAdminProtectedRoute>
            } />
            
            {/* Protected routes with sidebar */}
            <Route path="/portal/*" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Sidebar />
                  {/* CHANGE: Added ml-20 md:ml-64 to match sidebar width and prevent content hiding */}
                  <div className="ml-20 md:ml-64 p-6">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/my-exams" element={<MyExams />} />
                      <Route path="/my-results" element={<MyResults />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* Admin portal routes with admin sidebar */}
            <Route path="/admin/*" element={
              <OrgAdminProtectedRoute>
                <div className="min-h-screen">
                  <OrgAdminSidebar />
                  <div className="ml-20 md:ml-64 p-6">
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/notifications" element={<AdminNotifications />} />
                      <Route path="/manage-exams" element={<ManageExams />} />
                      <Route path="/create-exam" element={<CreateExam />} />
                      <Route path="/publish-results" element={<PublishResults />} />
                      <Route path="/finance" element={<FinanceDashboard />} />
                      <Route path="/student-management" element={<ManageStudents />} />
                      <Route path="/manage-users" element={<ManageUsers />} />
                      <Route path="/set-announcements" element={<SetAnnouncements />} />
                      <Route path="/create-announcement" element={<CreateAnnouncement />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/logout" element={<Logout />} />
                    </Routes>
                  </div>
                </div>
              </OrgAdminProtectedRoute>
            } />

          </Routes>
        </Router>
      </SuperAdminAuthProvider>
    </AuthProvider>
  );
}

export default App;