import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/contact" element={<ContactUsForm />} />

        {/* Student portal routes with sidebar */}
        <Route path="/portal/*" element={
          <div className="min-h-screen">
            <Sidebar />
            <div className="ml-20 md:ml-64 p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-exams" element={<MyExams />} />
                <Route path="/my-results" element={<MyResults />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/logout" element={<Logout />} />
              </Routes>
            </div>
          </div>
        } />

        {/* Admin portal routes with admin sidebar */}
        <Route path="/admin/*" element={
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
        } />

      </Routes>
    </Router>
  );
}

export default App;