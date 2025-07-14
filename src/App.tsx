import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperAdminAuthProvider } from "@/contexts/SuperAdminAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminProtectedRoute from "@/components/SuperAdminProtectedRoute";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Sidebar from "@/components/ui/Sidebar";
import SuperAdminSidebar from "@/components/ui/SuperAdminSidebar";
import SuperAdminLoginPage from "@/pages/SuperAdminLoginPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import ManageOrganizations from "@/pages/ManageOrganizations";
import ManageOrgAdmins from "@/pages/ManageOrgAdmins";
import SuperAdminLogout from "@/pages/SuperAdminLogout";

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

            {/* Super Admin Routes */}
            <Route path="/admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/admin/*" element={
              <SuperAdminProtectedRoute>
                <div className="min-h-screen">
                  <SuperAdminSidebar />
                  <div className="ml-16 md:ml-64 p-6">
                    <Routes>
                      <Route path="/dashboard" element={<SuperAdminDashboard />} />
                      <Route path="/organizations" element={<ManageOrganizations />} />
                      <Route path="/org-admins" element={<ManageOrgAdmins />} />
                      <Route path="/logout" element={<SuperAdminLogout />} />
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
                      <Route path="/logout" element={<Logout />} />
                      
              
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            } />

          </Routes>
        </Router>
      </SuperAdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
