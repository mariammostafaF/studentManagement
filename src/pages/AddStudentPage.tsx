import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";

interface Teacher {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  photo?: string;
}

export default function AddStudentPage() {
  const { logout, token } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [courses, setCourses] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => 
    window.location.hash.replace("#", "") || "dashboard"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash.replace("#", "") || "dashboard");
      // detect edit param on hash change
      const hash = window.location.hash.replace("#", "");
      const query = hash.split("?")[1] || "";
      const params = new URLSearchParams(query);
      const editId = params.get("edit");
      setEditingId(editId);
    };
    // Check hash on mount
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Prefill when editing
  useEffect(() => {
    const prefillForEdit = async () => {
      if (!token || !editingId) return;
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(
          `https://student-management-backend-production-2b4a.up.railway.app/api/students/${editingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const s = data.student || data;
          setFirstName(s.firstName || "");
          setLastName(s.lastName || "");
          setEmail(s.email || "");
          setAge(typeof s.age === "number" ? s.age : "");
          setImage(s.image || "");
          setCourses(Array.isArray(s.courses) ? s.courses.join(", ") : "");
        } else {
          const err = await response.json();
          setMessage(`❌ ${err.error || "Failed to load student"}`);
        }
      } catch (e) {
        setMessage("❌ Network error");
      } finally {
        setLoading(false);
      }
    };
    prefillForEdit();
  }, [token, editingId]);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (!token) return;
      
      setTeacherLoading(true);
      try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `https://student-management-backend-production-2b4a.up.railway.app/api/students/${editingId}`
        : "https://student-management-backend-production-2b4a.up.railway.app/api/students";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          age: Number(age),
          image,
          courses: courses.split(",").map((c) => c.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          setMessage("✅ Student updated successfully!");
          // Navigate back to students list for better UX
          setTimeout(() => {
            window.location.hash = "students";
          }, 500);
        } else {
          setMessage("✅ Student added successfully!");
          setFirstName("");
          setLastName("");
          setEmail("");
          setAge("");
          setImage("");
          setCourses("");
        }
      } else {
        setMessage(`❌ ${data.error || "Failed to add student"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }

    setLoading(false);
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">{editingId ? "Edit Student" : "Add New Student"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Profile Image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block font-medium">Courses (comma separated)</label>
              <input
                value={courses}
                onChange={(e) => setCourses(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="e.g. Math, English, Science"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-300"
              >
                {loading ? (editingId ? "Saving..." : "Adding...") : (editingId ? "Save Changes" : "Add Student")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { window.location.hash = "students"; }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <p className="mt-4">{message}</p>}
        </div>
      </main>
    </div>
  );
}
