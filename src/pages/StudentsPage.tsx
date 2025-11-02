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

interface Teacher {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  photo?: string;
}

export default function StudentsPage() {
  const { logout, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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

  const fetchStudents = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://student-management-backend-production-2b4a.up.railway.app/api/students${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.students) {
        setStudents(data.students);
      } else {
        setError(data.error || "Failed to fetch students");
        setStudents([]);
      }
    } catch (err) {
      setError("Network error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

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
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </form>
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

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Students List</h2>
          <button
            onClick={() => {
              window.location.hash = "add-student";
            }}
            className="bg-[#FEAF00] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Student</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No students found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector(".fallback-initials")) {
                                const fallback = document.createElement("div");
                                fallback.className = "fallback-initials w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center";
                                fallback.textContent = `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase();
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-sm">
                              {`${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-[#FEAF00] transition-colors"
                          onClick={() => {
                            window.location.hash = `student/${student.id}`;
                          }}
                        >
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.age}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student.enrollmentDate 
                            ? new Date(student.enrollmentDate).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              // Edit functionality to be implemented
                              console.log("Edit student:", student.id);
                              window.location.hash = `add-student?edit=${student.id}`;
                            }}
                            className="text-[#FEAF00] hover:text-[#FEAF00] transition-opacity hover:opacity-80 bg-transparent"
                            aria-label="Edit student"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            onClick={() => {
                              // Delete functionality to be implemented
                              if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
                                console.log("Delete student:", student.id);
                                // TODO: Implement delete API call
                              }
                            }}
                            className="text-[#FEAF00] hover:text-[#FEAF00] transition-opacity hover:opacity-80 bg-transparent"
                            aria-label="Delete student"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
