import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const BASE=import.meta.env.VITE_API_URL;

export default function AddStudentPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [image, setImage] = useState("");
  const [courses, setCourses] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const editId = searchParams.get("edit");
    setEditingId(editId);
  }, [searchParams]);

  // Prefill when editing
  useEffect(() => {
    const prefillForEdit = async () => {
      if (!token || !editingId) return;
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(
          `${BASE}students/${editingId}`,
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
          // Format enrollmentDate for input field (YYYY-MM-DD)
          if (s.enrollmentDate) {
            const date = new Date(s.enrollmentDate);
            const formattedDate = date.toISOString().split('T')[0];
            setEnrollmentDate(formattedDate);
          } else {
            setEnrollmentDate("");
          }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `${BASE}/students/${editingId}`
        : "${BASE}/students";
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
          ...(enrollmentDate && { enrollmentDate }),
          image,
          courses: courses.split(",").map((c) => c.trim()).filter((c) => c.length > 0),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          setMessage("✅ Student updated successfully!");
          // Navigate back to students list for better UX
          setTimeout(() => {
            navigate("/students");
          }, 500);
        } else {
          setMessage("✅ Student added successfully!");
          setFirstName("");
          setLastName("");
          setEmail("");
          setAge("");
          setEnrollmentDate("");
          setImage("");
          setCourses("");
        }
      } else {
        const errorMsg = data.error || (isEdit ? "Failed to update student" : "Failed to add student");
        setMessage(`❌ ${errorMsg}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }

    setLoading(false);
  };

  return (
    <Layout onBack={() => navigate("/students")} showSearch={false}>
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
              <label className="block font-medium">Enrollment Date</label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
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
                  onClick={() => { navigate("/students"); }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <p className="mt-4">{message}</p>}
        </div>
    </Layout>
  );
}
