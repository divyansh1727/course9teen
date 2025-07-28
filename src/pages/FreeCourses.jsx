import { useEffect, useState,userData } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CourseCard from "../Components/CourseCard"; // adjust path if needed

export default function FreeCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreeCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("price", "==", "Free"));

        const snapshot = await getDocs(q);
        const freeCourses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(freeCourses);
      } catch (err) {
        console.error("Error fetching free courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeCourses();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading Free Courses...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Free Courses</h2>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600">No free courses available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
  <div key={course.id} className="course-card">
    <CourseCard
      courseId={course.id}
      course={course}
      isAdmin={userData?.role === "admin"}
      onClick={() => navigate(`/course/${course.id}`)}
      onEditClick={() => navigate(`/admin/edit-course/${course.id}`)}
    />
  </div>

          ))}
        </div>
      )}
    </div>
  );
}
