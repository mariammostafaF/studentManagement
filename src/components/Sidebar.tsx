import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";

//const BASE=import.meta.env.VITE_API_URL;

interface Teacher {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  photo?: string;
}

export default function Sidebar() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const currentPage = location.pathname;

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

  return (
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
                navigate("/dashboard");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                currentPage === "/dashboard"
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
                navigate("/students");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                currentPage === "/students"
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
      
      {/* Logout Button */}
      <div
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center justify-center px-4 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity space-x-2"
      >
        <i className="fa-solid fa-right-from-bracket text-black text-xl"></i>
        <span className="text-black font-medium">Logout</span>
      </div>
    </aside>
  );
}

