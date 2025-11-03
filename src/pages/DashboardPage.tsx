import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  enrollmentDate: string;
  image: string;
  courses: string[];
}

interface DashboardStats {
  totalStudents: number;
  totalUniqueCourses: number;
  averageAge: number;
  enrollmentsThisYear: number;
}

interface Teacher {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  photo?: string;
}

export default function DashboardPage() {
  const { logout, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalUniqueCourses: 0,
    averageAge: 0,
    enrollmentsThisYear: 0,
  });
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => 
    window.location.hash.replace("#", "") || "dashboard"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash.replace("#", "") || "dashboard");
    };
    // Check hash on mount
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!token) return;
      
      setTeacherLoading(true);
      try {
        // Try common API endpoints for user/teacher info
        const endpoints = [
          "/api/auth/me",
          "/api/user",
          "/api/teacher",
          "/api/users/me"
        ];

        let teacherData = null;
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(
              `https://student-management-backend-production-2b4a.up.railway.app${endpoint}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              // Handle different response structures
              teacherData = data.user || data.teacher || data;
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (teacherData) {
          setTeacher(teacherData);
        }
      } catch (err) {
        console.error("Failed to fetch teacher info:", err);
      } finally {
        setTeacherLoading(false);
      }
    };

    fetchTeacherInfo();
  }, [token]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://student-management-backend-production-2b4a.up.railway.app/api/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalStudents: data.totalStudents ?? 0,
            totalUniqueCourses: data.totalUniqueCourses ?? 0,
            averageAge: data.averageAge ?? 0,
            enrollmentsThisYear: data.enrollmentsThisYear ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const getTeacherName = () => {
    if (teacher?.name) return teacher.name;
    if (teacher?.firstName || teacher?.lastName) {
      return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
    }
    if (teacher?.email) return teacher.email.split("@")[0];
    return "Teacher";
  };

  const getTeacherImage = () => {
    return teacher?.image || teacher?.photo || "";
  };

  const StatBox = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: string | React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {loading ? "..." : value}
          </p>
        </div>
        <div className={`${color} bg-opacity-10 p-4 rounded-full`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#F2EAE1] shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center justify-start p-6 pb-4 border-b border-gray-200">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-6 object-contain mr-1"
          />
          <h2 className="font-montserrat text-xl font-bold text-black whitespace-nowrap">
            Student Management
          </h2>
        </div>
        {/* Teacher Information Section */}
        <div className="p-6 border-b border-gray-200">
          {teacherLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mb-3"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {getTeacherImage() ? (
                <img
                  src={getTeacherImage()}
                  alt="Teacher"
                  className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%239CA3AF'%3E?%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-2 border-gray-300">
                  <span className="text-gray-500 text-2xl font-semibold">
                    {getTeacherName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                {getTeacherName()}
              </h3>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setCurrentPage("dashboard");
                  window.location.hash = "dashboard";
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  currentPage === "dashboard"
                    ? "bg-[#FEAF00] text-white"
                    : "bg-[#F2EAE1] text-black"
                }`}
              >
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setCurrentPage("students");
                  window.location.hash = "students";
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  currentPage === "students"
                    ? "bg-[#FEAF00] text-white"
                    : "bg-[#F2EAE1] text-black"
                }`}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Students</span>
              </button>
            </li>
          </ul>
        </nav>
         <div
                onClick={() => {
                  logout();
                  window.location.hash = "login";
                }}
                className="flex items-center justify-center px-4 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity space-x-2"
              >
                <i className="fa-solid fa-right-from-bracket text-black text-xl"></i>
                <span className="text-black font-medium">Logout</span>
              </div>
      </aside>
      

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header with Back, Search, and Notification */}
        <div className="flex items-center justify-between mb-6">
          <i 
            className="fa-solid fa-circle-chevron-left text-black text-xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              logout();
              window.location.hash = "login";
            }}
            aria-label="Logout"
          ></i>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <div className="relative">
            <i 
              className="fa-regular fa-bell text-black text-xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                // Notification functionality to be implemented
              }}
              aria-label="Notifications"
            ></i>
            {/* Notification badge */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox
            title="Total Students"
            value={stats.totalStudents}
            icon={<i className="fa-solid fa-graduation-cap"></i>}
            color="text-blue-400"
          />
          <StatBox
            title="Unique Courses"
            value={stats.totalUniqueCourses}
            icon={<i className="fa-regular fa-bookmark"></i>}
            color="text-pink-200"
          />
          <StatBox
            title="Average Age"
            value={stats.averageAge}
            icon={<i className="fa-regular fa-calendar-days"></i>}
            color="text-orange-400"
          />
          <StatBox
            title="Enrollments This Year"
            value={stats.enrollmentsThisYear}
            icon={<i className="fa-regular fa-user"></i>}
            color="text-orange-600"
          />
        </div>
      </main>
    </div>
  );
}

