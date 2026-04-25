import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login         from "./pages/auth/Login";
import Dashboard     from "./pages/dashboard/Dashboard";
import ResumeScreener from "./pages/hr/ResumeScreener";
import Chatbot       from "./pages/hr/Chatbot";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard/></ProtectedRoute>
          }/>
          <Route path="/hr/resume" element={
            <ProtectedRoute roles={["admin","hr"]}><ResumeScreener/></ProtectedRoute>
          }/>
          <Route path="/hr/chat" element={
            <ProtectedRoute><Chatbot/></ProtectedRoute>
          }/>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
