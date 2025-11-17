import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import profileImg from "../assets/profileimg.png";
import loginBg from "../assets/login-bg.jpg";

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
  country?: string;
  phoneNumber?: string;
  phone?: string;
  about?: string;
}

export default function StudentProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!token || !studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setImageError(false); // Reset image error when fetching new student
      try {
        const response = await fetch(
          `${BASE}/students/${studentId}`,
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
            `${BASE}/students`,
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
  }, [token, studentId]);

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

  const StudentAvatar = ({ 
    imageUrl, 
    firstName, 
    lastName 
  }: { 
    imageUrl?: string; 
    firstName: string; 
    lastName: string;
  }) => {
    const [hasError, setHasError] = useState(false);

    return imageUrl && !hasError ? (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
        onError={() => setHasError(true)}
      />
    ) : (
      <img
        src={profileImg}
        alt={`${firstName} ${lastName}`}
        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
      />
    );
  };

  return (
    <Layout onBack={() => navigate("/students")}>
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading student profile...</p>
        </div>
      ) : !student ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Student not found.</p>
          <button
            onClick={() => navigate("/students")}
            className="mt-4 px-4 py-2 bg-[#FEAF00] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Students
          </button>
        </div>
      ) : (
        <>
          {/* Header with Avatar and Name */}
          <div className="flex items-center mb-6">
            <StudentAvatar 
              imageUrl={student.image}
              firstName={student.firstName}
              lastName={student.lastName}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-gray-600 text-sm">Student</p>
            </div>
          </div>
          
          {/* Upper Two Boxes - Side by Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Student Info Box with Background Image - 1/3 width */}
            <div 
              className="rounded-lg shadow-md p-6 text-white relative overflow-hidden" 
              style={{ 
                backgroundImage: `url(${loginBg})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FEAF00]/80 to-[#FFA500]/80"></div>
              <div className="relative z-10">
                <div className="flex flex-col items-center mb-4">
                  <p className="text-white/90 mb-2">Hi, I am</p>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {student.firstName} {student.lastName}
                  </h3>
                  
                  {/* Large profile image - always use fallback for consistency */}
                  <img
                    src={student.image && !imageError ? student.image : profileImg}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-48 h-48 rounded-lg object-cover mb-4 border-4 border-white/20 shadow-lg"
                    onError={() => setImageError(true)}
                  />
                  
                  {student.about && (
                    <p className="text-white/95 text-sm mb-4 text-center">
                      {student.about}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3 mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center">
                    <i className="fa-solid fa-flag text-white/90 mr-3"></i>
                    <p className="text-white">{student.country || "N/A"}</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-envelope text-white/90 mr-3"></i>
                    <p className="text-white text-sm break-all">{student.email}</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-phone text-white/90 mr-3"></i>
                    <p className="text-white">{student.phoneNumber || student.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Box - 2/3 width */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">All Courses</h3>
                <span className="text-sm text-gray-500">
                  {student.courses?.length || 0} {student.courses?.length === 1 ? 'course' : 'courses'}
                </span>
              </div>
              
              {student.courses && student.courses.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {student.courses.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FEAF00]/20 to-[#FFA500]/20 flex items-center justify-center">
                          <i className="fa-solid fa-book text-[#FEAF00] text-xl"></i>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{course}</p>
                          <p className="text-gray-500 text-sm">Course #{index + 1}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log("Details for course:", course);
                          // TODO: Navigate to course details page
                        }}
                        className="px-4 py-2 bg-[#FEAF00] text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
                        aria-label={`View details for ${course}`}
                      >
                        Details <i className="fa-solid fa-chevron-right ml-1"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fa-solid fa-book-open text-gray-300 text-4xl mb-3"></i>
                  <p className="text-gray-500">No courses enrolled yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoBox
              title="Age"
              value={typeof student.age === 'number' ? `${student.age} Years` : "N/A"}
              icon={<i className="fa-solid fa-calendar-days"></i>}
            />
            <InfoBox
              title="Total Courses"
              value={`${student.courses?.length || 0} ${student.courses?.length === 1 ? 'Course' : 'Courses'}`}
              icon={<i className="fa-regular fa-bookmark"></i>}
            />
            <InfoBox
              title="Enrollment Date"
              value={student.enrollmentDate 
                ? new Date(student.enrollmentDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : "N/A"}
              icon={<i className="fa-solid fa-calendar"></i>}
            />
          </div>
        </>
      )}
    </Layout>
  );
}