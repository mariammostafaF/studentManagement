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
  country?: string;
  phoneNumber?: string;
  phone?: string;
}

interface Teacher {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  photo?: string;
}

export default function StudentProfilePage() {
  const { logout, token } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => 
    window.location.hash.replace("#", "").split("?")[0] || "dashboard"
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").split("?")[0];
      setCurrentPage(hash || "dashboard");
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
    const fetchStudent = async () => {
      if (!token) return;

      // Get student ID from URL hash
      const hash = window.location.hash.replace("#", "");
      const studentId = hash.split("student/")[1]?.split("?")[0]?.split("/")[0];

      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://student-management-backend-production-2b4a.up.railway.app/api/students/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStudent(data.student || data);
        } else {
          // If single student endpoint doesn't work, try getting all students and find the one
          const allResponse = await fetch(
            `https://student-management-backend-production-2b4a.up.railway.app/api/students`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (allResponse.ok) {
            const allData = await allResponse.json();
            const foundStudent = allData.students?.find((s: Student) => s.id === studentId);
            if (foundStudent) {
              setStudent(foundStudent);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch student:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
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

  const InfoBox = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="text-gray-400 text-2xl">
            {icon}
          </div>
        )}
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
              window.location.hash = "students";
            }}
            aria-label="Back"
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

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading student profile...</p>
          </div>
        ) : !student ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Student not found.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Profile</h2>
            
            {/* Student Info Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                {student.image ? (
                  <img
                    src={student.image}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-20 h-20 rounded-full object-cover mr-4 border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".fallback-initials")) {
                        const fallback = document.createElement("div");
                        fallback.className = "fallback-initials w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4 border-2 border-gray-300";
                        fallback.textContent = `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase();
                        parent.insertBefore(fallback, target);
                      }
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4 border-2 border-gray-300">
                    <span className="text-gray-600 font-semibold text-2xl">
                      {`${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Email</p>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Country</p>
                  <p className="text-gray-900">{student.country || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Phone Number</p>
                  <p className="text-gray-900">{student.phoneNumber || student.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Courses Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Courses</h3>
              {student.courses && student.courses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.courses.map((course, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No courses enrolled</p>
              )}
            </div>

            {/* Stats Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoBox
                title="Age"
                value={student.age || "N/A"}
                icon={<i className="fa-solid fa-calendar-days"></i>}
              />
              <InfoBox
                title="Total Courses"
                value={student.courses?.length || 0}
                icon={<i className="fa-regular fa-bookmark"></i>}
              />
              <InfoBox
                title="Enrollment Date"
                value={student.enrollmentDate 
                  ? new Date(student.enrollmentDate).toLocaleDateString()
                  : "N/A"}
                icon={<i className="fa-solid fa-calendar"></i>}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

