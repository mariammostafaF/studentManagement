import { useEffect, useState } from "react";

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://student-management-backend-production-2b4a.up.railway.app/api/students?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStudents(data.students);
      } else {
        setError(data.error || "Failed to fetch students");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Students List</h2>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-l px-3 py-2 w-64"
        />
        <button
          onClick={fetchStudents}
          className="bg-blue-600 text-white px-4 rounded-r"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-left">Courses</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <img
                    src={s.image}
                    alt={`${s.firstName} ${s.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="p-3">{s.firstName} {s.lastName}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.age}</td>
                <td className="p-3">{s.courses.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
