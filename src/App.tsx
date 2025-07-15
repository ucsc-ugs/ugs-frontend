import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PortalLayout from "@/layout/PortalLayout";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import Sidebar from "./components/ui/Sidebar";
import ContactUsForm from "./components/ContactUsForm"; // Import the ContactUsForm component
import SignIn from "@/pages/SignInPage";
import SignUpPage from "./pages/SignUpPage"; // Import SignIn component
import ContactUs from "@/pages/ContactUs";
import OrgAdminSidebar from "@/components/ui/OrgAdminSidebar";
import AdminDashboard from "@/pages/admin/OrgAdminHome";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import ManageExams from "@/pages/admin/ManageExams";
import CreateExam from "@/pages/admin/CreateExam";
import ManageUsers from "@/pages/admin/ManageUsers";
import University from "@/pages/admin/University";
import Settings from "@/pages/admin/Settings";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Main app routes with sidebar */}
          <Route
            path="/portal/*"
            element={
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
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/contact-us" element={<ContactUsForm />} /> {/* Add the new route here */}
                  </Routes>
                </div>
              </div>
            }
          />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpPage />} />

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
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/university" element={<University />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
              </Routes>
            </div>
          </div>
        } />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;