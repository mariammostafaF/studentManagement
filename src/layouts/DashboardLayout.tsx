import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="font-bold text-xl">Student Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => (window.location.hash = "dashboard")}
            className="hover:underline"
          >
            Dashboard
          </button>
          <button
            onClick={() => (window.location.hash = "students")}
            className="hover:underline"
          >
            Students
          </button>
          <button
            onClick={() => (window.location.hash = "add-student")}
            className="hover:underline"
          >
            Add Student
          </button>
          <button
            onClick={() => {
              logout();
              window.location.hash = "login";
            }}
            className="hover:underline text-red-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
