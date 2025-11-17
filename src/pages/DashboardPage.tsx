import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

const BASE=import.meta.env.VITE_API_URL;

interface DashboardStats {
  totalStudents: number;
  totalUniqueCourses: number;
  averageAge: number;
  enrollmentsThisYear: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalUniqueCourses: 0,
    averageAge: 0,
    enrollmentsThisYear: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${BASE}/stats`,
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
    <Layout>
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
    </Layout>
  );
}

