import { Routes, Route, Navigate } from "react-router-dom";
import StudentsPage from "./pages/StudentsPage";
import LoginPage from "./pages/LoginPage";
import AddStudentPage from "./pages/AddStudentPage";
import DashboardPage from "./pages/DashboardPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/add-student" element={<AddStudentPage />} />
      <Route path="/student/:id" element={<StudentProfilePage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
