import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const BASE=import.meta.env.VITE_API_URL;

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

export default function StudentsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchStudents = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${BASE}/students?${new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search ? { search } : {}),
        }).toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.students) {
        setStudents(data.students);
        // Reset image errors when new students are loaded
        setImageErrors({});
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages ?? 1);
          setTotalStudents(data.pagination.totalStudents ?? data.students.length ?? 0);
        } else {
          setTotalPages(1);
          setTotalStudents(data.students.length ?? 0);
        }
      } else {
        setError(data.error || "Failed to fetch students");
        setStudents([]);
        setTotalPages(1);
        setTotalStudents(0);
      }
    } catch (err) {
      setError("Network error");
      setStudents([]);
      setTotalPages(1);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    if (!token) return;

    try {
      const response = await fetch(
        `${BASE}/students/${studentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setStudents(students.filter((s) => s.id !== studentId));
        alert("Student deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete student");
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleImageError = (studentId: string) => {
    setImageErrors(prev => ({ ...prev, [studentId]: true }));
  };

  const getStudentInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <Layout
      onBack={() => navigate("/dashboard")}
      searchValue={search}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Students List
          {search && (
            <span className="text-base font-normal text-gray-500 ml-2">
              - Searching for "{search}"
            </span>
          )}
        </h2>
        <button
          onClick={() => navigate("/add-student")}
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
          <p className="text-gray-600">
            {search ? `No students found matching "${search}"` : "No students found."}
          </p>
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
                      {student.image && !imageErrors[student.id] ? (
                        <img
                          src={student.image}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={() => handleImageError(student.id)}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">
                            {getStudentInitials(student.firstName, student.lastName)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-[#FEAF00] transition-colors"
                        onClick={() => navigate(`/student/${student.id}`)}
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
                          onClick={() => navigate(`/add-student?edit=${student.id}`)}
                          className="text-[#FEAF00] hover:opacity-80 transition-opacity bg-transparent"
                          aria-label="Edit student"
                          title="Edit student"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                          className="text-red-500 hover:opacity-80 transition-opacity bg-transparent"
                          aria-label="Delete student"
                          title="Delete student"
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
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} ({totalStudents} total students)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`px-4 py-2 rounded border transition-colors ${
                  page <= 1 
                    ? "text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <i className="fa-solid fa-chevron-left mr-2"></i>
                Previous
              </button>
              <span className="text-sm text-gray-600 px-3">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded border transition-colors ${
                  page >= totalPages 
                    ? "text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Next
                <i className="fa-solid fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}