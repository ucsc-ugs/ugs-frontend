import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PortalLayout from "@/layout/PortalLayout";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";
import Sidebar from "@/components/ui/Sidebar";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        
        {/* Main app routes with sidebar */}
        <Route path="/portal/*" element={
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
        } />

      </Routes>
    </Router>
  );
}

export default App;
