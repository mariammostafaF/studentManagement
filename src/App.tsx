import { useEffect, useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentsPage from "./pages/StudentsPage";
import LoginPage from "./pages/LoginPage";
import AddStudentPage from "./pages/AddStudentPage";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { token } = useAuth();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setPage(hash || "dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      {page === "dashboard" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p>This is your student management dashboard.</p>
        </div>
      )}
      {page === "students" && <StudentsPage />}
      {page === "add-student" && <AddStudentPage />}
    </DashboardLayout>
  );
}

export default App;
