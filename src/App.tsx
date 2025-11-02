import { useEffect, useState } from "react";
import StudentsPage from "./pages/StudentsPage";
import LoginPage from "./pages/LoginPage";
import AddStudentPage from "./pages/AddStudentPage";
import DashboardPage from "./pages/DashboardPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("student/")) {
        setPage("student-profile");
      } else {
        setPage(hash || "dashboard");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <>
      {page === "dashboard" && <DashboardPage />}
      {page === "students" && <StudentsPage />}
      {page === "add-student" && <AddStudentPage />}
      {page === "student-profile" && <StudentProfilePage />}
    </>
  );
}

export default App;
