import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import MyExams from "@/pages/MyExams";
import MyResults from "@/pages/MyResults";
import Notifications from "@/pages/Notifications";
import Logout from "@/pages/Logout";

function App() {
  return (
    <Router>
      <div className="flex min-h-svh min-w-[550px]">
        <div >
          <Sidebar />
        </div>

        <div className="flex-1 p-6">
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
    </Router>
  );
}

export default App;
