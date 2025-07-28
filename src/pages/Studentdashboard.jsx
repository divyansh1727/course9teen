import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import CourseCard from "../Components/CourseCard";

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/sign-in");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          alert("No user data found.");
          navigate("/");
          return;
        }

        const userInfo = userSnap.data();
        setUserData(userInfo);

        const enrollmentSnap = await getDocs(
          query(collection(db, "enrollments"), where("userId", "==", user.uid))
        );

        const coursePromises = enrollmentSnap.docs.map(async (enrollDoc) => {
          const { courseId } = enrollDoc.data();
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            const countSnap = await getDocs(
              query(collection(db, "enrollments"), where("courseId", "==", courseId))
            );

            return {
              id: courseSnap.id,
              ...courseSnap.data(),
              studentCount: countSnap.size,
            };
          } else {
            console.warn(`❌ Skipping deleted courseId: ${courseId}`);
            return null;
          }
        });

        const enrolledCourses = (await Promise.all(coursePromises)).filter(Boolean);

        const uniqueCourses = enrolledCourses.filter(
          (course, index, self) =>
            index === self.findIndex((c) => c.id === course.id)
        );

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  // ✅ Filter courses by search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-600 text-white p-12">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-14 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {userData?.name}! 😄
          </h1>
        </div>

        <h2 className="text-xl font-bold mb-4">Your Courses</h2>

        {/* ✅ Search Input */}
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 p-2 rounded bg-gray-700 text-white border border-yellow-400 focus:outline-none"
        />

        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-xl mb-4">
              📭 No matching courses found...
            </p>
            <button
              onClick={() => navigate("/browse-courses")}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
            >
              Browse All Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition"
              >
                <h3 className="text-lg font-bold">{course.title}</h3>
                <p className="text-sm text-gray-300">{course.description}</p>
                <div className="text-xs text-gray-400 mt-1">
                  👥 {course.studentCount ?? 0} students enrolled
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
