import { useState } from "react";

export default function AddStudentPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [courses, setCourses] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://student-management-backend-production-2b4a.up.railway.app/api/students",
        {
          method: "POST",
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
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Student added successfully!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setAge("");
        setImage("");
        setCourses("");
      } else {
        setMessage(`❌ ${data.error || "Failed to add student"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Add New Student</h2>

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

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
