import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PortalLayout from "@/layout/PortalLayout";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";
import LandingPage from "@/pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected portal pages */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="my-exams" element={<MyExams />} />
          <Route path="my-results" element={<MyResults />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
