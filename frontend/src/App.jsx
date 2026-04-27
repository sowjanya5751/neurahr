import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute      from "./components/ProtectedRoute";
import Login               from "./pages/auth/Login";
import Dashboard           from "./pages/dashboard/Dashboard";
import ResumeScreener      from "./pages/hr/ResumeScreener";
import Chatbot             from "./pages/hr/Chatbot";
import VoiceChatbot        from "./pages/hr/VoiceChatbot";
import Employees           from "./pages/hr/Employees";
import JDGenerator         from "./pages/hr/JDGenerator";
import PerformanceReview   from "./pages/hr/PerformanceReview";
import LeaveManagement     from "./pages/hr/LeaveManagement";
import Attendance          from "./pages/hr/Attendance";
import Payroll             from "./pages/hr/Payroll";
import PerformanceTracking from "./pages/hr/PerformanceTracking";
import AISearch            from "./pages/hr/AISearch";
import Profile             from "./pages/Profile";
import NotFound            from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
            <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            <Route path="/hr/chat"      element={<ProtectedRoute><Chatbot /></ProtectedRoute>}/>
            <Route path="/hr/voice"     element={<ProtectedRoute><VoiceChatbot /></ProtectedRoute>}/>
            <Route path="/hr/leaves"    element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>}/>
            <Route path="/attendance"   element={<ProtectedRoute><Attendance /></ProtectedRoute>}/>
            <Route path="/payroll"      element={<ProtectedRoute><Payroll /></ProtectedRoute>}/>
            <Route path="/performance"  element={<ProtectedRoute><PerformanceTracking /></ProtectedRoute>}/>
            <Route path="/hr/search"    element={<ProtectedRoute roles={["admin","hr"]}><AISearch /></ProtectedRoute>}/>
            <Route path="/hr/resume"    element={<ProtectedRoute roles={["admin","hr"]}><ResumeScreener /></ProtectedRoute>}/>
            <Route path="/hr/jd-generator" element={<ProtectedRoute roles={["admin","hr"]}><JDGenerator /></ProtectedRoute>}/>
            <Route path="/hr/performance"  element={<ProtectedRoute roles={["admin","hr","manager"]}><PerformanceReview /></ProtectedRoute>}/>
            <Route path="/hr/employees"    element={<ProtectedRoute roles={["admin"]}><Employees /></ProtectedRoute>}/>
            <Route path="/404" element={<NotFound />} />
            <Route path="*"   element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
