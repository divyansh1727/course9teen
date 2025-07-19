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
  deleteDoc,
} from "firebase/firestore";

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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

        // ✅ Fetch enrollments
        const enrollmentSnap = await getDocs(
          query(collection(db, "enrollments"), where("userId", "==", user.uid))
        );

        const enrolledCourseIds = [];
        const coursePromises = enrollmentSnap.docs.map(async (enrollDoc) => {
          const { courseId } = enrollDoc.data();
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            enrolledCourseIds.push(courseId);
            return { id: courseSnap.id, ...courseSnap.data() };
          } else {
            console.warn(`❌ Skipping deleted courseId: ${courseId}`);

            // Optional: remove orphan enrollment
            // await deleteDoc(enrollDoc.ref);
            return null;
          }
        });

        const enrolledCourses = (await Promise.all(coursePromises)).filter(Boolean);

        // ✅ Remove duplicates (in case)
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

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-600 text-white p-12">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-14 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {userData?.name}! 😄
          </h1>
          
        </div>

        <h2 className="text-xl font-bold mb-2">Your Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-xl mb-4">📭 You’re not enrolled in any courses yet...</p>
            <button
              onClick={() => navigate("/browse-courses")}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition"
              >
                <h3 className="text-lg font-bold">{course.title}</h3>
                <p className="text-sm text-gray-300">{course.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

