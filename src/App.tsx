import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import Sidebar from "@/components/ui/Sidebar";
import OrgAdminSidebar from "@/components/ui/OrgAdminSidebar";
import SignUpPage from "./pages/SignUpPage";
import ContactUsForm from "./components/ui/ContactUsForm";
import AdminDashboard from "@/pages/OrgAdminHome";
// import AdminExams from "@/pages/admin/Exams";
// import AdminCreateExam from "@/pages/admin/CreateExam";
// import AdminUsers from "@/pages/admin/Users";
// import AdminUniversity from "@/pages/admin/University";
// import AdminSettings from "@/pages/admin/Settings";

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
                {/* <Route path="/exams" element={<AdminExams />} />
                <Route path="/create-exam" element={<AdminCreateExam />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/university" element={<AdminUniversity />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/logout" element={<Logout />} /> */}
              </Routes>
            </div>
          </div>
        } />

      </Routes>
    </Router>
  );
}

export default App;