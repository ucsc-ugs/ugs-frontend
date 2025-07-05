import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import ExamResult from "./components/ExamResult";
import ExamDetailsBox from "./components/ExamDetailsBox";
import ContactUsForm from "./components/ContactUsForm";
import RegistrationForm from "./components/RegistrationForm";
import { Button } from "./components/ui/button";

const dummyExam = {
  name: "GCAT - Master of Philosophy at UCSC",
  date: "2025-08-01",
  venue: "S204",
  fee: "$100",
  deadline: "2025-07-20",
  imageUrl: "/ucsclogo.png"
};

function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#f1f5f9]">
      <ExamResult />
      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={() => navigate("/exam-details")}>View Exam Details</Button>
        <Button variant="outline" onClick={() => navigate("/contact-us")}>Contact Us</Button>
        <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam-details" element={<ExamDetailsBox exam={dummyExam} />} />
        <Route path="/contact-us" element={<ContactUsForm />} />
        <Route path="/register" element={<RegistrationForm />} />
      </Routes>
    </Router>
  );
}
